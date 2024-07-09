import { Request, Response } from 'express'
import User from '../../models/user.model'
import mongoose from 'mongoose'
import Hemocentro from '../../models/hemocentro.model'
import Agendamento from '../../models/agendamento.model'
import nodemailer from 'nodemailer'

const emailTeste = process.env.EMAIL
const senhaTeste = process.env.PASSEMAIL

const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: emailTeste,
        pass: senhaTeste
    },
    tls: {
        rejectUnauthorized: false
    }
})

export default class AgendamentoController {
    static async store(req: Request, res: Response) {
        const { hemocentroId, nomeCompleto, dataNascimento, dataAgendamento, horario, statusDoacao, impedimento, diasImpedidos, email } = req.body

        if (!mongoose.Types.ObjectId.isValid(hemocentroId)) {
            return res.status(400).json({ error: 'Id de hemocentro inválido' })
        }

        if (!nomeCompleto || !dataAgendamento || !horario || !statusDoacao || !impedimento || !email) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
        }

        try {

            const hemocentro = await Hemocentro.findById(hemocentroId)
            if (!hemocentro) {
                return res.status(404).json({ error: 'Hemocentro não encontrado' })
            }

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

            if (!emailRegex.test(email)) {
                return res.status(400).json({ mensagem: 'Formato de e-mail inválido' })
            }

            const horaRegex = /^(?:[01]\d|2[0-3]):(?:[0-5]\d)$/

            if (!horaRegex.test(horario)) {
                return res.status(400).json({ mensagem: 'Formato de hora inválido. Use o formato HH:MM.' })
            }

            const regexData = /^\d{4}-\d{2}-\d{2}$/

            if (!regexData.test(dataAgendamento)) {
                return res.status(400).json({ mensagem: 'Formato de data inválido. Use o formato YYYY-MM-DD.' })
            }

            const partesDataAgendamento = dataAgendamento.split('-');
            const anoAgendamento = parseInt(partesDataAgendamento[0], 10)
            const mesAgendamento = parseInt(partesDataAgendamento[1], 10) - 1
            const diaAgendamento = parseInt(partesDataAgendamento[2], 10)
            const dataAgendamentoConvertida = new Date(anoAgendamento, mesAgendamento, diaAgendamento)

            if (dataAgendamentoConvertida.getFullYear() !== anoAgendamento || dataAgendamentoConvertida.getMonth() !== mesAgendamento || dataAgendamentoConvertida.getDate() !== diaAgendamento) {
                return res.status(400).json({ mensagem: 'Data de Agendamento inválida. Verifique o ano, mês e dia.' })
            }

            if (!regexData.test(dataNascimento)) {
                return res.status(400).json({ mensagem: 'Formato de data inválido. Use o formato YYYY-MM-DD.' })
            }

            const partesDataNascimento = dataNascimento.split('-');
            const anoNascimento = parseInt(partesDataNascimento[0], 10)
            const mesNascimento = parseInt(partesDataNascimento[1], 10) - 1
            const diaNascimento = parseInt(partesDataNascimento[2], 10)
            const dataNascimentoConvertida = new Date(anoNascimento, mesNascimento, diaNascimento)

            if (dataNascimentoConvertida.getFullYear() !== anoNascimento || dataNascimentoConvertida.getMonth() !== mesNascimento || dataNascimentoConvertida.getDate() !== diaNascimento) {
                return res.status(400).json({ mensagem: 'Data inválida. Verifique o ano, mês e dia.' })
            }


            const agendamento = new Agendamento()
            agendamento.hemocentroId = hemocentroId
            agendamento.nomeCompleto = nomeCompleto
            agendamento.dataAgendamento = dataAgendamento
            agendamento.dataNascimento = dataNascimento
            agendamento.horario = horario
            agendamento.statusDoacao = statusDoacao
            agendamento.impedimento = impedimento
            agendamento.email = email

            if (impedimento === 'temporario' && diasImpedidos) {
                if (isNaN(diasImpedidos)) {
                    return res.status(400).json({ error: 'Os dias de impedimento devem ser um número válido' });
                }
                agendamento.diasImpedidos = diasImpedidos
            }
            else {
                agendamento.diasImpedidos = 0
            }

            if (impedimento === "nenhum") {
                agendamento.statusDoacao = 'liberado'
            }
            else {
                agendamento.statusDoacao = 'bloqueado'
            }

            await agendamento.save()

            try {
                const mailOptions = {
                    from: 'TesteSangueMais@outlook.com',
                    to: email,
                    subject: 'Assunto do e-mail',
                    text: `<h1>Agendamento feito com sucesso</h1>
                  <p>Seu agendamento foi registrado com sucesso!</p>
                  <table>
                        <tr>
                            <td>Nome Completo</td>
                            <td>Data de agendamento</td>
                            <td>Data de nascimento</td>
                            <td>Horário</td>
                            <td>Status Doação</td>
                            <td>Impedimento</td>
                        </tr>
                        <tr>
                            <td>${nomeCompleto}</td>
                            <td>${dataAgendamento}</td>
                            <td>${dataNascimento}</td>
                            <td>${horario}</td>
                            <td>${statusDoacao}</td>
                            <td>${impedimento}</td>
                        </tr>
                    </table>`,
                };

                const info = await transporter.sendMail(mailOptions);
                console.log(`E-mail enviado: ${info.messageId}`);
                res.status(200).send('E-mail enviado com sucesso!');
            } catch (error) {
                console.error(`Erro ao enviar e-mail: ${error}`);
                res.status(500).send('Erro ao enviar e-mail. Por favor, tente novamente mais tarde.');
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Erro interno do servidor' })
        }
    }

