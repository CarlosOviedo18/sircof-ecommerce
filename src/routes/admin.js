import { Router } from 'express'
import statsRoutes from './admin/adminStats.js'
import productsRoutes from './admin/adminProducts.js'
import coffeesRoutes from './admin/adminCoffees.js'
import ordersRoutes from './admin/adminOrders.js'
import usersRoutes from './admin/adminUsers.js'
import contactsRoutes from './admin/adminContacts.js'

const router = Router()

// Montar cada módulo en su prefijo correspondiente
router.use('/stats', statsRoutes)
router.use('/products', productsRoutes)
router.use('/coffees', coffeesRoutes)
router.use('/orders', ordersRoutes)
router.use('/users', usersRoutes)
router.use('/contacts', contactsRoutes)

export default router
