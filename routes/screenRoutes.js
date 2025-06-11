import express from 'express';
import { 
  createScreen, 
  getScreenById, 
  updateScreen, 
  deleteScreen 
} from '../controllers/screenController.js';
import verifyToken from '../middlewares/auth.js';

const router = express.Router()

router.post('/', verifyToken, createScreen)
router.get('/:id', verifyToken, getScreenById)
router.put('/:id', verifyToken, updateScreen)
router.delete('/:id', verifyToken, deleteScreen)

export default router