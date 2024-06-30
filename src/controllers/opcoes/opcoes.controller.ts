import { Request, Response } from 'express'
import User from '../../models/user.model'
import mongoose from 'mongoose'
import Questoes from '../../models/questoes.model'
import Hemocentro from '../../models/hemocentro.model'
import Opcoes from '../../models/opcoes.model'

export default class OpcoesController {
    static async store(req: Request, res: Response) {
        const { descricao, questaoId, impedimento, diasImpedidos } = req.body
        const { userId } = req.headers

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' })
        }

        if (!descricao || !questaoId || !impedimento) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
        }

        if (!mongoose.Types.ObjectId.isValid(questaoId)) {
            return res.status(400).json({ error: 'Questão não encontrada' })
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

            const questao = await Questoes.findById(questaoId)
            if (!questao || questao.hemocentroId.toString() !== user.hemocentroId.toString()) {
                return res.status(404).json({ error: 'Questão não associada ao Hemocentro' })
            }

            const opcao = new Opcoes()
            opcao.descricao = descricao
            opcao.questaoId = questaoId
            opcao.impedimento = impedimento

            if (impedimento === 'temporario' && diasImpedidos) {
                if (isNaN(diasImpedidos)) {
                    return res.status(400).json({ error: 'Os dias de impedimento devem ser um número válido' });
                }
                opcao.diasImpedidos = diasImpedidos
            }
            else{
                opcao.diasImpedidos = 0
            }

            await opcao.save()
            return res.status(201).json(opcao)

        } catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor' })
        }
    }



    static async index(req: Request, res: Response) {
        const { questaoId } = req.params

        const opcoes = await Opcoes.find({ questaoId: questaoId })
        return res.json(opcoes)
    }

    static async update(req: Request, res: Response) {
        const { id } = req.params
        const { descricao, impedimento, diasImpedidos } = req.body
        const { userId } = req.headers


        if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })



        if (!descricao || !impedimento) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
        }

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'O id é obrigatório' })
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

            const opcao = await Opcoes.findById(id)

            if(!opcao){
                return res.status(404).json({ error: 'Opção não encontrada' })
            }

            const questao = await Questoes.findById(opcao.questaoId)
            if (!questao || questao.hemocentroId.toString() !== user.hemocentroId.toString()) {
                return res.status(404).json({ error: 'Questão não associada ao Hemocentro' })
            }

           
            opcao.descricao = descricao
            opcao.impedimento = impedimento

            if (impedimento === 'temporario') {
                if(!diasImpedidos){
                    return res.status(400).json({ error: 'É necessário informar os dias impedidos' })
                }
                if (isNaN(diasImpedidos)) {
                    return res.status(400).json({ error: 'Os dias de impedimento devem ser um número válido' });
                }
                opcao.diasImpedidos = diasImpedidos
            }
            else{
                opcao.diasImpedidos = 0
            }

            await opcao.save()
            return res.status(201).json(opcao)

        } catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor' })
        }
    }


    static async delete(req: Request, res: Response) {
        const { id } = req.params
        const { userId } = req.headers

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'O id é obrigatório' })
        }

        const opcao = await Opcoes.findById(id)

        if (!opcao) {
            return res.status(404).json({ error: 'Opcao não encontrada' })
        }

        const questao = await Questoes.findById(opcao.questaoId)

        if (!questao) {
            return res.status(404).json({ error: 'Questao não encontrada' })
        }

        const user = await User.findOne({ _id: userId })

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        if (questao.hemocentroId.toString() === user.hemocentroId.toString()) {
            await opcao.deleteOne({ _id: id })
            return res.status(204).json()

        }
        else{
            return res.status(401).json({ error: 'Acesso nâo autorizado' })
        }



    }

}

