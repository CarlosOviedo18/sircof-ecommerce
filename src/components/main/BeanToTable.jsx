import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import fotosPatrones from "../../assets/webp/foto patrones.webp";
import canastoCafe from "../../assets/webp/canasto con cafe.webp";
import sobreNosotros from "../../assets/webp/SobreNosotros.webp";
import tour1 from "../../assets/webp/tours1.webp";
import Stack from "../ui/Stack";

function BeanToTable() {
  const { t } = useTranslation('home')
  const images = [fotosPatrones, canastoCafe, tour1];
  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${sobreNosotros})` }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 "></div>

      {/* Contenido */}
      <div className="relative z-10 flex flex-col md:grid md:grid-cols-2 gap-12 items-center px-6 md:px-12 py-12 min-h-screen justify-center">
        {/* Lado Izquierdo - Imágenes con Stack */}
        <div className="flex items-center justify-center w-full md:w-auto">
          <div style={{ width: 500, height: 500, perspective: "1000px" }}>
            <h1 className=" text-center text-xs sm:text-sm text-white/70 font-light tracking-widest uppercase">{t('beanToTable.dragHint')}</h1>
            <Stack
              randomRotation={true}
              sensitivity={180}
              sendToBackOnClick={true}
              cards={images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`card-${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ))}
            />
          </div>
        </div>

        {/* Lado Derecho - Texto y CTA */}
        <div className="text-white flex flex-col justify-center space-y-6 text-center md:text-left">
          <div>
            <p className="text-sm font-semibold text-gray-300 tracking-widest">
              {t('beanToTable.enjoy')}
            </p>
            <h2 className="text-5xl md:text-4xl font-serif leading-tight mt-2">
              {t('beanToTable.title')}
            </h2>
          </div>

          <p className="text-gray-300 text-lg leading-relaxed ">
            {t('beanToTable.description')}
          </p>

          <div className="flex md:justify-start justify-center">
            <Link to="/tienda" onClick={() => window.scrollTo(0, 0)}  className="bg-red-500 hover:bg-red-600 transition-colors text-white font-bold py-3 px-8 rounded text-lg inline-block">
              {t('beanToTable.orderYours')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BeanToTable;
