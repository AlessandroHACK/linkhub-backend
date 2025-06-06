import express from 'express' 
import cors from 'cors'
import 'dotenv/config'
import { connectDB } from './config/db'
import { corsConfig } from './config/cors'
import cookieParser from 'cookie-parser'
import AuthRoutes from './routes/authRoutes'
import UserRoutes from  './routes/userRoutes'
connectDB()

const app = express()

// Cors
app.use(cors(corsConfig))
// Middleware para parsear cookies
app.use(cookieParser())
// Leer datos de formularios
app.use(express.json())

app.use('/api/auth', AuthRoutes)
app.use('/api/users', UserRoutes)
export default app