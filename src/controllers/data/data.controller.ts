import { Request, Response } from 'express'
import User from '../../models/user.model'
import mongoose from 'mongoose'
import Hemocentro from '../../models/hemocentro.model'
import DataAgend from '../../models/data.model'

export default class DataController {
    static async store(req: Request, res: Response) {
        const { data } = req.body
        const { userId } = req.headers

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' })
        }

        if (!data) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
        }

        const user = await User.findOne({ _id: userId })
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        const hemocentro = await Hemocentro.findById(user.hemocentroId)
        if (!hemocentro) {
            return res.status(404).json({ error: 'Hemocentro não encontrado' })
        }

        try {
            const regexData = /^\d{4}-\d{2}-\d{2}$/

            if (!regexData.test(data)) {
                return res.status(400).json({ mensagem: 'Formato de data inválido. Use o formato YYYY-MM-DD.' })
            }

            const partesData = data.split('-');
            const ano = parseInt(partesData[0], 10)
            const mes = parseInt(partesData[1], 10) - 1
            const dia = parseInt(partesData[2], 10)
            const dataConvertida = new Date(ano, mes, dia)

            if (dataConvertida.getFullYear() !== ano || dataConvertida.getMonth() !== mes || dataConvertida.getDate() !== dia) {
                return res.status(400).json({ mensagem: 'Data inválida. Verifique o ano, mês e dia.' })
            }

            const dataFinal = new Date(ano, mes, dia, 0, 0, 0, 0)

            const dataDuplicada = await DataAgend.findOne({ data: dataFinal })

            if (!dataDuplicada) {
                const dataAgend = new DataAgend()
                dataAgend.data = dataFinal
                dataAgend.hemocentroId = user.hemocentroId

                await dataAgend.save()

                res.status(201).json(dataAgend)
            }
            else {
                return res.status(400).json({ mensagem: 'data já cadastrada' })
            }



        }
        catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Erro interno do servidor' })
        }
    }

    static async index(req: Request, res: Response) {
        const { hemocentroId } = req.params

        const dataAgend = await DataAgend.find({ hemocentroId: hemocentroId })
        res.status(200).json(dataAgend)
    }

    static async show(req: Request, res: Response) {
        const { id } = req.params

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'O id é obrigatório' })
        }

        const dataAgend = await DataAgend.findById(id).exec()
        return res.json(dataAgend)
    }

    static async delete(req: Request, res: Response) {
        const { id } = req.params
        const { userId } = req.headers

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'O id é obrigatório' })
        }

        const dataAgend = await DataAgend.findById(id)

        if (!dataAgend) {
            return res.status(404).json({ error: 'Data não encontrada' })
        }

        const user = await User.findOne({ _id: userId })

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        if (dataAgend.hemocentroId.toString() === user.hemocentroId.toString()) {
            await dataAgend.deleteOne({ _id: id })
            return res.status(204).json()

        }
        else{
            return res.status(401).json({ error: 'Acesso nâo autorizado' })
        }
    }

}


