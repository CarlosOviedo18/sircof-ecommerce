import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../hooks/auth/useAuth";
import { useGoogle } from '../../hooks/auth/useGoogle';
import "../../styles/LoginUsers.css";

function SignIn({ isActive = true }) {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [state, setState] = React.useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('auth');
  const { login, loading, error } = useAuth();
  const { loginWithGoogle, loading: googleLoading, error: googleError } = useGoogle();

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

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      return;
    }

    try {
      await loginWithGoogle(credentialResponse.credential);

      const returnTo = location.state?.returnTo;
      setTimeout(() => navigate(returnTo || "/"), 500);
    } catch (err) {
      console.error('Error en login con Google:', err.message);
    }
  };

  return (
    <form onSubmit={handleOnSubmit}>
      <h1>{t('signIn.title')}</h1>
      <div className="social-container">
        {googleClientId && isActive ? (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.error('Google Login falló en el cliente')}
            useOneTap={false}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            logo_alignment="left"
          />
        ) : null}
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
      {(error || googleError) && <p style={{ color: 'red', fontSize: '12px', margin: '8px 0' }}>{error || googleError}</p>}
      {googleLoading && <p style={{ color: '#666', fontSize: '12px', margin: '8px 0' }}>Iniciando con Google...</p>}
      <Link to="/forgot-password">{t('signIn.forgotPassword')}</Link>
      <button disabled={loading}>{loading ? t('signIn.loading') : t('signIn.submit')}</button>
    </form>
  );
}

export default SignIn;
