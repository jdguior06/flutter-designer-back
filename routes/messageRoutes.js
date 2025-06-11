import express from 'express';
import { getMessages, createMessage } from '../controllers/messageController.js';
import verifyToken from '../middlewares/auth.js';

const router = express.Router()

router.get('/', verifyToken, getMessages)
router.post('/', verifyToken, createMessage)

export default router