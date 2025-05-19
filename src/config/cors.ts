import { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
    origin: function(origin, callback) {
        const whiteList = [process.env.FRONTEND_URL];
        
        if(process.argv[2] === '--api') {
            whiteList.push(undefined);
        }
        
        if(whiteList.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Error de CORS'));
        }
    },
    credentials: true, // Habilitar credenciales (cookies)
    exposedHeaders: ['set-cookie'], // Permitir que el frontend vea las cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};