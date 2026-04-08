# 📚 DOCUMENTACIÓN COMPLETA: FLUJOS DE FUNCIONALIDADES DEL PROYECTO SIRCOF

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Proyecto:** SIRCOF E-Commerce de Café  
**Stack:** React + Vite + Express + MySQL

---

## 📋 TABLA DE CONTENIDOS

1. [Introducción](#introducción)
2. [Funcionalidad 1: LOGIN / AUTENTICACIÓN](#1️⃣-funcionalidad-1-login--autenticación)
3. [Funcionalidad 2: AGREGAR AL CARRITO](#2️⃣-funcionalidad-2-agregar-al-carrito)
4. [Funcionalidad 3: CHECKOUT Y PAGO](#3️⃣-funcionalidad-3-checkout-y-pago)
5. [Funcionalidad 4: RECUPERAR CONTRASEÑA](#4️⃣-funcionalidad-4-recuperar-contraseña)
6. [Funcionalidad 5: CAMBIAR CONTRASEÑA](#5️⃣-funcionalidad-5-cambiar-contraseña)
7. [Resumen General](#resumen-general)

---

## 🎯 INTRODUCCIÓN

Este documento detalla **exactamente cómo funciona cada funcionalidad** de tu proyecto SIRCOF, incluyendo:

- **Nombres exactos de archivos** donde encontrar el código
- **Lógica paso a paso** desde que el usuario hace una acción hasta que se guarda en BD
- **Explicaciones del "¿por qué?"** de cada decisión de diseño
- **Diagramas de flujo** visuales
- **Código real** de tu proyecto

### Arquitectura General

```
┌─────────────────────┐
│   FRONTEND (React)  │
│ - Componentes       │
│ - Hooks             │
│ - Contextos         │
│ - API Calls         │
└──────────┬──────────┘
           │ HTTP REST
           ▼
┌─────────────────────┐
│  BACKEND (Express)  │
│ - Routes            │
│ - Middleware        │
│ - Auth (JWT)        │
│ - Business Logic    │
└──────────┬──────────┘
           │ SQL
           ▼
┌─────────────────────┐
│   BD (MySQL)        │
│ - users             │
│ - products          │
│ - carts             │
│ - orders            │
│ - etc...            │
└─────────────────────┘
```

---

## 1️⃣ FUNCIONALIDAD 1: LOGIN / AUTENTICACIÓN

### 🎯 Objetivo
Un usuario se autentica con email y contraseña. El sistema valida que sea correcto, genera un token JWT, y lo guarda en localStorage para mantener la sesión.

### 📁 Archivos Involucrados

**Frontend:**
```
src/pages/auth/LoginUsers.jsx ............... Página principal con login/signup
src/components/auth/SignIn.jsx ............. Componente formulario de login
src/hooks/auth/useAuth.js .................. Hook con lógica de autenticación
src/context/AuthContext.jsx ............... Contexto global de sesión
src/config/api.js ......................... Configuración centralizada de endpoints
```

**Backend:**
```
src/routes/auth/auth.js ................... Endpoints POST /register y POST /login
src/middleware/auth.js .................... Middleware protectRoute (valida JWT)
src/lib/crypto.js ......................... Funciones bcrypt
src/lib/jwt.js ........................... Funciones para generar/validar tokens
```

**Base de Datos:**
```
users (id, email, password, name, role, createdAt)
```

---

### 🔄 FLUJO PASO A PASO

#### **PASO 1: Usuario llega a /login**

**Archivo:** `src/pages/auth/LoginUsers.jsx`

```javascript
import SignIn from "../../components/auth/SignIn.jsx";

function LoginUsers() {
  const [type, setType] = useState("signIn"); // o "signUp"
  
  return (
    <div className="App">
      <div className="form-container sign-in-container">
        <SignIn isActive={type === "signIn"} />
      </div>
    </div>
  );
}
```

**¿Qué pasa?**
- `LoginUsers.jsx` es la página principal
- Renderiza el componente `SignIn.jsx` (el formulario)
- El estado `type` controla si se muestra login o signup

---

#### **PASO 2: Usuario ingresa email y contraseña**

**Archivo:** `src/components/auth/SignIn.jsx`

```javascript
import { useAuth } from "../../hooks/auth/useAuth";
import { useNavigate } from "react-router-dom";

function SignIn({ isActive }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      navigate("/");  // Navega a home si es exitoso
    } catch (err) {
      console.log(error);
    }
  };

  if (!isActive) return null;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

**¿Qué pasa?**
- Usuario escribe email y contraseña
- Al hacer click en "Iniciar sesión", llama a `login(email, password)` del hook
- Muestra spinner mientras se procesa

---

#### **PASO 3: Hook useAuth ejecuta POST al backend**

**Archivo:** `src/hooks/auth/useAuth.js`

```javascript
import { useAuthContext } from '../../context/AuthContext'
import { API_CONFIG, buildFullUrl } from '../../config/api'

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { setUser: setAuthUser } = useAuthContext()
  
  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      // POST a http://localhost:5000/api/auth/login
      const response = await fetch(
        buildFullUrl(API_CONFIG.ENDPOINTS.LOGIN),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        }
      )
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error en el login')
      }
      
      const data = await response.json()
      // data = {
      //   token: "eyJhbGciOiJIUzI1...",
      //   user: { id: 1, name: "Juan", email: "juan@...", role: "user" }
      // }
      
      // GUARDAR TOKEN EN localStorage
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      
      // Actualizar contexto global
      setAuthUser(data.user)
      
      return data
    } catch (err) {
      const errorMsg = err.message || 'Error en el login'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  return { login, loading, error }
}
```

**¿Qué pasa?**
1. Hook obtiene el token de localStorage
2. Construye URL: `http://localhost:5000/api/auth/login`
3. Hace POST con email y contraseña
4. Si respuesta no OK → lanza error
5. Si OK → extrae token y usuario
6. **IMPORTANTE:** Guarda token en localStorage
7. Actualiza contexto AuthContext
8. Retorna datos al componente

---

#### **PASO 4: Backend recibe petición**

**Archivo:** `src/routes/auth/auth.js`

```javascript
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import pool from '../../database.js'
import { comparePassword } from '../../lib/crypto.js'
import { generateToken } from '../../lib/jwt.js'

const router = Router()

// Rate limit: máximo 5 intentos cada 15 minutos (seguridad contra fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos, espera 15 minutos'
})

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Validación 1
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña requeridos'
      })
    }
    
    // Consulta 1: Buscar usuario por email
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )
    
    // Validación 2
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      })
    }
    
    const user = users[0]
    
    // Validación 3: No es cuenta Google
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Esta cuenta fue creada con Google'
      })
    }
    
    // Validación 4: Comparar contraseña (bcrypt.compare)
    const validPassword = await comparePassword(password, user.password)
    
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      })
    }
    
    // Generar JWT (expira en 24h)
    const token = generateToken(user.id, user.email)
    
    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error en /login:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    })
  }
})

export default router
```

**¿Qué pasa?**
1. **Rate limiting:** Máx 5 intentos cada 15 min (protección contra fuerza bruta)
2. **Validación 1:** Email y contraseña existen
3. **Búsqueda en BD:** `SELECT * FROM users WHERE email = ?`
4. **Validación 2:** Usuario existe
5. **Validación 3:** No es cuenta Google
6. **Validación 4:** `comparePassword()` usa bcrypt.compare (lento a propósito)
   - Tarda ~100ms
   - Imposibilita fuerza bruta
7. **JWT:** `generateToken()` crea token de 24h
8. **Respuesta:** Token + datos del usuario

---

#### **PASO 5: Criptografía - Comparación segura**

**Archivo:** `src/lib/crypto.js`

```javascript
import bcrypt from 'bcryptjs'

export async function comparePassword(password, hash) {
  // bcrypt.compare hace:
  // 1. Hash la contraseña ingresada con el SALT del hash guardado
  // 2. Compara ambos hashes
  // 3. Devuelve true/false
  return bcrypt.compare(password, hash)
}

// Ejemplo:
// hashGuardado = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMnO2"
// comparePassword("password123", hashGuardado) = true
// comparePassword("password456", hashGuardado) = false
```

**¿Por qué bcrypt?**
- Lento a propósito (~100ms por comparación)
- Imposibilita intentar 1 millón de contraseñas por segundo
- Incluso si alguien obtiene el hash, no puede revertiarlo
- Es el estándar de seguridad industrial

---

#### **PASO 6: JWT - Generación del token**

**Archivo:** `src/lib/jwt.js`

```javascript
import jwt from 'jsonwebtoken'

export function generateToken(userId, email) {
  return jwt.sign(
    { id: userId, email },           // Payload
    process.env.JWT_SECRET,          // Clave secreta
    { expiresIn: '24h' }             // Expira en 24h
  )
}

// Token decodificado: { id: 1, email: "juan@example.com", iat: ..., exp: ... }
```

**¿Por qué JWT?**
- **Stateless:** No necesita guardar sesiones en BD
- **Seguro:** Firmado con clave secreta
- **Autocontienido:** Lleva info del usuario dentro
- **Estándar:** Usado en web moderna

---

#### **PASO 7: Frontend recibe token**

De vuelta en `src/hooks/auth/useAuth.js`:

```javascript
const data = await response.json()
// data = { token: "eyJ...", user: { id: 1, name: "Juan", ... } }

// 1. Guarda token en localStorage
localStorage.setItem('token', data.token)

// 2. Actualiza contexto global
setAuthUser(data.user)
```

---

#### **PASO 8: AuthContext almacena usuario**

**Archivo:** `src/context/AuthContext.jsx`

```javascript
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Cuando el usuario hace login
  useEffect(() => {
    if (user) {
      // Guarda en localStorage (persiste al recargar)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('lastActivityTime', Date.now().toString())
    } else {
      localStorage.removeItem('user')
      localStorage.removeItem('lastActivityTime')
    }
  }, [user])
  
  // Recupera usuario cuando la app se carga
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const lastActivityTime = localStorage.getItem('lastActivityTime')
    
    if (storedUser && lastActivityTime) {
      // Verifica si NO expiró (30 minutos inactividad)
      const timeSinceLastActivity = Date.now() - parseInt(lastActivityTime)
      const timeoutMs = 30 * 60 * 1000
      
      if (timeSinceLastActivity > timeoutMs) {
        // TIMEOUT: Limpia datos
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        setUser(null)
      } else {
        // TODO OK: Restaura usuario
        setUser(JSON.parse(storedUser))
        localStorage.setItem('lastActivityTime', Date.now().toString())
      }
    }
    setLoading(false)
  }, [])
  
  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

**¿Qué pasa?**
- AuthContext almacena el usuario globalmente
- Guarda en localStorage para persistir
- **TIMEOUT 30 min:** Si no hay actividad, desloguea automáticamente
- Al cargar app, restaura sesión si es válida

---

#### **PASO 9: Usuario redirigido a home**

```javascript
// En SignIn.jsx
const handleSubmit = async (e) => {
  try {
    await login(email, password)
    navigate("/")  // ✅ Login exitoso
  } catch (err) {
    // ❌ Error manejado en el hook
  }
}
```

**Resultado:** Usuario autenticado, token en localStorage, datos en contexto global.

---

### 🔒 Seguridad en Login (5 Capas)

```
CAPA 1: Frontend
└─ Validación básica (email, password)

CAPA 2: Rate Limiting
└─ Máx 5 intentos cada 15 minutos por IP

CAPA 3: Bcrypt
└─ Comparación lenta (0.1s) → imposible fuerza bruta

CAPA 4: JWT
└─ Token firmado + expira en 24h

CAPA 5: Session Timeout
└─ Logout automático después de 30 min inactividad
```

---

### 📊 Flujo Visual Completo del Login

```
┌─────────────────────────────────────┐
│ Usuario en SignIn.jsx               │
│ Email + Password                    │
└────────────┬────────────────────────┘
             │ handleSubmit()
             ▼
┌─────────────────────────────────────┐
│ useAuth.login(email, password)      │
│ setLoading(true)                    │
└────────────┬────────────────────────┘
             │ POST /api/auth/login
             ▼
┌─────────────────────────────────────┐
│ Backend: router.post('/login')      │
│ 1. Rate limit check                 │
│ 2. SELECT * FROM users WHERE email  │
│ 3. bcrypt.compare(password, hash)   │
│ 4. jwt.sign(token)                  │
└────────────┬────────────────────────┘
             │ { token, user }
             ▼
┌─────────────────────────────────────┐
│ Frontend: Recibe respuesta          │
│ localStorage.setItem('token', ...)  │
│ setAuthUser(data.user)              │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ AuthContext actualiza estado        │
│ localStorage.setItem('user', ...)   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ navigate("/")                       │
│ ✅ Usuario autenticado en Home      │
└─────────────────────────────────────┘
```

---

## 2️⃣ FUNCIONALIDAD 2: AGREGAR AL CARRITO

### 🎯 Objetivo
Usuario hace click en "Agregar al carrito", el producto se agrega a la BD y el carrito se actualiza en tiempo real.

### 📁 Archivos Involucrados

**Frontend:**
```
src/components/Cart/CartItems.jsx ........ Lista de items
src/pages/store/ProductDetail.jsx ....... Página de producto
src/hooks/cart/useCart.js ............... Hook del carrito
src/context/CartContext.jsx ............ Contexto del carrito
src/config/api.js ...................... URLs endpoints
```

**Backend:**
```
src/routes/cart/cart.js ................ Endpoints POST /add, GET /
src/middleware/auth.js ................. protectRoute (valida JWT)
```

**Base de Datos:**
```
carts (id, user_id, createdAt)
cart_items (id, cart_id, product_id, quantity)
products (id, name, price, stock, line)
```

---

### 🔄 FLUJO PASO A PASO

#### **PASO 1: Usuario ve detalle del producto**

**Archivo:** `src/pages/store/ProductDetail.jsx`

```javascript
import { useParams } from 'react-router-dom'
import { useProductDetail } from '../../hooks/products/useProductDetail'
import { useCart } from '../../hooks/cart/useCart'

function ProductDetail() {
  const { id } = useParams()
  const { product, loading } = useProductDetail(id)
  const { addToCart, loading: cartLoading } = useCart()
  const [quantity, setQuantity] = useState(1)
  
  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity)
      // Muestra notificación de éxito
    } catch (err) {
      console.log(err)
    }
  }
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>Precio: ₡{product.price}</p>
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value))}
      />
      <button onClick={handleAddToCart} disabled={cartLoading}>
        {cartLoading ? "Agregando..." : "Agregar al carrito"}
      </button>
    </div>
  )
}
```

**¿Qué pasa?**
- Usuario ve detalle del producto
- Puede cambiar cantidad
- Al hacer click, llama a `addToCart(product.id, quantity)`

---

#### **PASO 2: Hook CartContext ejecuta POST**

**Archivo:** `src/context/CartContext.jsx`

```javascript
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const addToCart = useCallback(async (productId, cantidad = 1) => {
    try {
      setError(null)
      
      const token = localStorage.getItem('token')
      
      // POST a /api/cart/add
      const response = await fetch(
        buildFullUrl(API_CONFIG.ENDPOINTS.CART_ADD),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`  // ← JWT en header
          },
          body: JSON.stringify({ productId, cantidad })
        }
      )
      
      if (!response.ok) {
        throw new Error('Error al agregar al carrito')
      }
      
      // IMPORTANTE: Recarga carrito desde servidor
      await fetchCart()
    } catch (err) {
      setError(err.message)
    }
  }, [fetchCart])
  
  return (
    <CartContext.Provider value={{ cartItems, addToCart, ... }}>
      {children}
    </CartContext.Provider>
  )
}
```

**¿Qué pasa?**
1. Obtiene token de localStorage
2. POST a `/api/cart/add` con productId y cantidad
3. **Incluye JWT en header:** `Authorization: Bearer {token}`
4. Recarga el carrito desde el servidor después

---

#### **PASO 3: Backend protectRoute valida JWT**

**Archivo:** `src/middleware/auth.js`

```javascript
export function protectRoute(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      })
    }
    
    // Verifica firma del token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    req.user = decoded  // { id: 1, email: "..." }
    next()
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }
}
```

**¿Qué pasa?**
1. Extrae token del header
2. Verifica que tenga firma válida
3. Si es válido → decodifica y obtiene user.id
4. Si es inválido → 401 Unauthorized

---

#### **PASO 4: Backend POST /api/cart/add**

**Archivo:** `src/routes/cart/cart.js`

```javascript
// POST /api/cart/add - Agregar producto
router.post('/add', protectRoute, async (req, res) => {
  try {
    const userId = req.user.id  // Del JWT verificado
    const { productId, cantidad } = req.body
    
    // Validación 1
    if (!productId || !cantidad) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos'
      })
    }
    
    // Consulta 1: Obtener o crear carrito del usuario
    let [carts] = await pool.query(
      'SELECT id FROM carts WHERE user_id = ?',
      [userId]
    )
    
    let cartId = carts[0]?.id
    
    if (!cartId) {
      // Crear carrito si no existe
      const [result] = await pool.query(
        'INSERT INTO carts (user_id) VALUES (?)',
        [userId]
      )
      cartId = result.insertId
    }
    
    // Consulta 2: ¿Producto ya está en carrito?
    const [existingItem] = await pool.query(
      `SELECT id, quantity FROM cart_items 
       WHERE cart_id = ? AND product_id = ?`,
      [cartId, productId]
    )
    
    if (existingItem.length > 0) {
      // YA ESTÁ: incrementar cantidad
      await pool.query(
        `UPDATE cart_items 
         SET quantity = quantity + ? 
         WHERE id = ?`,
        [cantidad, existingItem[0].id]
      )
    } else {
      // NO ESTÁ: insertar nuevo
      await pool.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity) 
         VALUES (?, ?, ?)`,
        [cartId, productId, cantidad]
      )
    }
    
    res.json({
      success: true,
      message: 'Producto agregado al carrito'
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error al agregar'
    })
  }
})
```

**¿Qué pasa?**
1. protectRoute valida JWT
2. Busca carrito del usuario
3. Si no existe → crea uno
4. Verifica si producto ya está
5. Si YA ESTÁ → incrementa cantidad
6. Si NO ESTÁ → inserta nuevo item
7. Responde OK

---

#### **PASO 5: Frontend sincroniza con fetchCart()**

De vuelta en `src/context/CartContext.jsx`:

```javascript
const fetchCart = useCallback(async () => {
  try {
    setLoading(true)
    setError(null)
    
    const token = localStorage.getItem('token')
    
    // GET /api/cart (trae todos los items)
    const response = await fetch(
      buildFullUrl(API_CONFIG.ENDPOINTS.CART_GET),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    )
    
    if (!response.ok) {
      throw new Error('Error al obtener carrito')
    }
    
    const data = await response.json()
    // data = {
    //   success: true,
    //   items: [
    //     { id: 1, product_id: 5, quantity: 3, name: "Café Premium", price: 8500 }
    //   ]
    // }
    
    setCartItems(data.items || [])
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}, [])
```

**¿Qué pasa?**
- GET a `/api/cart` con JWT
- Backend retorna todos los items
- Actualiza estado en CartContext
- Componentes que usan `useCart()` se rerenderean

---

#### **PASO 6: Backend GET /api/cart**

**Archivo:** `src/routes/cart/cart.js`

```javascript
// GET /api/cart - Obtener carrito del usuario
router.get('/', protectRoute, async (req, res) => {
  try {
    const userId = req.user.id
    
    // Consulta 1: Obtener o crear carrito
    let [carts] = await pool.query(
      'SELECT id FROM carts WHERE user_id = ?',
      [userId]
    )
    
    let cartId = carts[0]?.id
    
    if (!cartId) {
      const [result] = await pool.query(
        'INSERT INTO carts (user_id) VALUES (?)',
        [userId]
      )
      cartId = result.insertId
    }
    
    // Consulta 2: Obtener todos los items del carrito
    // JOIN con products para tener nombre, precio
    const [cartItems] = await pool.query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.line
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?
       ORDER BY ci.id DESC`,
      [cartId]
    )
    
    res.json({
      success: true,
      items: cartItems || []
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener carrito'
    })
  }
})
```

**¿Qué pasa?**
1. protectRoute obtiene user.id
2. Busca carrito del usuario
3. JOIN entre cart_items y products
4. Retorna todos los items con detalles

---

#### **PASO 7: Frontend renderiza carrito**

```javascript
function CartItems() {
  const { cartItems, loading } = useCart()
  
  if (loading) return <div>Cargando...</div>
  
  if (cartItems.length === 0) {
    return <p>Carrito vacío</p>
  }
  
  const total = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  )
  
  return (
    <div>
      <h2>Tu carrito ({cartItems.length} items)</h2>
      {cartItems.map(item => (
        <div key={item.id}>
          <p>{item.name}</p>
          <p>Cantidad: {item.quantity}</p>
          <p>Precio: ₡{item.price * item.quantity}</p>
        </div>
      ))}
      <h3>Total: ₡{total}</h3>
    </div>
  )
}
```

---

### 📊 Flujo Visual Completo

```
ProductDetail.jsx
├─ cantidad = 2
├─ click "Agregar"
│
▼ addToCart(productId, 2)
├─ get token from localStorage
├─ POST /api/cart/add
│  Body: { productId, cantidad }
│  Header: Authorization: Bearer token
│
▼ Backend protectRoute
├─ jwt.verify(token)
├─ req.user.id = 1
│
▼ Backend POST /add
├─ SELECT * FROM carts WHERE user_id=1
├─ Existe? Si → usa; No → INSERT
├─ SELECT * FROM cart_items 
│  WHERE cart_id=1 AND product_id=5
├─ Existe? Si → UPDATE quantity+=2; No → INSERT
│
▼ Response: {success: true}
│
▼ Frontend await fetchCart()
├─ GET /api/cart
│  Header: Authorization: Bearer token
│
▼ Backend GET /
├─ SELECT * FROM cart_items
│  JOIN products WHERE cart_id=1
├─ Response: {items: [...]}
│
▼ Frontend
├─ setCartItems(data.items)
├─ CartItems.jsx rerender
└─ ✅ Carrito actualizado
```

---

## 3️⃣ FUNCIONALIDAD 3: CHECKOUT Y PAGO

### 🎯 Objetivo
Usuario completa formulario de envío, elige método de pago (Tilopay o PayPal), procesa compra, BD crea orden, vacía carrito, envía email.

### 📁 Archivos Involucrados

**Frontend:**
```
src/pages/checkout/CheckoutPage.jsx ........ Página principal
src/components/checkout/CheckoutShippingForm.jsx . Formulario
src/components/checkout/PaymentMethodSelector.jsx  Selector
src/hooks/payment/usePayment.js ........... Hook Tilopay
src/hooks/payment/usePayPalPayment.js ..... Hook PayPal
```

**Backend:**
```
src/routes/payment/payment.js ............ POST /process (Tilopay)
src/routes/payment/paypal.js ............ PayPal endpoints
src/routes/orders/orders.js ............ Crear orden
src/services/emailService.js .......... Enviar emails
```

**Base de Datos:**
```
orders (id, user_id, total, status, paymentMethod, shippingAddress)
order_items (id, order_id, product_id, quantity, price)
```

---

### 🔄 FLUJO PASO A PASO

#### **PASO 1: Usuario navega a /checkout**

**Archivo:** `src/pages/checkout/CheckoutPage.jsx`

```javascript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/cart/useCart'
import { usePayment } from '../../hooks/payment/usePayment'
import { useAuthContext } from '../../context/AuthContext'

function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { cartItems, refetchCart } = useCart()
  const { processPayment, loading: paymentLoading } = usePayment()
  
  const [shippingData, setShippingData] = useState({
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Costa Rica'
  })
  
  const [paymentMethod, setPaymentMethod] = useState('tilopay')
  
  // IMPORTANTE: Si no hay usuario, redirige a /login
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnTo: '/checkout' } })
    }
  }, [user, navigate])
  
  // Obtiene carrito
  useEffect(() => {
    if (user) {
      refetchCart()
    }
  }, [user])
  
  const total = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  )
  
  if (cartItems.length === 0) {
    return (
      <div>
        <p>Carrito vacío</p>
        <button onClick={() => navigate('/tienda')}>Volver a tienda</button>
      </div>
    )
  }
  
  return (
    <div>
      <h1>Checkout</h1>
      <OrderSummary cartItems={cartItems} total={total} />
      <CheckoutShippingForm data={shippingData} setData={setShippingData} />
      <PaymentMethodSelector selectedMethod={paymentMethod} onSelect={setPaymentMethod} />
      <button onClick={handleConfirmPayment}>
        Confirmar pago — ₡{total.toLocaleString('es-CR')}
      </button>
    </div>
  )
}
```

**¿Qué pasa?**
1. Valida que usuario sea autenticado
2. Si NO → redirige a /login
3. Obtiene items del carrito
4. Si carrito vacío → muestra mensaje

---

#### **PASO 2: Usuario completa formulario y elige pago**

```javascript
// Formulario se completa:
shippingData = {
  phone: "87654321",
  address: "Calle 5, San José",
  city: "San José",
  postalCode: "10101",
  country: "Costa Rica"
}

paymentMethod = "tilopay"  // o "paypal"
```

---

#### **PASO 3: Usuario hace click en "Confirmar pago"**

```javascript
const handleConfirmPayment = async () => {
  // Validaciones
  if (!shippingData.address.trim()) {
    setFormError('Dirección requerida')
    return
  }
  
  if (paymentMethod === 'tilopay') {
    try {
      const result = await processPayment({
        cartItems,
        amount: total,
        phone: shippingData.phone,
        address: shippingData.address,
        city: shippingData.city,
        postal_code: shippingData.postalCode,
        country: shippingData.country
      })
      
      // Si Tilopay devuelve URL, redirige
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      }
    } catch (error) {
      setFormError(error.message)
    }
  }
}
```

**¿Qué pasa?**
1. Valida campos requeridos
2. Llama a `processPayment()` del hook
3. Hook hace POST a `/api/payment/process`
4. Backend retorna URL de Tilopay
5. `window.location.href = paymentUrl` redirige al usuario

---

#### **PASO 4: Backend recibe petición de pago**

**Archivo:** `src/routes/payment/payment.js`

```javascript
import { Router } from "express"
import pool from "../../database.js"
import { protectRoute } from "../../middleware/auth.js"
import fetch from "node-fetch"
import { sendOrderEmails } from "../../services/emailService.js"

const router = Router()

// Función auxiliar: login en Tilopay
const loginTilopay = async () => {
  try {
    const response = await fetch("https://app.tilopay.com/api/v1/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiuser: process.env.TILOPAY_API_USER,
        password: process.env.TILOPAY_API_PASSWORD,
      }),
    })
    
    const data = await response.json()
    return data.token
  } catch (error) {
    throw error
  }
}

// POST /api/payment/process
router.post("/process", protectRoute, async (req, res) => {
  try {
    const userId = req.user.id
    const { cartItems, amount, phone, address, city, postal_code, country } = req.body
    
    // Validación 1
    if (!cartItems || !amount || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Carrito vacío"
      })
    }
    
    // Consulta 1: Obtener usuario
    const [users] = await pool.query(
      "SELECT email, name FROM users WHERE id = ?",
      [userId]
    )
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      })
    }
    
    const user = users[0]
    const orderReference = `ORDER_${userId}_${Date.now()}`
    
    // PASO 1: Obtener token de Tilopay
    const tilopayToken = await loginTilopay()
    
    // PASO 2: Construir payload de pago
    const processPaymentPayload = {
      key: process.env.TILOPAY_API_KEY,
      amount: amount.toFixed(2),
      currency: "CRC",
      orderNumber: orderReference,
      redirect: `${process.env.PUBLIC_URL}/checkout/success`,
      
      // Datos de facturación
      billToFirstName: user.name.split(" ")[0],
      billToLastName: user.name.split(" ").slice(1).join(" "),
      billToAddress: address,
      billToCity: city,
      billToZipPostCode: postal_code,
      billToCountry: "CR",
      billToTelephone: phone,
      billToEmail: user.email,
      
      capture: 1,
      cardnotpresent: 1,
    }
    
    // PASO 3: Enviar a Tilopay
    const tilopayResponse = await fetch(
      "https://app.tilopay.com/api/v1/payment/process",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tilopayToken}`
        },
        body: JSON.stringify(processPaymentPayload),
      }
    )
    
    if (!tilopayResponse.ok) {
      throw new Error("Error en Tilopay")
    }
    
    const tilopayData = await tilopayResponse.json()
    const paymentUrl = tilopayData.charge?.urlCheckout
    
    if (!paymentUrl) {
      return res.status(400).json({
        success: false,
        message: "No se pudo generar enlace de pago"
      })
    }
    
    // PASO 4: Guardar orden en BD (status = pending)
    const [orderResult] = await pool.query(
      `INSERT INTO orders 
       (user_id, total, status, paymentMethod, shippingAddress, paymentReference)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, amount, "pending", "tilopay", address, orderReference]
    )
    
    const orderId = orderResult.insertId
    
    // PASO 5: Guardar items de la orden
    for (const item of cartItems) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      )
    }
    
    // Respuesta: URL para que el frontend redirija
    res.json({
      success: true,
      paymentUrl,
      orderId
    })
  } catch (error) {
    console.error('Error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    })
  }
})
```

**¿Qué pasa?**
1. protectRoute valida JWT
2. Validación de datos
3. loginTilopay() obtiene token de sesión
4. Construye payload con datos de pago
5. POST a `tilopay.com/api/v1/payment/process`
6. INSERT en orders (status = "pending")
7. INSERT en order_items
8. Responde con paymentUrl

---

#### **PASO 5: Usuario redirigido a Tilopay**

```javascript
window.location.href = result.paymentUrl
// → Usuario en https://tilopay.com/checkout/...
// → Ingresa datos de tarjeta
// → Tilopay procesa pago
```

**Resultado:**
- Si pago exitoso → Tilopay redirige a `/checkout/success`
- Si falla → Tilopay redirige a `/checkout/failure`

---

#### **PASO 6: Webhook de Tilopay confirma pago**

```javascript
// POST /api/payment/webhook (sin protectRoute porque Tilopay lo llama)
router.post("/webhook", async (req, res) => {
  try {
    const { charge } = req.body
    
    // Buscar orden por referencia
    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE paymentReference = ?`,
      [charge.orderNumber]
    )
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }
    
    const order = orders[0]
    
    if (charge.status === "completed") {
      // PAGO EXITOSO
      
      // 1. Actualizar orden
      await pool.query(
        `UPDATE orders SET status = ? WHERE id = ?`,
        ["completed", order.id]
      )
      
      // 2. Vaciar carrito del usuario
      const [carts] = await pool.query(
        `SELECT id FROM carts WHERE user_id = ?`,
        [order.user_id]
      )
      
      if (carts.length > 0) {
        await pool.query(
          `DELETE FROM cart_items WHERE cart_id = ?`,
          [carts[0].id]
        )
      }
      
      // 3. Obtener usuario
      const [users] = await pool.query(
        `SELECT email, name FROM users WHERE id = ?`,
        [order.user_id]
      )
      
      // 4. Obtener items de la orden
      const [orderItems] = await pool.query(
        `SELECT oi.*, p.name 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      )
      
      // 5. Enviar emails
      if (users.length > 0) {
        await sendOrderEmails({
          orderId: order.id,
          clientEmail: users[0].email,
          clientName: users[0].name,
          items: orderItems,
          total: order.total
        })
      }
      
      return res.json({
        success: true,
        message: "Payment confirmed"
      })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      success: false,
      message: 'Webhook error'
    })
  }
})
```

**¿Qué pasa?**
1. Tilopay llama webhook `/api/payment/webhook`
2. Backend busca orden por referencia
3. Si pago completado:
   - UPDATE orders SET status = "completed"
   - DELETE cart_items (vacía carrito)
   - sendOrderEmails() envía notificaciones

---

#### **PASO 7: Email de confirmación**

**Archivo:** `src/services/emailService.js`

```javascript
import nodemailer from 'nodemailer';
import { clientEmailTemplate, companyEmailTemplate } from '../templates/emailTemplates.js';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendClientEmail = async (email, orderData) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Confirmación de Pedido #${orderData.orderId}`,
      html: clientEmailTemplate(orderData),
    });
    console.log(`✓ Email enviado a cliente: ${email}`);
    return true;
  } catch (error) {
    console.error('✗ Error al enviar email:', error.message);
    return false;
  }
};

