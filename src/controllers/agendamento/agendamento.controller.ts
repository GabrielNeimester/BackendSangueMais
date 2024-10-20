import { Request, Response } from 'express'
import User from '../../models/user.model'
import mongoose from 'mongoose'
import Hemocentro from '../../models/hemocentro.model'
import Agendamento from '../../models/agendamento.model'
import Hora from '../../models/hora.model'
import Questoes from '../../models/questoes.model'
import Opcoes from '../../models/opcoes.model'
import DataAgendModel from '../../models/data.model'


export default class AgendamentoController {
    static async store(req: Request, res: Response) {
        const { cpf, dataAgendamento, dataNascimento, email, hemocentroId, horario, nomeCompleto, sexo, telefone, tipoSanguineo, selectedAnswers } = req.body
        //Teste Agendamento
        if (!cpf || !dataAgendamento || !dataNascimento || !email || !hemocentroId || !horario || !nomeCompleto || !sexo || !telefone || !tipoSanguineo) {
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

            const dataDoacao = await DataAgendModel.findById(dataAgendamento)
            if (!dataDoacao) {
                return res.status(404).json({ error: 'Data não encontrada' })
            }

            const horarioAgendamento = await Hora.findById(horario)
            if (!horarioAgendamento) {
                return res.status(404).json({ error: 'Horário não encontrado' })
            }

            const agendamentosExistentes = await Agendamento.countDocuments({ horario: horarioAgendamento.horario, dataAgendamento });

            if (agendamentosExistentes >= horarioAgendamento.quantidade) {
                return res.status(400).json({ error: 'Não há vagas disponíveis para este horário' })
            }

            let impedimentoDefinitivo = false;
            let impedimentoTemporario = false;
            let diasImpedidos = 0;

            if (selectedAnswers) {
                for (const [questionId, opcaoId] of Object.entries(selectedAnswers)) {
                    if (
                        !mongoose.Types.ObjectId.isValid(questionId as string) ||
                        !mongoose.Types.ObjectId.isValid(opcaoId as string)
                    ) {
                        return res.status(400).json({ error: 'ID de pergunta ou resposta inválido no selectedAnswers' });
                    }
                }

                const questoesPromessas = Object.entries(selectedAnswers).map(async ([questionId, opcaoId]) => {
                    const questao = await Questoes.findById(questionId as string);
                    const resposta = await Opcoes.findById(opcaoId as string);
                    if (!questao) throw new Error(`Questão com ID ${questionId} não encontrada`);
                    if (!resposta) throw new Error(`Resposta com ID ${opcaoId} não encontrada`);
                    return { questao, resposta };
                });

                const questoesRespostas = await Promise.all(questoesPromessas);

                questoesRespostas.forEach(({ questao, resposta }) => {

                    if (resposta.impedimento === 'definitivo') {
                        impedimentoDefinitivo = true;
                    }
                    if (resposta.impedimento === 'temporario') {
                        impedimentoTemporario = true;
                        if (resposta.diasImpedidos > diasImpedidos) {
                            diasImpedidos = resposta.diasImpedidos;
                        }
                    }
                });

            }



            const regexData = /^\d{4}-\d{2}-\d{2}$/
            if (!regexData.test(dataNascimento)) {
                return res.status(400).json({ mensagem: 'Formato de data inválido. Use o formato YYYY-MM-DD.' })
            }

            const partesDataNascimento = dataNascimento.split('-');
            const anoNascimento = parseInt(partesDataNascimento[0], 10);
            const mesNascimento = parseInt(partesDataNascimento[1], 10) - 1;
            const diaNascimento = parseInt(partesDataNascimento[2], 10);
            const dataNascimentoConvertida = new Date(anoNascimento, mesNascimento, diaNascimento);

            if (dataNascimentoConvertida.getFullYear() !== anoNascimento || dataNascimentoConvertida.getMonth() !== mesNascimento || dataNascimentoConvertida.getDate() !== diaNascimento) {
                return res.status(400).json({ mensagem: 'Data inválida. Verifique o ano, mês e dia.' });
            }

            // Criação do agendamento
            const agendamento = new Agendamento();
            agendamento.hemocentroId = hemocentroId;
            agendamento.nomeCompleto = nomeCompleto;
            agendamento.dataAgendamento = dataDoacao.data;
            agendamento.dataNascimento = dataNascimento;
            agendamento.horario = horarioAgendamento.horario;
            agendamento.email = email;

            if (impedimentoTemporario && !impedimentoDefinitivo) {
                agendamento.impedimento = 'temporario';
                agendamento.diasImpedidos = diasImpedidos;
                agendamento.statusDoacao = 'bloqueado';
                await agendamento.save();
                return res.status(200).send(agendamento);
            }

            if (impedimentoDefinitivo) {
                agendamento.impedimento = 'definitivo';
                agendamento.statusDoacao = 'bloqueado';
                agendamento.diasImpedidos = 0;
                await agendamento.save();
                return res.status(200).send(agendamento);
            }

            agendamento.impedimento = 'nenhum';
            agendamento.statusDoacao = 'liberado';
            agendamento.diasImpedidos = 0;
            await agendamento.save();
            return res.status(200).send(agendamento);

        } catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
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
                return res.status(201).json(agendamento)
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