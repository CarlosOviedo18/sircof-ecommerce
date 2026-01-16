# Flujo de Autenticación - SIRCOF E-commerce

## 📋 Índice
1. [Flujo Sign Up (Registro)](#flujo-sign-up)
2. [Flujo Sign In (Login)](#flujo-sign-in)
3. [Bcrypt - Encriptación de Contraseñas](#bcrypt)
4. [JWT - Tokens de Autenticación](#jwt)
5. [Estructura de Archivos](#estructura)
6. [Diagrama Completo](#diagrama)

---

## 🔐 Flujo Sign Up (Registro)

### Paso 1: Usuario completa el formulario
```javascript
// SignUp.jsx
{
  name: "Juan López",
  email: "juan@mail.com",
  password: "MiContraseña123"
}
```

### Paso 2: Frontend valida y envía datos
```javascript
// useAuth.js - función register()
const response = await fetch(`${API_URL}/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, password })
})
```

### Paso 3: Backend valida
```javascript
// auth.js - POST /api/auth/register

1. Valida que tenga name, email, password
   ✓ Si falta algo → Devuelve error 400

2. Valida formato de email con regex
   ✓ Si no es válido → Devuelve error 400

3. Verifica si el email ya existe en BD
   ✓ Si existe → Devuelve error 400 "Email ya registrado"
```

### Paso 4: Encriptar contraseña con BCRYPT
```javascript
// auth.js - línea 49
const hashedPassword = await hashPassword(password)

// crypto.js
export const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10)
  return await bcryptjs.hash(password, salt)
}

// Resultado:
// "MiContraseña123" → "$2b$10$N9qo8uLO..." (irreversible)
```

### Paso 5: Guardar en base de datos
```javascript
// auth.js - línea 53
const [result] = await pool.query(
  'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
  [name, email, hashedPassword]  // ← Guarda ENCRIPTADA
)
```

### Paso 6: Backend devuelve respuesta exitosa
```javascript
res.status(201).json({
  success: true,
  message: 'Usuario registrado exitosamente',
  user: {
    id: 1,
    name: "Juan López",
    email: "juan@mail.com"
  }
})
```

### Paso 7: Frontend recibe datos
```javascript
// useAuth.js
const data = await response.json()
setAuthUser(data.user)  // Guarda usuario en contexto

// AuthContext.jsx guarda automáticamente en localStorage
localStorage.setItem('user', JSON.stringify(data.user))
```

---

## 🔑 Flujo Sign In (Login)

### Paso 1: Usuario ingresa credenciales
```javascript
// SignIn.jsx
{
  email: "juan@mail.com",
  password: "MiContraseña123"
}
```

### Paso 2: Frontend envía datos
```javascript
// useAuth.js - función login()
const response = await fetch(`${API_URL}/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

### Paso 3: Backend busca usuario
```javascript
// auth.js - línea 73
const [users] = await pool.query(
  'SELECT * FROM users WHERE email = ?',
  [email]
)

if (users.length === 0) {
  return res.status(401).json({
    message: 'Email o contraseña incorrectos'
  })
}
```

### Paso 4: Comparar contraseña con BCRYPT
```javascript
// auth.js - línea 87
const validPassword = await comparePassword(password, user.password)

// crypto.js
export const comparePassword = async (password, hashedPassword) => {
  return await bcryptjs.compare(password, hashedPassword)
}

// Resultado:
// comparePassword("MiContraseña123", "$2b$10$N9qo...") → true o false
```

### Paso 5: Generar JWT Token
```javascript
// auth.js - línea 95
const token = generateToken(user.id, user.email)

// jwt.js
export const generateToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

// Resultado:
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1..."
```

### Paso 6: Backend devuelve token + usuario
```javascript
res.json({
  success: true,
  message: 'Login exitoso',
  token: "eyJhbGc...",  // ← TOKEN JWT
  user: {
    id: 1,
    name: "Juan López",
    email: "juan@mail.com"
  }
})
```

### Paso 7: Frontend guarda token y usuario
```javascript
// useAuth.js - línea 67
const data = await response.json()
localStorage.setItem('token', data.token)  // ← Guarda TOKEN
setAuthUser(data.user)  // Guarda usuario en contexto

// AuthContext.jsx también guarda usuario en localStorage
localStorage.setItem('user', JSON.stringify(data.user))
```

### Resultado en localStorage:
```javascript
localStorage.getItem('token')
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

localStorage.getItem('user')
// {"id":1,"name":"Juan López","email":"juan@mail.com"}
```

---

## 🔒 BCRYPT - Encriptación de Contraseñas

### ¿Qué es Bcrypt?
Algoritmo de encriptación **ONE-WAY** que:
- Convierte contraseña en hash irreversible
- Añade "salt" (número aleatorio) para mayor seguridad
- Tarda tiempo deliberadamente (ralentiza ataques de fuerza bruta)

### Archivo: `src/lib/crypto.js`

```javascript
import bcryptjs from 'bcryptjs'

// ENCRIPTAR
export const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10)  // Genera salt
  return await bcryptjs.hash(password, salt)  // Encripta
}

