import { Router } from 'express'
import authRoutes from './auth/auth.routes'
import hemocentroRoutes from './hemocentro/hemocentro.routes'
import userRoutes from './user/user.routes'
import questoesRoutes from './questoes/questoes.routes'
import opcoesRoutes from './opcoes/opcoes.routes'
import dataRoutes from './data/data.routes'
import horaRoutes from './hora/hora.routes'
import agendamentoRoutes from './agendamento/agendamento.routes'


const routes = Router()

routes.use('/auth', authRoutes)
routes.use('/hemocentro', hemocentroRoutes)
routes.use('/user', userRoutes)
routes.use('/questoes', questoesRoutes)
routes.use('/opcoes', opcoesRoutes)
routes.use('/data', dataRoutes)
routes.use('/hora', horaRoutes)
routes.use('/agendamento', agendamentoRoutes)


export default routes