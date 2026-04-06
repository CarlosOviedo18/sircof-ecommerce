import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { API_CONFIG, buildFullUrl } from '../../config/api'

const parseJsonSafely = async (response) => {
	const raw = await response.text()
	if (!raw) {
		return null
	}

	try {
		return JSON.parse(raw)
	} catch {
		return null
	}
}

export const useGoogle = () => {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const { setUser: setAuthUser } = useAuthContext()

	const loginWithGoogle = async (credential) => {
		try {
			setLoading(true)
			setError(null)

			const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.GOOGLE), {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ credential })
			})

			const responseData = await parseJsonSafely(response)

			if (!response.ok) {
				throw new Error(responseData?.message || 'Error al iniciar sesión con Google')
			}

			if (!responseData?.user) {
				throw new Error('Respuesta inválida del servidor en login con Google')
			}

			// El token ya está en httpOnly cookie, solo guardamos el user
			setAuthUser(responseData.user)
			return responseData
		} catch (err) {
			const errorMsg = err.message || 'Error al iniciar sesión con Google'
			setError(errorMsg)
			throw err
		} finally {
			setLoading(false)
		}
	}

	return {
		loginWithGoogle,
		loading,
		error
	}
}
