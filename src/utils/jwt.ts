import jwt from 'jsonwebtoken'
import Types from 'mongoose'

type UserPayload = {
    id: Types.ObjectId
}

//crear jwt
export const generateJWT = (payload: UserPayload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '180d'
    })
    return token
}

//verificar jwt

export const decodedToken = (token: string) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
}