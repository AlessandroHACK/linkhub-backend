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


            const userExists = await User.findOne({ email })
            if (userExists) {
                const error = new Error('Un usuario con ese mail ya esta registrado')
                res.status(409).json({ error: error.message })
                return
            }

            const handle = slug(req.body.handle, '')
            const handleExists = await User.findOne({ handle })
            if (handleExists) {
                const error = new Error('Nombre de usuario no disponible')
                res.status(409).json({ error: error.message })
                return

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

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                const error = new Error('Usuario no encontrado');
                res.status(404).json({ error: error.message });
                return
            }


            const isPasswordCorrect = await checkPassword(password, user.password);
            if (!isPasswordCorrect) {
                const error = new Error('Contraseña incorrecta');
                res.status(403).json({ error: error.message });
                return
            }

   
            const token = generateJWT({ id: user.id });


            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 7, 
                path: '/',
            });


            res.json({
                success: true,
                message: 'Sesión iniciada correctamente',
                user: {
                    id: user.id,
                    email: user.email,
                    handle: user.handle,
                    name: user.name
                }
            });
            return

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error en el servidor" });
            return
        }
    }

    static user = async (req: Request, res: Response) => {
        try {
           
            if (!req.user) {
                const error = new Error('No autorizado');
                res.status(401).json({ error: error.message });
                return
            }


            res.json(req.user);
            return

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error en el servidor" });
            return
        }
    }

    static logout = async (req: Request, res: Response) => {
        try {

            res.clearCookie('access_token', {
                path: '/',
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
            });

            res.json({ success: true, message: 'Sesión cerrada correctamente' });
            return

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al cerrar sesión" });
            return
        }
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

          
            req.user.description = description
            req.user.handle = handle
            req.user.links = links
            await req.user.save()
            res.json('Perfil Actualizado Correctamente')
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }

    static uploadImage = async (req: Request, res: Response) => {
        const form = formidable({ multiples: false })
        try {
            form.parse(req, (error, fields, files) => {

                cloudinary.uploader.upload(files.file[0].filepath, {}, async function (error, result) {
                    if (error) {
                        res.status(500).json({ error: "Hubo un error" })
                    }
                    if (result) {
                        req.user.image = result.secure_url
                        await req.user.save()
                        res.json({ image: result.secure_url })
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


        const isPasswordCorrect = await checkPassword(current_password, user.password)
        if (!isPasswordCorrect) {
            const error = new Error('Password incorrecto')
            res.status(401).json({ error: error.message })
            return
        }

        try {
            user.password = await hashPassword(password) //hash nuevo password
            await user.save()
            res.json('El password se modifico correctamente')
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }

    static getUserByHandle = async (req: Request, res: Response) => {
        try {
           
            const user = req.user;
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" });
        }
    }

 
static searchByHandle = async (req: Request, res: Response) => {
    try {
 

        const { handle } = req.body
        const userExists = await User.findOne({handle})
        if(userExists) {
            const error = new Error(`${handle} ya está registrado`)
             res.status(409).json({error: error.message})
             return
        }
        res.json(`${handle} está disponible`)
    } catch (error) {
            res.status(500).json({ error: "Hubo un error" });
        }
}

}

