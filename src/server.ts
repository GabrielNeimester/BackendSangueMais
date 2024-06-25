import express from 'express'
import dotenv from 'dotenv'
import routes from './routes'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';


dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const swaggerDocument = YAML.load('./swagger.yaml');

app.use(cors())
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(routes)
app.listen(port, () => {
  console.log(`Servidor executando na porta ${port}`)
})

require("./database/connection")