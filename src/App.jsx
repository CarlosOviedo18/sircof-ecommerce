import { Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation.jsx";
import Footer from "./components/Footer.jsx";
import SobreNosotros from "./components/main/SobreNosotros.jsx";
import ExperienciaEnTaza from "./components/main/ExperienciaEnTaza.jsx";
import PromoProductos from "./components/main/PromoProductos.jsx";
import GranoTuMesa from "./components/main/GranoTuMesa.jsx";
import LoginUsers from "./pages/LoginUsers.jsx";

function App() {
  return (
    <Routes>
      {/* Rutas de autenticación sin Navigation ni Footer */}
      <Route path="/login" element={<LoginUsers />} />

      {/* Rutas protegidas con Navigation y Footer */}
      <Route
        path="/"
        element={
          <>
            <Navigation />
            <SobreNosotros />
            <ExperienciaEnTaza />
            <GranoTuMesa />
            <PromoProductos />
            <Footer />
          </>
        }
      />
    </Routes>
  );
}

export default App;
