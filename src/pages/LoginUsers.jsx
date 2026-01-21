import React, { useState } from "react";
import SignIn from "../components/auth/SignIn.jsx";
import SignUp from "../components/auth/SignUp.jsx";
// import "../styles/LoginUsers.css";

function LoginUsers() {
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
