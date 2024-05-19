import { Router } from 'express'
import authMiddleware from '../../middlewares/auth.middlewares'
import OpcoesController from '../../controllers/opcoes/opcoes.controller'

const opcoesRoutes = Router()

opcoesRoutes.get('/:questaoId', OpcoesController.index)
opcoesRoutes.post('/', authMiddleware, OpcoesController.store)
opcoesRoutes.put('/:id', authMiddleware, OpcoesController.update)
opcoesRoutes.delete('/:id', authMiddleware, OpcoesController.delete)

export default opcoesRoutes