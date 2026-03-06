import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../hooks/auth/useAuth";
import "../../styles/LoginUsers.css";

function SignIn() {
  const [state, setState] = React.useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('auth');
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
      <h1>{t('signIn.title')}</h1>
      <div className="social-container">
      
        <a href="#" className="social">
          <i className="fab fa-google-plus-g" />
        </a>
       
      </div>
      <span>{t('signIn.orUseAccount')}</span>
      <input
        type="email"
        placeholder={t('signIn.email')}
        name="email"
        value={state.email}
        onChange={handleChange}
      />
      <input
        type="password"
        placeholder={t('signIn.password')}
        name="password"
        value={state.password}
        onChange={handleChange}
      />
      {error && <p style={{ color: 'red', fontSize: '12px', margin: '8px 0' }}>{error}</p>}
      <Link to="/forgot-password">{t('signIn.forgotPassword')}</Link>
      <button disabled={loading}>{loading ? t('signIn.loading') : t('signIn.submit')}</button>
    </form>
  );
}

export default SignIn;