// COMPARAR
export const comparePassword = async (password, hashedPassword) => {
  return await bcryptjs.compare(password, hashedPassword)
}
```

### Ejemplo:
```
Input:  "MiContraseña123"
Encriptado: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKekmgAt33AvCn0H.0i2"
Hash diferente cada vez: "$2b$10$NixWPr7rqvVmZnrPm3Z5AuYHUUq/ye4g8KLW12Ofbi3lz5DvBO/KK"

Comparar:
bcryptjs.compare("MiContraseña123", "$2b$10$N9qo8...") → true
bcryptjs.compare("OtraContraseña", "$2b$10$N9qo8...") → false
```

### Importancia:
✅ Contraseña nunca se guarda en texto plano  
✅ Imposible recuperar contraseña original  
✅ Cada hash es único (mismo input = hashes diferentes)  
✅ Imposible falsificar el hash sin la contraseña  

---

## 🎫 JWT - JSON Web Tokens

### ¿Qué es JWT?
Estándar de autenticación **sin servidor** que:
- Contiene datos del usuario firmados criptográficamente
- No requiere sesiones en servidor
- Expira automáticamente
- Se envía en cada petición protegida

### Estructura JWT:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwi.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
│                                       │                │
└── Header                              └── Payload       └── Signature
```

**Header:**
```json
{
  "alg": "HS256",    // Algoritmo
  "typ": "JWT"       // Tipo
}
```

**Payload:**
```json
{
  "id": 1,
  "email": "juan@mail.com",
  "iat": 1705425600,   // Issued at
  "exp": 1705512000    // Expiration (24h después)
}
```

**Signature:**
```
HMACSHA256(header + payload, JWT_SECRET)
```

### Archivo: `src/lib/jwt.js`

```javascript
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro'

// GENERAR TOKEN
export const generateToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },     // Datos
    JWT_SECRET,                // Llave secreta
    { expiresIn: '24h' }       // Expira en 24 horas
  )
}

// VERIFICAR TOKEN
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET)
}
```

### Ejemplo:
```javascript
// GENERAR
const token = generateToken(1, "juan@mail.com")
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// VERIFICAR
const decoded = verifyToken(token)
// { id: 1, email: "juan@mail.com", iat: ..., exp: ... }

// VERIFICAR EXPIRADO
verifyToken(token)  // Si pasó 24h → Error: Token expirado
```

### Importancia:
✅ No necesita base de datos para verificar  
✅ Cliente puede verificar token localmente  
✅ Escalable (no consume memoria del servidor)  
✅ Expira automáticamente  
✅ Imposible falsificar sin JWT_SECRET  

---

## 📁 Estructura de Archivos

```
src/
├── routes/
│   └── auth.js                 # Rutas de autenticación
│       ├── POST /api/auth/register
│       ├── POST /api/auth/login
│       └── POST /api/auth/logout
│
├── lib/
│   ├── crypto.js               # Funciones de encriptación
│   │   ├── hashPassword()
│   │   └── comparePassword()
│   └── jwt.js                  # Funciones de JWT
│       ├── generateToken()
│       └── verifyToken()
│
├── hooks/
│   └── useAuth.js              # Hook de autenticación
│       ├── register()
│       ├── login()
│       └── logout()
│
├── context/
│   └── AuthContext.jsx         # Contexto de autenticación
│       ├── user
│       ├── setUser
│       └── loading
│
└── components/auth/
    ├── SignUp.jsx              # Formulario de registro
    └── SignIn.jsx              # Formulario de login
```

---

## 🔄 Diagrama Completo de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                      SIGN UP (REGISTRO)                      │
└─────────────────────────────────────────────────────────────┘