export const sendCompanyEmail = async (orderData) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
      to: process.env.COMPANY_EMAIL,
      subject: `Nuevo Pedido #${orderData.orderId}`,
      html: companyEmailTemplate(orderData),
    });
    return true;
  } catch (error) {
    console.error('✗ Error:', error.message);
    return false;
  }
};

export const sendOrderEmails = async (orderData) => {
  const clientResult = await sendClientEmail(orderData.clientEmail, orderData);
  const companyResult = await sendCompanyEmail(orderData);
  
  return {
    success: clientResult && companyResult,
    clientEmailSent: clientResult,
    companyEmailSent: companyResult,
  };
};
```

**¿Qué pasa?**
- Nodemailer envía email HTML al cliente
- También envía a la empresa
- Usa templates en `src/templates/emailTemplates.js`

---

### 📊 Flujo Visual Completo Checkout

```
Checkout Page
├─ cartItems loaded
├─ Formulario de envío completado
├─ Método de pago seleccionado
│
▼ handleConfirmPayment()
├─ Validaciones
├─ processPayment(cartItems, amount, ...)
│  └─ POST /api/payment/process
│
▼ Backend:
├─ protectRoute valida token
├─ loginTilopay() obtiene token API
├─ Construye payload de pago
├─ POST a tilopay.com/api/v1/payment/process
├─ INSERT INTO orders (status="pending")
├─ INSERT INTO order_items
│  └─ Response: {paymentUrl}
│
▼ Frontend:
├─ window.location.href = paymentUrl
│  └─ Usuario redirigido a Tilopay
│
▼ Usuario en Tilopay:
├─ Ingresa datos de tarjeta
├─ Tilopay procesa pago
│
├─ Si exitoso:
│  └─ Tilopay redirige a /checkout/success
│
▼ Webhook POST /api/payment/webhook:
├─ Busca orden en BD
├─ UPDATE orders SET status="completed"
├─ DELETE FROM cart_items (vacía carrito)
├─ sendOrderEmails(orderData)
│  ├─ Email al cliente: "Confirmación"
│  └─ Email a empresa: "Nueva orden"
│
▼ Frontend Success Page:
├─ Muestra "¡Orden confirmada! #123"
├─ Link a /user-settings
└─ Link a /tienda
```

---

## 4️⃣ FUNCIONALIDAD 4: RECUPERAR CONTRASEÑA

### 🎯 Objetivo
Usuario olvida contraseña. Sistema envía código por email. Usuario verifica código y establece nueva contraseña en 3 pasos.

### 📁 Archivos Involucrados

**Frontend:**
```
src/pages/auth/ForgotPassword.jsx ........ Página con 4 pasos
src/hooks/auth/useForgotPassword.js ..... Hook con lógica
src/config/api.js ....................... URLs endpoints
```

**Backend:**
```
src/routes/auth/passwordReset.js ........ Endpoints (forgot, verify, reset)
src/services/passwordResetEmail.js ...... Template del email
src/lib/crypto.js ....................... hashPassword
```

**Base de Datos:**
```
users (id, email, password, name)
password_resets (id, user_id, code, expires_at, used)
```

---

### 🔄 FLUJO PASO A PASO

#### **PASO 1: Página /forgot-password - Paso 1 (email)**

```javascript
// src/pages/auth/ForgotPassword.jsx
import { useForgotPassword } from '../../hooks/auth/useForgotPassword'

