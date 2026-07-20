import {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {DataState} from '../components/DataState';
import {BookingStatusBadge} from '../components/StatusBadge';
import {getBookings} from '../services/booking.service';
import {getErrorMessage} from '../services/api';
import {getSchedules} from '../services/schedule.service';
import {getTrainers} from '../services/trainer.service';
import type {Booking, Schedule, Trainer} from '../types';
import {formatCurrency, formatDate} from '../utils/formatters';

const bookingTrainerName = (booking: Booking) => typeof booking.trainerId === 'string' ? 'PT không xác định' : booking.trainerId.fullName;
const bookingUserName = (booking: Booking) => typeof booking.userId === 'string' ? 'Học viên không xác định' : booking.userId.fullName;

export function DashboardPage() {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [nextTrainers, nextSchedules, nextBookings] = await Promise.all([getTrainers(), getSchedules(), getBookings()]);
            setTrainers(nextTrainers);
            setSchedules(nextSchedules);
            setBookings(nextBookings);
        } catch (reason) {
            setError(getErrorMessage(reason));
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        void load();
    }, [load]);
    const pendingBookings = bookings.filter((booking) => booking.status === 'pending');
    const recentBookings = [...bookings].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()).slice(0, 5);
    return <>
        <div className="page-heading">
            <div><p className="eyebrow">TỔNG QUAN VẬN HÀNH</p><h1>Dashboard</h1><p>Theo dõi nhanh hoạt động đặt lịch
                trên toàn hệ thống.</p></div>
            <button className="button button-ghost" onClick={() => void load()}>↻ Làm mới dữ liệu</button>
        </div>
        <DataState loading={loading} error={error} empty={false} onRetry={() => void load()}/>{!loading && !error && <>
        <div className="stat-grid"><StatCard label="Huấn luyện viên" value={trainers.length} accent="PT"/><StatCard
            label="Lịch tập đã tạo" value={schedules.length} accent="LỊCH"/><StatCard label="Tổng booking"
                                                                                      value={bookings.length}
                                                                                      accent="BOOKING"/><StatCard
            label="Chờ xác nhận" value={pendingBookings.length} accent="CẦN XỬ LÝ" danger/></div>
        <section className="panel">
            <div className="panel-heading">
                <div><p className="eyebrow">CẬP NHẬT MỚI NHẤT</p><h2>Booking gần đây</h2></div>
                <Link className="text-link" to="/bookings">Xem tất cả →</Link></div>
            {recentBookings.length === 0 ? <div className="empty-inline">Chưa có booking nào được tạo.</div> :
                <div className="table-wrap">
                    <table>
                        <thead>
                        <tr>
                            <th>Học viên</th>
                            <th>Huấn luyện viên</th>
                            <th>Thời gian</th>
                            <th>Thanh toán</th>
                            <th>Trạng thái</th>
                        </tr>
                        </thead>
                        <tbody>{recentBookings.map((booking) => <tr key={booking._id}>
                            <td><strong>{bookingUserName(booking)}</strong></td>
                            <td>{bookingTrainerName(booking)}</td>
                            <td>{formatDate(booking.date)}<small>{booking.timeSlot}</small></td>
                            <td>{formatCurrency(booking.totalPrice)}</td>
                            <td><BookingStatusBadge status={booking.status}/></td>
                        </tr>)}</tbody>
                    </table>
                </div>}</section>
    </>}</>;
}

function StatCard({label, value, accent, danger = false}: {
    label: string;
    value: number;
    accent: string;
    danger?: boolean
}) {
    return <article className={`stat-card ${danger ? 'stat-danger' : ''}`}><span>{accent}</span><strong>{value}</strong>
        <p>{label}</p></article>;
}
