import { Router } from 'express';
import {
  cancelBooking,
  confirmBooking,
  createSchedule,
  createTrainer,
  deleteSchedule,
  deleteTrainer,
  listAdminTrainers,
  listBookings,
  listSchedules,
  updateSchedule,
  updateTrainer,
} from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/trainers', listAdminTrainers);
router.post('/trainers', createTrainer);
router.put('/trainers/:id', updateTrainer);
router.delete('/trainers/:id', deleteTrainer);

router.get('/schedules', listSchedules);
router.post('/schedules', createSchedule);
router.put('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);

router.get('/bookings', listBookings);
router.put('/bookings/:id/confirm', confirmBooking);
router.put('/bookings/:id/cancel', cancelBooking);

export default router;
