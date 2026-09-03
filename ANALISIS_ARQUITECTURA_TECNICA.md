# Análisis Técnico de la Arquitectura - SIRCOF E-Commerce

## Introducción
Este documento presenta un análisis completo de la arquitectura del e-commerce de SIRCOF Café, proyecto fullstack desarrollado con **React (frontend)** y **Node.js/Express (backend)**, con base de datos **MySQL**.

---

## 1. ARQUITECTURA GENERAL DEL PROYECTO

### 1.1 Estructura General (Monorepo)
El proyecto está organizado como un **monorepo** donde el frontend (React) y backend (Node.js) conviven en la misma carpeta raíz:

```
sircof-ecommerce/
├── src/                    # Código fuente (compartido React + Backend)
│   ├── App.jsx            # Componente raíz de React
│   ├── main.jsx           # Entry point de React
│   ├── index.js           # Servidor Express (Backend)
│   ├── components/        # Componentes React
│   ├── pages/             # Páginas React
│   ├── routes/            # Rutas Express (Backend)
│   ├── middleware/        # Middleware Express
│   ├── context/           # Context API (React)
│   ├── hooks/             # Custom hooks (React)
│   ├── services/          # Servicios (Backend)
│   ├── lib/               # Utilidades (JWT, Crypto, etc.)
│   └── config/            # Configuración
├── database/              # Scripts SQL
├── public/                # Archivos estáticos
├── dist/                  # Build compilado (producción)
└── vite.config.js         # Configuración de Vite
```

### 1.2 Stack Tecnológico

**Frontend:**
- **React 19.2** - UI library
- **React Router DOM 7** - Routing
- **Vite** - Build tool y dev server
- **TailwindCSS** - Styling
- **Context API** - State management
- **Custom Hooks** - Lógica compartida

**Backend:**
- **Express.js 4.18** - Web framework
- **Node.js** - Runtime
- **MySQL2** - Driver de BD
- **JWT (jsonwebtoken)** - Autenticación con tokens
- **bcryptjs** - Hashing de contraseñas
- **nodemailer** - Envío de emails
- **cors** - CORS middleware
- **express-rate-limit** - Rate limiting

**Base de Datos:**
- **MySQL** - RDBMS relacional

### 1.3 Flujo General de una Petición

Aquí explicamos cómo fluye una petición desde que el cliente la envía hasta que se recibe la respuesta:

```
1. CLIENTE (React)
   ↓
   Usuario realiza una acción (click, formulario, etc.)
   ↓
   Hook (useAuth, useCart, usePayment) se ejecuta
   ↓
   Fetch API hacia http://localhost:3000/api/...
   ↓
   Se incluye token en headers: Authorization: Bearer <TOKEN_JWT>

2. SERVIDOR (Express)
   ↓
   Llega a index.js, pasa por CORS y middleware de seguridad
   ↓
   Rate limiter verifica si la IP no ha excedido límite
   ↓
   Express parsea JSON del body
   ↓
   Ruta matchea (ej: /api/cart → router de cart.js)
   ↓
   Middleware de autenticación (protectRoute):
      - Extrae token del header Authorization
      - Verifica que sea válido con JWT_SECRET
      - Descodifica el token y obtiene userId
      - Adjunta datos del usuario a req.user
   ↓
   Controlador ejecuta lógica:
      - Valida datos de entrada
      - Accede a base de datos con mysql2
      - Ejecuta query
      - Procesa resultado

3. RESPUESTA
   ↓
   Servidor devuelve JSON: { success: true, data: {...} }
   ↓
   Cliente recibe respuesta en hook
   ↓
   Actualiza estado (Context API, useState)
   ↓
   React re-renderiza componentes afectados
   ↓
   UI se actualiza en pantalla
```

### 1.4 Decisión: Monorepo vs Microservicios

**¿Por qué monorepo?**
- **Inicio rápido** - Más fácil de desarrollar y desplegar al inicio
- **Compartir tipos/interfaces** - Si usara TypeScript, podrían compartirse tipos
- **Deploy simplificado** - Un único servidor sirve todo
- **Desarrollo más rápido** - Sin overhead de comunicación entre servicios

**Trade-offs:**
- Si crece, será difícil escalar independientemente frontend/backend
- Solución: En futura refactorización, separar en dos repos independientes con API REST clara

---

## 2. AUTENTICACIÓN

### 2.1 Sistemas de Autenticación Soportados

El proyecto tiene **dos métodos de autenticación**:

#### A) Autenticación Tradicional (Email + Contraseña)

**Registro:**
```
POST /api/auth/register
Body: { name, email, password }
```

Proceso en backend:
1. Valida formato de email con regex
2. Valida que contraseña sea fuerte:
   - Mínimo 8 caracteres
   - Obligatoriamente 1 mayúscula
   - Obligatoriamente 1 número
3. Verifica que el email no esté registrado
4. **Hashea la contraseña** con bcryptjs (salt=10)
5. Inserta usuario en BD
6. Genera JWT token válido por 24 horas
7. Devuelve token y datos del usuario

**Login:**
```
POST /api/auth/login
Body: { email, password }
```

Proceso:
1. Busca usuario por email
2. Compara contraseña enviada con hash almacenado
3. Si coincide, genera JWT token
4. Devuelve token y datos del usuario

#### B) Autenticación con Google (OAuth2)

```
POST /api/auth/google
Body: { credential } (token de Google)
```

Proceso:
1. Recibe credential token de Google
2. Verifica token con Google OAuth2Client usando GOOGLE_CLIENT_ID
3. Extrae datos: googleId, email, name
4. **Busca usuario por googleId o email**:
   - Si existe con googleId → login
   - Si existe con email pero sin googleId → vincula cuenta y login
   - Si no existe → crea nuevo usuario (sin password, con google_id)
5. Genera JWT token propio (no usa token de Google)

**¿Por qué vincular cuentas?**
Si alguien se registró con email/password y luego intenta con Google:
- En lugar de crear duplicado, se vincula la cuenta existente
- Seguridad: Verifica que el googleId no esté ya vinculado a otra cuenta

### 2.2 Generación y Validación de JWT

**Generación (lib/jwt.js):**
```javascript
generateToken(userId, email) → jwt.sign(
  { id: userId, email },
  JWT_SECRET,
  { expiresIn: '24h' }
)
```

**Estructura del JWT:**
- **Header:** { alg: 'HS256', typ: 'JWT' }
- **Payload:** { id: 123, email: 'user@example.com', iat: 1234567890, exp: 1234654290 }
- **Signature:** HMACSHA256(header.payload, JWT_SECRET)