    static async index(req: Request, res: Response) {
        const { userId } = req.headers

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' })
        }

        try {

            const user = await User.findOne({ _id: userId })
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' })
            }

            const agendamento = await Agendamento.find({ hemocentroId: user.hemocentroId })
            return res.json(agendamento)
        }
        catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor' })
        }

    }

    static async show(req: Request, res: Response) {
        const { userId } = req.headers
        const { id } = req.params


        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' })
        }

        const user = await User.findOne({ _id: userId })
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'O id é obrigatório' })
        }

        try {
            const agendamento = await Agendamento.findById(id)

            if (!agendamento) {
                return res.status(404).json({ error: 'Agendamento não encontrado' })
            }

            if (agendamento.hemocentroId.toString() === user.hemocentroId.toString()) {
                return res.status(201).json({ agendamento })
            }
        }
        catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor' })
        }


    }

    static async cancel(req: Request, res: Response) {
        const { id } = req.params
        const { userId } = req.headers

        if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })


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

            const agendamento = await Agendamento.findById(id)

            if (!agendamento) {
                return res.status(404).json({ error: 'Agendamento não encontrado' })
            }

            if (!agendamento || agendamento.hemocentroId.toString() !== user.hemocentroId.toString()) {
                return res.status(404).json({ error: 'Agendamento não associado ao Hemocentro' })
            }


            if (agendamento.statusDoacao === 'liberado') {
                agendamento.statusDoacao = 'cancelada'
                await agendamento.save()
                return res.status(201).json(agendamento)
            }
            else {
                return res.status(401).json({ error: 'Apenas é possível cancelar agendamentos com o status liberado' })
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Erro interno do servidor' })
        }
    }

    static async finish(req: Request, res: Response) {
        const { id } = req.params
        const { userId } = req.headers

        if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })


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

            const agendamento = await Agendamento.findById(id)

            if (!agendamento) {
                return res.status(404).json({ error: 'Agendamento não encontrado' })
            }

            if (!agendamento || agendamento.hemocentroId.toString() !== user.hemocentroId.toString()) {
                return res.status(404).json({ error: 'Agendamento não associado ao Hemocentro' })
            }


            if (agendamento.statusDoacao === 'liberado') {
                agendamento.statusDoacao = 'concluida'
                await agendamento.save()
                return res.status(201).json(agendamento)
            }
            else {
                return res.status(401).json({ error: 'Apenas é possível finalizar agendamentos com o status liberado' })
            }

        } catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor' })
        }
    }
}