function ForgotPassword() {
  const {
    step, email, setEmail, code, setCode,
    loading, error, success,
    sendResetCode, verifyCode, resetPassword
  } = useForgotPassword()
  
  return (
    <div>
      {/* Indicador progresivo 1→2→3→4 */}
      <div className="steps">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={step >= s ? 'active' : ''}>
            {step > s ? '✓' : s}
          </div>
        ))}
      </div>
      
      {/* PASO 1: Email */}
      {step === 1 && (
        <form onSubmit={sendResetCode}>
          <h1>Recuperar contraseña</h1>
          <input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar código"}
          </button>
        </form>
      )}
      
      {/* PASO 2: Código */}
      {step === 2 && (
        <form onSubmit={verifyCode}>
          <h1>Verificar código</h1>
          <p>Hemos enviado un código a {email}</p>
          <input
            type="text"
            placeholder="Código (6 dígitos)"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
          />
          <button type="submit" disabled={loading}>Verificar</button>
        </form>
      )}
      
      {/* PASO 3: Nueva contraseña */}
      {step === 3 && (
        <form onSubmit={resetPassword}>
          <h1>Nueva contraseña</h1>
          <input type="password" placeholder="Nueva contraseña" required />
          <input type="password" placeholder="Confirmar" required />
          <button type="submit" disabled={loading}>Cambiar contraseña</button>
        </form>
      )}
      
      {/* PASO 4: Éxito */}
      {step === 4 && (
        <div className="success">
          <h1>✓ Contraseña cambiada</h1>
          <button onClick={() => navigate('/login')}>Ir a login</button>
        </div>
      )}
      
      {error && <p className="error">{error}</p>}
      {success && step !== 4 && <p className="success">{success}</p>}
    </div>
  )
}
```

**¿Qué pasa?**
- Renderiza 4 pasos distintos
- El estado `step` controla qué se muestra
- Cada paso llama a funciones diferentes

---

#### **PASO 2: Hook envia email**

```javascript
// src/hooks/auth/useForgotPassword.js

