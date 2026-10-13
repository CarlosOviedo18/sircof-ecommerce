<img width="1799" height="838" alt="Image" src="https://github.com/user-attachments/assets/32394dd3-daba-45b3-90ce-8d8ab4cd7d57" />
# SIRCOF E-Commerce — Plataforma de venta de café

Plataforma de comercio electrónico para la venta de café, desarrollada con React (Vite) en el frontend y Express + MySQL en el backend. Incluye catálogo con variantes, carrito, dos pasarelas de pago (Tilopay y PayPal), panel de administración, autenticación con JWT y Google, envío de correos de confirmación e internacionalización (español e inglés).

El frontend y el backend comparten la carpeta `src/`. En producción, el servidor Express sirve tanto la API como el frontend ya compilado.

---

## Tabla de contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [Ejecución en desarrollo](#ejecución-en-desarrollo)
- [Compilación y producción](#compilación-y-producción)
- [Reglas de envío y métodos de pago](#reglas-de-envío-y-métodos-de-pago)
- [Seguridad](#seguridad)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Scripts disponibles](#scripts-disponibles)
- [Tecnologías](#tecnologías)
- [Autor](#autor)

---

## Características

**Autenticación y cuentas**
- Registro e inicio de sesión con JWT y contraseñas hasheadas con bcrypt.
- Inicio de sesión con Google (OAuth).
- Recuperación de contraseña con código de un solo uso, hasheado y con límite de intentos.
- Revocación de sesión: al cambiar la contraseña, las sesiones anteriores quedan invalidadas.

**Catálogo**
- Cafés organizados por categorías, cada uno con sus variantes (tamaño, molienda y tueste).
- Una tarjeta por café, con selección de variante en el detalle.
- Búsqueda y ordenamiento, acceso público sin necesidad de iniciar sesión.

**Pack de 9 (internacional)**
- Producto especial con 9 cafés premium y envío internacional incluido en el precio.
- Disponible únicamente para pedidos fuera de Costa Rica y solo por PayPal.
- Se muestra destacado en la tienda, con aviso claro de que es exclusivo para clientes en el exterior.

**Carrito y checkout**
- Carrito persistido en base de datos, con validación de cantidades y de stock.
- Los montos siempre se recalculan en el servidor; nunca se confía en el precio enviado por el navegador.
- Costo de envío fijo configurable desde el panel de administración.

**Pagos**
- Tilopay para pagos nacionales (colones).
- PayPal para pagos internacionales (dólares), con conversión de moneda.
- La confirmación del pago de Tilopay se valida de servidor a servidor consultando la API de Tilopay, no desde el navegador.

**Panel de administración**
- Gestión de cafés, variantes, pedidos, usuarios y contactos.
- Edición del costo de envío.
- Rol verificado contra la base de datos en cada petición.

**Otros**
- Correos de confirmación al cliente y a la empresa tras cada pago.
- Internacionalización en español e inglés.
- Diseño responsivo con Tailwind CSS y animaciones.
- Elemento 3D optimizado (modelo comprimido y render bajo demanda).

---

## Arquitectura

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, i18next.
- **Backend:** Express (módulos ES), MySQL mediante `mysql2` con consultas parametrizadas.
- **Autenticación:** JWT en el encabezado `Authorization`, bcrypt para contraseñas.
- **Pagos:** Tilopay (nacional) y PayPal (internacional).
- **Correos:** nodemailer.
- **Código compartido:** la carpeta `src/` contiene tanto la aplicación React como el servidor Express. En producción Express sirve la carpeta `dist/` generada por Vite.

---

## Requisitos previos

- Node.js 18 o superior.
- npm.
- MySQL 8.0 o superior.
- Un editor de código (por ejemplo, VS Code).

---

## Instalación

```bash
git clone https://github.com/CarlosOviedo18/sircof-ecommerce.git
cd sircof-ecommerce
npm install
```

Luego configurar el archivo `.env` (ver la sección siguiente) y cargar la base de datos.

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables.

```env
# Ambiente
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contrasena_mysql
DB_NAME=database_sircof

# Servidor
PORT=3000
BACKEND_URL=http://localhost:3000

# URLs publicas (callbacks y correos)
PUBLIC_URL=http://localhost:3000
CALLBACK_URL=http://localhost:3000/checkout/success
CORS_ORIGIN=http://localhost:3000

# Frontend (deben empezar con VITE_ para incluirse en el bundle)
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=tu_google_client_id

# Google OAuth (backend)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# JWT (debe medir 32 caracteres o mas, o el servidor no arranca)
JWT_SECRET=una_clave_larga_y_aleatoria_de_al_menos_32_caracteres

# PayPal
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret
PAYPAL_MODE=sandbox

# Tilopay
TILOPAY_API_KEY=tu_api_key
TILOPAY_API_USER=tu_api_user
TILOPAY_API_PASSWORD=tu_api_password
TILOPAY_ENVIRONMENT=live

# Correo (Gmail con contrasena de aplicacion)
EMAIL_SERVICE=gmail
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASSWORD=contrasena_de_aplicacion_de_16_caracteres
COMPANY_EMAIL=correo_donde_llegan_los_pedidos
COMPANY_NAME=CafeSircof

# Lista de paises del formulario de envio
RESTCOUNTRIES_API_KEY=tu_api_key_restcountries
```

Notas importantes:

- `JWT_SECRET` debe tener al menos 32 caracteres; de lo contrario el servidor se detiene al arrancar.
- `EMAIL_PASSWORD` debe ser una contraseña de aplicación de Gmail (requiere verificación en dos pasos activada), no la contraseña normal.
- `PAYPAL_MODE` acepta `sandbox` (pruebas) o `live` (producción). Las credenciales de sandbox y live son distintas.
- En producción, todas las URLs (`VITE_API_URL`, `PUBLIC_URL`, `CALLBACK_URL`, `CORS_ORIGIN`, `BACKEND_URL`, `GOOGLE_REDIRECT_URI`) deben apuntar al dominio real, no a `localhost`.

---

## Base de datos

El archivo `database/db.sql` contiene el esquema completo y actualizado: tablas, restricciones, índices y los datos iniciales de configuración (costo de envío y producto Pack).

```bash
mysql -u root -p
```

Dentro de la consola de MySQL:

```sql
CREATE DATABASE database_sircof;
USE database_sircof;
SOURCE database/db.sql;
EXIT;
```

El nombre de la base debe coincidir con `DB_NAME` del archivo `.env`. La carpeta `database/migrations/` contiene migraciones históricas; para una instalación nueva basta con `db.sql`.

---

## Ejecución en desarrollo

El frontend y el backend se levantan por separado. Se recomienda usar dos terminales.

Terminal 1 (backend, puerto 3000):

```bash
npm run server
```

Terminal 2 (frontend, puerto 5173):

```bash
npm run dev
```

El frontend de Vite queda en `http://localhost:5173` y consume la API del backend en `http://localhost:3000`.

---

## Compilación y producción

Compilar el frontend:

```bash
npm run build
```

Esto convierte las imágenes y genera la carpeta `dist/`. Importante: `VITE_API_URL` se incrusta en el bundle durante la compilación, así que debe tener el valor de producción antes de ejecutar `npm run build`.

En producción, el mismo servidor Express sirve la API y la carpeta `dist/`:

```bash
npm run server
```

Checklist de despliegue:

1. Definir las variables de entorno con los valores de producción (dominio real, `PAYPAL_MODE=live`, credenciales reales).
2. Ejecutar `database/db.sql` en la base de datos del servidor.
3. Instalar dependencias con `npm install`.
4. Compilar con `npm run build` (con `VITE_API_URL` apuntando al dominio).
5. Iniciar o reiniciar el proceso de Node.

---

## Reglas de envío y métodos de pago

El tipo de producto y el país de destino determinan qué se puede comprar y cómo se paga. Las reglas se validan en el servidor.

| Contenido del carrito | Costa Rica | Internacional |
| --- | --- | --- |
| Cafés individuales | Permitido (Tilopay o PayPal) | No permitido |
| Pack de 9 | No permitido | Permitido (solo PayPal) |

- Los cafés individuales se envían únicamente dentro de Costa Rica.
- El Pack de 9 se envía únicamente al exterior y se paga solo con PayPal; su precio ya incluye el envío internacional.
- El costo de envío nacional es un valor fijo, editable desde el panel de administración.

---

## Seguridad

- Contraseñas hasheadas con bcrypt.
- Autenticación por JWT con algoritmo fijo y expiración; el rol de administrador se verifica contra la base de datos en cada petición.
- Revocación de sesiones al cambiar o restablecer la contraseña.
- Recuperación de contraseña con código aleatorio seguro, almacenado hasheado y con límite de intentos.
- Validación de cantidades y de stock; los montos se recalculan siempre en el servidor.
- Confirmación de pagos verificada de servidor a servidor (Tilopay por consulta a su API; PayPal validando la captura y el monto) para que el navegador no pueda declarar un pago falso.
- Consultas parametrizadas en todas las operaciones de base de datos.
- Variables sensibles fuera del repositorio, en el archivo `.env`.
- Límite de peticiones (rate limiting) y cabeceras de seguridad.

---

## Estructura del proyecto

```
sircof-ecommerce/
├── src/
│   ├── components/        Componentes de interfaz (checkout, carrito, admin, etc.)
│   ├── pages/             Páginas (tienda, checkout, admin, cuenta, nosotros, etc.)
│   ├── hooks/             Custom hooks (auth, carrito, pagos, admin, settings)
│   ├── context/           Estado global (AuthContext, CartContext)
│   ├── routes/            Rutas de la API de Express (auth, cart, payment, orders, admin)
│   ├── services/          Lógica de negocio (totales, pagos, correos, Tilopay, guardas del pack)
│   ├── middleware/        Autenticación, autorización, cabeceras, límites
│   ├── lib/               Utilidades (JWT, criptografía, política de contraseñas)
│   ├── shared/            Código compartido entre frontend y backend (reglas del pack)
│   ├── i18n/locales/      Traducciones (es, en)
│   ├── templates/         Plantillas de correo
│   ├── animations/        Componente 3D
│   ├── index.js           Servidor Express (API + archivos estáticos en producción)
│   └── main.jsx           Punto de entrada del frontend
├── database/
│   ├── db.sql             Esquema completo y datos iniciales
│   └── migrations/        Migraciones históricas
├── public/                Recursos estáticos (incluye modelos 3D)
├── dist/                  Frontend compilado (generado por npm run build)
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el frontend de Vite en modo desarrollo. |
| `npm run server` | Inicia el servidor Express (API y, en producción, el frontend compilado). |
| `npm run build` | Convierte imágenes y compila el frontend en `dist/`. |
| `npm run preview` | Sirve localmente el frontend ya compilado. |
| `npm run lint` | Ejecuta ESLint sobre el proyecto. |

---

## Tecnologías

**Frontend**

- React 18 y Vite
- React Router
- Tailwind CSS
- i18next (internacionalización)
- Three.js (elemento 3D)

**Backend**

- Express (módulos ES)
- MySQL con mysql2
- JWT (jsonwebtoken) y bcryptjs
- nodemailer
- Integraciones con Tilopay y PayPal

---

## Autor

**Carlos Oviedo**

- LinkedIn: https://www.linkedin.com/in/carlos-oviedo-135a1426b
- GitHub: https://github.com/CarlosOviedo18
- Correo: caantoni24@gmail.com

---

Última actualización: octubre de 2026.
