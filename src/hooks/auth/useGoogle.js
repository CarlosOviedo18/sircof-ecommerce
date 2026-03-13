import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`

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

			const response = await fetch(`${API_URL}/google`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ credential })
			})

			const responseData = await parseJsonSafely(response)

			if (!response.ok) {
				throw new Error(responseData?.message || 'Error al iniciar sesión con Google')
			}

			if (!responseData?.token || !responseData?.user) {
				throw new Error('Respuesta inválida del servidor en login con Google')
			}

			const data = responseData
			localStorage.setItem('token', data.token)
			setAuthUser(data.user)
			return data
		} catch (err) {
			const errorMsg = err.message || 'Error al iniciar sesión con Google'
			console.error('Error en Google login:', errorMsg)
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
