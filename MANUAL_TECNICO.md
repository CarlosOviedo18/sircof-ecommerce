# MANUAL TÉCNICO DEL SISTEMA
## SIRCOF E-Commerce — Plataforma de Ventas de Café

---

> **Versión del documento:** 1.0  
> **Fecha:** Marzo 2026  
> **Elaborado para:** Desarrolladores que continuarán el mantenimiento y desarrollo del sistema.

---

## TABLA DE CONTENIDOS

1. [Descripción General del Sistema](#1-descripción-general-del-sistema)  
2. [Stack Tecnológico y Versiones](#2-stack-tecnológico-y-versiones)  
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)  
4. [Requisitos Previos del Entorno](#4-requisitos-previos-del-entorno)  
5. [Proceso de Instalación Paso a Paso](#5-proceso-de-instalación-paso-a-paso)  
   - 5.1 [Instalar Visual Studio Code](#51-instalar-visual-studio-code)  
   - 5.2 [Instalar Node.js y npm](#52-instalar-nodejs-y-npm)  
   - 5.3 [Instalar MySQL](#53-instalar-mysql)  
   - 5.4 [Instalar Git](#54-instalar-git)  
   - 5.5 [Clonar el Repositorio](#55-clonar-el-repositorio)  
   - 5.6 [Instalar Dependencias del Proyecto](#56-instalar-dependencias-del-proyecto)  
   - 5.7 [Configurar la Base de Datos](#57-configurar-la-base-de-datos)  
   - 5.8 [Configurar Variables de Entorno](#58-configurar-variables-de-entorno)  
   - 5.9 [Ejecutar el Proyecto](#59-ejecutar-el-proyecto)  
6. [Estructura del Proyecto](#6-estructura-del-proyecto)  
7. [Base de Datos](#7-base-de-datos)  
8. [API — Endpoints del Backend](#8-api--endpoints-del-backend)  
9. [Sistema de Autenticación y Seguridad](#9-sistema-de-autenticación-y-seguridad)  
10. [Módulos Funcionales del Sistema](#10-módulos-funcionales-del-sistema)  
11. [Variables de Entorno — Referencia Completa](#11-variables-de-entorno--referencia-completa)  
12. [Extensiones Recomendadas para VS Code](#12-extensiones-recomendadas-para-vs-code)  
13. [Comandos Útiles de Desarrollo](#13-comandos-útiles-de-desarrollo)  
14. [Diagramas del Sistema](#14-diagramas-del-sistema)  
15. [Despliegue en Producción](#15-despliegue-en-producción)  
16. [Consideraciones de Seguridad](#16-consideraciones-de-seguridad)  
17. [Solución de Problemas Comunes](#17-solución-de-problemas-comunes)  

---

## 1. DESCRIPCIÓN GENERAL DEL SISTEMA

**SIRCOF E-Commerce** es una plataforma web de comercio electrónico desarrollada para la venta de café premium. El sistema está construido como una **Single Page Application (SPA)** en el frontend y una **API REST** en el backend, ambos coexistiendo dentro del mismo repositorio.

### Características del sistema

| Módulo | Descripción |
|--------|-------------|
| Autenticación | Registro, inicio de sesión con JWT, OAuth con Google, recuperación de contraseña |
| Catálogo de Productos | Listado, filtros por línea (Premium/Nacional), detalle de producto |
| Carrito de Compras | Gestión en tiempo real, sincronización con base de datos |
| Pasarela de Pagos | Integración con Tilopay y PayPal |
| Gestión de Pedidos | Historial de órdenes, estados (pendiente/pagado/cancelado) |
| Panel de Administración | Gestión de productos, usuarios, órdenes y contactos |
| Perfil de Usuario | Edición de datos, historial de compras |
| Formulario de Contacto | Envío de mensajes con notificaciones por correo |
| Internacionalización | Soporte para español e inglés (i18n) |

---

## 2. STACK TECNOLÓGICO Y VERSIONES

### Frontend

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **React** | ^19.2.0 | Biblioteca principal de UI |
| **React DOM** | ^19.2.0 | Renderizado en el DOM |
| **React Router DOM** | ^7.12.0 | Enrutamiento del lado del cliente |
| **Vite** | ^7.2.4 | Bundler y servidor de desarrollo |
| **Tailwind CSS** | ^3.4.1 | Framework de estilos utilitarios |
| **Framer Motion** | ^12.29.2 | Animaciones y transiciones |
| **GSAP** | ^3.14.2 | Animaciones avanzadas |
| **Three.js** | ^0.183.0 | Gráficos 3D (modelo de taza de café) |
| **Lucide React** | ^0.562.0 | Iconografía |
| **i18next** | ^25.8.14 | Internacionalización |
| **React i18next** | ^16.5.6 | Integración de i18next con React |
| **@react-oauth/google** | ^0.13.4 | Autenticación con Google OAuth |

### Backend

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Node.js** | v20 LTS (recomendado) | Entorno de ejecución del servidor |
| **Express.js** | ^4.18.2 | Framework de servidor web |
| **MySQL2** | ^3.6.0 | Conector de base de datos MySQL |
| **jsonwebtoken** | ^9.0.3 | Generación y verificación de JWT |
| **bcrypt / bcryptjs** | ^6.0.0 / ^3.0.3 | Hash seguro de contraseñas |
| **nodemailer** | ^7.0.13 | Envío de correos electrónicos |
| **dotenv** | ^17.2.3 | Gestión de variables de entorno |
| **cors** | ^2.8.5 | Configuración de CORS |
| **express-rate-limit** | ^8.2.1 | Limitación de tasa de peticiones |
| **google-auth-library** | ^10.6.1 | Verificación de tokens de Google |
| **node-fetch** | ^3.3.2 | Peticiones HTTP desde el servidor |

### Base de Datos

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **MySQL** | 8.0+ | Motor de base de datos relacional |

### Herramientas de Desarrollo

| Herramienta | Versión | Descripción |
|-------------|---------|-------------|
| **Visual Studio Code** | Última estable | Editor de código |
| **Git** | Última estable | Control de versiones |
| **Node.js** | v20.x LTS | Entorno de ejecución |
| **npm** | v10.x (incluido con Node) | Gestor de paquetes |
| **ESLint** | ^9.39.1 | Linter de código JavaScript |
| **PostCSS** | ^8.4.33 | Procesador de CSS |
| **Autoprefixer** | ^10.4.17 | Prefijos CSS automáticos |
| **Terser** | ^5.46.0 | Minificador de JS para producción |

---

## 3. ARQUITECTURA DEL SISTEMA

El sistema utiliza una arquitectura **Full Stack Monorepo**, donde el frontend (React/Vite) y el backend (Express.js) conviven en el mismo repositorio.

```
CLIENTE (Navegador)
        │
        │  HTTP / JSON
        ▼
FRONTEND — React SPA (Puerto 5173 en desarrollo)
        │
        │  Peticiones a /api/*
        ▼
BACKEND — Express.js API REST (Puerto 3000)
        │
        │  mysql2/promise (Pool de conexiones)
        ▼
BASE DE DATOS — MySQL
```

### Patrón de comunicación

- El frontend consume la API del backend mediante `fetch()` con el prefijo `VITE_API_URL`.
- El backend expone rutas bajo `/api/` organizadas por módulo.
- La autenticación se maneja mediante **JWT Bearer Tokens** almacenados en `localStorage`.
- Las rutas protegidas validan el token en los middlewares `protectRoute` y `protectAdmin`.

---

## 4. REQUISITOS PREVIOS DEL ENTORNO

Antes de comenzar la instalación, asegúrate de que tu máquina cumpla con los siguientes requisitos:

| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| Sistema Operativo | Windows 10 / macOS 11 / Ubuntu 20.04 | Windows 11 / macOS 13+ / Ubuntu 22.04 |
| RAM | 4 GB | 8 GB o más |
| Espacio en disco | 2 GB libres | 5 GB libres |
| Conexión a Internet | Requerida para instalar dependencias | — |

---

## 5. PROCESO DE INSTALACIÓN PASO A PASO

---

### 5.1 Instalar Visual Studio Code

Visual Studio Code es el editor de código recomendado para trabajar en este proyecto.

**Pasos:**

1. Ir a la página oficial: [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. Descargar la versión para tu sistema operativo (Windows / macOS / Linux).
3. Ejecutar el instalador descargado.
4. Durante la instalación en Windows, marcar las opciones:
   - ✅ "Agregar al PATH"
   - ✅ "Abrir con Code" (opción del menú contextual)
5. Finalizar la instalación y abrir VS Code.

**Verificar instalación:**
```bash
code --version
```

#### Espacio para imagen — Pantalla de descarga de VS Code

<!-- INSERTAR IMAGEN: Captura de pantalla de la página de descarga de VS Code -->
> 📷 _Imagen: Página oficial de descarga de Visual Studio Code_

---

#### Espacio para imagen — Proceso de instalación de VS Code

<!-- INSERTAR IMAGEN: Captura del instalador de VS Code con las opciones marcadas -->
> 📷 _Imagen: Instalador de VS Code — opciones recomendadas a marcar_

---

### 5.2 Instalar Node.js y npm

Node.js es el entorno de ejecución del servidor y también es necesario para las herramientas de desarrollo del frontend.

**Pasos:**

1. Ir a la página oficial: [https://nodejs.org/](https://nodejs.org/)
2. Descargar la versión **LTS** (Long Term Support) — actualmente **v20.x**.
3. Ejecutar el instalador y seguir los pasos por defecto.
4. Asegurarse de que la opción **"Automatically install the necessary tools"** esté marcada.

**Verificar instalación:**
```bash
node --version
# Debe mostrar: v20.x.x

npm --version
# Debe mostrar: 10.x.x
```

#### Espacio para imagen — Descarga de Node.js

<!-- INSERTAR IMAGEN: Captura de la página de descarga de Node.js mostrando la versión LTS -->
> 📷 _Imagen: Página oficial de Node.js — seleccionar versión LTS_

---

#### Espacio para imagen — Verificación de Node.js en terminal

<!-- INSERTAR IMAGEN: Terminal mostrando "node --version" y "npm --version" con sus resultados -->
> 📷 _Imagen: Terminal con la verificación correcta de Node.js y npm_

---

### 5.3 Instalar MySQL

MySQL es el sistema de gestión de base de datos utilizado por el proyecto.

**Opción A — MySQL Community Server (Recomendado)**

1. Ir a: [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Descargar **MySQL Installer for Windows** (versión 8.0.x).
3. Ejecutar el instalador y seleccionar el tipo de instalación **"Developer Default"**.
4. Durante la configuración:
   - Tipo de configuración: **Development Computer**
   - Puerto: **3306** (dejar el valor por defecto)
   - Establecer una contraseña para el usuario `root` — **guardarla en un lugar seguro**.
   - Autenticación: seleccionar **"Use Legacy Authentication Method"** si hay problemas de compatibilidad.
5. Completar la instalación.

**Opción B — XAMPP (más fácil para principiantes)**

1. Ir a: [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Descargar e instalar XAMPP.
3. Abrir XAMPP Control Panel y activar el servicio **MySQL**.

**Verificar instalación de MySQL:**
```bash
mysql --version
# Debe mostrar: mysql  Ver 8.0.x
```

#### Espacio para imagen — Instalador de MySQL

<!-- INSERTAR IMAGEN: Captura del instalador de MySQL con la opción "Developer Default" seleccionada -->
> 📷 _Imagen: MySQL Installer — selección de tipo de instalación_

---

#### Espacio para imagen — Configuración de contraseña MySQL

<!-- INSERTAR IMAGEN: Pantalla de configuración de contraseña root durante la instalación -->
> 📷 _Imagen: MySQL Installer — configuración de contraseña del usuario root_

---

**Instalar MySQL Workbench (herramienta gráfica recomendada):**

MySQL Workbench permite visualizar y gestionar la base de datos de manera visual.

1. Se instala automáticamente con el MySQL Installer (Developer Default).
2. O descargar por separado desde: [https://dev.mysql.com/downloads/workbench/](https://dev.mysql.com/downloads/workbench/)

#### Espacio para imagen — MySQL Workbench abierto

<!-- INSERTAR IMAGEN: Captura de MySQL Workbench con la conexión al servidor local -->
> 📷 _Imagen: MySQL Workbench — pantalla principal con conexión local_

---

### 5.4 Instalar Git

Git es el sistema de control de versiones utilizado para manejar el código fuente.

**Pasos:**

1. Ir a: [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. Descargar la versión para tu sistema operativo.
3. Durante la instalación en Windows:
   - Editor por defecto: seleccionar **Visual Studio Code** si está disponible.
   - Dejar las demás opciones por defecto.
4. Completar la instalación.

**Verificar instalación:**
```bash
git --version
# Debe mostrar: git version 2.x.x
```

**Configurar identidad de Git (obligatorio antes de primer commit):**
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tucorreo@ejemplo.com"
```

#### Espacio para imagen — Instalación de Git

<!-- INSERTAR IMAGEN: Captura del instalador de Git seleccionando VS Code como editor -->
> 📷 _Imagen: Instalador de Git — selección de editor predeterminado_

---

### 5.5 Clonar el Repositorio

Una vez instaladas las herramientas, obtén el código fuente del proyecto.

**Paso 1: Abrir una terminal**

En Windows: Buscar "PowerShell" o "Git Bash" en el menú inicio.  
En macOS/Linux: Abrir la aplicación Terminal.

**Paso 2: Navegar a la carpeta donde deseas guardar el proyecto**

```bash
cd C:\Proyectos
# o en macOS/Linux:
cd ~/Proyectos
```

**Paso 3: Clonar el repositorio**

```bash
git clone https://github.com/tu-organizacion/sircof-ecommerce.git
```

**Paso 4: Entrar a la carpeta del proyecto**

```bash
cd sircof-ecommerce
```

**Paso 5: Abrir el proyecto en VS Code**

```bash
code .
```

#### Espacio para imagen — Clonación del repositorio en terminal

<!-- INSERTAR IMAGEN: Captura de la terminal ejecutando el git clone con su resultado -->
> 📷 _Imagen: Terminal mostrando el proceso de clonación del repositorio_

---

### 5.6 Instalar Dependencias del Proyecto

Dentro de la carpeta raíz del proyecto, instala todas las dependencias de Node.js:

```bash
npm install
```

Este comando descarga e instala automáticamente todos los paquetes listados en `package.json` (tanto dependencias de producción como de desarrollo). El proceso puede tomar varios minutos dependiendo de la velocidad de Internet.

**Resultado esperado:**
```
added 847 packages, and audited 848 packages in 45s
```

> ⚠️ **Importante:** Si aparecen advertencias de `npm warn`, generalmente son informativas y no impiden el funcionamiento. Si aparecen **errores**, revisar la sección [Solución de Problemas Comunes](#17-solución-de-problemas-comunes).

#### Espacio para imagen — Instalación de dependencias

<!-- INSERTAR IMAGEN: Captura de la terminal ejecutando "npm install" y su resultado exitoso -->
> 📷 _Imagen: Terminal mostrando "npm install" completado correctamente_

---

### 5.7 Configurar la Base de Datos

#### Paso 1: Acceder a MySQL

**Opción A — Desde la terminal:**
```bash
mysql -u root -p
# Ingresar la contraseña del usuario root cuando se solicite
```

**Opción B — Desde MySQL Workbench:**
1. Abrir MySQL Workbench.
2. Hacer clic en la conexión local (Local instance MySQL80).
3. Ingresar la contraseña.

#### Paso 2: Crear la base de datos

En la consola de MySQL o en el editor de consultas de Workbench:

```sql
CREATE DATABASE IF NOT EXISTS database_sircof
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE database_sircof;
```

#### Paso 3: Importar el esquema de tablas

**Opción A — Desde la terminal (en la carpeta raíz del proyecto):**
```bash
mysql -u root -p database_sircof < database/db.sql
```

**Opción B — Desde MySQL Workbench:**
1. Ir a **File > Run SQL Script**.
2. Seleccionar el archivo `database/db.sql` dentro de la carpeta del proyecto.
3. Hacer clic en **Run**.

#### Paso 4 (Opcional): Aplicar migraciones adicionales

Si el proyecto tiene migraciones pendientes, ejecutarlas en orden:
```bash
mysql -u root -p database_sircof < database/migrations/2026-03-13-google-auth.sql
```

#### Espacio para imagen — MySQL Workbench con la base de datos creada

<!-- INSERTAR IMAGEN: Captura de MySQL Workbench mostrando las tablas creadas en database_sircof -->
> 📷 _Imagen: MySQL Workbench — listado de tablas del esquema database_sircof_

---

### 5.8 Configurar Variables de Entorno

Las variables de entorno contienen datos sensibles (contraseñas, claves de API, etc.) que **nunca deben subirse al repositorio**.

#### Paso 1: Crear el archivo `.env`

En la **carpeta raíz** del proyecto, crear un archivo llamado `.env`:

```bash
# En Windows (PowerShell):
New-Item -Name ".env" -ItemType "file"

# En macOS/Linux:
touch .env
```

O simplemente crear el archivo manualmente desde VS Code.

#### Paso 2: Copiar y rellenar las variables

Abrir el archivo `.env` y pegar el siguiente contenido, **rellenando cada valor**:

```env
# ================================================
# CONFIGURACIÓN DEL SERVIDOR BACKEND
# ================================================
PORT=3000

# ================================================
# BASE DE DATOS MYSQL
# ================================================
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql_aqui
DB_NAME=database_sircof

# ================================================
# SEGURIDAD — JWT
# ================================================
# Clave secreta para firmar tokens JWT.
# Usa una cadena larga y aleatoria. Ejemplo:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=genera_una_clave_secreta_larga_y_aleatoria_aqui

# ================================================
# CORS — Origen permitido del frontend
# ================================================
CORS_ORIGIN=http://localhost:5173

# ================================================
# URL DE LA API (usada por el frontend)
# ================================================
VITE_API_URL=http://localhost:3000

# ================================================
# GOOGLE OAUTH 2.0
# ================================================
# Obtener en: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# ================================================
# NODEMAILER — Correo electrónico del sistema
# ================================================
EMAIL_USER=correo_del_sistema@gmail.com
EMAIL_PASS=contraseña_o_app_password_de_gmail
EMAIL_FROM=correo_del_sistema@gmail.com

# ================================================
# PASARELA DE PAGOS — TILOPAY
# ================================================
TILOPAY_API_KEY=tu_api_key_de_tilopay
TILOPAY_API_URL=https://sandbox.tilopay.com
TILOPAY_HASH_KEY=tu_hash_key_de_tilopay

# ================================================
# PASARELA DE PAGOS — PAYPAL
# ================================================
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
```

> ⚠️ **NUNCA subas el archivo `.env` al repositorio.** Ya está incluido en `.gitignore`.

**Generar una clave JWT segura:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Espacio para imagen — Archivo .env en VS Code

<!-- INSERTAR IMAGEN: Captura del archivo .env abierto en VS Code (con los valores ocultos/censurados) -->
> 📷 _Imagen: Archivo .env abierto en VS Code — estructura de las variables_

---

### 5.9 Ejecutar el Proyecto

El proyecto requiere **dos procesos** corriendo simultáneamente:

- **Frontend** (Vite): sirve la interfaz de React.
- **Backend** (Node/Express): sirve la API REST.

#### Terminal 1 — Iniciar el Frontend

```bash
npm run dev
```

Resultado esperado:
```
  VITE v7.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Abrir el navegador en: **[http://localhost:5173](http://localhost:5173)**

#### Terminal 2 — Iniciar el Backend

Abrir una **segunda terminal** (en VS Code: `Ctrl + Shift + ` ` o desde el menú Terminal > New Terminal):

```bash
npm run server
```

Resultado esperado:
```
Server running on port 3000
Database connected successfully
```

> 💡 **Consejo:** En VS Code puedes tener ambas terminales visibles simultáneamente dividiendo el panel de terminal.

#### Espacio para imagen — Dos terminales corriendo frontend y backend

<!-- INSERTAR IMAGEN: Captura de VS Code con dos terminales abiertas, una con "npm run dev" y otra con "npm run server" -->
> 📷 _Imagen: VS Code con ambas terminales activas — frontend en 5173, backend en 3000_

---

#### Espacio para imagen — Aplicación corriendo en el navegador

<!-- INSERTAR IMAGEN: Captura del navegador mostrando la página principal de SIRCOF E-Commerce -->
> 📷 _Imagen: Página principal del sistema funcionando en http://localhost:5173_

---

## 6. ESTRUCTURA DEL PROYECTO

```
sircof-ecommerce/
│
├── 📄 index.html                  # Punto de entrada HTML del SPA
├── 📄 package.json                # Dependencias y scripts del proyecto
├── 📄 vite.config.js              # Configuración de Vite (bundler)
├── 📄 tailwind.config.js          # Configuración de Tailwind CSS
├── 📄 postcss.config.js           # Configuración de PostCSS
├── 📄 eslint.config.js            # Reglas de linting
├── 📄 tsconfig.json               # Configuración TypeScript (para tipos)
├── 📄 vercel.json                 # Configuración de despliegue en Vercel
├── 📄 convert-images.js           # Script de optimización de imágenes
├── 📄 .env                        # Variables de entorno (NO en repositorio)
│
├── 📁 database/
│   ├── 📄 db.sql                  # Esquema completo de la base de datos
│   └── 📁 migrations/
│       └── 📄 2026-03-13-google-auth.sql  # Migración: columna google_id
│
├── 📁 public/
│   └── 📁 models/                 # Modelos 3D (.glb) para Three.js
│
└── 📁 src/
    │
    ├── 📄 main.jsx                # Punto de entrada de React
    ├── 📄 App.jsx                 # Componente raíz, definición de rutas
    ├── 📄 index.js                # Servidor Express (backend)
    ├── 📄 database.js             # Pool de conexiones MySQL
    ├── 📄 keys.js                 # Carga de variables de entorno
    │
    ├── 📁 animations/             # Componentes y utilidades de animación
    │   ├── animations.js          # Variantes de animación reutilizables
    │   ├── CoffeeCup3D.jsx        # Modelo 3D de taza (Three.js)
    │   ├── PageAnimated.jsx       # Wrapper de animación entre páginas
    │   └── TransitionLogin.jsx    # Transición específica del login
    │
    ├── 📁 assets/                 # Recursos estáticos
    │   ├── img/                   # Imágenes originales
    │   └── webp/                  # Imágenes optimizadas en formato WebP
    │
    ├── 📁 components/             # Componentes React reutilizables
    │   ├── 📁 admin/
    │   │   ├── AdminLayout.jsx    # Layout del panel de administración
    │   │   └── AdminRoute.jsx     # Guards de ruta para administradores
    │   ├── 📁 auth/
    │   │   ├── SignIn.jsx         # Formulario de inicio de sesión
    │   │   └── SignUp.jsx         # Formulario de registro
    │   ├── 📁 Cart/
    │   │   ├── CartDrawer.jsx     # Panel lateral del carrito
    │   │   ├── CartFooter.jsx     # Pie del carrito (totales, botones)
    │   │   ├── CartHeader.jsx     # Cabecera del carrito
    │   │   ├── CartItem.jsx       # Item individual del carrito
    │   │   ├── CartItems.jsx      # Lista de items del carrito
    │   │   └── ShippingForm.jsx   # Formulario de envío en el carrito
    │   ├── 📁 checkout/
    │   │   ├── CheckoutShippingForm.jsx  # Formulario de envío en checkout
    │   │   ├── OrderSummary.jsx          # Resumen de la orden
    │   │   └── PaymentMethodSelector.jsx # Selector de método de pago
    │   ├── 📁 layout/
    │   │   ├── Footer.jsx               # Pie de página global
    │   │   ├── Navigation.jsx           # Barra de navegación principal
    │   │   ├── ScrollToTopButton.jsx    # Botón flotante subir al inicio
    │   │   ├── SecondNavigation.jsx     # Navegación secundaria con carrito
    │   │   └── TransparentNavigation.jsx # Navegación transparente (home)
    │   ├── 📁 main/
    │   │   ├── AboutUs.jsx        # Sección "Sobre Nosotros" en el home
    │   │   ├── BeanToTable.jsx    # Sección "Del Grano a la Mesa"
    │   │   ├── CupExperience.jsx  # Sección experiencia de taza
    │   │   └── FeaturedProducts.jsx # Productos destacados en el home
    │   ├── 📁 navigation/
    │   │   └── SearchBox.jsx      # Barra de búsqueda
    │   └── 📁 ui/
    │       ├── InfiniteMenu.jsx   # Menú con scroll infinito
    │       ├── LanguageSelector.jsx # Selector de idioma
    │       └── Stack.jsx          # Componente de apilado visual
    │
    ├── 📁 context/                # Contextos globales de React
    │   ├── AuthContext.jsx        # Estado global de autenticación
    │   └── CartContext.jsx        # Estado global del carrito
    │
    ├── 📁 hooks/                  # Custom hooks de React
    │   ├── 📁 admin/
    │   │   ├── useAdmin.js              # Lógica del panel admin
    │   │   └── useAdminNotifications.js # Notificaciones del admin
    │   ├── 📁 auth/
    │   │   ├── useAuth.js               # Hook de autenticación
    │   │   ├── useForgotPassword.js     # Recuperación de contraseña
    │   │   ├── useGoogle.js             # Login con Google
    │   │   └── useSessionTimeout.js     # Cierre de sesión automático
    │   ├── 📁 cart/
    │   │   └── useCart.js               # Operaciones del carrito
    │   ├── 📁 contact/
    │   │   └── useContactForm.js        # Formulario de contacto
    │   ├── 📁 orders/
    │   │   └── useOrders.js             # Historial de pedidos
    │   ├── 📁 payment/
    │   │   ├── useConfirmPayment.js     # Confirmación de pago
    │   │   ├── usePayment.js            # Proceso de pago Tilopay
    │   │   └── usePayPalPayment.js      # Proceso de pago PayPal
    │   ├── 📁 products/
    │   │   ├── useFeaturedProducts.js   # Productos destacados
    │   │   ├── useProductDetail.js      # Detalle de un producto
    │   │   └── useProducts.js           # Listado de productos
    │   └── 📁 user/
    │       └── useUserProfile.js        # Perfil de usuario
    │
    ├── 📁 i18n/                   # Internacionalización
    │   ├── index.js               # Configuración de i18next
    │   └── 📁 locales/
    │       ├── 📁 en/             # Traducciones en inglés
    │       └── 📁 es/             # Traducciones en español
    │
    ├── 📁 lib/                    # Utilidades del backend
    │   ├── crypto.js              # Funciones criptográficas
    │   ├── jwt.js                 # Generación y verificación de JWT
    │   └── utils.ts               # Utilidades generales (TypeScript)
    │
    ├── 📁 middleware/             # Middlewares de Express
    │   ├── auth.js                # Validación de JWT (protectRoute)
    │   └── adminAuth.js           # Validación de rol admin (protectAdmin)
    │
    ├── 📁 pages/                  # Páginas de la aplicación
    │   ├── 📁 about/
    │   │   └── AboutUsPage.jsx    # Página "Acerca de Nosotros"
    │   ├── 📁 admin/
    │   │   ├── AdminDashboard.jsx # Dashboard del administrador
    │   │   ├── AdminProducts.jsx  # Gestión de productos
    │   │   ├── AdminOrders.jsx    # Gestión de pedidos
    │   │   ├── AdminUsers.jsx     # Gestión de usuarios
    │   │   └── AdminContacts.jsx  # Mensajes de contacto
    │   ├── 📁 auth/
    │   │   ├── LoginUsers.jsx     # Página de login/registro
    │   │   └── ForgotPassword.jsx # Página de recuperar contraseña
    │   ├── 📁 checkout/
    │   │   ├── CheckoutPage.jsx   # Página de pago
    │   │   └── CheckoutSuccess.jsx # Confirmación de compra exitosa
    │   ├── 📁 contact/
    │   │   └── ContactUs.jsx      # Página de contacto
    │   ├── 📁 content/
    │   │   └── Galery.jsx         # Galería de imágenes
    │   ├── 📁 store/
    │   │   ├── StoreProduct.jsx   # Catálogo / tienda
    │   │   └── ProductDetail.jsx  # Detalle de un producto
    │   └── 📁 user/
    │       └── UserSettings.jsx   # Configuración del perfil
    │
    ├── 📁 routes/                 # Rutas de la API Express
    │   ├── admin.js               # Rutas del panel admin
    │   ├── 📁 admin/              # Sub-rutas admin
    │   ├── 📁 auth/
    │   │   ├── auth.js            # Login, registro
    │   │   ├── googleAuth.js      # Google OAuth
    │   │   └── passwordReset.js   # Reset de contraseña
    │   ├── 📁 cart/
    │   │   └── cart.js            # CRUD del carrito
    │   ├── 📁 contact/
    │   │   └── contactForm.js     # Formulario de contacto
    │   ├── 📁 orders/
    │   │   └── orders.js          # Gestión de órdenes
    │   ├── 📁 payment/
    │   │   ├── payment.js         # Proceso de pago Tilopay
    │   │   └── paypal.js          # Proceso de pago PayPal
    │   ├── 📁 products/
    │   │   └── products.js        # CRUD de productos
    │   └── 📁 user/
    │       ├── users.js           # Datos del usuario
    │       └── userSettings.js    # Actualización del perfil
    │
    ├── 📁 services/               # Servicios externos
    │   ├── emailService.js        # Configuración de nodemailer
    │   └── passwordResetEmail.js  # Envío de correo de reseteo
    │
    ├── 📁 styles/                 # Estilos CSS adicionales
    │   ├── AboutUsPage.css
    │   ├── index.css              # Estilos globales + variables Tailwind
    │   ├── LoginUsers.css
    │   └── Navigation.css
    │
    └── 📁 templates/             # Plantillas HTML de correos
        ├── emailTemplates.js      # Plantillas generales
        └── passwordResetTemplate.js # Plantilla de reset de contraseña
```

---

## 7. BASE DE DATOS

### Diagrama de tablas (Entidades)

El sistema utiliza **6 tablas principales**:

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios registrados del sistema |
| `products` | Catálogo de productos de café |
| `carts` | Carritos activos de cada usuario |
| `cart_items` | Productos dentro de cada carrito |
| `orders` | Órdenes de compra realizadas |
| `order_items` | Productos de cada orden |
| `contacts` | Mensajes enviados por el formulario de contacto |

### Detalle de cada tabla

#### Tabla: `users`
```sql
CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(100)  NOT NULL UNIQUE,
  password    VARCHAR(255)  DEFAULT NULL,       -- NULL si usa Google OAuth
  google_id   VARCHAR(255)  UNIQUE DEFAULT NULL, -- ID de cuenta Google
  role        ENUM('user','admin') DEFAULT 'user',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `products`
```sql
CREATE TABLE products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150)  NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  image_url   VARCHAR(255),
  line        VARCHAR(50),    -- 'Premium' o 'Nacional'
  stock       INT DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `carts`
```sql
CREATE TABLE carts (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  user_id   INT NOT NULL,     -- FK a users.id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `cart_items`
```sql
CREATE TABLE cart_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  cart_id     INT NOT NULL,   -- FK a carts.id
  product_id  INT NOT NULL,   -- FK a products.id
  quantity    INT NOT NULL DEFAULT 1
);
```

#### Tabla: `orders`
```sql
CREATE TABLE orders (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  user_id                 INT NOT NULL,
  total                   DECIMAL(10,2) NOT NULL,
  status                  ENUM('pending','paid','cancelled') DEFAULT 'pending',
  payment_method          ENUM('tilopay','paypal') DEFAULT 'tilopay',
  tilopay_reference       VARCHAR(255) DEFAULT NULL,
  tilopay_order_number    VARCHAR(255) DEFAULT NULL,
  phone                   VARCHAR(20),
  address                 VARCHAR(255),
  city                    VARCHAR(100),
  postal_code             VARCHAR(20),
  country                 VARCHAR(100),
  created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `order_items`
```sql
CREATE TABLE order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,   -- FK a orders.id
  product_id  INT NOT NULL,   -- FK a products.id
  quantity    INT NOT NULL,
  price       DECIMAL(10,2) NOT NULL  -- precio al momento de la compra
);
```

#### Tabla: `contacts`
```sql
CREATE TABLE contacts (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(100) NOT NULL,
  subject   VARCHAR(255),
  message   LONGTEXT NOT NULL,
  status    VARCHAR(50) DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Relaciones entre tablas

```
users ─────< carts ─────< cart_items >───── products
  │
  └──────────< orders ────< order_items >─── products
```

---

## 8. API — ENDPOINTS DEL BACKEND

El backend expone una API REST en el puerto `3000`. Todos los endpoints tienen el prefijo `/api/`.

### Autenticación — `/api/auth`

| Método | Ruta | Descripción | Auth requerida |
|--------|------|-------------|---------------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/google` | Login con Google OAuth | No |
| POST | `/api/auth/forgot-password` | Solicitar reset de contraseña | No |
| POST | `/api/auth/reset-password` | Confirmar nueva contraseña | No |

### Productos — `/api/products`

| Método | Ruta | Descripción | Auth requerida |
|--------|------|-------------|---------------|
| GET | `/api/products` | Obtener todos los productos | No |
| GET | `/api/products/:id` | Obtener detalle de un producto | No |
| POST | `/api/products` | Crear producto | Admin |
| PUT | `/api/products/:id` | Actualizar producto | Admin |
| DELETE | `/api/products/:id` | Eliminar producto | Admin |

### Carrito — `/api/cart`

| Método | Ruta | Descripción | Auth requerida |
|--------|------|-------------|---------------|
| GET | `/api/cart` | Obtener carrito del usuario | Sí |
| POST | `/api/cart` | Agregar producto al carrito | Sí |
| PUT | `/api/cart/:itemId` | Actualizar cantidad de un item | Sí |
| DELETE | `/api/cart/:itemId` | Eliminar item del carrito | Sí |
| DELETE | `/api/cart` | Vaciar carrito | Sí |

### Pagos — `/api/payment`

| Método | Ruta | Descripción | Auth requerida |
|--------|------|-------------|---------------|
| POST | `/api/payment/process` | Procesar pago con Tilopay | Sí |
| POST | `/api/payment/confirm` | Confirmar pago recibido | Sí |
| POST | `/api/paypal/create-order` | Crear orden en PayPal | Sí |
| POST | `/api/paypal/capture-order` | Capturar pago de PayPal | Sí |

### Órdenes — `/api/orders`

| Método | Ruta | Descripción | Auth requerida |
|--------|------|-------------|---------------|
| GET | `/api/orders` | Historial de órdenes del usuario | Sí |
| GET | `/api/orders/:id` | Detalle de una orden | Sí |

### Usuario — `/api/users` y `/api/user-settings`

| Método | Ruta | Descripción | Auth requerida |
|--------|------|-------------|---------------|
| GET | `/api/users/profile` | Obtener perfil del usuario | Sí |
| PUT | `/api/user-settings/email` | Actualizar email | Sí |
| PUT | `/api/user-settings/password` | Actualizar contraseña | Sí |

### Contacto — `/api/contact`

| Método | Ruta | Descripción | Auth requerida |
|--------|------|-------------|---------------|
| POST | `/api/contact` | Enviar mensaje de contacto | No |

### Administración — `/api/admin`

| Método | Ruta | Descripción | Auth requerida |
|--------|------|-------------|---------------|
| GET | `/api/admin/users` | Listar todos los usuarios | Admin |
| GET | `/api/admin/orders` | Listar todas las órdenes | Admin |
| GET | `/api/admin/contacts` | Listar mensajes de contacto | Admin |
| PUT | `/api/admin/users/:id/role` | Cambiar rol de usuario | Admin |
| DELETE | `/api/admin/users/:id` | Eliminar usuario | Admin |

---

## 9. SISTEMA DE AUTENTICACIÓN Y SEGURIDAD

### Flujo de Autenticación con Email/Password

```
1. Usuario ingresa email + contraseña
2. Frontend envía POST /api/auth/login
3. Backend verifica email en BD
4. Compara contraseña hasheada con bcrypt
5. Genera JWT con {id, email} — expira en 24h
6. Frontend guarda JWT en localStorage
7. Cada petición protegida incluye: Authorization: Bearer <token>
8. Middleware protectRoute verifica y decodifica el JWT
```

### Flujo de Autenticación con Google OAuth

```
1. Usuario hace clic en "Continuar con Google"
2. Google retorna un credential token
3. Frontend envía el token a POST /api/auth/google
4. Backend verifica el token con google-auth-library
5. Si el usuario no existe, se crea automáticamente
6. Se genera un JWT propio del sistema
7. El flujo continúa igual que con email/password
```

### Middlewares de Seguridad

| Middleware | Archivo | Función |
|------------|---------|---------|
| `protectRoute` | `src/middleware/auth.js` | Verifica JWT para rutas de usuario |
| `protectAdmin` | `src/middleware/adminAuth.js` | Verifica JWT + rol `admin` en BD |
| `rateLimit` | `src/index.js` | Limita peticiones por IP para prevenir ataques |
| CORS | `src/index.js` | Restringe peticiones al origen del frontend |

### Seguridad de Contraseñas

- Las contraseñas se hashean con **bcrypt** (salt rounds: 10+).
- **Nunca** se almacenan contraseñas en texto plano.
- Los usuarios de Google OAuth no tienen contraseña (`password = NULL`).

### Sesión Automática

- El sistema cierra sesión automáticamente después de **30 minutos de inactividad** (configurado en `useSessionTimeout.js`).
- El JWT tiene una expiración de **24 horas** desde su emisión.

---

## 10. MÓDULOS FUNCIONALES DEL SISTEMA

### 10.1 Módulo de Productos

- **Página:** `src/pages/store/StoreProduct.jsx`
- **Hook:** `src/hooks/products/useProducts.js`
- **API:** `GET /api/products`
- Permite filtrar por línea: **Premium** y **Nacional**.
- Cada producto tiene imágenes en formato **WebP** para optimización.

### 10.2 Módulo de Carrito

- **Contexto global:** `src/context/CartContext.jsx`
- **Hook:** `src/hooks/cart/useCart.js`
- **Componentes:** `src/components/Cart/`
- El carrito se sincroniza con la base de datos cuando el usuario está autenticado.
- Muestra badge con el conteo de items en la navegación.

### 10.3 Módulo de Checkout y Pagos

- **Página:** `src/pages/checkout/CheckoutPage.jsx`
- **Hooks:** `usePayment.js`, `usePayPalPayment.js`, `useConfirmPayment.js`
- Soporta dos métodos de pago: **Tilopay** y **PayPal**.
- Genera una orden en la base de datos al completar el pago.

### 10.4 Módulo de Administración

- **Rutas protegidas por:** `src/components/admin/AdminRoute.jsx`
- **Layout:** `src/components/admin/AdminLayout.jsx`
- **Páginas:** `src/pages/admin/`
- Solo accesible por usuarios con `role = 'admin'` en la base de datos.
- Funcionalidades: gestión de productos, órdenes, usuarios y mensajes de contacto.

### 10.5 Módulo de Internacionalización

- **Configuración:** `src/i18n/index.js`
- Soporta **español (es)** e **inglés (en)**.
- Los archivos de traducción están en `src/i18n/locales/`.
- El selector de idioma se encuentra en `src/components/ui/LanguageSelector.jsx`.

### 10.6 Modo Mantenimiento

El sistema tiene un modo mantenimiento integrado en `src/index.js`:

```javascript
const MAINTENANCE_MODE = false; // Cambiar a true para activarlo
```

Cuando está activo, todas las peticiones retornan una página HTML de "Próximamente".

---

## 11. VARIABLES DE ENTORNO — REFERENCIA COMPLETA

| Variable | Requerida | Descripción | Ejemplo |
|----------|-----------|-------------|---------|
| `PORT` | No | Puerto del servidor backend | `3000` |
| `DB_HOST` | Sí | Host de MySQL | `localhost` |
| `DB_USER` | Sí | Usuario de MySQL | `root` |
| `DB_PASSWORD` | Sí | Contraseña de MySQL | `miContraseña123` |
| `DB_NAME` | Sí | Nombre de la base de datos | `database_sircof` |
| `JWT_SECRET` | Sí | Clave secreta para JWT | *(cadena larga y aleatoria)* |
| `CORS_ORIGIN` | No | Origen permitido por CORS | `http://localhost:5173` |
| `VITE_API_URL` | Sí | URL base de la API (frontend) | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Condicional | Client ID de Google OAuth | `xxxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Condicional | Secret de Google OAuth | `GOCSPX-xxxxx` |
| `EMAIL_USER` | Condicional | Correo del sistema (nodemailer) | `sistema@gmail.com` |
| `EMAIL_PASS` | Condicional | App Password de Gmail | `abcd efgh ijkl mnop` |
| `EMAIL_FROM` | No | Nombre/correo remitente | `sistema@gmail.com` |
| `TILOPAY_API_KEY` | Condicional | API Key de Tilopay | `tp_live_xxxxx` |
| `TILOPAY_API_URL` | Condicional | URL de Tilopay | `https://sandbox.tilopay.com` |
| `TILOPAY_HASH_KEY` | Condicional | Hash key de Tilopay | *(provisto por Tilopay)* |
| `PAYPAL_CLIENT_ID` | Condicional | Client ID de PayPal | `AYxxxxx` |
| `PAYPAL_CLIENT_SECRET` | Condicional | Secret de PayPal | `ELxxxxx` |
| `PAYPAL_API_URL` | Condicional | URL de la API de PayPal | `https://api-m.sandbox.paypal.com` |

> **"Condicional"** significa que es requerida si se usa esa funcionalidad (pagos, Google login, correos).

---

## 12. EXTENSIONES RECOMENDADAS PARA VS CODE

Instalar las siguientes extensiones para una mejor experiencia de desarrollo:

| Extensión | ID | Descripción |
|-----------|----|-------------|
| **ES7+ React/Redux Snippets** | `dsznajder.es7-react-js-snippets` | Snippets para React |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss` | Autocompletado de clases Tailwind |
| **Prettier** | `esbenp.prettier-vscode` | Formateo automático de código |
| **ESLint** | `dbaeumer.vscode-eslint` | Detección de errores de linting |
| **GitLens** | `eamodio.gitlens` | Historial y anotaciones de Git |
| **MySQL** | `cweijan.vscode-mysql-client2` | Cliente MySQL desde VS Code |
| **DotENV** | `mikestead.dotenv` | Resaltado de sintaxis en `.env` |
| **Auto Rename Tag** | `formulahendry.auto-rename-tag` | Renombrado automático de tags JSX |
| **Path Intellisense** | `christian-kohler.path-intellisense` | Autocompletado de rutas de archivos |

**Instalar desde la terminal de VS Code:**
```bash
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension mikestead.dotenv
```

---

## 13. COMANDOS ÚTILES DE DESARROLLO

### Scripts del proyecto

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo de Vite (frontend) |
| `npm run server` | Inicia el servidor Express (backend) |
| `npm run build` | Construye el proyecto para producción (optimiza imágenes + bundlea) |
| `npm run preview` | Previsualiza el build de producción localmente |
| `npm run lint` | Ejecuta ESLint para detectar errores de código |
| `npm run convert-images` | Convierte imágenes a formato WebP |

### Comandos de MySQL útiles

```sql
-- Ver todas las bases de datos
SHOW DATABASES;

-- Usar la base de datos del proyecto
USE database_sircof;

-- Ver todas las tablas
SHOW TABLES;

-- Ver estructura de una tabla
DESCRIBE users;

-- Listar todos los usuarios
SELECT id, name, email, role, created_at FROM users;

-- Hacer a un usuario administrador
UPDATE users SET role = 'admin' WHERE email = 'correo@ejemplo.com';

-- Ver todos los productos
SELECT id, name, price, line, stock FROM products;

-- Ver órdenes recientes
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
```

### Comandos de Git útiles

```bash
# Ver estado actual del repositorio
git status

# Ver historial de commits
git log --oneline

# Crear una nueva rama para una funcionalidad
git checkout -b feature/nueva-funcionalidad

# Guardar cambios en staging
git add .

# Hacer commit
git commit -m "feat: descripción del cambio"

# Subir cambios al repositorio remoto
git push origin feature/nueva-funcionalidad
```

---

## 14. DIAGRAMAS DEL SISTEMA

> Esta sección está destinada a los diagramas visuales del sistema. Los espacios marcados deben rellenarse con las imágenes correspondientes.

---

### 14.1 Diagrama de Arquitectura General

_Representación visual de cómo se comunican el Frontend, Backend y Base de Datos._

<!-- INSERTAR IMAGEN: Diagrama de arquitectura del sistema (Cliente → React SPA → Express API → MySQL) -->
> 📷 _Imagen: Diagrama de Arquitectura General del Sistema_

---

### 14.2 Diagrama Entidad-Relación (ER) — Base de Datos

_Representación visual de las tablas y sus relaciones._

<!-- INSERTAR IMAGEN: Diagrama ER con las tablas: users, products, carts, cart_items, orders, order_items, contacts -->
> 📷 _Imagen: Diagrama Entidad-Relación de la Base de Datos_

---

### 14.3 Diagrama de Flujo — Autenticación de Usuario

_Secuencia de pasos desde que el usuario ingresa credenciales hasta que accede al sistema._

<!-- INSERTAR IMAGEN: Diagrama de flujo del proceso de login (inicio → validación → JWT → acceso) -->
> 📷 _Imagen: Diagrama de Flujo — Inicio de Sesión con Email/Password_

---

### 14.4 Diagrama de Flujo — Autenticación con Google OAuth

_Secuencia del proceso de login mediante Google._

<!-- INSERTAR IMAGEN: Diagrama de flujo del login con Google (botón → Google → token → backend → JWT) -->
> 📷 _Imagen: Diagrama de Flujo — Login con Google OAuth_

---

### 14.5 Diagrama de Flujo — Proceso de Compra

_Secuencia completa desde que el usuario agrega un producto hasta que recibe confirmación del pago._

<!-- INSERTAR IMAGEN: Diagrama de flujo del checkout (catálogo → carrito → checkout → método de pago → confirmación) -->
> 📷 _Imagen: Diagrama de Flujo — Proceso de Compra Completo_

---

### 14.6 Diagrama de Componentes React

_Árbol visual de los componentes principales de la aplicación._

<!-- INSERTAR IMAGEN: Diagrama de árbol de componentes (App.jsx → Navigation, Pages, Context, etc.) -->
> 📷 _Imagen: Diagrama de Árbol de Componentes React_

---

### 14.7 Diagrama de Rutas de la API

_Mapa visual de todos los endpoints disponibles en el backend._

<!-- INSERTAR IMAGEN: Diagrama con todos los grupos de rutas de la API (/auth, /products, /cart, /payment, /orders, etc.) -->
> 📷 _Imagen: Diagrama de Rutas del Backend Express_

---

### 14.8 Diagrama de Flujo — Panel de Administración

_Acceso y funcionalidades del panel de administración._

<!-- INSERTAR IMAGEN: Diagrama de flujo del panel admin (login admin → AdminRoute → AdminLayout → páginas admin) -->
> 📷 _Imagen: Diagrama de Flujo — Acceso y Navegación del Panel Administrativo_

---

### 14.9 Capturas del Sistema en Funcionamiento

_Vistas de las páginas principales de la aplicación._

#### Página Principal (Home)
<!-- INSERTAR IMAGEN: Captura del Home del sistema con la navegación, productos destacados y footer -->
> 📷 _Imagen: Página principal — Vista general del Home_

#### Catálogo de Productos (Tienda)
<!-- INSERTAR IMAGEN: Captura de la página de la tienda con el filtro por línea y los productos -->
> 📷 _Imagen: Página de la Tienda — Catálogo de productos_

#### Carrito de Compras
<!-- INSERTAR IMAGEN: Captura del drawer/panel lateral del carrito con items agregados -->
> 📷 _Imagen: Carrito de Compras — Panel lateral abierto_

#### Proceso de Checkout
<!-- INSERTAR IMAGEN: Captura de la página de checkout con el formulario y resumen de orden -->
> 📷 _Imagen: Página de Checkout — Formulario de pago_

#### Panel de Administración
<!-- INSERTAR IMAGEN: Captura del dashboard del administrador -->
> 📷 _Imagen: Panel de Administración — Dashboard_

#### Perfil de Usuario
<!-- INSERTAR IMAGEN: Captura de la página de configuración/perfil del usuario -->
> 📷 _Imagen: Perfil de Usuario — Configuración de cuenta_

---

## 15. DESPLIEGUE EN PRODUCCIÓN

El proyecto está configurado para desplegarse en **Vercel** (frontend) y puede desplegarse en cualquier servidor VPS o hosting compartido con Node.js (backend).

### Frontend — Vercel

El archivo `vercel.json` ya está configurado:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Pasos para desplegar en Vercel:**
1. Crear cuenta en [https://vercel.com/](https://vercel.com/).
2. Importar el repositorio de GitHub.
3. En la configuración del proyecto en Vercel, agregar las variables de entorno (`VITE_API_URL` apuntando al servidor de producción).
4. Hacer clic en "Deploy".

### Backend — Servidor VPS / Hosting

Para producción, el backend debe correr en un servidor con Node.js. Recomendaciones:

```bash
# Instalar PM2 para mantener el servidor corriendo
npm install -g pm2

# Iniciar el servidor con PM2
pm2 start src/index.js --name "sircof-backend"

# Guardar configuración de PM2 para reinicio automático
pm2 save
pm2 startup
```

### Variables de entorno en producción

Cambiar los valores del `.env` para producción:
```env
VITE_API_URL=https://tu-dominio.com
CORS_ORIGIN=https://tu-dominio-frontend.vercel.app
TILOPAY_API_URL=https://app.tilopay.com  # sin "sandbox"
PAYPAL_API_URL=https://api-m.paypal.com  # sin "sandbox"
```

---

## 16. CONSIDERACIONES DE SEGURIDAD

| Aspecto | Implementación |
|---------|---------------|
| Contraseñas | Hasheadas con bcrypt (nunca en texto plano) |
| Autenticación | JWT con expiración de 24 horas |
| Rate Limiting | Middleware `express-rate-limit` para prevenir brute force |
| CORS | Restringido solo al dominio del frontend |
| SQL Injection | Uso de consultas parametrizadas con `mysql2` (prepared statements) |
| Variables sensibles | Almacenadas en `.env`, nunca en el código fuente |
| Roles | Verificación de rol `admin` directamente en base de datos (no solo en token) |
| HTTPS | Requerido en producción para proteger tokens en tránsito |

> ⚠️ **Importante:** Nunca versionar el archivo `.env`. Siempre verificar que esté en `.gitignore`.

---

## 17. SOLUCIÓN DE PROBLEMAS COMUNES

### Error: `ECONNREFUSED` al conectar con MySQL

**Causa:** El servidor MySQL no está corriendo.  
**Solución:**
```bash
# Windows (desde XAMPP o servicios):
# Abrir XAMPP Control Panel y iniciar MySQL

# O desde servicios de Windows:
net start MySQL80
```

### Error: `Cannot find module` al ejecutar el servidor

**Causa:** Las dependencias no están instaladas o están incompletas.  
**Solución:**
```bash
# Borrar node_modules y reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Error: `Invalid token` / `Token no proporcionado`

**Causa:** El JWT_SECRET en `.env` no coincide con el usado para generar el token, o el token expiró.  
**Solución:** Cerrar sesión, volver a iniciar sesión para obtener un token nuevo. Asegurar que `JWT_SECRET` sea consistente.

### El frontend no se comunica con el backend (errores CORS)

**Causa:** El valor de `CORS_ORIGIN` en el backend no coincide con la URL del frontend.  
**Solución:** Verificar que en `.env` esté:
```env
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3000
```

### Las imágenes no cargan

**Causa:** Las rutas de imágenes son incorrectas o los archivos WebP no están generados.  
**Solución:**
```bash
npm run convert-images
```

### Error de puerto en uso: `EADDRINUSE :3000`

**Causa:** Otro proceso está usando el puerto 3000.  
**Solución:**
```bash
# Encontrar y terminar el proceso en Windows:
netstat -ano | findstr :3000
taskkill /PID <número_del_pid> /F
```

### No puedo hacer login como administrador

**Causa:** El usuario no tiene `role = 'admin'` en la base de datos.  
**Solución:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'tu_correo@ejemplo.com';
```

---

## REFERENCIAS Y RECURSOS

| Recurso | URL |
|---------|-----|
| Documentación de React | [https://react.dev/](https://react.dev/) |
| Documentación de Vite | [https://vite.dev/](https://vite.dev/) |
| Documentación de Express.js | [https://expressjs.com/](https://expressjs.com/) |
| Documentación de Tailwind CSS | [https://tailwindcss.com/docs](https://tailwindcss.com/docs) |
| Documentación de Framer Motion | [https://www.framer.com/motion/](https://www.framer.com/motion/) |
| Documentación de MySQL | [https://dev.mysql.com/doc/](https://dev.mysql.com/doc/) |
| Documentación de jwt.io | [https://jwt.io/](https://jwt.io/) |
| Documentación de nodemailer | [https://nodemailer.com/](https://nodemailer.com/) |
| Google Cloud Console (OAuth) | [https://console.cloud.google.com/](https://console.cloud.google.com/) |
| PayPal Developer | [https://developer.paypal.com/](https://developer.paypal.com/) |

---

_Manual Técnico — SIRCOF E-Commerce — Versión 1.0 — Marzo 2026_
