import express from 'express';
import { 
  createQuiz, 
  uploadQuizXlsx, 
  downloadQuizXlsx,
  listQuizzes, 
  submitQuiz, 
  getUserScores,
  createManualQuiz
} from '../controller/quizController.js';

import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post('/create', createQuiz);
router.post('/manual/create', createManualQuiz);
router.post('/upload', upload.single("file"), uploadQuizXlsx);
router.get('/download/:quizId', downloadQuizXlsx);
router.get('/list', listQuizzes);
router.post('/submit', submitQuiz);
router.get('/scores/:userId', getUserScores);

export default router;