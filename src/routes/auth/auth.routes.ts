import { Router } from 'express'
import AuthController from '../../controllers/auth.controller'
import authMiddleware from '../../middlewares/auth.middlewares'


const authRoutes = Router()

authRoutes.post('/register', authMiddleware, AuthController.store)
authRoutes.post('/login', AuthController.login)
authRoutes.post('/refresh', AuthController.refresh)
authRoutes.post('/logout', AuthController.logout)

export default authRoutes