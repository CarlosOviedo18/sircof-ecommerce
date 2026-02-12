import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/LoginUsers.css";

function SignIn() {
  const [state, setState] = React.useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error } = useAuth();

  const handleChange = (evt) => {
    const value = evt.target.value;
    setState({
      ...state,
      [evt.target.name]: value,
    });
  };

  const handleOnSubmit = async (evt) => {
    evt.preventDefault();
    const { email, password } = state;
    
    try {
      await login(email, password);
      setState({ email: "", password: "" });
      
      const returnTo = location.state?.returnTo;
      setTimeout(() => navigate(returnTo || "/"), 500);
    } catch (err) {
      console.error('Error en login:', err.message);
    }
  };

  return (
    <form onSubmit={handleOnSubmit}>
      <h1>Iniciar Sesión</h1>
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
      <span>o usa tu cuenta SIRCOF</span>
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
      <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
      <button disabled={loading}>{loading ? 'Iniciando sesión...' : 'Inicia Sesión'}</button>
    </form>
  );
}

export default SignIn;
