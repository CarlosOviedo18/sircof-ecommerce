import React from "react";
import { Link } from "react-router-dom";
import fotosPatrones from "../../assets/webp/foto patrones.webp";
import canastoCafe from "../../assets/webp/canasto con cafe.webp";
import sobreNosotros from "../../assets/webp/SobreNosotros.webp";
import tour1 from "../../assets/webp/tours1.webp";
import Stack from "../Stack";

function GranoTuMesa() {
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
              DISFRUTA
            </p>
            <h2 className="text-5xl md:text-4xl font-bold leading-tight mt-2">
              Del grano a tu mesa
            </h2>
          </div>

          <p className="text-gray-300 text-lg leading-relaxed ">
            Seleccionamos y tostamos nuestro propio café para asegurar un sabor
            auténtico y lleno de frescura. Ahora puedes disfrutarlo adquiriéndolo
            directamente en nuestra tienda y llevar a tu hogar una experiencia
            única en cada taza.
          </p>

          <div className="flex md:justify-start justify-center">
            <Link to="/tienda" onClick={() => window.scrollTo(0, 0)}  className="bg-red-500 hover:bg-red-600 transition-colors text-white font-bold py-3 px-8 rounded text-lg inline-block">
              Ordena al tuyo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GranoTuMesa;
