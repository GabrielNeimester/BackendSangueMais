import { Router } from 'express'
import authRoutes from './auth/auth.routes'
import hemocentroRoutes from './hemocentro/hemocentro.routes'
import userRoutes from './user/user.routes'
import questoesRoutes from './questoes/questoes.routes'
import opcoesRoutes from './opcoes/opcoes.routes'
import dataRoutes from './data/data.routes'


const routes = Router()

routes.use('/auth', authRoutes)
routes.use('/hemocentro', hemocentroRoutes)
routes.use('/user', userRoutes)
routes.use('/questoes', questoesRoutes)
routes.use('/opcoes', opcoesRoutes)
routes.use('/data', dataRoutes)


export default routes