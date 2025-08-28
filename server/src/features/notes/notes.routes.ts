import { Router } from 'express';
import { NotesController } from './notes.controllers';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

// All notes routes require authentication
router.use(requireAuth);

router.get('/', NotesController.listNotes);
router.post('/', NotesController.createNote);
router.delete('/:id', NotesController.deleteNote);

export default router;
