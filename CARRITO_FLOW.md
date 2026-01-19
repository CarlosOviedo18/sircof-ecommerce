# Flujo del Carrito de Compra - SIRCOF E-commerce

## 📋 Descripción General

El carrito de compra es un sistema que permite a los usuarios logueados agregar, modificar y remover productos. Los datos se guardan en la base de datos asociados al usuario.

---

## 🗄️ Estructura de Tablas

### **1. Tabla `users`**
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
**Relación:** Un usuario tiene un carrito.

---

### **2. Tabla `carts`**
```sql
CREATE TABLE carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
```
**Relación:** 
- Un usuario tiene un carrito (1:1)
- Un carrito tiene muchos items (1:N)

---

### **3. Tabla `products`**
```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255),
  line VARCHAR(50),
  stock INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
**Relación:** Un producto puede estar en muchos carritos diferentes.

---

### **4. Tabla `cart_items`**
```sql
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id)
    REFERENCES carts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE
);
```
**Relación:**
- Un carrito tiene muchos items (1:N)
- Un producto puede estar en muchos items (1:N)

---

## 🔗 Diagrama de Relaciones

```
users (1) ──→ (1) carts (1) ──→ (N) cart_items (N) ←─ (1) products
```

**Ejemplo:**
```
Usuario: Juan López (id=1)
  └─ Carrito (id=1)
      ├─ Cart Item (id=1): Producto Premium (id=1), Cantidad: 2
      ├─ Cart Item (id=2): Producto Nacional (id=2), Cantidad: 1
      └─ Cart Item (id=3): Producto Premium (id=3), Cantidad: 3
```

---

## 📱 Flujo Frontend

### **1. Ver Producto en Tienda**
- Usuario ve lista de productos en `/tienda`
- Al clickear un producto → Va a `/producto/:id` (ProductDetail.jsx)

### **2. Agregar Producto al Carrito**

**Archivo:** `src/pages/ProductDetail.jsx`

```javascript
1. Usuario selecciona cantidad (1, 2, 3...)
2. Presiona botón "Agregar al carrito"
3. handleAddToCart() se ejecuta:
   - Llama a addToCart(productId, cantidad)
   - Muestra mensaje de éxito
   - Recarga el carrito (refetchCart)
```

### **3. Abrir el CartDrawer**

**Archivo:** `src/components/Cart/CartDrawer.jsx`

```javascript
1. Usuario presiona icono del carrito (header)
2. CartDrawer se abre (panel deslizable)
3. useEffect detecta que isOpen=true
4. Ejecuta refetchCart() para obtener items actualizados
5. Muestra los items en CartItem.jsx
```

### **4. Modificar Items en el Carrito**

**Archivo:** `src/components/Cart/CartItem.jsx`

```javascript
Usuario puede:
- Presionar + para aumentar cantidad
- Presionar - para disminuir cantidad
- Presionar "Remover" para eliminar el producto

Cada acción llama a:
- updateQuantity(cartItemId, newQuantity)
- removeFromCart(cartItemId)
```

---

## 🔌 API Backend

**Base URL:** `http://localhost:3000/api/cart`

### **GET /api/cart**
Obtiene todos los items del carrito del usuario logueado.

**Headers:**
```javascript
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "quantity": 2,
      "name": "Café Premium",
      "price": 5000,
      "line": "Premium"
    }
  ]
}
```

---

### **POST /api/cart/add**
Agrega un producto al carrito del usuario.

**Headers:**
```javascript
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "productId": 1,
  "cantidad": 2
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Producto agregado al carrito"
}
```

**Lógica:**
- Si el producto ya existe en el carrito → Suma la cantidad
- Si no existe → Crea un nuevo item

---

### **DELETE /api/cart/:cartItemId**
Elimina un producto del carrito.

**Headers:**
```javascript
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Producto removido del carrito"
}
```

---

### **PATCH /api/cart/:cartItemId**
Actualiza la cantidad de un producto en el carrito.

**Headers:**
```javascript
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "cantidad": 5
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Cantidad actualizada"
}
```

