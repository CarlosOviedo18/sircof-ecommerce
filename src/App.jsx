import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import Navigation from "./components/layout/Navigation.jsx";
import SecondNavigation from "./components/layout/SecondNavigation.jsx";
import Footer from "./components/layout/Footer.jsx";
import AboutUs from "./components/main/AboutUs.jsx";
import CupExperience from "./components/main/CupExperience.jsx";
import FeaturedProducts from "./components/main/FeaturedProducts.jsx";
import BeanToTable from "./components/main/BeanToTable.jsx";
import { PageAnimated } from "./animations/PageAnimated.jsx";
import { useSessionTimeout } from "./hooks/auth/useSessionTimeout.js";
import ScrollToTopButton from "./components/layout/ScrollToTopButton.jsx";
import "./styles/Navigation.css";
import TransparentNavigation from "./components/layout/TransparentNavigation.jsx";



// Lazy load - páginas secundarias
const LoginUsers = lazy(() => import("./pages/auth/LoginUsers.jsx"));
const StoreProduct = lazy(() => import("./pages/store/StoreProduct.jsx"));
const ProductDetail = lazy(() => import("./pages/store/ProductDetail.jsx"));
const CoffeeDetail = lazy(() => import("./pages/store/CoffeeDetail.jsx"));
const CheckoutPage = lazy(
  () => import("./pages/checkout/CheckoutPage.jsx"),
);
const CheckoutSuccess = lazy(
  () => import("./pages/checkout/CheckoutSuccess.jsx"),
);
const UserSettings = lazy(() => import("./pages/user/UserSettings.jsx"));
const ContactUs = lazy(() => import("./pages/contact/ContactUs.jsx"));
const Galery = lazy(() => import("./pages/content/Galery.jsx"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword.jsx"));
const AboutUsPage = lazy(
  () => import("./pages/about/AboutUsPage.jsx"),
);

// Lazy load - admin
const AdminRoute = lazy(() => import("./components/admin/AdminRoute.jsx"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts.jsx"));
const AdminCoffees = lazy(() => import("./pages/admin/AdminCoffees.jsx"));
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
  const location = useLocation();
  // Logout automático después de 30 minutos de inactividad
  useSessionTimeout(30);

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Rutas de autenticación sin Navigation ni Footer */}
          <Route
            path="/login"
            element={
              <PageAnimated>
                <LoginUsers />
              </PageAnimated>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PageAnimated>
                <ForgotPassword />
              </PageAnimated>
            }
          />

          {/* Rutas protegidas con Navigation y Footer */}
          <Route
            path="/"
            element={
              <PageAnimated>
                <>
                  <Navigation />
                  <AboutUs />
                  <CupExperience />
                  <BeanToTable />
                  <FeaturedProducts />
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
                  <ScrollToTopButton />
                </>
              </PageAnimated>
            }
          />

          {/* Página de Detalle del Café (con selector de presentación) */}
          <Route
            path="/cafe/:slug"
            element={
              <PageAnimated>
                <>
                  <SecondNavigation />
                  <CoffeeDetail />
                  <Footer />
                </>
              </PageAnimated>
            }
          />

          {/* URLs viejas por id de producto. Sigue montada a propósito:
              redirige a /cafe/:slug, y para el Pack (que no tiene café padre)
              renderiza la página de siempre sin cambios. */}
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
                  <ScrollToTopButton />
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
                  <ContactUs />
                  <Footer />
                  <ScrollToTopButton />
                </>
              </PageAnimated>
            }
          />

          {/* Página Sobre Nosotros */}
          <Route
            path="/sobre-nosotros"
            element={
              <PageAnimated>
                <>
                  <AboutUsPage />
                  <ScrollToTopButton />
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

          {/* Página de Checkout */}
          <Route
            path="/checkout"
            element={
              <PageAnimated>
                <>
                  <SecondNavigation />
                  <CheckoutPage />
                  <Footer />
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
            <Route path="coffees" element={<AdminCoffees />} />
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
