import { Request, Response, NextFunction } from 'express'
import User, { IUser } from '../models/User'
import { decodedToken } from '../utils/jwt'

declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

// Middleware de autenticación JWT
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.access_token

    if (!token) {
        const error = new Error('No autorizado - Token no encontrado')
         res.status(401).json({ error: error.message })
         return
    }

    try {
        const decoded = decodedToken(token)
        
        if (typeof decoded !== 'object' || !decoded.id) {
            throw new Error('Token inválido')
        }

        const user = await User.findById(decoded.id).select('-password')
        
        if (!user) {
            throw new Error('Usuario no encontrado')
        }

        req.user = user
        
        return next()

    } catch (error) {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        })

        const errorMessage = error instanceof Error ? error.message : 'Error de autenticación'
         res.status(401).json({ error: errorMessage })
         return
    }
}


// Middleware para verificar existencia de usuario por handle
export const checkUserExistsByHandle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { handle } = req.params;
        const user = await User.findOne({ handle }).select('-password -__v -email -_id');
        
           if(!user){
            const error = new Error('El usuario no existe')
            res.status(404).json({error: error.message})
            return
           }

       
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: "Hubo un error al buscar el usuario" });
    }
};