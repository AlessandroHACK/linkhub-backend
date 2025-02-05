import User from "../models/User"
import type { Request, Response } from 'express'
import slug from 'slug'
import { hashPassword } from "../utils/auth"

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const userExists = await User.findOne({ email })
            if (userExists) {
                const error = new Error('Un usuario con ese mail ya esta registrado')
                
            }
        
            const handle = slug(req.body.handle, '')
            const handleExists = await User.findOne({ handle })
            if (handleExists) {
                const error = new Error('Nombre de usuario no disponible')
               
            }
        
            const user = new User(req.body)
            user.password = await hashPassword(password)
            user.handle = handle
        
            await user.save()
            res.status(201).send('Registro Creado Correctamente')
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }
}