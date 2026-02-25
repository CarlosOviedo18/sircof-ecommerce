
<img width="1897" height="775" alt="home" src="https://github.com/user-attachments/assets/ce87d58f-2662-4294-a68b-b30113e12de9" />
#  SIRCOF E-Commer
ce - Plataforma de Ventas de Café

Una plataforma de e-commerce moderna desarrollada con **React** y **Express.js** para la venta de café premium. Sistema completo con autenticación de usuarios, carrito de compras, pasarela de pagos y gestión de pedidos.

## Características Principales

 **Sistema de Autenticación**
- Registro e inicio de sesión seguro con JWT
- Hash de contraseñas con bcrypt
- Gestión de sesiones de usuario

 **Catálogo de Productos**
- Visualización de productos con filtros por línea (Premium/Nacional)
- Detalles de productos con imágenes y precios
- Acceso público sin requerir autenticación

 **Carrito de Compras**
- Agregar/remover productos en tiempo real
- Actualización dinámica de cantidad
- Badge contador de items en el carrito
- Sincronización automática entre componentes

 **Pasarela de Pagos**
- Integración con Tilopay para procesos de pago seguros
- Validación de números telefónicos
- Confirmación de compra con número de orden

 **Gestión de Cuenta de Usuario**
- Dashboard con perfil de usuario
- Historial de pedidos completo
- Actualización de email y contraseña
- Información de facturas y envíos

 **Interfaz Moderna**
- Diseño responsivo con Tailwind CSS
- Animaciones suaves con Framer Motion
- Tema visual profesional basado en café

##  Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v16 o superior ([Descargar](https://nodejs.org/))
- **npm** o **yarn** (viene con Node.js)
- **MySQL** 5.7 o superior ([Descargar](https://www.mysql.com/downloads/))
- Un editor de código como **VS Code** ([Descargar](https://code.visualstudio.com/))

## 📥 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/sircof-ecommerce.git
cd sircof-ecommerce
```

### 2. Instalar dependencias del frontend

```bash
npm install
```

### 3. Configurar la base de datos

#### Crear la base de datos
```bash
mysql -u root -p
```

En la consola de MySQL:
```sql
CREATE DATABASE sircof_db;
USE sircof_db;
SOURCE database/db.sql;
EXIT;
```

#### Variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Frontend
VITE_API_URL=http://localhost:3000

# Backend
PORT=3000
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=tu_contraseña_mysql
DATABASE_NAME=sircof_db
JWT_SECRET=tu_clave_secreta_jwt
TILOPAY_API_KEY=tu_api_key_tilopay
TILOPAY_API_URL=https://sandbox.tilopay.com
```

### 4. Instalar dependencias del backend

```bash
cd backend
npm install
cd ..
```

## Cómo Ejecutar el Proyecto

### Opción 1: Terminal Única (Recomendado)

```bash
npm run dev
```

Este comando ejecuta automáticamente:
- Frontend en `http://localhost:5173`
- Backend en `http://localhost:3000`

### Opción 2: Terminales Separadas

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run server
```

##  Estructura del Proyecto

```
sircof-ecommerce/
├── src/
│   ├── components/          # Componentes React reutilizables
│   │   ├── Navigation.jsx   # Navegación principal
│   │   ├── SecondNavigation.jsx  # Navegación secundaria con carrito
│   │   ├── Cart/            # Componentes del carrito
│   │   ├── auth/            # Componentes de autenticación
│   │   └── main/            # Componentes de contenido
│   ├── context/             # Context API para estado global
│   │   ├── AuthContext.jsx  # Contexto de autenticación
│   │   └── CartContext.jsx  # Contexto del carrito
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.js       # Hook para autenticación
│   │   ├── useCart.js       # Hook para carrito
│   │   ├── usePayment.js    # Hook para pagos
│   │   └── ...
│   ├── pages/               # Páginas principales
│   │   ├── StoreProduct.jsx # Tienda
│   │   ├── UserSettings.jsx # Perfil del usuario
│   │   ├── CheckoutSuccess.jsx # Confirmación de compra
│   │   └── ...
│   ├── routes/              # Rutas API (backend)
│   │   ├── auth.js          # Rutas de autenticación
│   │   ├── cart.js          # Rutas del carrito
│   │   ├── payment.js       # Rutas de pagos
│   │   └── ...
│   ├── lib/                 # Utilidades (crypto, JWT, etc)
│   ├── App.jsx              # Aplicación principal
│   └── main.jsx             # Punto de entrada
├── database/
│   └── db.sql               # Esquema de base de datos
├── package.json             # Dependencias del proyecto
├── vite.config.js           # Configuración de Vite
├── tailwind.config.js       # Configuración de Tailwind
└── README.md                # Este archivo
```

##  Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de construcción rápida
- **React Router** - Enrutamiento del cliente
- **Tailwind CSS** - Estilos utilitarios
- **Framer Motion** - Animaciones suaves
- **Context API** - Gestión de estado global

### Backend
- **Express.js** - Framework de servidor web
- **MySQL** - Base de datos relacional
- **JWT (jsonwebtoken)** - Autenticación segura
- **bcryptjs** - Hash de contraseñas
- **Tilopay API** - Pasarela de pagos

##  Flujos Principales

### Flujo de Autenticación
```
Usuario → Registrarse/Iniciar Sesión → JWT Token → Acceso a Carrito y Perfil
```

### Flujo de Compra
```
Navegar Tienda → Ver Producto → Agregar al Carrito → 
Checkout → Ingreso de Teléfono → Pago Tilopay → Confirmación
```

### Flujo de Usuario
```
Perfil → Ver/Editar Datos → Actualizar Email/Contraseña → 
Ver Historial de Pedidos
```
##  Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación basada en JWT
- ✅ Middleware de protección de rutas
- ✅ CORS configurado correctamente
- ✅ Variables de entorno sensibles en `.env`
- ✅ Validación de entrada en formularios

##  Responsive Design

La aplicación es completamente responsive y funciona en:
-  Dispositivos móviles (320px+)
-  Tablets (768px+)
-  Laptops y escritorios (1024px+)

##  Solución de Problemas

### Error: "Cannot find module 'bcrypt'"
```bash
npm install bcrypt
```

### Error de conexión a base de datos
- Verifica que MySQL esté ejecutándose
- Revisa las credenciales en `.env`
- Asegúrate que la base de datos existe

### El carrito no se actualiza
- Comprueba que `CartProvider` envuelve `App` en `main.jsx`
- Verifica la consola para errores de fetch



##  Licencia

Este proyecto está bajo licencia MIT. Ver el archivo `LICENSE` para más detalles.

##  Desarrollador

[LinkedIn](www.linkedin.com/in/carlos-oviedo-135a1426b) | [GitHub](https://github.com/CarlosOviedo18)

##  Contacto

Para preguntas o sugerencias, contáctame en:
- 📧 Email: carlos.oviedo18@hotmail.com
- 💼 LinkedIn: www.linkedin.com/in/carlos-oviedo-135a1426b

---

*Última actualización: Enero 2026*