**Validación (middleware/auth.js - protectRoute):**
```javascript
1. Extrae header Authorization
2. Verifica formato: "Bearer <TOKEN>"
3. Verifica firma con JWT_SECRET
4. Verifica que no esté expirado (exp)
5. Descodifica y adjunta decoded.id al req.user
6. Si algo falla → 401 Unauthorized
```

**Almacenamiento del Token:**
- Cliente: localStorage.setItem('token', data.token)
- Se envía en cada petición autenticada: Authorization: Bearer <TOKEN>

### 2.3 Hashing de Contraseñas

**Librería:** bcryptjs (compatibilidad mejor que bcrypt)

**Proceso:**
```javascript
hashPassword(password) → 
  1. Genera salt con 10 rounds: bcryptjs.genSalt(10)
  2. Hash: bcryptjs.hash(password, salt)
  3. Resultado: $2b$10$... (hash de 60 caracteres)

comparePassword(plainPassword, hashedPassword) →
  1. bcryptjs.compare(plainPassword, hashedPassword)
  2. Devuelve true/false
  3. No se puede invertir el hash (one-way function)
```

**¿Por qué bcryptjs?**
- Adaptación de Java a JavaScript de bcrypt (algoritmo estándar de hashing)
- Ajustable (10 rounds es buen balance entre seguridad y velocidad)
- Resistente a ataques por fuerza bruta (computacionalmente caro)
- No es reversible (hash → plaintext imposible)

### 2.4 Rate Limiting en Autenticación

**Aplicado en:**
- POST /api/auth/register: **20 intentos cada 15 minutos**
- POST /api/auth/login: **20 intentos cada 15 minutos**
- POST /api/auth/google: **10 intentos cada 15 minutos**

**¿Por qué?**
- Previene ataques de fuerza bruta
- Si alguien prueba 1000 contraseñas, será bloqueado
- Protege contra spam de registro

### 2.5 Recuperación de Contraseña

**Flujo:**
```
1. Usuario solicita reset: POST /api/auth/forgot-password
2. Backend genera código de 6 dígitos
3. Envía email con enlace + código
4. Usuario recibe email y entra el código
5. Verifica código: POST /api/auth/verify-reset-code
6. Si válido, usuario resetea contraseña: POST /api/auth/reset-password
7. Contraseña hashea nuevamente, se guarda en BD
```

**Seguridad:**
- Código expira en 15 minutos (campo expires_at en BD)
- Se marca como used = 1 después de usar (no reutilizable)
- Solo el propietario del email puede reset su password

---

## 3. MODELO DE DATOS

### 3.1 Diagrama de Tablas

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ email (UNIQUE)  │
│ password        │
│ google_id       │
│ role (enum)     │ ← 'user' o 'admin'
│ created_at      │
└────────┬────────┘
         │ 1
         │
         ├─────────────────────────────────┬────────────────────┬──────────────────┐
         │                                 │                    │                  │
         │ 1                               │ 1                  │ 1                │ 1
         └─ * ──┐                          └─ * ─┐              └─ * ┐             └─ * ┐
                │                               │                   │                   │
         ┌──────────────┐            ┌──────────────────┐    ┌──────────┐   ┌─────────────────┐
         │   carts      │            │     orders       │    │ contacts │   │ password_resets │
         ├──────────────┤            ├──────────────────┤    ├──────────┤   ├─────────────────┤
         │ id (PK)      │            │ id (PK)          │    │ id (PK)  │   │ id (PK)         │
         │ user_id (FK) │            │ user_id (FK)     │    │ name     │   │ user_id (FK)    │
         │ created_at   │            │ total            │    │ email    │   │ code (6 dígitos)│
         └──────────────┘            │ status           │    │ subject  │   │ expires_at      │
              │ 1                    │ payment_method   │    │ message  │   │ used (bool)     │
              │                      │ tilopay_*        │    │ status   │   │ created_at      │
              │                      │ phone, address   │    │ created  │   └─────────────────┘
              │ *                    │ city, country    │    │ updated  │
              │                      │ created_at       │    │ *indices │
         ┌────────────────────┐      └────────┬─────────┘    └──────────┘
         │   cart_items       │             │ 1
         ├────────────────────┤             │
         │ id (PK)            │             │ *
         │ cart_id (FK)       │        ┌──────────────────┐
         │ product_id (FK) ┐  │        │  order_items     │
         │ quantity        │  │        ├──────────────────┤
         └────────────────┼┬─┘        │ id (PK)          │
                          ││           │ order_id (FK)    │
                          ││           │ product_id (FK)  │
                          ││           │ quantity         │
                          ││           │ price (snapshot) │
                          ││           └──────────────────┘
                          │└─────────────────────┐
                          │                      │
                          │                  ┌───────────────┐
                          │                  │   products    │
                          └─────────────────→├───────────────┤
                                             │ id (PK)       │
                                             │ name          │
                                             │ description   │
                                             │ price         │
                                             │ image_url     │
                                             │ line          │
                                             │ stock         │
                                             │ created_at    │
                                             └───────────────┘
```

### 3.2 Descripción de Tablas

#### **users**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT AUTO_INCREMENT | Identificador único |
| name | VARCHAR(100) | Nombre del usuario |
| email | VARCHAR(100) UNIQUE | Email único |
| password | VARCHAR(255) NULL | Hash bcrypt (NULL si login por Google) |
| google_id | VARCHAR(255) UNIQUE NULL | ID de Google (NULL si login tradicional) |
| role | ENUM('user','admin') | Rol: usuario normal o administrador |
| created_at | DATETIME | Fecha de creación |

**Decisiones:**
- `password` es NULL para usuarios que se registran con Google
- `google_id` es NULL para usuarios con registro tradicional
- Permite tener cuenta con ambos métodos vinculados

---

#### **products**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT AUTO_INCREMENT | Identificador único |
| name | VARCHAR(150) | Nombre del café |
| description | TEXT | Descripción larga |
| price | DECIMAL(10,2) | Precio en CRC |
| image_url | VARCHAR(255) | URL de imagen |
| line | VARCHAR(50) | Línea: "Nacional" o "Premium" |
| stock | INT | Stock disponible |
| created_at | DATETIME | Fecha de creación |

**Datos de ejemplo:**
- Café Nacional 500g @ ₡3,300
- Café Premium 500g @ ₡4,500

---

#### **carts** y **cart_items** (Relación 1-a-Muchos)

```
users (1) ──→ carts (*)
              └─→ cart_items (*)
                   ├─→ productos
