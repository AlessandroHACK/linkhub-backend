import User from "../models/User"
import type { Request, Response } from 'express'
import slug from 'slug'
import { hashPassword } from "../utils/auth"

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            
            //verificar si el user ya existe
            const userExists = await User.findOne({ email })
            if (userExists) {
                const error = new Error('Un usuario con ese mail ya esta registrado')
                res.status(409).json({ error: error.message })
                return
            }
            //verificar si el handle ya existe
            const handle = slug(req.body.handle, '')
            const handleExists = await User.findOne({ handle })
            if (handleExists) {
                const error = new Error('Nombre de usuario no disponible')
                res.status(409).json({ error: error.message })
                return
               
            }
            //crear el user
            const user = new User(req.body)
            //hash password
            user.password = await hashPassword(password)
            //asignar el handle
            user.handle = handle
            //guardra el User
            await user.save()
            res.status(201).send('Registro Creado Correctamente')
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }
}