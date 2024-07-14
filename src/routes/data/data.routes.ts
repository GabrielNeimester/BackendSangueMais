import { Router } from 'express'
import authMiddleware from '../../middlewares/auth.middlewares'
import DataController from '../../controllers/data/data.controller'

const dataRoutes = Router()

dataRoutes.post('/', authMiddleware, DataController.store)
dataRoutes.get('/showByHemocentro/:hemocentroId', DataController.index)
dataRoutes.get('/showByUser', authMiddleware, DataController.indexByUser)
dataRoutes.delete('/:id', authMiddleware, DataController.delete)
dataRoutes.get('/byId/:id', authMiddleware, DataController.show)

export default dataRoutes