import { Router } from 'express'
import authMiddleware from '../../middlewares/auth.middlewares'
import HoraController from '../../controllers/hora/hora.controller'

const horaRoutes = Router()

horaRoutes.post('/', authMiddleware, HoraController.store)
horaRoutes.get('/:dataId', authMiddleware, HoraController.index)
horaRoutes.delete('/:id', authMiddleware, HoraController.delete)
horaRoutes.get('/byId/:id', authMiddleware, HoraController.show)

export default horaRoutes