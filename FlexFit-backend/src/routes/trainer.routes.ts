import { Router } from 'express';
import { listAvailableSchedules, listTrainers } from '../controllers/trainer.controller';

const router = Router();

router.get('/', listTrainers);
router.get('/:id/schedules', listAvailableSchedules);

export default router;
