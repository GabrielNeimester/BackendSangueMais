import { Router } from 'express'
import authMiddleware from '../../middlewares/auth.middlewares'
import UserController from '../../controllers/user/user.controller'


const userRoutes = Router()


userRoutes.get('/getByHemocentro/:hemocentroId', authMiddleware, UserController.index)



export default userRoutes