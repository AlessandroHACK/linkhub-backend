
import express from 'express'
import 'dotenv/config'
import router from './router'
import { connectDB } from './config/db'
const app = express()

//DB
connectDB()
//leer datos del formualrio
app.use(express.json())

//rounting
app.use('/api', router)
export default app