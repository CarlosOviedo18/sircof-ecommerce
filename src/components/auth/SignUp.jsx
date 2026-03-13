import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/auth/useAuth";
import { GoogleLogin } from '@react-oauth/google';
import { useGoogle } from "../../hooks/auth/useGoogle";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

function SignUp({ onSignUpSuccess, isActive = true }) {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("auth");
  const {
    loginWithGoogle,
    loading: googleLoading,
    error: googleError,
  } = useGoogle();

  const [state, setState] = React.useState({
    name: "",
    email: "",
    password: "",
  });
  const [passwordError, setPasswordError] = React.useState("");
  const { register, loading, error } = useAuth();

  const handleChange = (evt) => {
    const value = evt.target.value;
    setState({
      ...state,
      [evt.target.name]: value,
    });
    // Limpiar error de contraseña al escribir
    if (evt.target.name === "password") {
      setPasswordError("");
    }
  };

  const handleOnSubmit = async (evt) => {
    evt.preventDefault();
    const { name, email, password } = state;

    // Validar contraseña antes de enviar
    if (!PASSWORD_REGEX.test(password)) {
      setPasswordError(t("signUp.passwordError"));
      return;
    }

    try {
      await register(name, email, password);
      setState({ name: "", email: "", password: "" });
      if (onSignUpSuccess) {
        onSignUpSuccess();
      }
    } catch (err) {
      console.error("Error en registro:", err.message);
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
      console.error("Error en login con Google:", err.message);
    }
  };

  return (
    <form onSubmit={handleOnSubmit}>
      <h1>{t("signUp.title")}</h1>
      <div className="social-container">
        {googleClientId && isActive ? (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.error("Google Login falló en el cliente")}
            useOneTap={false}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            logo_alignment="left"
          />
        ) : null}
      </div>
      {/* <span>{t('signIn.orUseAccount')}</span> */}
      <input
        type="email"
        placeholder={t("signUp.email")}
        name="email"
        value={state.email}
        onChange={handleChange}
      />
      <input
        type="password"
        placeholder={t("signUp.password")}
        name="password"
        value={state.password}
        onChange={handleChange}
      />
      {state.password && !PASSWORD_REGEX.test(state.password) && (
        <div
          style={{
            fontSize: "11px",
            color: "#888",
            margin: "4px 0",
            textAlign: "left",
            width: "100%",
          }}
        >
          <span
            style={{ color: state.password.length >= 8 ? "green" : "#888" }}
          >
            ✓ {t("signUp.passwordHint.chars")}
          </span>
          {" · "}
          <span
            style={{ color: /[A-Z]/.test(state.password) ? "green" : "#888" }}
          >
            ✓ {t("signUp.passwordHint.uppercase")}
          </span>
          {" · "}
          <span style={{ color: /\d/.test(state.password) ? "green" : "#888" }}>
            ✓ {t("signUp.passwordHint.number")}
          </span>
        </div>
      )}
      {passwordError && (
        <p style={{ color: "red", fontSize: "12px", margin: "8px 0" }}>
          {passwordError}
        </p>
      )}
      {error && (
        <p style={{ color: "red", fontSize: "12px", margin: "8px 0" }}>
          {error}
        </p>
      )}
      <button disabled={loading}>
        {loading ? t("signUp.loading") : t("signUp.submit")}
      </button>

      {(error || googleError) && (
        <p style={{ color: "red", fontSize: "12px", margin: "8px 0" }}>
          {error || googleError}
        </p>
      )}
      {googleLoading && (
        <p style={{ color: "#666", fontSize: "12px", margin: "8px 0" }}>
          Iniciando con Google...
        </p>
      )}
    </form>
  );
}

export default SignUp;
