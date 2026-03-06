import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useForgotPassword } from '../../hooks/auth/useForgotPassword.js'
import '../../styles/LoginUsers.css'

function ForgotPassword() {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')
  const {
    step,
    email, setEmail,
    code, setCode,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    loading, error, success,
    sendResetCode,
    verifyCode,
    resetPassword,
    resendCode
  } = useForgotPassword()

  return (
    <div className="App">
      {/* Botón volver */}
      <motion.button
        onClick={() => navigate('/login')}
        className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 z-50"
        title={t('forgotPassword.backToLogin')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {t('forgotPassword.back')}
      </motion.button>

      <motion.div
        className="container"
        style={{ maxWidth: '440px', minHeight: 'auto', padding: '0', fontFamily: "'Poppins', sans-serif" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Indicador de pasos */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          padding: '24px 20px 0',
          background: '#fff',
          borderRadius: '10px 10px 0 0'
        }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: step >= s ? '#6f4e37' : '#e0e0e0',
                color: step >= s ? '#fff' : '#999',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                transition: 'all 0.3s ease'
              }}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div style={{
                  width: '40px',
                  height: '2px',
                  backgroundColor: step > s ? '#6f4e37' : '#e0e0e0',
                  transition: 'all 0.3s ease'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Contenido del formulario */}
        <div style={{ padding: '20px 50px 30px', background: '#fff', borderRadius: '0 0 10px 10px' }}>

          {/* Mensajes de éxito/error */}
          {error && (
            <p style={{
              color: '#d32f2f',
              fontSize: '13px',
              margin: '0 0 12px',
              padding: '8px 12px',
              backgroundColor: '#ffeef0',
              borderRadius: '6px',
              fontFamily: 'Montserrat, sans-serif'
            }}>{error}</p>
          )}
          {success && step !== 4 && (
            <p style={{
              color: '#2e7d32',
              fontSize: '13px',
              margin: '0 0 12px',
              padding: '8px 12px',
              backgroundColor: '#e8f5e9',
              borderRadius: '6px',
              fontFamily: 'Montserrat, sans-serif'
            }}>{success}</p>
          )}

          {/* ========== PASO 1: Ingresar correo ========== */}
          {step === 1 && (
            <form onSubmit={sendResetCode}>
              <h1 style={{ fontSize: '22px', marginBottom: '8px' }}>{t('forgotPassword.step1Title')}</h1>
              <span style={{ color: '#666', display: 'block', marginBottom: '20px' }}>
                {t('forgotPassword.step1Subtitle')}
              </span>
              <input
                type="email"
                placeholder={t('forgotPassword.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={loading} style={{ marginTop: '16px' }}>
                {loading ? t('forgotPassword.sending') : t('forgotPassword.sendCode')}
              </button>
            </form>
          )}

          {/* ========== PASO 2: Verificar código ========== */}
          {step === 2 && (
            <form onSubmit={verifyCode}>
              <h1 style={{ fontSize: '22px', marginBottom: '8px' }}>{t('forgotPassword.step2Title')}</h1>
              <span style={{ color: '#666', display: 'block', marginBottom: '20px' }}>
                {t('forgotPassword.step2Subtitle')} <strong>{email}</strong>
              </span>
              <input
                type="text"
                placeholder={t('forgotPassword.codePlaceholder')}
                value={code}
                onChange={(e) => {
                  // Solo permitir números, máximo 6 dígitos
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setCode(val)
                }}
                maxLength={6}
                required
                style={{
                  textAlign: 'center',
                  fontSize: '24px',
                  letterSpacing: '8px',
                  fontWeight: 'bold'
                }}
              />
              <button type="submit" disabled={loading} style={{ marginTop: '16px' }}>
                {loading ? t('forgotPassword.verifying') : t('forgotPassword.verifyCode')}
              </button>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); resendCode(); }}
                style={{ marginTop: '12px', display: 'block' }}
              >
                {t('forgotPassword.resendCode')}
              </a>
            </form>
          )}

          {/* ========== PASO 3: Nueva contraseña ========== */}
          {step === 3 && (
            <form onSubmit={resetPassword}>
              <h1 style={{ fontSize: '22px', marginBottom: '8px' }}>{t('forgotPassword.step3Title')}</h1>
              <span style={{ color: '#666', display: 'block', marginBottom: '20px' }}>
                {t('forgotPassword.step3Subtitle')}
              </span>
              <input
                type="password"
                placeholder={t('forgotPassword.newPassword')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder={t('forgotPassword.confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit" disabled={loading} style={{ marginTop: '16px' }}>
                {loading ? t('forgotPassword.changing') : t('forgotPassword.changePassword')}
              </button>
            </form>
          )}

          {/* ========== PASO 4: Éxito ========== */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#e8f5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '28px'
              }}>
                ✓
              </div>
              <h1 style={{ fontSize: '22px', marginBottom: '8px' }}>{t('forgotPassword.step4Title')}</h1>
              <span style={{ color: '#666', display: 'block', marginBottom: '24px' }}>
                {t('forgotPassword.step4Subtitle')}
              </span>
              <button onClick={() => navigate('/login')}>
                {t('forgotPassword.goToLogin')}
              </button>
            </div>
          )}

          {/* Link volver al login (pasos 1-3) */}
          {step < 4 && (
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('/login'); }}
              style={{ marginTop: '16px', display: 'block', textAlign: 'center' }}
            >
              {t('forgotPassword.backToLoginLink')}
            </a>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword
