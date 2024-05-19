import { Router } from 'express'
import authMiddleware from '../../../middlewares/auth.middlewares'
import HemocentroController from '../../../controllers/hemocentro/hemocentro.controller'

const bloodcenterRoutes = Router()


bloodcenterRoutes.get('/', HemocentroController.index)
bloodcenterRoutes.get('/:id', HemocentroController.show)
bloodcenterRoutes.post('/', authMiddleware, HemocentroController.store)
bloodcenterRoutes.put('/:id', authMiddleware,HemocentroController.update)
bloodcenterRoutes.get('/showByUser', authMiddleware, HemocentroController.showByUser)


export default bloodcenterRoutes