const sendResetCode = async (e) => {
  e.preventDefault()
  setError("")
  setSuccess("")
  setLoading(true)
  
  try {
    // POST /api/auth/forgot-password
    const response = await fetch(
      buildFullUrl(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || "Error al enviar código")
    }
    
    setSuccess(data.message)
    setStep(2)  // Avanza a paso 2
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

**¿Qué pasa?**
1. POST a `/api/auth/forgot-password`
2. Backend procesa
3. Si OK → setStep(2), muestra éxito
4. Si error → muestra error

---

#### **PASO 3: Backend genera código y envía email**

```javascript
// src/routes/auth/passwordReset.js

const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requerido'
      })
    }
    
    // Consulta 1: Buscar usuario
    const [users] = await pool.query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email]
    )
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No existe cuenta con ese correo'
      })
    }
    
    const user = users[0]
    const resetCode = generateResetCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    
    // Invalidar códigos anteriores
    await pool.query(
      'UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0',
      [user.id]
    )
    
    // Insertar nuevo código (expira en 15 min)
    await pool.query(
      'INSERT INTO password_resets (user_id, code, expires_at) VALUES (?, ?, ?)',
      [user.id, resetCode, expiresAt]
    )
    
    // Enviar email
    const emailSent = await sendResetCodeEmail(user.email, user.name, resetCode)
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Error al enviar email'
      })
    }
    
    res.json({
      success: true,
      message: 'Código enviado al correo'
    })
  } catch (error) {
    console.error('Error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error en servidor'
    })
  }
})
```

**¿Qué pasa?**
1. Busca usuario por email
2. Valida que exista
3. Genera código aleatorio de 6 dígitos
4. Invalidar códigos anteriores (seguridad)
5. Inserta nuevo código con expiración 15 min
6. sendResetCodeEmail() envía email con código

---

#### **PASO 4: Email enviado**

```javascript
// src/services/passwordResetEmail.js

export async function sendResetCodeEmail(email, name, resetCode) {
  const html = `
    <!DOCTYPE html>
    <html>
      <body>
        <h2>Hola ${name},</h2>
        <p>Tu código de recuperación es:</p>
        <div style="background: #6f4e37; color: white; padding: 20px; font-size: 32px; text-align: center;">
          ${resetCode}
        </div>
        <p>Este código expira en 15 minutos.</p>
        <p style="color: #cf3e3e; font-size: 12px;">Si no solicitaste esto, ignora este email.</p>
      </body>
    </html>
  `
  
  const info = await transporter.sendMail({
    from: 'no-reply@sircof.com',
    to: email,
    subject: 'Código de recuperación - Sircof',
    html
  })
  
  return true
}
```

---

#### **PASO 5: Usuario verifica código**

```javascript
const verifyCode = async (e) => {
  e.preventDefault()
  setError("")
  setSuccess("")
  setLoading(true)
  
  try {
    // POST /api/auth/verify-reset-code
    const response = await fetch(
      buildFullUrl(API_CONFIG.ENDPOINTS.VERIFY_RESET_CODE),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || "Código inválido")
    }
    
    setSuccess(data.message)
    setStep(3)  // Avanza a paso 3
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

---

#### **PASO 6: Backend verifica código**

```javascript
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body
    
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email y código son requeridos'
      })
    }
    
    // Consulta 1: Buscar código válido
    const [results] = await pool.query(
      `SELECT pr.id, pr.user_id
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE u.email = ? 
         AND pr.code = ? 
         AND pr.used = 0
         AND pr.expires_at > NOW()
       LIMIT 1`,
      [email, code]
    )
    
    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o expirado'
      })
    }
    
    // Marcar como usado
    await pool.query(
      'UPDATE password_resets SET used = 1 WHERE id = ?',
      [results[0].id]
    )
    
    res.json({
      success: true,
      message: 'Código verificado'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error'
    })
  }
})
```

**¿Qué pasa?**
1. Backend busca código en tabla
2. Valida que:
   - Exista
   - Sea del email correcto
   - No haya sido usado
   - No haya expirado
3. Si válido → marca como usado
4. Responde OK

---

#### **PASO 7: Usuario ingresa nueva contraseña**

```javascript
const resetPassword = async (e) => {
  e.preventDefault()
  setError("")
  setSuccess("")
  
  if (newPassword !== confirmPassword) {
    setError("Las contraseñas no coinciden")
    return
  }
  
  if (newPassword.length < 6) {
    setError("Mínimo 6 caracteres")
    return
  }
  
  setLoading(true)
  
  try {
    // POST /api/auth/reset-password
    const response = await fetch(
      buildFullUrl(API_CONFIG.ENDPOINTS.RESET_PASSWORD),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword })
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || "Error al cambiar")
    }
    
    setSuccess(data.message)
    setStep(4)  // Paso final
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

