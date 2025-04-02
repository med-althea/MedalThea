// src/user/routes/userRoutes.js
import { Router } from 'express';
const router = Router();
import { register, login, getUserDetails, getUserList, updateUserProfile } from '../controller/userController.js';

router.post('/register', register);
router.post('/login', login);
router.get('/user-details/:userId', getUserDetails);
router.get('/list', getUserList);
router.put('/:userId', updateUserProfile);

export default router;