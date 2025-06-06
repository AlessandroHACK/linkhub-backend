import { Router } from "express";

import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { authenticate, checkUserExistsByHandle } from "../middleware/auth";



const router = Router();


router.patch('/',
    body('handle').notEmpty().withMessage('El handle no puede ir vacío'),
    handleInputErrors,
    authenticate,
    AuthController.updateProfile
);


router.post('/image',
    authenticate,
    handleInputErrors,
    AuthController.uploadImage
);


router.post('/update-password',
    authenticate,
    body('current_password').notEmpty().withMessage('El password actual no puede ir vacío'),
    body('password').isLength({ min: 8 }).withMessage('El password debe tener mínimo 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Los passwords no coinciden');
        }
        return true;
    }),
    handleInputErrors,
    AuthController.updateCurrentUserPassword
);


router.get('/:handle',
    //param('handle').notEmpty().withMessage('El handle es requerido'),
    handleInputErrors,
    checkUserExistsByHandle,
    AuthController.getUserByHandle
);

router.post(
  '/search',
  body('handle')
    .notEmpty()
    .withMessage('El handle no puede ir vacio'), // <-- este mensaje es el que aparece
  handleInputErrors,
  AuthController.searchByHandle
);
export default router