import { Request, Response, NextFunction } from 'express'
import Token from '../models/token.model'

export default async function authMiddleware (req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers

  if (!authorization) return res.status(401).json({ error: 'Token não informado' })

  // Verifica se o token existe
  const userToken = await Token.findOne({ token: authorization })
  if (!userToken) return res.status(401).json({ error: 'Token inválido' })

  // Verifica se o token expirou
  if (userToken.expiracao < new Date()) {
    await userToken.deleteOne({token: userToken.token})
    return res.status(401).json({ error: 'Token expirado' })
  }

  // Adiciona o id do usuário no header da requisição
  req.headers.userId = userToken.userId.toString()

  // Continua a execução
  next()
}