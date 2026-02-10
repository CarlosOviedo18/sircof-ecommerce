import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
import Contactenos from "./pages/Contactenos.jsx";
import { PageAnimated } from "./animations/PageAnimated.jsx";
import { useSessionTimeout } from "./hooks/useSessionTimeout.js";
import Galery from "./pages/Galery.jsx";
import './styles/Navigation.css';

// Admin imports
import AdminRoute from "./components/admin/AdminRoute.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminContacts from "./pages/admin/AdminContacts.jsx";


function App() {
  const location = useLocation()
  // Logout automático después de 30 minutos de inactividad
  useSessionTimeout(30)

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
      {/* Rutas de autenticación sin Navigation ni Footer */}
      <Route path="/login" element={<PageAnimated><LoginUsers /></PageAnimated>} />

      {/* Rutas protegidas con Navigation y Footer */}
      <Route
        path="/"
        element={
          <PageAnimated>
            <>
              <Navigation />
              <SobreNosotros />
              <ExperienciaEnTaza />
              <GranoTuMesa />
              <PromoProductos />
              <Footer />
            </>
          </PageAnimated>
        }
      />

      {/* Página de Tienda */}
      <Route
        path="/tienda"
        element={
          <PageAnimated>
            <>
              <SecondNavigation />
              <StoreProduct />
              <Footer />
            </>
          </PageAnimated>
        }
      />

      {/* Página de Detalle del Producto */}
      <Route
        path="/producto/:id"
        element={
          <PageAnimated>
            <>
              <SecondNavigation />
              <ProductDetail />
              <Footer />
            </>
          </PageAnimated>
        }
      />

        {/* Página de Configuración de Usuario */}
      <Route
        path="/user-settings"
        element={
          <PageAnimated>
            <>
              <SecondNavigation />
              <UserSettings />
              <Footer />
            </>
          </PageAnimated>
        }
      />

        {/* Página de Contactenos */}
      <Route
        path="/contactenos"
        element={
          <PageAnimated>
            <>
              <SecondNavigation />
              <Contactenos />
              <Footer />
            </>
          </PageAnimated>
        }
      />

          {/* Página de Galeria */}
      <Route
        path="/galeria"
        element={
          <PageAnimated>
            <>
            
              <Galery />
            
            </>
          </PageAnimated>
        }
      />

      {/* Página de Éxito del Pago */}
      <Route
        path="/checkout/success"
        element={
          <PageAnimated>
            <>
              <SecondNavigation />
              <CheckoutSuccess />
              <Footer />
            </>
          </PageAnimated>
        }
      />

      {/* Panel de Administración */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="contacts" element={<AdminContacts />} />
      </Route>

      </Routes>
    </AnimatePresence>
  );
}

export default App;