---

#### **PASO 8: Backend actualiza contraseña**

```javascript
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      })
    }
    
    // Validar código nuevamente
    const [results] = await pool.query(
      `SELECT pr.user_id
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE u.email = ? 
         AND pr.code = ? 
         AND pr.used = 1
         AND pr.expires_at > NOW()
       LIMIT 1`,
      [email, code]
    )
    
    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido'
      })
    }
    
    const userId = results[0].user_id
    
    // Hash nueva contraseña
    const hashedPassword = await hashPassword(newPassword)
    
    // UPDATE en BD
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    )
    
    // Invalidar todos TODOS los códigos del usuario (seguridad)
    await pool.query(
      'UPDATE password_resets SET used = 1 WHERE user_id = ?',
      [userId]
    )
    
    res.json({
      success: true,
      message: 'Contraseña actualizada. Puedes iniciar sesión.'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error'
    })
  }
})
```

**¿Qué pasa?**
1. Valida código nuevamente
2. Hash la nueva contraseña con bcrypt
3. UPDATE en tabla users
4. Invalida TODOS los códigos del usuario (seguridad)
5. Responde OK

---

## 5️⃣ FUNCIONALIDAD 5: CAMBIAR CONTRASEÑA (Usuario autenticado)

### 🎯 Objetivo
Usuario autenticado puede cambiar su contraseña actual por una nueva en `/user-settings`.

