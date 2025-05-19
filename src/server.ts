import express from 'express' 
import cors from 'cors'
import 'dotenv/config'
import router from './router'
import { connectDB } from './config/db'
import { corsConfig } from './config/cors'
import cookieParser from 'cookie-parser'
connectDB()

const app = express()

// Cors
app.use(cors(corsConfig))
// Middleware para parsear cookies
app.use(cookieParser())
// Leer datos de formularios
app.use(express.json())

app.use('/api/auth', router)

export default app