```

Diseño:
- Cada usuario tiene UN carrito (creado automáticamente al primer acceso)
- El carrito tiene MUCHOS items
- Cada item referencia un producto

**¿Por qué esta estructura?**
- **Carrito no es solo Array** - Tiene su propia tabla para facilitar queries
- Permite obtener carrito rápido sin iterar
- Facilita "guardar carrito" (persistencia)
- Items se eliminan en cascada si se elimina el carrito

---

#### **orders** y **order_items** (Relación 1-a-Muchos)

```
users (1) ──→ orders (*)
              └─→ order_items (*)
                   ├─→ productos
```

**orders:**
| Campo | Tipo | Propósito |
|-------|------|----------|
| id | INT | ID de la orden |
| user_id | INT FK | Quién compró |
| total | DECIMAL | Monto total |
| status | ENUM | pending / paid / cancelled |
| payment_method | ENUM | tilopay / paypal |
| tilopay_reference | VARCHAR | ID de transacción en Tilopay |
| tilopay_order_number | VARCHAR | Número de orden en Tilopay |
| phone, address, city, postal_code, country | VARCHAR | Datos de envío |
| created_at | DATETIME | Cuándo se realizó |

**order_items:**
| Campo | Tipo | Propósito |
|-------|------|----------|
| id | INT | ID del item |
| order_id | INT FK | A qué orden pertenece |
| product_id | INT FK | Qué producto |
| quantity | INT | Cuántas unidades |
| price | DECIMAL | **Precio snapshot** |

**¿Por qué guardar price en order_items?**
- Histórico: Si el precio del café cambia, la orden guarda el precio que se pagó
- Reportes: Análisis de margen histórico
- Auditoría: Saber exactamente qué pagó cada cliente

**Cascada:** Si se elimina la orden, se eliminan todos sus items automáticamente

---

#### **contacts** (Tabla de Contacto)
Para formulario de "Contáctanos"

| Campo | Tipo | Propósito |
|-------|------|----------|
| id | INT | ID |
| name | VARCHAR | Nombre remitente |
| email | VARCHAR | Email remitente |
| subject | VARCHAR | Asunto |
| message | LONGTEXT | Mensaje largo |
| status | VARCHAR | "unread", "read", "replied" |
| created_at | TIMESTAMP | Cuándo |

**Índices:**
- Por email, status, created_at (para filtrar rápido)

---

#### **password_resets** (Tabla de Recuperación)

| Campo | Tipo | Propósito |
|-------|------|----------|
| id | INT | ID |
| user_id | INT FK | Qué usuario |
| code | VARCHAR(6) | Código de 6 dígitos |
| expires_at | DATETIME | Cuándo expira (15 min) |
| used | TINYINT(1) | 0=no usado, 1=usado |
| created_at | DATETIME | Cuándo se creó |

**Flow:**
1. Usuario solicita reset → se crea fila
2. Usuario valida código → se verifica que expires_at > NOW()
3. Usuario resetea password → se marca used = 1
4. Si intenta reusar código → error (used = 1)

### 3.3 Relaciones (Integridad Referencial)

**Foreign Key Constraints ON DELETE CASCADE:**

Esto significa: Si se elimina el padre, se eliminan todos los hijos automáticamente.

Ejemplos:
- Si user_id=5 se elimina → se eliminan carts, orders, password_resets de ese usuario
- Si order_id=100 se elimina → se eliminan todos sus order_items
- Si cart_id=50 se elimina → se eliminan todos sus cart_items

**¿Por qué CASCADE?**
- Limpieza automática de datos huérfanos
- Simplifica lógica de eliminación
- Sin CASCADE, habría que borrar manualmente en orden

**¿Por qué no eliminar usuarios?**
- En producción, se deshabilitan en lugar de eliminar (auditoria)
- Historial de pedidos se conserva
- Decisión del sistema actual: cascada completa

---

## 4. FLUJO DE COMPRA

### 4.1 Diagrama de Flujo General

```
┌─────────────────┐
│   Usuario en    │
│  página Tienda  │
└────────┬────────┘
         │
         ↓
    ┌──────────────┐
    │ Selecciona   │
    │  producto +  │
    │  cantidad    │
    └──────┬───────┘
           │
           ↓
    ┌──────────────────────┐
    │ CLICK: "Al Carrito"  │  → Hook: useCart.addToCart()
    └──────┬───────────────┘     → API: POST /api/cart/add
           │                      → Carrito en Context API se actualiza
           ↓
    ┌──────────────────────┐
    │ Usuario ve Carrito   │
    │ (puede agregar más,  │
    │  cambiar cantidad,   │
    │  remover items)      │
    └──────┬───────────────┘
           │
           ↓
    ┌──────────────────────┐
    │ CLICK: "Proceder     │
    │ al pago"             │
    └──────┬───────────────┘
           │
           ↓
    ┌──────────────────────┐
    │ Página CHECKOUT      │
    │ 1. Datos de envío    │
    │ 2. Resumen de orden  │
    │ 3. Método de pago    │  ← Elige Tilopay o PayPal
    └──────┬───────────────┘
           │
           ├──────────────────┬──────────────────┐
           │                  │                  │
    ┌──────▼──────┐    ┌──────▼──────┐    ┌─────▼──────┐
    │  TILOPAY    │    │   PAYPAL    │    │   EFECTIVO │
    │             │    │             │    │ (no implem)│
    └──────┬──────┘    └──────┬──────┘    └────────────┘
           │                  │
           ↓                  ↓
    ┌──────────────────┐   ┌──────────────────┐
    │ POST /api/       │   │ POST /api/paypal/│
    │ payment/process  │   │ create-order     │
    │                  │   │                  │
    │ Crea orden en BD │   │ Crea orden en    │
    │ status=pending   │   │ PayPal, obtiene  │
    │                  │   │ URL de aprobación│
    └──────┬───────────┘   └──────┬───────────┘
           │                      │
           ↓                      ↓
    ┌──────────────────┐   ┌──────────────────┐
    │ Redirige a       │   │ Redirige a       │
    │ Tilopay.com      │   │ sandbox.paypal   │
    │ (pasarela real)  │   │                  │
    │                  │   │ Usuario aprueba  │
    │ Usuario ingresa  │   │ pago en PayPal   │
    │ datos tarjeta    │   └──────┬───────────┘
    │                  │           │
    │ Tilopay procesa  │   ┌───────▼────────┐
    │ transacción      │   │ PayPal redirige│
    │                  │   │ a success URL  │
    │ Tilopay redirige │   │                │
    │ a success URL    │   └───────┬────────┘
    └──────┬───────────┘           │
           │                       │
           └───────────┬───────────┘
                       │
                       ↓
        ┌──────────────────────────┐
        │ Success Page             │
        │ (/checkout/success)      │
        │                          │
        │ - Muestra "Pago OK"      │
        │ - Parámetros en URL:     │
        │   ?orderNumber=...       │
        │   &code=1 (exito)        │
        └──────┬───────────────────┘
               │
               ↓
        ┌──────────────────────────┐
        │ POST /api/payment/confirm│
        │ (desde el cliente)       │
        │                          │
        │ Verifica code=1          │
        │ Marca orden como "paid"  │
        │ Limpia carrito           │
        │ Envía emails             │
        └──────────────────────────┘
```

### 4.2 Detalle: Agregar Producto al Carrito

**Frontend (Hook useCart):**
```javascript
addToCart = async (productId, cantidad) => {
  POST /api/cart/add
  Headers: Authorization: Bearer <TOKEN>
  Body: { productId, cantidad }
}
```

**Backend (routes/cart/cart.js):**
```
1. Extrae userId del token
2. Busca carrito del usuario:
   - Si existe → usa ese cartId
   - Si no existe → crea nuevo carrito
3. Verifica si producto ya está en carrito:
   - Si SÍ → UPDATE cantidad += new cantidad
   - Si NO → INSERT nuevo cart_item
4. Devuelve { success: true }
5. Frontend actualiza Context API con carrito nuevo
```

**¿Por qué crear carrito automáticamente?**
- UX mejor: Usuario no necesita crear carrito explícitamente
- Backend puede crear cuando sea necesario
- BD siempre tiene consistencia 1 usuario = 1 carrito

**¿Por qué sumar cantidades?**
- Si usuario agrega 2 cafés, luego agrega 2 más → total 4 en carrito
- No duplica items, solo incrementa cantidad
- Mejor UX que crear item duplicado

---

### 4.3 Detalle: Checkout y Creación de Orden

**Cliente selecciona "Proceder al pago"**

Datos requeridos:
- Carrito (items con cantidad)
- Monto total
- Datos de envío: phone, address, city, postal_code, country

**Si elige TILOPAY:**

```
POST /api/payment/process
{
  cartItems: [
    { product_id: 1, quantity: 2, price: 3300 },
    { product_id: 3, quantity: 1, price: 4500 }
  ],
  amount: 11100,
  phone: "86123456",
  address: "Calle 5, San José",
  city: "San José",
  postal_code: "10101",
  country: "CR"
}
```

Backend hace:
1. **Valida autenticación** (protectRoute middleware)
2. **Valida datos** (carrito no vacío, monto > 0)
3. **Obtiene datos del usuario** (nombre, email)
4. **Crea referencia de orden**: `ORDER_123_1718654321`
5. **Se autentica con Tilopay**:
   - Usa API_USER y API_PASSWORD de env
   - Obtiene token de sesión
6. **Llama endpoint /api/v1/processPayment de Tilopay** con:
   - Monto
   - Referencia de orden
   - Datos de facturación/envío
   - URL de webhook (para confirmación)
   - URL de callback (success/error)
7. **Si Tilopay responde OK**:
   - Guarda orden en BD: orders (status="pending", tilopay_reference=...)
   - Guarda items: inserta cada item en order_items
   - Devuelve paymentUrl (redirige al usuario a Tilopay)
8. **Si hay error**: devuelve mensaje de error

```javascript
// Pseudocódigo de lo que hace
const tilopayData = await fetch("https://app.tilopay.com/api/v1/processPayment", {
  headers: { Authorization: `Bearer ${tilopayToken}` },
  body: {
    key: TILOPAY_API_KEY,
    amount: "11100.00",
    currency: "CRC",
    orderNumber: "ORDER_123_1718654321",
    redirect: "http://localhost:3000/checkout/success",
    billToFirstName: "Carlos",
    billToLastName: "Oviedo",
    // ... más datos de facturación
  }
})

// Respuesta de Tilopay:
// { url: "https://checkout.tilopay.com/link/XYZ", id: "TLP123" }

// Guardar en BD:
INSERT INTO orders (user_id, total, status, tilopay_reference, tilopay_order_number, payment_method, ...)
VALUES (5, 11100, "pending", "ORDER_123_1718654321", "TLP123", "tilopay", ...)

// Guardar items:
INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES (50, 1, 2, 3300)
INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES (50, 3, 1, 4500)
```

---

### 4.4 Confirmación de Pago

**Después que usuario completa pago en Tilopay:**

Tilopay redirige a:
```
http://localhost:3000/checkout/success?orderNumber=ORDER_123_1718654321&code=1
```

**Códigos Tilopay:**
- `code=1` → Transacción exitosa
- `code=0` → Transacción rechazada
- Otros → Errores varios

**Frontend (CheckoutSuccess.jsx):**
1. Lee query params
2. Llama hook useConfirmPayment
3. POST /api/payment/confirm

**Backend (routes/payment/payment.js):**
```
POST /api/payment/confirm
{
  orderNumber: "ORDER_123_1718654321",
  code: "1"
}
```

Backend hace:
1. Valida que code === "1" (pago exitoso)
2. Busca la orden por tilopay_reference y user_id
3. Si encuentra:
   - Actualiza status a "paid"
   - Obtiene datos de la orden e items
   - **Envía emails**:
     - Email al cliente: "Tu pedido está confirmado"
     - Email a empresa: "Nuevo pedido recibido"
   - Limpia carrito del usuario
   - Devuelve { success: true }
4. Si no encuentra: error 404

**¿Por qué confirmar después?**
- Tilopay es fuente de verdad del pago
- Si pago falla (code ≠ 1), no confirmar
- Si cliente cierra ventana antes de confirmación → orden queda pending
- Admin puede ver pending orders en dashboard y contactar al cliente

---

### 4.5 Carrito Persistente

**¿Cómo se persiste el carrito entre sesiones?**

1. **En BD:** Carrito está en tabla `carts`, siempre disponible
2. **En cliente:**
   - Context API almacena items en memoria
   - Al recargar página → fetchCart() obtiene carrito de BD
   - AuthContext mantiene user en localStorage
   - CartContext obtiene carrito automáticamente al montar

**Flujo:**
```
Usuario login → localStorage tiene token
Usuario navega a /tienda
Componente <CartProvider> monta
CartProvider.useEffect → fetchCart()
  ↓
  GET /api/cart (con token en header)
  ↓
  Backend busca carts.user_id = decoded.id
  ↓
  Devuelve items
  ↓
Context API actualiza cartItems
↓
UI renderiza carrito con items
```

**¿Qué pasa si usuario cierra navegador?**
- localStorage conserva token
- Siguiente sesión: token aún válido (24h)
- Carrito en BD está intacto
- Vuelve a fetchCart() y recupera carrito

---

## 5. INTEGRACIÓN DE MÉTODOS DE PAGO

### 5.1 Tilopay (Pasarela Costarricense)

**¿Qué es Tilopay?**
- Pasarela de pago costarricense
- Procesa tarjetas de crédito/débito
- Acepta CRC (colones costarricenses)
- API REST con SDK disponibles

**Integración:**

1. **Credenciales (en .env):**
```
TILOPAY_API_USER=xxxxx
TILOPAY_API_PASSWORD=xxxxx
TILOPAY_API_KEY=xxxxx
```

2. **Flow técnico:**
```
Cliente elige Tilopay
        ↓
Backend llama /api/v1/login con credenciales
        ↓ (obtiene token de sesión Tilopay)
        ↓
Backend llama /api/v1/processPayment con:
  - Monto en CRC
  - Referencia de orden
  - Datos de facturación
  - Webhook URL (para confirmación asíncrona)
        ↓ (Tilopay responde con checkout URL)
        ↓
Backend guarda orden en BD (status="pending")
        ↓
Frontend redirige usuario a URL de Tilopay
        ↓
Usuario ingresa datos de tarjeta en Tilopay (hosted page)
        ↓
Tilopay procesa transacción
        ↓
(Vía webhook) Backend recibe notificación de resultado
        ↓
Tilopay redirige usuario a success/error URL
        ↓
Frontend llama POST /api/payment/confirm
        ↓
Backend marca orden como "paid" y envía emails
```

**Ventajas:**
- Acepta moneda local (CRC)
- PCI compliant (datos de tarjeta en hosted page, no toca nuestro servidor)
- Soporte local

**Desventajas:**
- Solo funciona en Costa Rica
- API menos documentada que Stripe/PayPal

---

### 5.2 PayPal (Pasarela Internacional)

**¿Qué es PayPal?**
- Pasarela internacional más grande
- Acepta múltiples monedas (USD, EUR, etc.)
- Usuarios pueden pagar con saldo PayPal o tarjeta
- API REST robusta

**Integración:**

1. **Credenciales (en .env):**
```
PAYPAL_MODE=sandbox o live
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx
```

2. **Tipos de cambio:**
```
Usuario en Costa Rica quiere pagar ₡11,100
Backend obtiene tipo de cambio CRC → USD:
  - Intenta con API abierta: 1 USD = ~525 CRC
  - Si falla, fallback a 525 CRC
Convierte: 11,100 / 525 = $21.14 USD
```

3. **Flow técnico:**
```
Cliente elige PayPal
        ↓
Backend llama /v1/oauth2/token con Client ID + Secret
        ↓ (obtiene access_token de PayPal)
        ↓
Backend llama /v2/checkout/orders con:
  - Monto en USD
  - Descripción
  - Datos de envío
  - URLs de retorno
        ↓ (PayPal responde con order_id)
        ↓
Backend devuelve URLs de aprobación al frontend
        ↓
Frontend redirige a PayPal
        ↓
Usuario aprueba pago en PayPal (login si necesario)
        ↓
PayPal redirige a success URL con order_id
        ↓
Frontend llama POST /api/paypal/capture-order
        ↓
Backend captura el pago: /v2/checkout/orders/{id}/capture
        ↓
Si exitoso: marca orden como "paid", envía emails
```

**Ventajas:**
- Funciona globalmente
- Usuarios pueden pagar con saldo PayPal
- Documentación excelente
- Sandbox para testing

**Desventajas:**
- Necesita conversión de moneda
- Comisiones más altas
- Solo en USD (no CRC nativo)

---

### 5.3 Comparativa Tilopay vs PayPal

| Aspecto | Tilopay | PayPal |
|--------|---------|--------|
| Moneda nativa | CRC | USD |
| Región | Costa Rica | Global |
| Tarjeta + Saldo | Solo tarjeta | Tarjeta + Saldo |
| Comisiones | ~2.5% | ~3.49% |
| Validación de dirección | Requerida | Requerida |
| Webhook | Soporte | Soporte |
| PCI Compliance | Hosted page | Hosted page |

**Decisión del proyecto:**
- Tilopay como principal (mejor para clientes locales)
- PayPal como alternativa (clientes internacionales)

---

### 5.4 Webhooks para Confirmación

**¿Qué es un webhook?**
- Callback HTTP desde la pasarela al servidor
- Cuando sucede evento en pasarela (pago completado), notifica el servidor
- Útil para procesar pagos asincrónicamente

**Implementación en Tilopay:**
```javascript
// En POST /api/payment/process
const webhookUrl = process.env.WEBHOOK_URL || 
  `http://localhost:3000/api/payment/webhook`

const processPaymentPayload = {
  // ... otros datos
  returnData: orderReference,  // Tilopay devuelve esto
}
```

Cuando Tilopay procesa pago:
```
POST http://localhost:3000/api/payment/webhook
{
  returnData: "ORDER_123_1718654321",
  code: 1,
  message: "Transacción exitosa"
}
```

Backend verifica y marca orden como "paid".

**¿Por qué webhooks?**
- No depende de que usuario cierre ventana
- Si servidor no recibe webhook pero usuario ve "OK" → orden queda pending
- Admin contacta cliente y verifica manualmente
- Sistema es tolerante a fallos

---

## 6. PANEL DE ADMINISTRACIÓN

### 6.1 Estructura de Rutas Admin

```
/api/admin/
├── /stats                 → Estadísticas del dashboard
├── /stats/notifications   → Badges (órdenes pending, contactos sin leer)
├── /products              → CRUD de productos
│   ├── GET /              → Listar todos
│   ├── GET /:id           → Obtener uno
│   ├── POST /             → Crear
│   ├── PUT /:id           → Actualizar
│   └── DELETE /:id        → Eliminar
├── /orders                → Gestión de órdenes
│   ├── GET /              → Listar todas (con user_name, items)
│   └── PATCH /:id/status  → Cambiar status
├── /users                 → Gestión de usuarios
│   ├── GET /              → Listar
│   ├── PATCH /:id/role    → Cambiar rol
│   └── DELETE /:id        → Eliminar usuario
└── /contacts              → Gestión de contactos
    ├── GET /              → Listar contactos
    └── DELETE /:id        → Eliminar contacto
```

### 6.2 Middleware de Autenticación Admin

**Middleware: protectAdmin (middleware/adminAuth.js)**

```javascript
export const protectAdmin = async (req, res, next) => {
  // 1. Extrae token del header Authorization
  // 2. Valida token JWT
  // 3. Descodifica para obtener userId
  // 4. CONSULTA BD: SELECT role FROM users WHERE id = ?
  // 5. Si role !== 'admin' → 403 Forbidden
  // 6. Si role === 'admin' → permite acceso (next())
}
```

**¿Por qué verificar en BD?**
- No confiar solo en token (podría estar modificado)
- El rol podría haber cambiado desde que se generó el token
- Token válido por 24h, pero role puede cambiar en cualquier momento
- Verificar en BD on-demand

**Decisión: Verificación en-tiempo real vs en-token**
- **Pros de on-demand:** Seguro, cambios inmediatos
- **Cons de on-demand:** Extra query a BD en cada request admin
- **Trade-off:** En producción, podrían cachear rol en Redis con TTL

---

### 6.3 Operaciones Admin

#### **A) Gestión de Productos**

**Listar productos:**
```
GET /api/admin/products
Respuesta: [
  { id: 1, name: "Café Nacional 500g", price: 3300, stock: 50 },
  { id: 2, name: "Café Premium 500g", price: 4500, stock: 50 }
]
```

**Crear producto:**
```
POST /api/admin/products
Body: {
  name: "Nuevo Café",
  price: 5000,
  line: "Especial",
  description: "...",
  stock: 100,
  image_url: "..."
}
```

**Actualizar producto:**
```
PUT /api/admin/products/1
Body: { name: "...", price: 5500, ... }
```

**Eliminar producto:**
```
DELETE /api/admin/products/1
```

**Validaciones:**
- name, price, line son requeridos
- price debe ser número > 0
- stock no puede ser negativo

---

#### **B) Gestión de Órdenes**

**Listar órdenes:**
```
GET /api/admin/orders
Respuesta: [
  {
    id: 50,
    user_id: 5,
    user_name: "Carlos Oviedo",
    user_email: "carlos@example.com",
    total: 11100,
    status: "pending",
    payment_method: "tilopay",
    items: [
      { product_name: "Café Nacional 500g", quantity: 2, price: 3300 },
      { product_name: "Café Premium 500g", quantity: 1, price: 4500 }
    ]
  }
]
```

**Cambiar estado:**
```
PATCH /api/admin/orders/50/status
Body: { status: "paid" }

Estados válidos: pending, paid, cancelled
```

**Casos de uso:**
- order status="pending" + payment_method="tilopay" → webhook no llegó
  - Admin cambia manualmente a "paid" después de verificar pago
- order status="paid" + cliente reclama no recibió → cambiar a "cancelled"

---

#### **C) Gestión de Usuarios**

**Listar usuarios:**
```
GET /api/admin/users
Devuelve todos los usuarios con su rol
```

**Cambiar rol:**
```
PATCH /api/admin/users/5/role
Body: { role: "admin" }
```

**Eliminar usuario:**
```
DELETE /api/admin/users/5
Cascada: Elimina carts, orders, password_resets del usuario
```

---

#### **D) Gestión de Contactos**

**Listar contactos:**
```
GET /api/admin/contacts
```

**Cambiar estado:**
```
PATCH /api/admin/contacts/10/status
Body: { status: "read" o "replied" }
```

**Eliminar contacto:**
```
DELETE /api/admin/contacts/10
```

---

### 6.4 Dashboard y Estadísticas

**Endpoint: GET /api/admin/stats**

Devuelve:
```javascript
{
  stats: {
    totalUsers: 45,
    totalProducts: 15,
    totalOrders: 230,
    totalRevenue: 1234567,  // Solo órdenes "paid"
    pendingOrders: 12,
    
    recentSales: [           // Últimos 7 días
      { date: "2024-06-09", orders: 5, revenue: 25000 },
      { date: "2024-06-08", orders: 3, revenue: 15000 }
    ],
    
    latestOrders: [          // Últimas 5
      { id: 50, user_name: "Carlos", total: 11100, status: "paid", created_at: "..." }
    ]
  }
}
```

**Queries de Analytics:**
```sql
-- Total revenue (órdenes pagadas)
SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'paid'

-- Ventas por día últimos 7 días
SELECT DATE(created_at), COUNT(*), SUM(total)
FROM orders
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(created_at)

-- Producto más vendido
SELECT p.id, p.name, SUM(oi.quantity) as total_sold
FROM order_items oi
JOIN products p ON oi.product_id = p.id
GROUP BY p.id
ORDER BY total_sold DESC
LIMIT 1
```

---

### 6.5 Conexión Frontend-Backend del Admin

**Frontend:**
```javascript
// Component: AdminDashboard.jsx
useEffect(() => {
  const fetchStats = async () => {
    const response = await fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    setStats(data.stats)
  }
  fetchStats()
}, [])
```

**Backend:**
1. Extrae token
2. Verifica autenticación + admin
3. Ejecuta queries de analytics
4. Devuelve JSON

---

## 7. ENDPOINTS PRINCIPALES

### 7.1 Autenticación

| Endpoint | Método | Descripción | Autenticado |
|----------|--------|-------------|-------------|
| `/api/auth/register` | POST | Registrar usuario | ❌ |
| `/api/auth/login` | POST | Login con email/password | ❌ |
| `/api/auth/logout` | POST | Logout | ✅ |
| `/api/auth/google` | POST | Login con Google OAuth | ❌ |
| `/api/auth/forgot-password` | POST | Solicitar reset de password | ❌ |
| `/api/auth/verify-reset-code` | POST | Verificar código de reset | ❌ |
| `/api/auth/reset-password` | POST | Resetear password | ❌ |

**Ejemplos:**

```javascript
// Register
POST /api/auth/register
Body: { name: "Carlos", email: "carlos@example.com", password: "Pass1234" }
Response: { success: true, token: "eyJhbGc...", user: {...} }

// Login
POST /api/auth/login
Body: { email: "carlos@example.com", password: "Pass1234" }
Response: { success: true, token: "eyJhbGc...", user: {...} }

// Google Auth
POST /api/auth/google
Body: { credential: "<google_id_token>" }
Response: { success: true, token: "eyJhbGc...", user: {...} }
```

---

### 7.2 Carrito

| Endpoint | Método | Descripción | Autenticado |
|----------|--------|-------------|-------------|
| `/api/cart` | GET | Obtener carrito del usuario | ✅ |
| `/api/cart/add` | POST | Agregar producto | ✅ |
| `/api/cart/:id` | PATCH | Cambiar cantidad | ✅ |
| `/api/cart/:id` | DELETE | Remover producto | ✅ |
| `/api/cart/clear` | DELETE | Vaciar carrito | ✅ |

**Ejemplos:**

```javascript
// GET carrito
GET /api/cart
Headers: Authorization: Bearer <TOKEN>
Response: {
  success: true,
  items: [
    { id: 1, product_id: 1, quantity: 2, name: "Café Nacional", price: 3300 }
  ]
}

// POST agregar
POST /api/cart/add
Body: { productId: 1, cantidad: 2 }
Response: { success: true, message: "Producto agregado" }

// PATCH cantidad
PATCH /api/cart/5
Body: { cantidad: 3 }
Response: { success: true }

// DELETE remover
DELETE /api/cart/5
Response: { success: true }

// DELETE vaciar
DELETE /api/cart/clear
Response: { success: true }
```

---

### 7.3 Productos (Públicos)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/productos` | GET | Listar todos los productos |
| `/api/productos-destacados` | GET | Obtener 3 destacados |

```javascript
// Listar todos
GET /api/productos
Response: [
  { id: 1, name: "Café Nacional", price: 3300, line: "Nacional" }
]

// Destacados
GET /api/productos-destacados
Response: [ /* 3 productos */ ]
```

---

### 7.4 Órdenes

| Endpoint | Método | Descripción | Autenticado |
|----------|--------|-------------|-------------|
| `/api/orders/create-order` | POST | Crear orden | ✅ |
| `/api/orders/orders` | GET | Listar mis órdenes | ✅ |

```javascript
// Crear orden
POST /api/orders/create-order
Body: {
  products: [{ id: 1, quantity: 2, price: 3300 }],
  total: 6600,
  clientName: "Carlos",
  clientEmail: "carlos@example.com"
}
Response: { success: true, orderId: 50 }

// Listar
GET /api/orders/orders
Response: {
  success: true,
  orders: [
    {
      id: 50,
      total: 11100,
      status: "paid",
      items: [...]
    }
  ]
}
```

---

### 7.5 Pagos

| Endpoint | Método | Descripción | Autenticado |
|----------|--------|-------------|-------------|
| `/api/payment/process` | POST | Procesar pago Tilopay | ✅ |
| `/api/payment/confirm` | POST | Confirmar pago Tilopay | ✅ |
| `/api/paypal/create-order` | POST | Crear orden PayPal | ✅ |
| `/api/paypal/capture-order` | POST | Capturar pago PayPal | ✅ |

```javascript
// Tilopay
POST /api/payment/process
Body: {
  cartItems: [{...}],
  amount: 11100,
  phone: "86123456",
  address: "...",
  city: "San José",
  postal_code: "10101",
  country: "CR"
}
Response: {
  success: true,
  paymentUrl: "https://checkout.tilopay.com/...",
  orderId: 50
}

// PayPal
POST /api/paypal/create-order
Body: { /* mismos datos */ }
Response: {
  success: true,
  links: [{ rel: "approve", href: "https://sandbox.paypal.com/..." }]
}

// Confirmar
POST /api/payment/confirm
Body: { orderNumber: "ORDER_123_...", code: 1 }
Response: { success: true, emailsSent: true }
```

---

### 7.6 Contacto

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/contact` | POST | Enviar mensaje contacto |

```javascript
POST /api/contact
Body: {
  name: "Carlos",
  email: "carlos@example.com",
  subject: "Pregunta",
  message: "..."
}
Response: { success: true }
```

---

### 7.7 Admin

**Todos requieren autenticación y rol="admin"**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/admin/stats` | GET | Estadísticas dashboard |
| `/api/admin/stats/notifications` | GET | Badges |
| `/api/admin/products` | GET/POST | Listar/crear |
| `/api/admin/products/:id` | GET/PUT/DELETE | Detalle/editar/eliminar |
| `/api/admin/orders` | GET | Listar órdenes |
| `/api/admin/orders/:id/status` | PATCH | Cambiar status |
| `/api/admin/users` | GET | Listar usuarios |
| `/api/admin/users/:id/role` | PATCH | Cambiar rol |
| `/api/admin/users/:id` | DELETE | Eliminar usuario |
| `/api/admin/contacts` | GET | Listar contactos |
| `/api/admin/contacts/:id` | DELETE | Eliminar contacto |

---

## 8. DECISIONES ARQUITECTÓNICAS

### 8.1 Por qué Monorepo

✅ **Ventajas:**
- Deploy simplificado (un servidor sirve todo)
- Desarrollo más rápido al inicio
- Compartir tipos/configuración

❌ **Desventajas:**
- Difícil escalar independientemente
- Frontend y backend comparten dependencias
- Build más lento

**Si fuera a refactorizar:**
- Separar en dos repos: `sircof-frontend` y `sircof-backend`
- APIs REST clara y documentada
- CI/CD independiente para cada uno
- Deploy separado (frontend en Vercel/Netlify, backend en Heroku/Railway)

---

### 8.2 Por qué JWT + Stateless

✅ **Ventajas:**
- Escalable (no necesita sesiones en servidor)
- Mobile-friendly (no requiere cookies)
- Microservicios-ready
- Token incluye info del usuario

❌ **Desventajas:**
- Token no se puede revocar inmediatamente (TTL de 24h)
- Debe verificarse en BD cada request admin (por seguridad)

**Alternativa: Sesiones (session-based)**
- Guardaría session en BD o Redis
- Revocar inmediatamente (logout efectivo)
- Menos información en token
- Requiere session storage en servidor (menos escalable)

**Decisión correcta para fase inicial.**

---

### 8.3 Por qué Context API (no Redux)

✅ **Context API es suficiente para:**
- Estado global simple (user, cart)
- No mucha reutilización
- Proyecto mediano

❌ **Redux sería overkill:**
- Boilerplate excesivo para este caso
- Devtools no son necesarios
- Context es parte de React, Redux es dependencia externa

**Si creciera el estado:**
- Migrar a Redux/Zustand
- Mejor DevTools
- Mejor performance con grandes árboles de estado

---

### 8.4 Por qué MySQL (no NoSQL)

✅ **MySQL es mejor para:**
- Relaciones claras (users → orders → order_items)
- Integridad referencial (Foreign Keys)
- Transacciones ACID
- Reportes/Analytics fáciles (JOIN, GROUP BY)

❌ **NoSQL (MongoDB) sería mejor si:**
- Datos no estructurados
- Escalado horizontal masivo
- Flexibilidad de esquema

**Decisión correcta para e-commerce.**

---

### 8.5 Por qué Rate Limiting

```javascript
// Previene:
// - Fuerza bruta en login (20 intentos/15 min)
// - Spam de registro (20 registros/15 min)
// - Spam de contacto (5 mensajes/15 min)
// - DDoS general (1000 requests/15 min)
```

**Implementación:**
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.ip  // Por IP
})
app.post('/login', limiter, ...)
```

**Trade-off:**
- Bloquea por IP, no por usuario
- En redes compartidas (wifi corporativo), puede afectar múltiples usuarios
- Solución: Usar Redis para distribuir rate limiting entre servidores

---

### 8.6 Por qué Bcryptjs (no SHA-256)

| Método | Seguridad | Velocidad | Recomendado |
|--------|-----------|-----------|-------------|
| bcryptjs | ⭐⭐⭐⭐⭐ | Lenta | ✅ Sí |
| SHA-256 | ⭐⭐ | Rápida | ❌ No |
| PBKDF2 | ⭐⭐⭐⭐ | Lenta | ✅ Sí |
| Argon2 | ⭐⭐⭐⭐⭐ | Muy lenta | ✅ Sí (mejor) |

**Bcryptjs:**
- Adaptivo: Salt + cost factor (10 rounds)
- Cada 5 años, aumentar rounds en línea de código → hash más fuerte
- Imposible invertir (one-way)
- Estándar de industria

---

## 9. FLUJOS DE CASOS DE USO

### 9.1 Usuario Nuevo Compra por Primera Vez

```
1. Usuario llega a /signup
2. Ingresa: nombre, email, contraseña
3. Cliente valida:
   - Email formato correcto
   - Password ≥ 8 caracteres, mayúscula, número
4. POST /api/auth/register
5. Backend:
   - Verifica email no exista
   - Hashea password con bcryptjs
   - Inserta en BD
   - Genera JWT token (24h)
6. Frontend:
   - Guarda token en localStorage
   - Guarda user en Context
   - Redirige a /tienda
7. Usuario agrega productos al carrito
8. Carrito se guarda en BD (carts tabla)
9. Usuario va a /checkout
10. Elige pago y completa transacción
11. Orden se crea con status="pending"
12. Usuario ve success page
13. Backend marca orden como "paid", envía emails
14. Usuario recibe email de confirmación
```

---

### 9.2 Usuario Existente Recupera Contraseña

```
1. Usuario en /login, olvida password
2. Hace click en "¿Olvidó la contraseña?"
3. Ingresa email
4. POST /api/auth/forgot-password
5. Backend:
   - Busca usuario por email
   - Genera código de 6 dígitos
   - Calcula expires_at = NOW() + 15 minutos
   - Inserta en password_resets tabla
   - Envía email con código
6. Usuario recibe email con código
7. Ingresa código en /reset-password
8. POST /api/auth/verify-reset-code
   - Backend verifica:
     - Código existe
     - expires_at > NOW()
     - used = 0
9. Si OK, usuario puede ingresar nueva password
10. POST /api/auth/reset-password
    - Backend: hashea new password, actualiza users
    - Marca password_reset como used = 1
11. Usuario puede loguear con nueva password
```

---

### 9.3 Admin Gestiona Órdenes Pendientes

```
1. Admin login en /admin
2. Dashboard muestra: 12 órdenes pendientes
3. Admin hace click en orden
4. Ve detalles:
   - Cliente: Carlos Oviedo (carlos@example.com)
   - Teléfono: 86123456
   - Dirección: Calle 5, San José
   - Productos: Café Nacional x2, Premium x1
   - Total: ₡11,100
   - Status: pending
   - Payment method: tilopay
5. Admin verifica en Tilopay que pago fue exitoso
6. Admin hace PATCH /api/admin/orders/50/status
   Body: { status: "paid" }
7. Backend actualiza status
8. Sistema automáticamente envía email al cliente
9. Cliente recibe confirmación de envío
10. Orden aparece en historial del cliente como "paid"
```

---

### 9.4 Cliente Intenta Ataque de Fuerza Bruta

```
1. Atacante intenta 25 veces login en 5 minutos
2. Express-rate-limit cuenta requests por IP
3. Request 21 recibe:
   429 Too Many Requests
   { message: "Demasiados intentos de login, espera 15 minutos" }
4. IP está bloqueada por 15 minutos
5. Atacante no puede intentar más login
6. Después de 15 minutos, reset y puede intentar de nuevo
```

---

## 10. SEGURIDAD

### 10.1 Headers de Seguridad

**Middleware: securityHeaders.js**

```javascript
// Previene:
// X-Content-Type-Options: nosniff → evita MIME sniffing
// X-Frame-Options: DENY → evita clickjacking
// X-XSS-Protection → protección XSS
// Strict-Transport-Security → HTTPS
```

---

### 10.2 CORS Restringido

```javascript
// Solo origen del frontend autorizado
allowedOrigins = [
  'http://localhost:5173',  // Dev
  'http://localhost:3000',  // Alternativa
  process.env.CORS_ORIGIN   // Producción
]
```

Si cliente intenta desde `evil.com`:
```
CORS Error: Origin not allowed
```

---

### 10.3 Validación de Entrada

```javascript
// Register
- Email regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- Password: ≥8 chars, 1 uppercase, 1 number
- Name: required

// Checkout
- Amount must be > 0
- Cart must not be empty
- Address, city, country required
```

---

### 10.4 Variables de Entorno

```env
JWT_SECRET=secreto_muy_largo_aleatorio
TILOPAY_API_USER=xxxxx
TILOPAY_API_PASSWORD=xxxxx
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx
EMAIL_USER=empresa@gmail.com
EMAIL_PASSWORD=xxxxx
```

**Nunca en código**, siempre en `.env` (gitignored).

---

## 11. MEJORAS FUTURAS

### 11.1 Corto Plazo
- [ ] 2FA con código OTP
- [ ] Recuperación de contraseña vía SMS
- [ ] Wishlist de productos
- [ ] Reseñas de clientes
- [ ] Cupones de descuento

### 11.2 Mediano Plazo
- [ ] Separar en monorepo (frontend + backend repos)
- [ ] Caching con Redis (sesiones, rate limit)
- [ ] Búsqueda full-text de productos (Elasticsearch)
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Admin panel mejorado (gráficos avanzados)

### 11.3 Largo Plazo
- [ ] Microservicios (Pagos, Productos, Usuarios separados)
- [ ] Machine learning (recomendaciones de productos)
- [ ] Mobile app nativa (React Native)
- [ ] Integración con ERP (inventario automático)

---

## Conclusión

Este e-commerce es un proyecto **bien estructurado** que demuestra:
- ✅ Arquitectura clara con separación de concerns
- ✅ Seguridad (JWT, bcrypt, rate limiting, CORS)
- ✅ Integración con pasarelas de pago reales (Tilopay, PayPal)
- ✅ Base de datos relacional correctamente diseñada
- ✅ Admin panel funcional y útil

**Para una entrevista**, enfatizar:
- Decisiones arquitectónicas y trade-offs
- Seguridad en autenticación y pagos
- Escalabilidad (monorepo → microservicios)
- Manejo de errores y edge cases

¡Mucho éxito en tu entrevista! 🚀
