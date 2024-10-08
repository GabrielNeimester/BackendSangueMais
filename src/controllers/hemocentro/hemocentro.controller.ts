import { Request, Response } from 'express'
import Hemocentro from '../../models/hemocentro.model'
import User from '../../models/user.model'
import mongoose from 'mongoose'
import { ObjectId } from 'mongodb'

export default class HemocentroController {
    static async store(req: Request, res: Response) {
        const { cnpj, nome, estado, cidade, bairro, telefone, email, numero, endereco } = req.body
        const { userId } = req.headers


        if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

        if (!cnpj || !nome || !estado || !cidade || !bairro || !telefone || !email || !numero || !endereco) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
        }


        try {

            const user = await User.findOne({ _id: userId })

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' })
            }

            if (user.nivelAcesso === 'Adm') {

                const hemocentro = new Hemocentro()
                hemocentro.cnpj = cnpj
                hemocentro.nome = nome
                hemocentro.estado = estado
                hemocentro.cidade = bairro
                hemocentro.telefone = telefone
                hemocentro.bairro = bairro
                hemocentro.email = email
                hemocentro.ativo = true
                hemocentro.endereco = endereco
                hemocentro.numero = numero
                await hemocentro.save()

                return res.status(201).json({ hemocentro })

            }
            else {
                return res.status(401).json({ error: 'Acesso não autorizado' })
            }


        } catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor' })
        }
    }



    static async index(req: Request, res: Response) {

        const hemocentro = await Hemocentro.find()
        return res.json(hemocentro)
    }

    static async show(req: Request, res: Response) {
        const { id } = req.params

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'O id é obrigatório' })
        }

        const hemocentro = await Hemocentro.findById(id).exec()
        return res.json(hemocentro)
    }

    static async userShow(req: Request, res: Response) {
        const { userId } = req.headers



        if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        const hemocentro = await Hemocentro.findById(user.hemocentroId).exec()
        return res.json(hemocentro)
    }


    static async update(req: Request, res: Response) {
        const { id } = req.params
        const { cnpj, nome, estado, cidade, bairro, telefone, email, ativo, endereco, numero } = req.body

        const { userId } = req.headers


        if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

        if (!cnpj || !nome || !estado || !cidade || !bairro || !telefone || !email || !endereco || !numero) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
        }

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'O id é obrigatório' })
        }

        try {

            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!regexEmail.test(email)) {
                return res.status(400).json({ mensagem: 'E-mail inválido' })
            }
    
            const regexTelefone = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/
            if (!regexTelefone.test(telefone)) {
                return res.status(400).json({ mensagem: 'Formato de telefone inválido. É necessário informar um telefone em um dos formatos válidos "(xx) xxxx-xxxx, (xx) xxxxx-xxxx"' })
            }
    

            const user = await User.findById(userId)

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' })
            }

            const hemocentro = await Hemocentro.findOne({ _id: id })

            if (!hemocentro) {
                return res.status(404).json({ error: 'Hemocentro não encontrado' })
            }

            if (user.nivelAcesso === 'Adm') {

                hemocentro.cnpj = cnpj
                hemocentro.nome = nome
                hemocentro.estado = estado
                hemocentro.cidade = cidade
                hemocentro.telefone = telefone
                hemocentro.bairro = bairro
                hemocentro.email = email
                hemocentro.ativo = ativo
                hemocentro.endereco = endereco
                hemocentro.numero = numero
                await hemocentro.save()

                return res.status(201).json({ hemocentro })

            }
            else if (user.nivelAcesso === "Hemocentro") {

                const userHemocentro = await Hemocentro.findOne({ _id: user.hemocentroId })


                    if (String(user.hemocentroId) === String(hemocentro._id)) {

                        hemocentro.cnpj = cnpj
                        hemocentro.nome = nome
                        hemocentro.estado = estado
                        hemocentro.cidade = cidade
                        hemocentro.telefone = telefone
                        hemocentro.bairro = bairro
                        hemocentro.email = email
                        hemocentro.endereco = endereco
                        hemocentro.numero = numero
                        await hemocentro.save()

                        return res.status(201).json({ hemocentro })
                    }
                    else {
                        return res.status(404).json({ error: 'Hemocentro não associado a usuário' })
                    }

                }
                else {
                    return res.status(401).json({ error: 'Acesso não autorizado' })
                }


            } catch (error) {
                return res.status(500).json({ error: 'Erro interno do servidor' })
            }
        }

}

