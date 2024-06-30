import { Request, Response } from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import User from '../models/user.model'
import Token, { TokenDocument } from '../models/token.model'
import Bloodcenter from '../models/hemocentro.model'

export default class AuthController {

    static async store(req: Request, res: Response) {
        const { userId } = req.headers
        const { nome, senha, nivelAcesso, hemocentroId } = req.body

        if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })


        try {

            const userAutenticado = await User.findOne({ _id: userId })

            if (!userAutenticado) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

                if (!nome) return res.status(400).json({ error: 'O nome é obrigatório' })
                if (!senha) return res.status(400).json({ error: 'A senha é obrigatória' })
                if (!nivelAcesso) return res.status(400).json({ erro: 'Nível de acesso é obrigatório' })

                const user = await User.findOne({ nome: nome })

                if (user) return res.status(400).json({ error: 'Nome de usuário já existe' })


                    

                if (nivelAcesso === 'Hemocentro') {
                    if (!hemocentroId || !mongoose.Types.ObjectId.isValid(hemocentroId)) {
                        return res.status(400).json({ error: 'Id do hemocentro inválido' })
                    }

                    const hemocentro = await Bloodcenter.findOne({ _id: hemocentroId })

                    if (!hemocentro) {
                        return res.status(404).json({ error: 'Hemocentro não encontrado com o Id fornecido' })
                    }

                    if(hemocentro.ativo == false){
                        return res.status(400).json({ error: 'Hemocentro está inativo' })
                    }

                    const novoUser = new User()
                    novoUser.nome = nome
                    novoUser.senha = bcrypt.hashSync(senha, 10)
                    novoUser.nivelAcesso = nivelAcesso
                    novoUser.hemocentroId = hemocentroId
                    await novoUser.save()

                    return res.status(201).json({
                        id: novoUser.id,
                        nome: novoUser.nome,
                        nivelAcesso: novoUser.nivelAcesso,
                        hemocentroId: novoUser.hemocentroId
                    })


                }

                else if (nivelAcesso === 'Adm') {
                    const novoUser = new User()
                    novoUser.nome = nome
                    // Gera a hash da senha com bcrypt - para não salvar a senha em texto puro
                    novoUser.senha = bcrypt.hashSync(senha, 10)
                    novoUser.nivelAcesso = nivelAcesso
                    await novoUser.save()

                    return res.status(201).json({
                        id: novoUser.id,
                        nome: novoUser.nome,
                        nivelAcesso: novoUser.nivelAcesso,
                    })


                }
                else return res.status(400).json({ erro: 'Nível de acesso é inválido' })



        } catch (error) {

            return res.status(500).json({error: "Erro interno do Servidor"});
        }


    }

    static async login(req: Request, res: Response) {
        const { nome, senha } = req.body

        if (!nome) return res.status(400).json({ error: 'O nome é obrigatório' })
        if (!senha) return res.status(400).json({ error: 'A senha é obrigatória' })

        const user = await User.findOne({nome: nome })
        if (!user) return res.status(401).json({ error: 'Usuário não encontrado' })

        if (user.nivelAcesso === 'Hemocentro'){
            const hemocentro = await Bloodcenter.findOne({ _id: user.hemocentroId})

            if (!hemocentro) {
                return res.status(404).json({ error: 'Hemocentro não encontrado com o Id fornecido' })
            }

            if(hemocentro.ativo === false){
                return res.status(400).json({ error: 'Hemocentro está inativo' })
            }
            const passwordMatch = bcrypt.compareSync(senha, user.senha)
        if (!passwordMatch) return res.status(401).json({ error: 'Senha inválida' })


        // Remove todos os tokens antigos do usuário
        await Token.deleteMany(
            {userId: user._id}
        )

        const token = new Token()
        // Gera um token aleatório
        token.token = bcrypt.hashSync(Math.random().toString(36), 1).slice(-20)
        // Define a data de expiração do token para 1 hora
        token.expiracao = new Date(Date.now() + 60 * 60 * 1000)
        // Gera um refresh token aleatório
        token.refreshToken = bcrypt.hashSync(Math.random().toString(36), 1).slice(-20)

        token.userId =  mongoose.Types.ObjectId.createFromHexString(user._id.toString())
        await token.save()

        return res.json({
            token: token.token,
            expiresAt: token.expiracao,
            refreshToken: token.refreshToken
        })
        }
        else return res.status(401).json({ error: 'Acesso não autorizado' })
    }

    static async loginAdm(req: Request, res: Response) {
        const { nome, senha } = req.body

        if (!nome) return res.status(400).json({ error: 'O nome é obrigatório' })
        if (!senha) return res.status(400).json({ error: 'A senha é obrigatória' })

        const user = await User.findOne({nome: nome })
        if (!user) return res.status(401).json({ error: 'Usuário não encontrado' })

        if (user.nivelAcesso === 'Adm'){
            const passwordMatch = bcrypt.compareSync(senha, user.senha)
        if (!passwordMatch) return res.status(401).json({ error: 'Senha inválida' })


        // Remove todos os tokens antigos do usuário
        await Token.deleteMany(
            {userId: user._id}
        )

        const token = new Token()
        // Gera um token aleatório
        token.token = bcrypt.hashSync(Math.random().toString(36), 1).slice(-20)
        // Define a data de expiração do token para 1 hora
        token.expiracao = new Date(Date.now() + 60 * 60 * 1000)
        // Gera um refresh token aleatório
        token.refreshToken = bcrypt.hashSync(Math.random().toString(36), 1).slice(-20)

        token.userId =  mongoose.Types.ObjectId.createFromHexString(user._id.toString())
        await token.save()

        return res.json({
            token: token.token,
            expiresAt: token.expiracao,
            refreshToken: token.refreshToken
        })
        }
        else return res.status(401).json({ error: 'Acesso não autorizado' })
    }

    static async refresh(req: Request, res: Response) {
        const { authorization } = req.headers

        if (!authorization) return res.status(400).json({ error: 'O refresh token é obrigatório' })

        const token = await Token.findOne({ refreshToken: authorization })
        if (!token) return res.status(401).json({ error: 'Refresh token inválido' })

        // Verifica se o refresh token ainda é válido
        if (token.expiracao < new Date()) {
            await token.deleteOne({token: token.token})
            return res.status(401).json({ error: 'Refresh token expirado' })
        }

        // Atualiza os tokens
        token.token = bcrypt.hashSync(Math.random().toString(36), 1).slice(-20)
        token.refreshToken = bcrypt.hashSync(Math.random().toString(36), 1).slice(-20)
        token.expiracao = new Date(Date.now() + 60 * 60 * 1000)
        await token.save()

        return res.json({
            token: token.token,
            expiresAt: token.expiracao,
            refreshToken: token.refreshToken
        })
    }

    static async logout(req: Request, res: Response) {
        const { authorization } = req.headers

        if (!authorization) return res.status(400).json({ error: 'O token é obrigatório' })

        // Verifica se o token existe
        const userToken = await Token.findOne({ token: authorization }) as TokenDocument
        if (!userToken) return res.status(401).json({ error: 'Token inválido' })

        // Remove o token
        await userToken.deleteOne({ token: authorization })

        // Retorna uma resposta vazia
        return res.status(204).json()
    }

}