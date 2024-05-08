import { Router } from 'express'
import authRoutes from './auth/auth.routes'
import hemocentroRoutes from './auth/hemocentro/hemocentro.routes'
import userRoutes from './user/user.routes'


const routes = Router()

routes.use('/auth', authRoutes)
routes.use('/hemocentro', hemocentroRoutes)
routes.use('/user', userRoutes)


export default routes