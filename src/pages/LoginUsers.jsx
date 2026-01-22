import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignIn from "../components/auth/SignIn.jsx";
import SignUp from "../components/auth/SignUp.jsx";
// import "../styles/LoginUsers.css";

function LoginUsers() {
  const navigate = useNavigate();
  const [type, setType] = useState("signIn");

  const handleOnClick = (text) => {
    if (text !== type) {
      setType(text);
      return;
    }
  };

  const containerClass =
    "container " + (type === "signUp" ? "right-panel-active" : "");

  return (
    <div className="App">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 z-50"
        title="Volver al menú principal"
      >
        ← Atrás
      </button>
      <div className={containerClass} id="container">
        <div className="form-container sign-up-container">
          <SignUp onSignUpSuccess={() => setType("signIn")} />
        </div>
        <div className="form-container sign-in-container">
          <SignIn />
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>¡Bienvenido de Vuelta!</h1>
              <p>
                Inicia sesión con tus datos para disfrutar de la mejor experiencia en café SIRCOF
              </p>
              <button
                className="ghost"
                id="signIn"
                onClick={() => handleOnClick("signIn")}
              >
                Iniciar Sesión
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>¿Eres Nuevo?</h1>
              <p>Únete a nuestra comunidad cafetera y descubre los mejores granos SIRCOF</p>
              <button
                className="ghost"
                id="signUp"
                onClick={() => handleOnClick("signUp")}
              >
                Registrarse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginUsers;
