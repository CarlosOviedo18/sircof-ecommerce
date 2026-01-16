import React from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

function SignUp() {
  const [state, setState] = React.useState({
    name: "",
    email: "",
    password: "",
  })
  const navigate = useNavigate()
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
    
    console.log("📝 Datos del formulario:", { name, email, password })
    
    try {
      const response = await register(name, email, password)
      console.log("✅ Usuario registrado:", response)
      setState({ name: "", email: "", password: "" })
      // Redirigir a la página principal después del registro
      setTimeout(() => navigate("/"), 500)
    } catch (err) {
      console.error("❌ Error:", err.message)
    }
  }

  return (
    <form onSubmit={handleOnSubmit}>
      <h1>Create Account</h1>
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
      <span>or use your email for registration</span>
      <input
        type="text"
        placeholder="Name"
        name="name"
        value={state.name}
        onChange={handleChange}
      />
      <input
        type="email"
        placeholder="Email"
        name="email"
        value={state.email}
        onChange={handleChange}
      />
      <input
        type="password"
        placeholder="Password"
        name="password"
        value={state.password}
        onChange={handleChange}
      />
      {error && <p style={{ color: 'red', fontSize: '12px', margin: '8px 0' }}>❌ {error}</p>}
      <button disabled={loading}>{loading ? 'Registrando...' : 'Sign Up'}</button>
    </form>
  );
}

export default SignUp;
