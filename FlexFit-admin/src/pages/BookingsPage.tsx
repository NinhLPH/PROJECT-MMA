import {useCallback, useEffect, useMemo, useState} from 'react';
import {ConfirmDialog} from '../components/ConfirmDialog';
import {DataState} from '../components/DataState';
import {BookingStatusBadge, PaymentStatusBadge} from '../components/StatusBadge';
import {cancelBooking, confirmBooking, getBookings} from '../services/booking.service';
import {getErrorMessage} from '../services/api';
import type {Booking, BookingStatus} from '../types';
import {formatCurrency, formatDate} from '../utils/formatters';

type BookingAction = { booking: Booking; type: 'confirm' | 'cancel' };
const trainerName = (booking: Booking) => typeof booking.trainerId === 'string' ? 'PT không xác định' : booking.trainerId.fullName;
const user = (booking: Booking) => typeof booking.userId === 'string' ? {
    fullName: 'Học viên không xác định',
    email: '—'
} : booking.userId;

export function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | BookingStatus>('all');
    const [action, setAction] = useState<BookingAction | null>(null);
    const [saving, setSaving] = useState(false);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setBookings(await getBookings());
        } catch (reason) {
            setError(getErrorMessage(reason));
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        void load();
    }, [load]);
    const visible = useMemo(() => filter === 'all' ? bookings : bookings.filter((booking) => booking.status === filter), [bookings, filter]);

    async function runAction() {
        if (!action) return;
        setSaving(true);
        try {
            const updated = action.type === 'confirm' ? await confirmBooking(action.booking._id) : await cancelBooking(action.booking._id);
            setBookings((current) => current.map((booking) => booking._id === updated._id ? {...booking, ...updated} : booking));
            setAction(null);
        } catch (reason) {
            setError(getErrorMessage(reason));
            setAction(null);
        } finally {
            setSaving(false);
        }
    }

    return <>
        <div className="page-heading">
            <div><p className="eyebrow">HOẠT ĐỘNG ĐẶT LỊCH</p><h1>Quản lý booking</h1><p>Xác nhận lịch hợp lệ hoặc hủy
                lịch khi có sự cố.</p></div>
            <button className="button button-ghost" onClick={() => void load()}>↻ Làm mới</button>
        </div>
        <section className="panel">
            <div className="table-toolbar"><label className="filter-label">Trạng thái<select value={filter}
                                                                                             onChange={(event) => setFilter(event.target.value as typeof filter)}>
                <option value="all">Tất cả booking</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
            </select></label><span>{visible.length} booking</span></div>
            <DataState loading={loading} error={error} empty={!loading && !error && visible.length === 0}
                       onRetry={() => void load()}/>{!loading && !error && visible.length > 0 &&
            <div className="table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>Học viên</th>
                        <th>Huấn luyện viên</th>
                        <th>Buổi tập</th>
                        <th>Chi phí</th>
                        <th>Trạng thái</th>
                        <th/>
                    </tr>
                    </thead>
                    <tbody>{visible.map((booking) => <tr key={booking._id}>
                        <td><strong>{user(booking).fullName}</strong><small>{user(booking).email}</small></td>
                        <td>{trainerName(booking)}</td>
                        <td>{formatDate(booking.date)}<small>{booking.timeSlot}</small></td>
                        <td>{formatCurrency(booking.totalPrice)}<small><PaymentStatusBadge
                            status={booking.paymentStatus}/></small></td>
                        <td><BookingStatusBadge status={booking.status}/></td>
                        <td className="row-actions">{booking.status === 'pending' &&
                            <button className="button button-primary button-small"
                                    onClick={() => setAction({booking, type: 'confirm'})}>Xác
                                nhận</button>}{(booking.status === 'pending' || booking.status === 'confirmed') &&
                            <button className="button button-danger button-small"
                                    onClick={() => setAction({booking, type: 'cancel'})}>Hủy</button>}</td>
                    </tr>)}</tbody>
                </table>
            </div>}</section>
        {action && <ConfirmDialog title={action.type === 'confirm' ? 'Xác nhận booking' : 'Hủy booking'}
                                  description={action.type === 'confirm' ? `Xác nhận lịch tập của ${user(action.booking).fullName} với ${trainerName(action.booking)}?` : `Hủy booking của ${user(action.booking).fullName}? Khung giờ sẽ được mở lại cho học viên khác.`}
                                  confirmLabel={action.type === 'confirm' ? 'Xác nhận lịch' : 'Hủy booking'}
                                  danger={action.type === 'cancel'} loading={saving} onClose={() => setAction(null)}
                                  onConfirm={() => void runAction()}/>}</>;
}
