import CoffeeCup3D from '../../animations/CoffeeCup3D'
import leaf4 from '../../assets/img/leaf4.png'
import leaf1 from '../../assets/img/leaf1.png'
import '../../styles/AboutUsPage.css'
import { useTranslation } from 'react-i18next'
import TransparentNavigation from "../../components/layout/TransparentNavigation.jsx";
function AboutUsPage() {
  const { t } = useTranslation('about');
  return (


    
    <div className="about-page">
      {/* Elemento 3D - Taza de café */}
      <CoffeeCup3D
        modelPath="/models/sample.glb"
        sectionSelector=".about-section"
      />

         <div className="absolute top-0 left-0 right-0 z-50">
        <TransparentNavigation />
      </div>

      {/* Banner */}
      <section className="about-section" id="banner">
        <div className="about-content-fit">
          <div className="about-title-main" data-before={t('banner.dataBefore')}>{t('banner.title')}</div>
          <p className="banner-subtitle">{t('banner.subtitle')}</p>
        </div>
        <img src={leaf4} className="decorate leaf4-banner" alt="" />
        <div className="scroll-indicator">
          <span>{t('banner.scroll')}</span>
          <div className="arrow">↓</div>
        </div>
      </section>

      {/* Sección 01 - Empresa Familiar */}
      <section className="about-section" id="intro">
        <div className="about-content-fit">
          <div className="about-number">01</div>
          <div className="about-des">
            <div className="about-title">{t('section01.title')}</div>
            <p>
              {t('section01.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Sección 02 - Proceso Artesanal */}
      <section className="about-section" id="description">
        <div className="about-content-fit">
          <div className="about-number">02</div>
          <div className="about-des">
            <div className="about-title">{t('section02.title')}</div>
            <p>
              {t('section02.description')}
            </p>
          </div>
        </div>
        <img src={leaf1} className="decorate leaf1-description" alt="" />
      </section>

      {/* Sección 03 - Global & Local */}
      <section className="about-section" id="global">
        <div className="about-content-fit">
          <div className="about-number">03</div>
          <div className="about-des">
            <div className="about-title">{t('section03.title')}</div>
            <p>
              {t('section03.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Sección Misión, Visión & Valores */}
      <section className="about-section" id="mission">
        <img src={leaf4} className="decorate leaf-mission" alt="" />
        <div className="about-content-fit">
          <div className="mission-container">
            <div className="mission-title">
              <h2>{t('essence.title')}</h2>
            </div>
            <div className="mission-content">
              <div className="mission-item">
                <div className="mission-subtitle">{t('essence.mission.title')}</div>
                <p>
                  {t('essence.mission.description')}
                </p>
              </div>
              <div className="mission-item">
                <div className="mission-subtitle">{t('essence.vision.title')}</div>
                <p>
                  {t('essence.vision.description')}
                </p>
              </div>
            </div>
            <div className="values-section">
              <h3>{t('essence.valuesTitle')}</h3>
              <div className="values-grid">
                <div className="value-card">
                  <div className="value-number">01</div>
                  <div className="value-title">{t('essence.values.tradition.title')}</div>
                  <p>{t('essence.values.tradition.description')}</p>
                </div>
                <div className="value-card">
                  <div className="value-number">02</div>
                  <div className="value-title">{t('essence.values.quality.title')}</div>
                  <p>{t('essence.values.quality.description')}</p>
                </div>
                <div className="value-card">
                  <div className="value-number">03</div>
                  <div className="value-title">{t('essence.values.sustainability.title')}</div>
                  <p>{t('essence.values.sustainability.description')}</p>
                </div>
                <div className="value-card">
                  <div className="value-number">04</div>
                  <div className="value-title">{t('essence.values.passion.title')}</div>
                  <p>{t('essence.values.passion.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Contacto */}
      <section className="about-section" id="contact">
        <div className="about-content-fit">
          <div className="contact-container">
            <h2>{t('contact.title')}</h2>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutUsPage
