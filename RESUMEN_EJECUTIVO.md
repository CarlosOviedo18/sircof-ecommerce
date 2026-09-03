# Resumen Ejecutivo - SIRCOF E-Commerce

## Contexto Rápido (2-3 minutos)

Este es un **e-commerce fullstack de una cafetería costarricense** que desarrollé solo. Stack: **React + Node.js/Express + MySQL**.

### Stack Principal
- **Frontend:** React 19 + Vite + Context API + TailwindCSS
- **Backend:** Express.js + Node.js
- **BD:** MySQL con relaciones 1-a-muchos
- **Autenticación:** JWT + bcryptjs
- **Pagos:** Tilopay (pasarela local) + PayPal (internacional)
- **Email:** Nodemailer para notificaciones

---

## 1️⃣ Arquitectura (1 minuto)

**Monorepo estructura:**
```
Backend (Express) en src/index.js
  ├─ Rutas: src/routes/ (auth, cart, payment, admin, etc.)
  ├─ Middleware: autenticación, rate limiting, seguridad
  └─ Servicios: email, pagos

Frontend (React) en src/
  ├─ Contextos: AuthContext, CartContext
  ├─ Hooks personalizados: useAuth, useCart, usePayment
  └─ Componentes: tienda, checkout, admin panel
```

**Flujo petición:** Cliente → Fetch + JWT → Express → BD MySQL → JSON response → React Context actualiza UI

---

## 2️⃣ Autenticación (1 minuto)

**Dos métodos:**

**A) Email + Contraseña:**
1. Usuario registra con password (validación: ≥8 chars, mayúscula, número)
2. Backend hashea con bcryptjs (10 rounds)
3. Genera JWT token (24h)
4. Token se envía en `Authorization: Bearer <TOKEN>` en cada request

**B) Google OAuth:**
1. Frontend obtiene token de Google
2. Backend valida con OAuth2Client
3. Crea o vincula cuenta automáticamente
4. Genera su propio JWT token

**Middleware protectRoute:**
- Extrae token del header
- Valida firma con JWT_SECRET
- Descodifica userId
- Si admin: verifica rol en BD on-demand

---

## 3️⃣ Modelo de Datos (1 minuto)

**7 tablas principales:**

```
users (id, name, email, password, google_id, role)
  ├─ carts (1:*)
  │   └─ cart_items (1:*) → products
  ├─ orders (1:*)
  │   └─ order_items (1:*) → products
  ├─ contacts (1:*)
  └─ password_resets (1:*)

products (id, name, price, line, stock)
```

**Decisiones:**
- Guardar `price` en `order_items` (snapshot histórico)
- Foreign Keys con CASCADE (limpieza automática)
- Índices en email, status, created_at (queries rápidas)

---

## 4️⃣ Flujo de Compra (1.5 minutos)

```
1. Usuario agrega producto al carrito
   → POST /api/cart/add
   → Se crea carrito si no existe
   → Se suma cantidad si ya está

2. Carrito se almacena en BD (tabla carts + cart_items)
   → Context API en frontend

3. Usuario va a checkout
   → Ingresa datos de envío
   → Elige método de pago

4. Si Tilopay:
   → POST /api/payment/process
   → Backend crea orden (status="pending")
   → Autentica con Tilopay API
   → Tilopay devuelve checkout URL
   → Usuario paga en pasarela de Tilopay
   → Tilopay redirige a success

5. Frontend llama POST /api/payment/confirm
   → Backend marca orden "paid"
   → Envía emails (cliente + empresa)
   → Limpia carrito del usuario

6. Usuario ve "Pago confirmado" y recibe email
```

**Seguridad:** Orden siempre en status="pending" hasta confirmación oficial (webhook o success URL)

---

## 5️⃣ Integración de Pagos (1 minuto)

**Tilopay:**
- Pasarela costarricense
- Acepta CRC (moneda local)
- PCI compliant (hosted page)
- API REST con autenticación

**PayPal:**
- Pasarela internacional
- Convierte CRC → USD automáticamente
- Soporte en PayPal Sandbox para testing
- Captura de pago asincrónica

**Decisión:** Tilopay como principal (clientes locales), PayPal como alternativa

---

## 6️⃣ Panel Admin (1 minuto)

**Acceso:** Solo usuarios con `role='admin'` verificado en BD

**Operaciones:**
- **Productos:** CRUD (crear, listar, editar, eliminar)
- **Órdenes:** Ver detalles, cambiar status (pending → paid → cancelled)
- **Usuarios:** Listar, cambiar rol, eliminar
- **Contactos:** Ver mensajes, marcar como leído
- **Estadísticas:** Dashboard con métricas (usuarios, órdenes, revenue)

**Rate limiting:** Protegido también por rate limiter general (1000 req/15 min)

---

## 7️⃣ Endpoints Clave (2 minutos)

### Auth (sin auth):
- `POST /api/auth/register` → crear cuenta
- `POST /api/auth/login` → login
- `POST /api/auth/google` → OAuth
- `POST /api/auth/forgot-password` → reset

### Carrito (con JWT):
- `GET /api/cart` → obtener
- `POST /api/cart/add` → agregar producto
- `DELETE /api/cart/:id` → remover
- `DELETE /api/cart/clear` → vaciar

### Pagos (con JWT):
- `POST /api/payment/process` → Tilopay
- `POST /api/paypal/create-order` → PayPal
- `POST /api/payment/confirm` → confirmar pago

### Admin (con JWT + admin):
- `GET /api/admin/stats` → estadísticas
- `GET/POST/PUT/DELETE /api/admin/products` → CRUD productos
- `GET /api/admin/orders` → listar órdenes
- `PATCH /api/admin/orders/:id/status` → cambiar status

### Públicos:
- `GET /api/productos` → listar todos
- `GET /api/productos-destacados` → 3 destacados

---

## Decisiones Técnicas Clave

| Decisión | ¿Por qué? |
|----------|---------|
| **Monorepo** | Más rápido al inicio, deploy simplificado |
| **JWT Stateless** | Escalable, no necesita sesiones en servidor |
| **Context API** | Suficiente para estado simple, sin Redux overhead |
| **MySQL** | Relaciones claras, integridad referencial, reportes fáciles |
| **bcryptjs** | Estándar de industria, adaptivo, imposible de invertir |
| **Rate Limiting** | Previene brute force y spam |
| **Tilopay + PayPal** | Local + Internacional |

---

## Seguridad Implementada

✅ JWT con expiración 24h
✅ Contraseñas hasheadas con bcryptjs
✅ CORS restringido al frontend
✅ Rate limiting en auth (20 intentos/15 min)
✅ Validación de entrada (email, password strength)
✅ Headers de seguridad (X-Content-Type-Options, X-Frame-Options)
✅ Middleware de autenticación en rutas protegidas
✅ Verificación de admin role on-demand (en BD)
✅ Variables de entorno para credenciales

---

## Caso de Uso: Flujo Completo (5 minutos)

### Usuario Nuevo Compra

```
1. Visita sircof.com
2. Click "Registrarse"
3. Ingresa: nombre, email, password
4. Backend: valida, hashea password, crea usuario
5. Frontend: guarda JWT en localStorage
6. Redirige a /tienda
7. Usuario agrega "Café Premium 500g" x2
   → POST /api/cart/add
   → Carrito se crea en BD
8. Usuario agrega "Café Nacional 500g" x1
   → POST /api/cart/add (cantidad se suma)
9. Usuario ve carrito: 3 items, total ₡11,100
10. Click "Proceder al pago"
11. Ingresa datos de envío:
    - Teléfono: 86123456
    - Dirección: Calle 5, San José
    - Ciudad: San José
12. Elige "Pagar con Tilopay"
13. POST /api/payment/process
    → Backend crea orden #50 (status="pending")
    → Autentica con Tilopay
    → Tilopay devuelve URL de checkout
14. Usuario redirigido a pasarela de Tilopay
15. Ingresa datos de tarjeta (en servidor de Tilopay, no nuestro)
16. Tilopay procesa transacción exitosamente
17. Redirige a /checkout/success?orderNumber=ORDER_123&code=1
18. Frontend ejecuta POST /api/payment/confirm
    → Backend marca orden #50 como "paid"
    → Backend envía emails (cliente + empresa)
    → Backend limpia carrito del usuario
19. Usuario ve "¡Pago confirmado!" con número de orden
20. Usuario recibe email: "Gracias por tu compra #50"
21. Empresa recibe email: "Nuevo pedido #50 - Carlos Oviedo"

### Admin Después

```
1. Admin login en /admin
2. Dashboard muestra: 5 órdenes pendientes
3. Click en orden #50
4. Ve: Carlos Oviedo, Café x3, ₡11,100, status="paid"
5. Si hubiera sido pending:
   - Admin verifica en Tilopay que pago fue exitoso
   - PATCH /api/admin/orders/50/status → { status: "paid" }
   - Sistema envía emails
```

---

## Mejoras Futuras

**Inmediatas:**
- Wishlist de productos
- Cupones de descuento
- Reseñas de clientes

**Mediano plazo:**
- Separar monorepo en dos repos
- Caching con Redis
- Búsqueda full-text con Elasticsearch
- WebSockets para notificaciones

**Largo plazo:**
- Microservicios
- Machine learning (recomendaciones)
- App móvil nativa
- Integración ERP

---

## Preguntas Que Puedo Defender

✅ ¿Por qué JWT y no sesiones?
✅ ¿Cómo escalarías esto?
✅ ¿Qué sucede si Tilopay falla?
✅ ¿Cómo prevenis SQL injection?
✅ ¿Qué pasa si usuario cierra navegador durante pago?
✅ ¿Cómo verificas que solo admin puede acceder?
✅ ¿Qué es el rate limiting?
✅ ¿Por qué guardar `price` en `order_items`?
✅ ¿Cómo recupera el usuario su contraseña?
✅ ¿Qué sucede si el email no se envía?

---

## Resumen para Decir (30 segundos)

> "Desarrollé un e-commerce para una cafetería con React y Node.js. El sistema permite a usuarios registrarse, autenticarse con email o Google, agregar productos al carrito, y hacer checkout con dos métodos de pago: Tilopay (pasarela local costarricense) y PayPal. El backend está en Express con autenticación JWT, bcryptjs para contraseñas, y MySQL para la BD. Tiene un panel admin donde se gestiona productos, órdenes, usuarios y se ven estadísticas. Implementé seguridad con rate limiting, validación de entrada, CORS restringido y headers de seguridad."

---

## Resumen Técnico (1 minuto)

> "**Frontend:** React + Context API + TailwindCSS
> **Backend:** Express.js + JWT + bcryptjs
> **BD:** MySQL con relaciones 1-a-muchos
> **Autenticación:** Email/Password + Google OAuth
> **Pagos:** Tilopay (CRC) + PayPal (USD)
> **Admin:** CRUD de productos, órdenes, usuarios
> **Seguridad:** Rate limiting, CORS, validación, headers"
