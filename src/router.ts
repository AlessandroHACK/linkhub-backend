import { Router } from "express";
import { AuthController } from "./controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "./middleware/validation";
import { authenticate } from "./middleware/auth";


const router = Router();

//Autenticacion y registro
router.post('/auth/register',
    body('handle').notEmpty().withMessage('El handle no puede ir vacio'),
    body('name').notEmpty().withMessage('El Nombre no puede ir vacio'),
    body('email').isEmail().withMessage('E-mail no válido'),
    body('password').isLength({ min: 8 }).withMessage('El Password es muy corto, mínimo 8 caracteres'),
    handleInputErrors,
    AuthController.createAccount)

router.post('/auth/login',
    body('email').isEmail().withMessage('E-mail no válido'),
    body('password').notEmpty().withMessage('El password no debe de ir vacio'),
    handleInputErrors,
    AuthController.login
)

router.get('/auth/user',
    authenticate,
    AuthController.user
)
export default router