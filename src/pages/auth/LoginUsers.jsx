import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import SignIn from "../../components/auth/SignIn.jsx";
import SignUp from "../../components/auth/SignUp.jsx";
import { TransitionLogin, buttonVariants } from "../../animations/TransitionLogin.jsx";
// import "../styles/LoginUsers.css";

function LoginUsers() {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
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
    <TransitionLogin>
      <div className="App">
        <motion.button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 z-50"
          title={t('loginPage.backToMenu')}
          variants={buttonVariants}
        >
          {t('loginPage.back')}
        </motion.button>
      <div className={containerClass} id="container">
        <div className="form-container sign-up-container">
          <SignUp
            onSignUpSuccess={() => setType("signIn")}
            isActive={type === "signUp"}
          />
        </div>
        <div className="form-container sign-in-container">
          <SignIn isActive={type === "signIn"} />
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>{t('loginPage.welcomeBack')}</h1>
              <p>
                {t('loginPage.welcomeBackDesc')}
              </p>
              <button
                className="ghost"
                id="signIn"
                onClick={() => handleOnClick("signIn")}
              >
                {t('loginPage.signInButton')}
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>{t('loginPage.areYouNew')}</h1>
              <p>{t('loginPage.areYouNewDesc')}</p>
              <button
                className="ghost"
                id="signUp"
                onClick={() => handleOnClick("signUp")}
              >
                {t('loginPage.signUpButton')}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </TransitionLogin>
  );
}

export default LoginUsers;
