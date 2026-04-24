import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getPasswords,
  getPassword,
  createPassword,
  updatePassword,
  deletePassword,
} from '../controllers/passwordController.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getPasswords);
router.get('/:id', getPassword);
router.post('/', createPassword);
router.put('/:id', updatePassword);
router.delete('/:id', deletePassword);

export default router;
