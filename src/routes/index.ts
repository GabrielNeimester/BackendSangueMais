import { Router } from 'express'
import authRoutes from './auth/auth.routes'
import hemocentroRoutes from './auth/hemocentro/hemocentro.routes'


const routes = Router()

routes.use('/auth', authRoutes)
routes.use('/hemocentro', hemocentroRoutes)


export default routes