CLIENTE                          SERVIDOR
  │                                │
  │ 1. User completa formulario    │
  │    {name, email, password}     │
  │                                │
  ├─ 2. POST /api/auth/register ──→│
  │                                │ 3. Valida datos
  │                                │ 4. Valida email
  │                                │ 5. Verifica si existe
  │                                │ 6. Encripta con BCRYPT
  │                                │    "pass123"
  │                                │    ↓
  │                                │    "$2b$10$N9qo8..."
  │                                │ 7. Guarda en BD
  │                                │
  │← 8. { user } ────────────────── │
  │                                │
  │ 9. Guarda en localStorage
  │ 10. AuthContext → localStorage


┌─────────────────────────────────────────────────────────────┐
│                     SIGN IN (LOGIN)                          │
└─────────────────────────────────────────────────────────────┘

CLIENTE                          SERVIDOR
  │                                │
  │ 1. User ingresa credenciales   │
  │    {email, password}           │
  │                                │
  ├─ 2. POST /api/auth/login ─────→│
  │                                │ 3. Busca usuario por email
  │                                │ 4. Compara contraseña
  │                                │    "pass123"
  │                                │    ↓
  │                                │    comparePassword()
  │                                │    ↓
  │                                │    "$2b$10$N9qo8..." ✓
  │                                │ 5. Genera JWT
  │                                │    { id, email }
  │                                │    ↓ (Firma con JWT_SECRET)
  │                                │    "eyJhbGciOiJI..."
  │                                │
  │← 6. { token, user } ──────────→│
  │                                │
  │ 7. localStorage.setItem('token', data.token)
  │ 8. localStorage.setItem('user', data.user)
  │ 9. AuthContext actualiza


┌─────────────────────────────────────────────────────────────┐
│                  PETICIONES PROTEGIDAS                       │
└─────────────────────────────────────────────────────────────┘

CLIENTE                          SERVIDOR
  │                                │
  │ 1. GET /api/productos          │
  │    Header: Authorization       │
  │    Bearer eyJhbGciOiJI...      │
  │                                │
  ├─ 2. Extrae token ─────────────→│
  │    del header                  │
  │                                │ 3. verifyToken(token)
  │                                │    Decodifica
  │                                │    Valida firma
  │                                │    Verifica expiración
  │                                │    ✓ Válido
  │                                │
  │← 4. Datos protegidos ─────────→│
  │                                │
```

---

## 🔧 Uso Práctico

### Registrar usuario
```javascript
const { register } = useAuth()
await register("Juan", "juan@mail.com", "Pass123")
// 1. Encripta contraseña con BCRYPT
// 2. Guarda en BD
// 3. Retorna usuario
```

### Login
```javascript
const { login } = useAuth()
await login("juan@mail.com", "Pass123")
// 1. Busca usuario
// 2. Compara contraseña con BCRYPT
// 3. Genera JWT token
// 4. Guarda token + usuario en localStorage
```

### Usar token en peticiones
```javascript
const token = localStorage.getItem('token')
const response = await fetch('/api/productos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Logout
```javascript
const { logout } = useAuth()
await logout()
// 1. Borra token de localStorage
// 2. Borra usuario del contexto
```

---

## 📚 Resumen Clave

| Concepto | Función | Ubicación |
|----------|---------|-----------|
| **Bcrypt** | Encriptar contraseña | `src/lib/crypto.js` |
| **JWT** | Generar token autenticación | `src/lib/jwt.js` |
| **AuthContext** | Mantener usuario en app | `src/context/AuthContext.jsx` |
| **useAuth** | Hook para login/register/logout | `src/hooks/useAuth.js` |
| **LocalStorage** | Guardar token + usuario | Navegador cliente |
| **JWT_SECRET** | Llave para firmar tokens | Variables de entorno |

---

## ⚠️ Seguridad

✅ **Lo que sí hacemos:**
- Contraseña encriptada con Bcrypt
- Token JWT firmado
- Token expira en 24h
- Token en localStorage (acceso desde JS)

⚠️ **Mejoras futuras:**
- Usar HttpOnly cookies en lugar de localStorage
- Refresh tokens para renovar sesión
- Rate limiting en login
- Validación en frontend + backend
- HTTPS en producción
- JWT_SECRET en variables de entorno

---

## 📖 Referencias

- [Bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
- [JWT Introduction](https://jwt.io/introduction)
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)
