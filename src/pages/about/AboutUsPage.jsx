import CoffeeCup3D from '../../animations/CoffeeCup3D'
import leaf4 from '../../assets/img/leaf4.png'
import leaf1 from '../../assets/img/leaf1.png'
import '../../styles/AboutUsPage.css'
import TransparentNavigation from "../../components/layout/TransparentNavigation.jsx";
function AboutUsPage() {
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
          <div className="about-title-main" data-before="ARTESANAL">CAFE SIRCOF</div>
          <p className="banner-subtitle">Café artesanal de las montañas de Costa Rica</p>
        </div>
        <img src={leaf4} className="decorate leaf4-banner" alt="" />
        <div className="scroll-indicator">
          <span>Scroll</span>
          <div className="arrow">↓</div>
        </div>
      </section>

      {/* Sección 01 - Empresa Familiar */}
      <section className="about-section" id="intro">
        <div className="about-content-fit">
          <div className="about-number">01</div>
          <div className="about-des">
            <div className="about-title">Una Empresa Familiar</div>
            <p>
              Café Sircof es una empresa familiar costarricense con más de 20 años de
              tradición y pasión por el café. Nacida en el corazón de las montañas de
              Costa Rica, nuestra empresa es impulsada principalmente por mi papá,
              quien junto con la familia dedica su vida a cada detalle de nuestro proceso.
            </p>
          </div>
        </div>
      </section>

      {/* Sección 02 - Proceso Artesanal */}
      <section className="about-section" id="description">
        <div className="about-content-fit">
          <div className="about-number">02</div>
          <div className="about-des">
            <div className="about-title">Proceso Artesanal</div>
            <p>
              Controlamos todo el proceso de producción: desde la recolección manual de
              los granos hasta el empaquetado final. Cada paso es realizado con dedicación
              para asegurar un producto de calidad superior.
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
            <div className="about-title">Global &amp; Local</div>
            <p>
              Nuestro café está presente en los principales mercados de Costa Rica y
              trasciende fronteras: exportamos a Estados Unidos y China, llevando la
              calidad y tradición de Café Sircof a mercados internacionales de alto valor.
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
              <h2>Nuestra Esencia</h2>
            </div>
            <div className="mission-content">
              <div className="mission-item">
                <div className="mission-subtitle">Misión</div>
                <p>
                  Producir café artesanal de excelencia que represente la esencia de
                  Costa Rica, combinando tradición familiar con innovación en cada grano.
                </p>
              </div>
              <div className="mission-item">
                <div className="mission-subtitle">Visión</div>
                <p>
                  Ser reconocidos como la marca de café artesanal familiar más confiable
                  y de mayor calidad en Centroamérica, despertando pasión por el café en
                  cada taza.
                </p>
              </div>
            </div>
            <div className="values-section">
              <h3>Nuestros Valores</h3>
              <div className="values-grid">
                <div className="value-card">
                  <div className="value-number">01</div>
                  <div className="value-title">Tradición</div>
                  <p>Conocimiento y experiencia transmitidos de generación en generación.</p>
                </div>
                <div className="value-card">
                  <div className="value-number">02</div>
                  <div className="value-title">Calidad</div>
                  <p>Excelencia en cada detalle, desde el grano hasta el producto final.</p>
                </div>
                <div className="value-card">
                  <div className="value-number">03</div>
                  <div className="value-title">Sostenibilidad</div>
                  <p>Cuidamos nuestras montañas y comunidades para las próximas generaciones.</p>
                </div>
                <div className="value-card">
                  <div className="value-number">04</div>
                  <div className="value-title">Pasión</div>
                  <p>Amor y entusiasmo reflejados en cada aspecto de Café Sircof.</p>
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
            <h2>¿Te gustaría probar nuestro café?</h2>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutUsPage
