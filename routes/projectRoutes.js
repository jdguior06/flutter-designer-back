import express from 'express';
import { 
  getProjectsByUser, 
  createProject, 
  getProjectById, 
  updateProject, 
  deleteProject 
} from '../controllers/projectController.js';
import verifyToken from '../middlewares/auth.js';

const router = express.Router()

router.get('/user/:userId', verifyToken, getProjectsByUser)
router.post('/', verifyToken, createProject)
router.get('/:id', verifyToken, getProjectById)
router.put('/:id', verifyToken, updateProject)
router.delete('/:id', verifyToken, deleteProject)

export default router