---

## 🎯 Flujo Completo

```
1. PRODUCTO AGREGADO
   Usuario en ProductDetail.jsx
   ↓
   Selecciona cantidad (ej: 2)
   ↓
   Presiona "Agregar al carrito"
   ↓
   handleAddToCart() ejecuta:
   └─ POST /api/cart/add
   └─ Backend: Inserta en cart_items o actualiza cantidad
   └─ refetchCart() recarga datos
   ↓
   Mensaje verde: "✓ Producto agregado al carrito"

2. CARRITO ABIERTO
   Usuario presiona icono carrito
   ↓
   CartDrawer abre (panel deslizable)
   ↓
   useEffect dispara:
   └─ GET /api/cart
   └─ Obtiene items del carrito
   └─ cartItems se actualiza
   ↓
   CartDrawer renderiza CartItem para cada producto

3. MODIFICAR ITEM
   Usuario en CartDrawer presiona + o -
   ↓
   onQuantityChange(cartItemId, newQuantity)
   ↓
   PATCH /api/cart/:cartItemId
   └─ Backend actualiza quantity
   └─ refetchCart() recarga
   ↓
   CartDrawer muestra nueva cantidad

4. REMOVER ITEM
   Usuario presiona "Remover"
   ↓
   onRemove(cartItemId)
   ↓
   DELETE /api/cart/:cartItemId
   └─ Backend borra de cart_items
   └─ refetchCart() recarga
   ↓
   Producto desaparece del CarDrawer
```

---

## 📂 Archivos Principales

| Archivo | Descripción |
|---------|-------------|
| `src/hooks/useCart.js` | Hook que maneja toda la lógica del carrito |
| `src/routes/cart.js` | Rutas Express del backend |
| `src/components/Cart/CartDrawer.jsx` | Panel del carrito (deslizable) |
| `src/components/Cart/CartItem.jsx` | Cada producto en el carrito |
| `src/pages/ProductDetail.jsx` | Página de detalle con botón agregar |
| `src/components/Navigation.jsx` | Header con icono del carrito |
| `src/components/SecondNavigation.jsx` | Header de la tienda con icono del carrito |

---

## 🔐 Autenticación

Todas las rutas del carrito requieren:
- **Token JWT** en el header `Authorization: Bearer {token}`
- Usuario debe estar **logueado**
- Cada usuario solo puede acceder a su carrito

---

## 💾 Almacenamiento

Los datos del carrito se guardan en:
- **Base de datos (MySQL):** Tablas `carts` y `cart_items`
- **Token JWT:** localStorage (para autenticación)

**No se usa localStorage para guardar items del carrito** - Se obtienen desde la BD cada vez que se abre el drawer.

---

## ✅ Checklist de Funcionalidad

- [x] Agregar producto al carrito
- [x] Obtener items del carrito
- [x] Cambiar cantidad de producto
- [x] Remover producto del carrito
- [x] Calcular total del carrito
- [x] Actualizar carrito sin recargar página
- [x] Proteger rutas con autenticación
- [x] Relaciones correctas en BD

---

## 🐛 Problemas Comunes

### **"NaN" en el total**
- Verificar que los items tienen `price` y `quantity`
- En CartDrawer: `item.quantity` (no `item.cantidad`)

### **Carrito no se actualiza**
- Verificar que CartDrawer tiene `useEffect` con `refetchCart()`
- ProductDetail debe llamar `refetchCart()` después de `addToCart()`

### **No se guardan los items**
- Verificar que el usuario está logueado
- Verificar que el token está en localStorage
- Verificar que las rutas están registradas en el servidor

### **Error 404 en las rutas**
- Verificar que `cart.js` está importado en `src/index.js`
- Verificar que se agregó `app.use('/api/cart', cartRoutes)`

---

## 🚀 Próximas Mejoras

- Implementar checkout y pago
- Agregar tabla de órdenes completadas
- Sistema de cupones/descuentos
- Carrito persistente en localStorage (opcional)
- Notificaciones en tiempo real

