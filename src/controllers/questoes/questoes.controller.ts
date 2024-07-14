import { Request, Response } from 'express'
import User from '../../models/user.model'
import mongoose from 'mongoose'
import Questoes from '../../models/questoes.model'
import Hemocentro from '../../models/hemocentro.model'
import Opcoes from '../../models/opcoes.model'

export default class QuestoesController {
    static async store(req: Request, res: Response) {
        const { descricao } = req.body
        const { userId } = req.headers


        if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

        if (!descricao) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
        }


        try {

            const user = await User.findOne({ _id: userId })

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' })
            }

            const hemocentro = await Hemocentro.findById(user.hemocentroId)

            if (!hemocentro) {
                return res.status(404).json({ error: 'Hemocentro não encontrado' })
            }

            const questao = new Questoes()
            questao.descricao = descricao
            questao.hemocentroId = user.hemocentroId
            await questao.save()
            return res.status(201).json({ questao })
        } catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor' })
        }
    }



    static async index(req: Request, res: Response) {
        const { hemocentroId } = req.params

        if (!hemocentroId || !mongoose.Types.ObjectId.isValid(hemocentroId)) {
            return res.status(400).json({ error: 'O id é obrigatório' })
        }

        const questoes = await Questoes.find({ hemocentroId: hemocentroId })
        return res.json(questoes)
    }

    static async indexByUser(req: Request, res: Response) {
        const { userId } = req.headers

        const user = await User.findOne({ _id: userId })
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        const hemocentro = await Hemocentro.findById(user.hemocentroId)
        if (!hemocentro) {
            return res.status(404).json({ error: 'Hemocentro não encontrado' })
        }

        const questao = await Questoes.find({ hemocentroId: user.hemocentroId })
        res.status(200).json(questao)
    }

    static async show(req: Request, res: Response) {
        const { id } = req.params

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'O id é obrigatório' })
        }

        const questoes = await Questoes.findById(id).exec()
        return res.json(questoes)
    }


    static async update(req: Request, res: Response) {
        const { id } = req.params
        const { descricao } = req.body

        const questao = await Questoes.findById(id)

        if (!questao) {
            return res.status(404).json({ error: 'Questao não encontrado' })
        }


        const { userId } = req.headers


        if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })



        if (!descricao) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
        }

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'O id é obrigatório' })
        }

        try {

            const user = await User.findById(userId)

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' })
            }

            const hemocentro = await Hemocentro.findById(user.hemocentroId)

            if (!hemocentro) {
                return res.status(404).json({ error: 'Hemocentro não encontrado' })
            }


            if (questao.hemocentroId.toString() === user.hemocentroId.toString()) {
                questao.descricao = descricao
                return res.status(201).json({ questao })
            }

            console.log('questao:', questao);
            console.log('user:', user);

            return res.status(401).json({ error: 'Acesso não autorizado' })


        } catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor' })
        }
    }

    static async delete(req: Request, res: Response) {
        const { userId } = req.headers
        const { id } = req.params

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'O id é obrigatório' })
        }

        const questao = await Questoes.findById(id)
        if (!questao) {
            return res.status(404).json({ error: 'Questão não encontrada' })
        }

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }


        if (user.hemocentroId.equals(questao.hemocentroId)) {
            await Opcoes.deleteMany({ questaoId: id })
            await questao.deleteOne()
            return res.status(204).json()
        }
        else {
            return res.status(404).json({ error: 'Acesso não autorizado' })
        }
    }

}