### 📁 Archivos Involucrados

```
Frontend:
├─ src/pages/user/UserSettings.jsx
├─ src/hooks/user/useUserProfile.js ... updatePassword()
└─ src/config/api.js

Backend:
├─ src/routes/user/userSettings.js ... POST /password
├─ src/middleware/auth.js ........... protectRoute (requiere JWT)
└─ src/lib/crypto.js .............. comparePassword, hashPassword
```

---

### 🔄 FLUJO PASO A PASO

#### **PASO 1: Usuario en /user-settings**

**Archivo:** `src/pages/user/UserSettings.jsx`

```javascript
import { useState } from 'react'
import { useUserProfile } from '../../hooks/user/useUserProfile'
import { useAuthContext } from '../../context/AuthContext'

function UserSettings() {
  const { user } = useAuthContext()
  const { updatePassword, loading } = useUserProfile()
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Validaciones
    if (!currentPassword) {
      setError('Contraseña actual requerida')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (newPassword.length < 6) {
      setError('Mínimo 6 caracteres')
      return
    }
    
    try {
      await updatePassword({
        currentPassword,
        newPassword
      })
      
      setSuccess('Contraseña cambiada exitosamente')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message)
    }
  }
  
  return (
    <div>
      <h1>Configuración</h1>
      <p>Email: {user?.email}</p>
      
      <form onSubmit={handleChangePassword}>
        <h2>Cambiar contraseña</h2>
        
        <input
          type="password"
          placeholder="Contraseña actual"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? "Procesando..." : "Cambiar contraseña"}
        </button>
        
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
    </div>
  )
}
```

