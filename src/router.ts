import { Router } from "express";
import { AuthController } from "./controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "./middleware/validation";


const router = Router();

//Autenticacion y registro
router.post('/auth/register',
    body('handle')
    .notEmpty()
    .withMessage('El handle no puede ir vacio'),
body('name')
    .notEmpty()
    .withMessage('El Nombre no puede ir vacio'),
body('email')
    .isEmail()
    .withMessage('E-mail no válido'),
body('password')
    .isLength({ min: 8 })
    .withMessage('El Password es muy corto, mínimo 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Los Password no son iguales')
        }
        return true
    }),
handleInputErrors,
    AuthController.createAccount)

export default router