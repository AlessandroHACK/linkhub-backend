import { Router } from "express";
import { AuthController } from "./controllers/AuthController";
import { body, param } from "express-validator";
const router = Router()

//Autenticacion y registro
router.post('/auth/register', AuthController.createAccount)

export default router