import { Router } from "express";

import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { authenticate, checkUserExistsByHandle } from "../middleware/auth";



const router = Router();

//Autenticacion y registro
router.post('/register',
    body('handle').notEmpty().withMessage('El handle no puede ir vacio'),
    body('name').notEmpty().withMessage('El Nombre no puede ir vacio'),
    body('email').isEmail().withMessage('E-mail no válido'),
    body('password').isLength({ min: 8 }).withMessage('El Password es muy corto, mínimo 8 caracteres'),
    handleInputErrors,
    AuthController.createAccount)

router.post('/login',
    body('email').isEmail().withMessage('E-mail no válido'),
    body('password').notEmpty().withMessage('El password no debe de ir vacio'),
    handleInputErrors,
    AuthController.login
)

router.post('/logout', authenticate, AuthController.logout);

// Obtener perfil del usuario autenticado
router.get('/user',
    authenticate,
    AuthController.user
);
export default router