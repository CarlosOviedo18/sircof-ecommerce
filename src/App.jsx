import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import Navigation from "./components/Navigation.jsx";
import SecondNavigation from "./components/SecondNavigation.jsx";
import Footer from "./components/Footer.jsx";
import SobreNosotros from "./components/main/SobreNosotros.jsx";
import ExperienciaEnTaza from "./components/main/ExperienciaEnTaza.jsx";
import PromoProductos from "./components/main/PromoProductos.jsx";
import GranoTuMesa from "./components/main/GranoTuMesa.jsx";
import { PageAnimated } from "./animations/PageAnimated.jsx";
import { useSessionTimeout } from "./hooks/useSessionTimeout.js";
import ScrollToTopButton from "./components/ScrollToTopButton.jsx";
import './styles/Navigation.css';

// Lazy load - páginas secundarias
const LoginUsers = lazy(() => import("./pages/LoginUsers.jsx"));
const StoreProduct = lazy(() => import("./pages/StoreProduct.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess.jsx"));
const UserSettings = lazy(() => import("./pages/UserSettings.jsx"));
const Contactenos = lazy(() => import("./pages/Contactenos.jsx"));
const Galery = lazy(() => import("./pages/Galery.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));

// Lazy load - admin
const AdminRoute = lazy(() => import("./components/admin/AdminRoute.jsx"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts.jsx"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders.jsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.jsx"));
const AdminContacts = lazy(() => import("./pages/admin/AdminContacts.jsx"));

// Loader mientras cargan las páginas
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-neutral-900">
    <div className="w-10 h-10 border-4 border-coffee border-t-transparent rounded-full animate-spin"></div>
  </div>
);


function App() {
  const location = useLocation()
  // Logout automático después de 30 minutos de inactividad
  useSessionTimeout(30)

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
      {/* Rutas de autenticación sin Navigation ni Footer */}
      <Route path="/login" element={<PageAnimated><LoginUsers /></PageAnimated>} />
      <Route path="/forgot-password" element={<PageAnimated><ForgotPassword /></PageAnimated>} />

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
              <ScrollToTopButton />
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
      </Suspense>
    </AnimatePresence>
  );
}

export default App;
