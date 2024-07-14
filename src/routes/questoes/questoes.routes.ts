import { Router } from 'express'
import authMiddleware from '../../middlewares/auth.middlewares'
import QuestoesController from '../../controllers/questoes/questoes.controller'


const questoesRoutes = Router()

questoesRoutes.get('/hemocentro/:hemocentroId', QuestoesController.index)
questoesRoutes.get('/showByUser', authMiddleware, QuestoesController.indexByUser)
questoesRoutes.post('/', authMiddleware, QuestoesController.store)
questoesRoutes.put('/:id', authMiddleware, QuestoesController.update)
questoesRoutes.get('/:id', QuestoesController.show)
questoesRoutes.delete('/:id', authMiddleware, QuestoesController.delete)

export default questoesRoutes