import express from 'express'
import dotenv from 'dotenv'
import routes from './routes'
import cors from 'cors'
import nodemailer from 'nodemailer'


dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(routes) 
app.listen(port, () => {
  console.log(`Servidor executando na porta ${port}`)
})

require("./database/connection")