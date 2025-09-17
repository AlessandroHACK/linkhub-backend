import { rateLimit } from 'express-rate-limit';

export const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 5, 
    message: {"error": "Has realizado demasiadas peticiones en un minuto, por favor espera un momento e inténtalo de nuevo."},
    
})