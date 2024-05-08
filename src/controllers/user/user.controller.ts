import { Request, Response } from 'express'
import User from '../../models/user.model'


export default class UserController {

    static async index(req: Request, res: Response) {
        const { hemocentroId } = req.params
        const { userId } = req.headers

        if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

        const user = await User.find()


        try {

            const user = await User.findOne({ _id: userId })

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            // Access the user's role
            if (user.nivelAcesso === 'Adm') {

                const userList = await User.find({ hemocentroId: hemocentroId })

                return res.json(userList)

            }
            else {
                return res.status(401).json({ error: 'Acesso não autorizado' });
            }


        } catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }

    }

}
