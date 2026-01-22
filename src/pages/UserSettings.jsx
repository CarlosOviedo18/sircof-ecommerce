import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useAuth } from "../hooks/useAuth";
import { usePurchases } from "../hooks/useOrders";
import { useUserProfile } from "../hooks/useUserProfile";

function UserSettings() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { logout } = useAuth();
  const { purchases, loading: loadingPurchases, error: purchasesError, fetchPurchases } = usePurchases();
  const { updateEmail, updatePassword, loading: loadingProfile } = useUserProfile();
  const [activeTab, setActiveTab] = useState("profile");
  const [animatingField, setAnimatingField] = useState(null);
  
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  // Traer órdenes cuando cambias al tab de compras
  useEffect(() => {
    if (activeTab === "purchases") {
      fetchPurchases();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setMessage({ type: "error", text: "Por favor ingresa un correo" });
      return;
    }

    setAnimatingField("email");
    const result = await updateEmail(formData.email);
    setMessage({ type: result.success ? "success" : "error", text: result.message });
    
    if (result.success) {
      setFormData(prev => ({ ...prev, email: "" }));
    }
    
    setTimeout(() => {
      setMessage({ type: "", text: "" });
      setAnimatingField(null);
    }, 3000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setMessage({ type: "error", text: "Por favor completa todos los campos" });
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    setAnimatingField("password");
    const result = await updatePassword(formData.currentPassword, formData.newPassword);
    setMessage({ type: result.success ? "success" : "error", text: result.message });
    
    if (result.success) {
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    }
    
    setTimeout(() => {
      setMessage({ type: "", text: "" });
      setAnimatingField(null);
    }, 3000);
  };

  const handleLogout = () => {
      logout();
      navigate("/");
    
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              title="Volver"
            >
              ← Atrás
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
          </div>
          <p className="text-gray-600">Bienvenido, {user?.name || "Usuario"}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-4 px-2 font-semibold transition-colors ${
              activeTab === "profile"
                ? "text-coffee border-b-2 border-coffee"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`pb-4 px-2 font-semibold transition-colors ${
              activeTab === "purchases"
                ? "text-coffee border-b-2 border-coffee"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Mis Compras
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 gap-8">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              {/* Change Email */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cambiar Correo Electrónico</h2>
                {message.type && animatingField === "email" && (
                  <div className={`mb-4 p-4 rounded-lg animate-pulse ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {message.text}
                  </div>
                )}
                <form onSubmit={handleChangeEmail} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Correo Actual</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Nuevo Correo</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ejemplo@correo.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-coffee"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingProfile}
                    className="px-6 py-2 bg-coffee text-white font-semibold rounded-lg hover:bg-coffee/90 transition-colors disabled:opacity-50"
                  >
                    {loadingProfile ? "Actualizando..." : "Actualizar Correo"}
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cambiar Contraseña</h2>
                {message.type && animatingField === "password" && (
                  <div className={`mb-4 p-4 rounded-lg animate-pulse ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {message.text}
                  </div>
                )}
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Contraseña Actual</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-coffee"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Nueva Contraseña</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-coffee"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-coffee"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingProfile}
                    className="px-6 py-2 bg-coffee text-white font-semibold rounded-lg hover:bg-coffee/90 transition-colors disabled:opacity-50"
                  >
                    {loadingProfile ? "Actualizando..." : "Actualizar Contraseña"}
                  </button>
                </form>
              </div>

              {/* Logout */}
              <div className="bg-red-50 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-red-900 mb-4">Cerrar Sesión</h2>
                <p className="text-gray-700 mb-6">Cierra tu sesión de forma segura</p>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}

          {/* PURCHASES TAB */}
          {activeTab === "purchases" && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Compras</h2>
              {loadingPurchases ? (
                <p className="text-gray-600 text-center py-8">Cargando compras...</p>
              ) : purchasesError ? (
                <p className="text-red-600 text-center py-8">Error: {purchasesError}</p>
              ) : purchases.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No tienes compras realizadas aún</p>
              ) : (
                <div className="space-y-4">
                  {purchases.map(purchase => (
                    <div key={purchase.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">Orden #{purchase.id}</h3>
                          <p className="text-gray-600 text-sm">{formatDate(purchase.created_at)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          purchase.status === "completed" 
                            ? "bg-green-100 text-green-700"
                            : purchase.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {purchase.status === "completed" ? "Entregado" : purchase.status === "pending" ? "Pendiente" : "En tránsito"}
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="text-gray-700 font-medium mb-2">Productos:</p>
                        <ul className="list-disc list-inside">
                          {purchase.items?.map((item, idx) => (
                            <li key={idx} className="text-gray-600">
                              {item.name} x{item.quantity}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-2xl font-bold text-coffee">₡{parseFloat(purchase.total).toFixed(2)}</p>
                        <button className="px-4 py-2 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                          Ver Factura
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserSettings;