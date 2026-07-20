import { Router } from 'express';
import { listSchedules, listTrainers } from '../controllers/trainer.controller';

const router = Router();

router.get('/', listTrainers);
router.get('/:id/schedules', listSchedules);

export default router;
