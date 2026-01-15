import { useState } from "react";
import Navigation from "./components/Navigation.jsx";
import Footer from "./components/Footer.jsx";
import SobreNosotros from "./components/main/SobreNosotros.jsx";
import ExperienciaEnTaza from "./components/main/ExperienciaEnTaza.jsx";
import PromoProductos from "./components/main/PromoProductos.jsx";
import GranoTuMesa from "./components/main/GranoTuMesa.jsx";

function App() {
  return (
    <>
      <Navigation />

      <SobreNosotros />
      <ExperienciaEnTaza />
      <GranoTuMesa />
      <PromoProductos />

      <Footer />
    </>
  );
}

export default App;
