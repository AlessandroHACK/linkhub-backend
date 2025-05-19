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

        // 7. Manejar diferentes tipos de errores
        const errorMessage = error instanceof Error ? error.message : 'Error de autenticación'
         res.status(401).json({ error: errorMessage })
         return
    }
}