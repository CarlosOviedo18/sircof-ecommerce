import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/LoginUsers.css";

function SignIn() {
  const [state, setState] = React.useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
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
    
    console.log("📝 Datos del formulario:", { email, password });
    
    try {
      const response = await login(email, password);
      console.log("✅ Usuario autenticado:", response);
      setState({ email: "", password: "" });
      // Redirigir a la página principal después del login
      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      console.error("❌ Error:", err.message);
    }
  };

  return (
    <form onSubmit={handleOnSubmit}>
      <h1>Sign In</h1>
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
      <span>or use your account</span>
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
      <a href="#">Forgot your password?</a>
      <button disabled={loading}>{loading ? 'Iniciando sesión...' : 'Sign In'}</button>
    </form>
  );
}

export default SignIn;
