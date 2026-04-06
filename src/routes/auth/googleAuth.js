import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { OAuth2Client } from 'google-auth-library'
import pool from '../../database.js'
import { generateToken } from '../../lib/jwt.js'

const router = Router()

const isAuthDebugEnabled =
	process.env.NODE_ENV !== 'production' || process.env.AUTH_DEBUG === 'true'

const getFriendlyGoogleError = (error) => {
	const rawMessage = error?.message || ''
	const message = rawMessage.toLowerCase()

	if (message.includes('secretorprivatekey')) {
		return {
			status: 500,
			message: 'JWT_SECRET no está configurado en el servidor'
		}
	}

	if (error?.code === 'ER_BAD_FIELD_ERROR' && message.includes('google_id')) {
		return {
			status: 500,
			message: 'La base de datos no tiene la columna google_id en users. Ejecutá la migración de Google Auth.'
		}
	}

	if (error?.code === 'ER_BAD_NULL_ERROR' && message.includes('password')) {
		return {
			status: 500,
			message: 'La columna users.password no permite NULL. Ejecutá la migración de Google Auth.'
		}
	}

	if (
		message.includes('invalid token') ||
		message.includes('wrong recipient') ||
		message.includes('token used too late')
	) {
		return {
			status: 401,
			message: 'Token de Google inválido o expirado'
		}
	}

	return {
		status: 500,
		message: 'Error en autenticación de Google'
	}
}

const googleAuthLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: { success: false, message: 'Demasiados intentos con Google, por favor espera 15 minutos' },
	standardHeaders: true,
	legacyHeaders: false
})

const getGoogleClientId = () => process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID

router.post('/google', googleAuthLimiter, async (req, res) => {
	try {
		const { credential } = req.body

		if (!credential) {
			return res.status(400).json({
				success: false,
				message: 'Credential de Google requerido'
			})
		}

		const googleClientId = getGoogleClientId()
		if (!googleClientId) {
			return res.status(500).json({
				success: false,
				message: 'Google Auth no está configurado en el servidor'
			})
		}

		const client = new OAuth2Client(googleClientId)
		const ticket = await client.verifyIdToken({
			idToken: credential,
			audience: googleClientId
		})

		const payload = ticket.getPayload()

		if (!payload) {
			return res.status(401).json({
				success: false,
				message: 'No se pudo validar el token de Google'
			})
		}

		const googleId = payload.sub
		const email = payload.email
		const emailVerified = payload.email_verified
		const name = payload.name?.trim() || email?.split('@')[0] || 'Usuario'

		if (!googleId || !email || !emailVerified) {
			return res.status(401).json({
				success: false,
				message: 'La cuenta de Google no tiene un correo verificado'
			})
		}

		let user

		const [usersByGoogleId] = await pool.query(
			'SELECT id, name, email, role, google_id FROM users WHERE google_id = ? LIMIT 1',
			[googleId]
		)

		if (usersByGoogleId.length > 0) {
			user = usersByGoogleId[0]
		} else {
			const [usersByEmail] = await pool.query(
				'SELECT id, name, email, role, google_id FROM users WHERE email = ? LIMIT 1',
				[email]
			)

			if (usersByEmail.length > 0) {
				const existingUser = usersByEmail[0]

				if (existingUser.google_id && existingUser.google_id !== googleId) {
					return res.status(409).json({
						success: false,
						message: 'Este correo ya está vinculado con otra cuenta de Google'
					})
				}

				await pool.query(
					'UPDATE users SET google_id = ?, name = COALESCE(NULLIF(name, ""), ?) WHERE id = ?',
					[googleId, name, existingUser.id]
				)

				user = {
					...existingUser,
					google_id: googleId,
					name: existingUser.name || name
				}
			} else {
				const [result] = await pool.query(
					'INSERT INTO users (name, email, password, google_id) VALUES (?, ?, NULL, ?)',
					[name, email, googleId]
				)

				user = {
					id: result.insertId,
					name,
					email,
					role: 'user',
					google_id: googleId
				}
			}
		}

		const token = generateToken(user.id, user.email)

		// Setear cookie httpOnly (igual que en login/register)
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 24 * 60 * 60 * 1000 // 24 horas
		})

		res.json({
			success: true,
			message: 'Login con Google exitoso',
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role
			}
		})
	} catch (error) {
		const friendlyError = getFriendlyGoogleError(error)
		res.status(friendlyError.status).json({
			success: false,
			message: friendlyError.message,
			...(isAuthDebugEnabled
				? {
					errorCode: error?.code || null,
					errorDetail: error?.message || null
				}
				: {})
		})
	}
})

export default router
