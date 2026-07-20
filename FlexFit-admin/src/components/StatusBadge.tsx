import type {BookingStatus, PaymentStatus} from '../types';

const bookingLabels: Record<BookingStatus, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
};

export function BookingStatusBadge({status}: { status: BookingStatus }) {
    return <span className={`status-badge status-${status}`}>{bookingLabels[status]}</span>;
}

export function PaymentStatusBadge({status}: { status: PaymentStatus }) {
    return <span
        className={`status-badge ${status === 'paid' ? 'status-paid' : 'status-unpaid'}`}>{status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>;
}
