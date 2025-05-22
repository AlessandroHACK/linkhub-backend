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
    // 1. Obtener el token de las cookies 
    const token = req.cookies.access_token

    if (!token) {
        const error = new Error('No autorizado - Token no encontrado')
         res.status(401).json({ error: error.message })
         return
    }

    try {
        // 2. Verificar el token
        const decoded = decodedToken(token)
        
        if (typeof decoded !== 'object' || !decoded.id) {
            throw new Error('Token inválido')
        }

        // 3. Buscar el usuario en la base de datos
        const user = await User.findById(decoded.id).select('-password')
        
        if (!user) {
            throw new Error('Usuario no encontrado')
        }

        // 4. Asignar el usuario al request
        req.user = user
        
        // 5. Continuar con la siguiente función/middleware
        return next()

    } catch (error) {
        // 6. Limpiar la cookie si hay algún error
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        })

        // 7. Maneja de errores
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