import { Request, Response } from 'express'
import User from '../../models/user.model'
import mongoose from 'mongoose'
import Hemocentro from '../../models/hemocentro.model'
import Hora from '../../models/hora.model'
import DataAgend from '../../models/data.model'
import Agendamento from '../../models/agendamento.model'

export default class HoraController {
    static async store(req: Request, res: Response) {
        const { horario, dataId, quantidade } = req.body
        const { userId } = req.headers

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' })
        }

        if (isNaN(quantidade)) {
            return res.status(400).json({ error: 'O número de vagas disponíveis deve ser um número válido' });
        }

        if (!horario) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
        }

        if (!mongoose.Types.ObjectId.isValid(dataId)) {
            return res.status(400).json({ error: 'Id de data inválido' })
        }

        const user = await User.findOne({ _id: userId })
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        const hemocentro = await Hemocentro.findById(user.hemocentroId)
        if (!hemocentro) {
            return res.status(404).json({ error: 'Hemocentro não encontrado' })
        }

        const data = await DataAgend.findById(dataId)
        if (!data || data.hemocentroId.toString() !== user.hemocentroId.toString()) {
            return res.status(404).json({ error: 'Data não associada ao Hemocentro' })
        }

        try {

            if (quantidade <= 0 || quantidade > 100) {
                return res.status(400).json({ error: 'O número de vagas disponíveis deve ser um número válido entre 1 e 100' })
            }

            const horaRegex = /^(?:[01]\d|2[0-3]):(?:[0-5]\d)$/

            if (!horaRegex.test(horario)) {
                return res.status(400).json({ mensagem: 'Formato de hora inválido. Use o formato HH:MM.' })
            }

            const horaDuplicada = await Hora.findOne({ horario: horario, dataId: dataId })

            if (!horaDuplicada) {
                const [hours, minutes] = horario.split(':').map(Number);
                const horarioEmMinutos = hours * 60 + minutes;

                const horariosExistentes = await Hora.find({ dataId: dataId });

                for (let horaExistente of horariosExistentes) {
                    const [hExistente, mExistente] = horaExistente.horario.split(':').map(Number)
                    const horarioExistenteEmMinutos = hExistente * 60 + mExistente

                    if (Math.abs(horarioExistenteEmMinutos - horarioEmMinutos) < 15) {
                        return res.status(400).json({ error: 'Já existe horário cadastrado em um intervalo próximo menor que 15 minutos!' })
                    }
                }

                const hora = new Hora()
                hora.quantidade = quantidade
                hora.horario = horario
                hora.dataId = dataId

                await hora.save()

                res.status(201).json(hora)
            }
            else {
                return res.status(400).json({ mensagem: 'Horário já cadastrado' })
            }



        }
        catch (error) {
            res.status(500).json({ error: 'Erro interno do servidor' })
        }
    }

    static async index(req: Request, res: Response) {
        const { dataId } = req.params

        if (!dataId || !mongoose.Types.ObjectId.isValid(dataId)) {
            return res.status(400).json({ error: 'O id é obrigatório' })
        }

        try {
            const horarios = await Hora.find({ dataId: dataId }).sort({ horario: 1 })

            const horariosDisponiveis = []

            for (const hora of horarios) {
                const totalAgendamentos = await Agendamento.countDocuments({ horario: hora.horario })

                horariosDisponiveis.push({
                    _id: hora._id,
                    horario: hora.horario,
                    dataId: dataId
                })

            }

            res.status(200).json(horariosDisponiveis)
        } catch (error) {
            res.status(500).json({ error: 'Erro interno do servidor' })
        }
    }

    static async indexActives(req: Request, res: Response) {
        const { dataId } = req.params

        if (!dataId || !mongoose.Types.ObjectId.isValid(dataId)) {
            return res.status(400).json({ error: 'O id é obrigatório' })
        }

        try {
            const horarios = await Hora.find({ dataId: dataId }).sort({ horario: 1 })

            const horariosDisponiveis = []

            for (const hora of horarios) {
                const totalAgendamentos = await Agendamento.countDocuments({ horario: hora.horario })

                if (totalAgendamentos < hora.quantidade) {
                    horariosDisponiveis.push({
                        _id: hora._id,
                        horario: hora.horario,
                        dataId: dataId,
                        quantidade: hora.quantidade - totalAgendamentos,
                    })
                }
            }

            res.status(200).json(horariosDisponiveis)
        } catch (error) {
            res.status(500).json({ error: 'Erro interno do servidor' })
        }
    }


    static async show(req: Request, res: Response) {
        const { id } = req.params

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'O id é obrigatório' })
        }

        const hora = await Hora.findById(id).exec()
        return res.json(hora)
    }

    static async delete(req: Request, res: Response) {
        const { id } = req.params
        const { userId } = req.headers

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'O id é obrigatório' })
        }

        const hora = await Hora.findById(id)

        if (!hora) {
            return res.status(404).json({ error: 'Horario não encontrado' })
        }

        const user = await User.findOne({ _id: userId })

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        const agendamento = await Agendamento.findOne({ horario: hora.horario })

        if (agendamento) {
            return res.status(401).json({ error: 'Esse horário possui agendamento cadastrados, por favor cancele todos os agendamentos nesse horário para poder apagá-lo!' })
        }

        const data = await DataAgend.findById(hora.dataId)
        if (!data || data.hemocentroId.toString() !== user.hemocentroId.toString()) {
            return res.status(404).json({ error: 'Data não associada ao Hemocentro' })
        }
        else if (data.hemocentroId.toString() === user.hemocentroId.toString()) {
            await Hora.deleteOne({ _id: id })
            return res.status(204).json()

        }
        else {
            return res.status(401).json({ error: 'Acesso nâo autorizado' })
        }
    }

}


