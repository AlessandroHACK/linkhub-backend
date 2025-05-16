import User from "../models/User"
import type { Request, Response } from 'express'
import slug from 'slug'
import { checkPassword, hashPassword } from "../utils/auth"
import { generateJWT } from "../utils/jwt"
import formidable from 'formidable'
import cloudinary from "../config/cloudinary"
import { v4 as uuid } from "uuid"

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

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('Usuario no encontrado')
                res.status(404).json({ error: error.message })
                return
            }

            //revisar password
            const isPasswordCorrect = await checkPassword(password, user.password)
            if (!isPasswordCorrect) {
                const error = new Error('Password incorrecto')
                res.status(401).json({ error: error.message })
                return
            }

            //generar JWT
            const token = generateJWT({ id: user.id })
            res.send(token)
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user)
        return
    }
    static updateProfile = async (req: Request, res: Response) => {

        try {
            const { description, links } = req.body
            const handle = slug(req.body.handle, '')
            const handleExists = await User.findOne({ handle })
            if (handleExists && handleExists.email !== req.user.email) {
                const error = new Error('Nombre de usuario no disponible')
                res.status(409).json({ error: error.message })
                return
            }

            // Actualizar el usuario
            req.user.description = description
            req.user.handle = handle
            req.user.links = links
            await req.user.save()
            res.send('Perfil Actualizado Correctamente')
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }

    static uploadImage = async (req: Request, res: Response) => {
        const form = formidable({ multiples: false })
        try {
            form.parse(req, (error, fields, files) => {

                cloudinary.uploader.upload(files.file[0].filepath, { }, async function (error, result) {
                    if (error) {
                        res.status(500).json({ error: "Hubo un error" })
                    }
                    if(result){
                        req.user.image = result.secure_url
                        await req.user.save()
                        res.json({image: result.secure_url})
                    }
                })
            })
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body

        const user = await User.findById(req.user.id)

        //revisar password
        const isPasswordCorrect = await checkPassword(current_password, user.password)
        if (!isPasswordCorrect) {
            const error = new Error('Password incorrecto')
             res.status(401).json({ error: error.message })
             return
        }

        try {
            user.password = await hashPassword(password) //hash nuevo password
            await user.save()
            res.send('El password se modifico correctamente')
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }
}