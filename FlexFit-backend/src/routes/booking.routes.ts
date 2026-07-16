import { Router } from 'express';
import { cancelOwnBooking, createBooking, listUserBookings } from '../controllers/booking.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/', createBooking);
router.get('/user/:userId', listUserBookings);
router.put('/:id/cancel', cancelOwnBooking);

export default router;
