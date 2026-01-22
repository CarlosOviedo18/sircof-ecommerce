import React from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

function SignUp({ onSignUpSuccess }) {
  const navigate = useNavigate()
  const [state, setState] = React.useState({
    name: "",
    email: "",
    password: "",
  })
  const { register, loading, error } = useAuth()

  const handleChange = (evt) => {
    const value = evt.target.value
    setState({
      ...state,
      [evt.target.name]: value,
    })
  }

  const handleOnSubmit = async (evt) => {
    evt.preventDefault()
    const { name, email, password } = state
    
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
      {error && <p style={{ color: 'red', fontSize: '12px', margin: '8px 0' }}>{error}</p>}
      <button disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
    </form>
  );
}

export default SignUp;