---

#### **PASO 2: Hook ejecuta petición**

```javascript
// src/hooks/user/useUserProfile.js

export const useUserProfile = () => {
  const [loading, setLoading] = useState(false)
  
  const updatePassword = async (data) => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('token')
      
      // POST /api/user/settings/password
      const response = await fetch(
        buildFullUrl(API_CONFIG.ENDPOINTS.USER_SETTINGS_PASSWORD),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword
          })
        }
      )
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Error al cambiar')
      }
      
      return result
    } finally {
      setLoading(false)
    }
  }
  
  return { updatePassword, loading }
}
```

---

#### **PASO 3: Backend valida y actualiza**

```javascript
// src/routes/user/userSettings.js

router.post('/password', protectRoute, async (req, res) => {
  try {
    const userId = req.user.id
    const { currentPassword, newPassword } = req.body
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseñas requeridas'
      })
    }
    
    // Consulta 1: Obtener usuario actual
    const [users] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    )
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }
    
    const user = users[0]
    
    // Validación 1: Verificar contraseña actual
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    )
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      })
    }
    
    // Validación 2: Nueva diferente a la actual
    const isSamePassword = await comparePassword(
      newPassword,
      user.password
    )
    
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'Debe ser diferente a la actual'
      })
    }
    
    // Hash nueva contraseña
    const hashedPassword = await hashPassword(newPassword)
    
    // UPDATE
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    )
    
    res.json({
      success: true,
      message: 'Contraseña actualizada'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error'
    })
  }
})
```

