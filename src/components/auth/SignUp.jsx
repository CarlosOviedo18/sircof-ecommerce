import React from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../../hooks/useAuth"
import { staggerContainer, staggerItem } from "../../animations/animations"

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/

function SignUp({ onSignUpSuccess }) {
  const navigate = useNavigate()
  const [state, setState] = React.useState({
    name: "",
    email: "",
    password: "",
  })
  const [passwordError, setPasswordError] = React.useState("")
  const { register, loading, error } = useAuth()

  const handleChange = (evt) => {
    const value = evt.target.value
    setState({
      ...state,
      [evt.target.name]: value,
    })
    // Limpiar error de contraseña al escribir
    if (evt.target.name === 'password') {
      setPasswordError('')
    }
  }

  const handleOnSubmit = async (evt) => {
    evt.preventDefault()
    const { name, email, password } = state

    // Validar contraseña antes de enviar
    if (!PASSWORD_REGEX.test(password)) {
      setPasswordError('Mínimo 8 caracteres, una mayúscula y un número')
      return
    }
    
    try {
      await register(name, email, password)
      setState({ name: "", email: "", password: "" })
      if (onSignUpSuccess) {
        onSignUpSuccess()
      }
    } catch (err) {
      console.error('Error en registro:', err.message)
    }
  }

  return (
    <form onSubmit={handleOnSubmit}>
      <h1>Crear Cuenta</h1>
      <div className="social-container">
        <a href="#" className="social">
          <i className="fab fa-facebook-f" />
        </a>
        <a href="#" className="social">
          <i className="fab fa-google-plus-g" />
        </a>
        <a href="#" className="social">
          <i className="fab fa-linkedin-in" />
        </a>
      </div>
      <span>o usa tu correo para registrarte</span>
      <input
        type="text"
        placeholder="Nombre"
        name="name"
        value={state.name}
        onChange={handleChange}
      />
      <input
        type="email"
        placeholder="Correo"
        name="email"
        value={state.email}
        onChange={handleChange}
      />
      <input
        type="password"
        placeholder="Contraseña"
        name="password"
        value={state.password}
        onChange={handleChange}
      />
      {state.password && !PASSWORD_REGEX.test(state.password) && (
        <div style={{ fontSize: '11px', color: '#888', margin: '4px 0', textAlign: 'left', width: '100%' }}>
          <span style={{ color: state.password.length >= 8 ? 'green' : '#888' }}>✓ 8 caracteres</span>{' · '}
          <span style={{ color: /[A-Z]/.test(state.password) ? 'green' : '#888' }}>✓ Mayúscula</span>{' · '}
          <span style={{ color: /\d/.test(state.password) ? 'green' : '#888' }}>✓ Número</span>
        </div>
      )}
      {passwordError && <p style={{ color: 'red', fontSize: '12px', margin: '8px 0' }}>{passwordError}</p>}
      {error && <p style={{ color: 'red', fontSize: '12px', margin: '8px 0' }}>{error}</p>}
      <button disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
    </form>
  );
}

export default SignUp;
