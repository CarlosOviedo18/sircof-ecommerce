import { Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation.jsx";
import SecondNavigation from "./components/SecondNavigation.jsx";
import Footer from "./components/Footer.jsx";
import SobreNosotros from "./components/main/SobreNosotros.jsx";
import ExperienciaEnTaza from "./components/main/ExperienciaEnTaza.jsx";
import PromoProductos from "./components/main/PromoProductos.jsx";
import GranoTuMesa from "./components/main/GranoTuMesa.jsx";
import LoginUsers from "./pages/LoginUsers.jsx";
import StoreProduct from "./pages/StoreProduct.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import CheckoutSuccess from "./pages/CheckoutSuccess.jsx";
import UserSettings from "./pages/UserSettings.jsx";


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

      {/* Página de Tienda */}
      <Route
        path="/tienda"
        element={
          <>
            <SecondNavigation />
            <StoreProduct />
            <Footer />
          </>
        }
      />

      {/* Página de Detalle del Producto */}
      <Route
        path="/producto/:id"
        element={
          <>
            <SecondNavigation />
            <ProductDetail />
            <Footer />
          </>
        }
      />

        {/* Página de Configuración de Usuario */}
      <Route
        path="/user-settings"
        element={
          <>
            <SecondNavigation />
            <UserSettings />
            <Footer />
          </>
        }
      />

      {/* Página de Éxito del Pago */}
      <Route
        path="/checkout/success"
        element={
          <>
            <SecondNavigation />
            <CheckoutSuccess />
            <Footer />
          </>
        }
      />
    </Routes>

    
  );
}

export default App;
