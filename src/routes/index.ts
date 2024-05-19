import { Router } from 'express'
import authRoutes from './auth/auth.routes'
import hemocentroRoutes from './auth/hemocentro/hemocentro.routes'
import userRoutes from './user/user.routes'
import questoesRoutes from './questoes/questoes.routes'
import opcoesRoutes from './opcoes/opcoes.routes'


const routes = Router()

routes.use('/auth', authRoutes)
routes.use('/hemocentro', hemocentroRoutes)
routes.use('/user', userRoutes)
routes.use('/questoes', questoesRoutes)
routes.use('/opcoes', opcoesRoutes)


export default routes