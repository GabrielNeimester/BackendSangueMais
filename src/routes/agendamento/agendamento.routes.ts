import { Router } from 'express'
import authMiddleware from '../../middlewares/auth.middlewares'
import AgendamentoController from '../../controllers/agendamento/agendamento.controller'

const agendamentoRoutes = Router()

agendamentoRoutes.post('/', AgendamentoController.store)
agendamentoRoutes.get('/', authMiddleware, AgendamentoController.index)
agendamentoRoutes.get('/:id', authMiddleware, AgendamentoController.show)
agendamentoRoutes.put('/cancel/:id', authMiddleware, AgendamentoController.cancel)
agendamentoRoutes.put('/finish/:id', authMiddleware, AgendamentoController.finish)

export default agendamentoRoutes