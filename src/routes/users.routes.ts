import { Router } from 'express';
import * as userServices from '../controllers/users.controller';

const router: Router = Router();

router.post("/register", userServices.register);
router.post("/login", userServices.login);

export default router;