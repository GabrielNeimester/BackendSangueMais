import { Router } from 'express'
import authMiddleware from '../../../middlewares/auth.middlewares'
import HemocentroController from '../../../controllers/hemocentro/hemocentro.controller'

const bloodcenterRoutes = Router()


bloodcenterRoutes.get('/', HemocentroController.index)
bloodcenterRoutes.get('/hemocentroShow/:id', HemocentroController.show)
bloodcenterRoutes.post('/', authMiddleware, HemocentroController.store)
bloodcenterRoutes.put('/:id', authMiddleware,HemocentroController.update)
bloodcenterRoutes.get('/userShow', authMiddleware, HemocentroController.userShow)


export default bloodcenterRoutes