**¿Qué pasa?**
1. protectRoute valida JWT
2. Verifica que contraseña actual sea correcta
3. Valida que nueva sea diferente
4. Hash la nueva contraseña
5. UPDATE en BD
6. Responde OK

---

## 📊 RESUMEN GENERAL

### Flujos Documentados

| # | Funcionalidad | Frontend | Backend | BD |
|---|---|---|---|---|
| 1 | **Login** | SignIn.jsx → useAuth() | auth.js | users |
| 2 | **Carrito** | CartItems.jsx → useCart() | cart.js | carts, cart_items |
| 3 | **Checkout/Pago** | CheckoutPage.jsx → usePayment() | payment.js | orders, order_items |
| 4 | **Recuperar Contraseña** | ForgotPassword.jsx → useForgotPassword() | passwordReset.js | password_resets |
| 5 | **Cambiar Contraseña** | UserSettings.jsx → useUserProfile() | userSettings.js | users |

### Patrones de Seguridad

```
Todos los flujos implementan:
✓ JWT Bearer Token en headers
✓ protectRoute middleware en backend
✓ Validaciones en frontend Y backend
✓ Rate limiting donde corresponde
✓ Bcrypt para contraseñas
✓ Timeouts de sesión
✓ Códigos con expiración
✓ Transacciones en BD
```

### Stack Tecnológico

```
FRONTEND:
- React 19 + Vite 7
- React Router v7
- Tailwind CSS
- Framer Motion
- Axios / Fetch API

BACKEND:
- Node.js + Express
- MySQL2 con Pool
- JWT (jsonwebtoken)
- Bcryptjs
- Nodemailer
- Rate Limiting

DEPLOYMENT:
- Variaciones con Vercel
- Backend a producción
- Email con SMTP
```

---

**Fin del documento**

Última actualización: Abril 2026
