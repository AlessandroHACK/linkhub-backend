import { Router } from "express";
import { AuthController } from "./controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "./middleware/validation";
import { authenticate } from "./middleware/auth";


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

router.get('/user',
    authenticate,
    AuthController.user
)
router.post('/logout', authenticate, AuthController.logout);

router.patch('/user',
    body('handle').notEmpty().withMessage('El handle no puede ir vacio'),
    handleInputErrors,
    authenticate,
    AuthController.updateProfile
)

router.post('/user/image',
    authenticate,
    handleInputErrors,
    AuthController.uploadImage
)
router.post('/update-password',
    authenticate,
    body('current_password').notEmpty().withMessage('El password actual no puede ir vacio'),
    body('password')
        .isLength({ min: 8 }).withMessage('El password es muy corto, minimo 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Los Password no son iguales')
        }
        return true
    }),
    handleInputErrors,
    AuthController.updateCurrentUserPassword
)
export default router