import {useCallback, useEffect, useMemo, useState} from 'react';
import type {FormEvent} from 'react';
import {ConfirmDialog} from '../components/ConfirmDialog';
import {DataState} from '../components/DataState';
import {Modal} from '../components/Modal';
import {getErrorMessage} from '../services/api';
import {createSchedule, deleteSchedule, getSchedules, updateSchedule} from '../services/schedule.service';
import {getTrainers} from '../services/trainer.service';
import type {Schedule, ScheduleInput, Trainer} from '../types';
import {formatDate, trainerIdOf, trainerNameOf} from '../utils/formatters';

const emptySchedule: ScheduleInput = {trainerId: '', date: '', timeSlot: ''};

export function SchedulesPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<Schedule | null>(null);
    const [form, setForm] = useState<ScheduleInput>(emptySchedule);
    const [formOpen, setFormOpen] = useState(false);
    const [deleting, setDeleting] = useState<Schedule | null>(null);
    const [saving, setSaving] = useState(false);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [nextSchedules, nextTrainers] = await Promise.all([getSchedules(), getTrainers()]);
            setSchedules(nextSchedules);
            setTrainers(nextTrainers);
        } catch (reason) {
            setError(getErrorMessage(reason));
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        void load();
    }, [load]);
    const ordered = useMemo(() => [...schedules].sort((first, second) => `${first.date}-${first.timeSlot}`.localeCompare(`${second.date}-${second.timeSlot}`)), [schedules]);

    function openCreate() {
        setError(null);
        setEditing(null);
        setForm(emptySchedule);
        setFormOpen(true);
    }

    function openEdit(schedule: Schedule) {
        setError(null);
        setEditing(schedule);
        setForm({trainerId: trainerIdOf(schedule.trainerId), date: schedule.date, timeSlot: schedule.timeSlot});
        setFormOpen(true);
    }

    function closeForm() {
        setFormOpen(false);
        setEditing(null);
        setForm(emptySchedule);
    }

    async function save(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (editing) await updateSchedule(editing._id, form); else await createSchedule(form);
            closeForm();
            await load();
        } catch (reason) {
            setError(getErrorMessage(reason));
        } finally {
            setSaving(false);
        }
    }

    async function remove() {
        if (!deleting) return;
        setSaving(true);
        try {
            await deleteSchedule(deleting._id);
            setDeleting(null);
            await load();
        } catch (reason) {
            setError(getErrorMessage(reason));
            setDeleting(null);
        } finally {
            setSaving(false);
        }
    }

    return <>
        <div className="page-heading">
            <div><p className="eyebrow">LỊCH TRỐNG CỦA PT</p><h1>Quản lý lịch tập</h1><p>Thiết lập khung giờ để học viên
                có thể đặt lịch tập.</p></div>
            <button className="button button-primary" onClick={openCreate}>+ Tạo lịch tập</button>
        </div>
        <section className="panel"><DataState loading={loading} error={error}
                                              empty={!loading && !error && ordered.length === 0}
                                              onRetry={() => void load()}/>{!loading && !error && ordered.length > 0 &&
            <div className="table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>Huấn luyện viên</th>
                        <th>Ngày tập</th>
                        <th>Khung giờ</th>
                        <th>Trạng thái</th>
                        <th/>
                    </tr>
                    </thead>
                    <tbody>{ordered.map((schedule) => <tr key={schedule._id}>
                        <td><strong>{trainerNameOf(schedule.trainerId, trainers)}</strong></td>
                        <td>{formatDate(schedule.date)}</td>
                        <td>{schedule.timeSlot}</td>
                        <td><span
                            className={`status-badge ${schedule.isBooked ? 'status-confirmed' : 'status-paid'}`}>{schedule.isBooked ? 'Đã được đặt' : 'Còn trống'}</span>
                        </td>
                        <td className="row-actions">
                            <button className="button button-ghost button-small" disabled={schedule.isBooked}
                                    title={schedule.isBooked ? 'Không thể sửa lịch đã được đặt' : undefined}
                                    onClick={() => openEdit(schedule)}>Sửa
                            </button>
                            <button className="button button-danger button-small" disabled={schedule.isBooked}
                                    title={schedule.isBooked ? 'Không thể xóa lịch đã được đặt' : undefined}
                                    onClick={() => setDeleting(schedule)}>Xóa
                            </button>
                        </td>
                    </tr>)}</tbody>
                </table>
            </div>}</section>
        {formOpen && <Modal title={editing ? 'Cập nhật lịch tập' : 'Tạo lịch tập'} onClose={closeForm}><ScheduleForm
            error={error} form={form} trainers={trainers} saving={saving} onChange={setForm} onClose={closeForm}
            onSubmit={save}/></Modal>}{deleting && <ConfirmDialog title="Xóa lịch tập"
                                                                  description="Bạn có chắc muốn xóa khung giờ này? Hành động không thể hoàn tác."
                                                                  confirmLabel="Xóa lịch" danger loading={saving}
                                                                  onClose={() => setDeleting(null)}
                                                                  onConfirm={() => void remove()}/>}</>;
}

function ScheduleForm({error, form, trainers, saving, onChange, onClose, onSubmit}: {
    error: string | null;
    form: ScheduleInput;
    trainers: Trainer[];
    saving: boolean;
    onChange: (form: ScheduleInput) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent) => void
}) {
    const update = <K extends keyof ScheduleInput>(key: K, value: ScheduleInput[K]) => onChange({
        ...form,
        [key]: value
    });
    return <form onSubmit={onSubmit} className="admin-form">{error &&
        <p className="form-error" role="alert">{error}</p>}<label>Huấn luyện viên<select required value={form.trainerId}
                                                                                         onChange={(event) => update('trainerId', event.target.value)}>
        <option value="">Chọn huấn luyện viên</option>
        {trainers.map((trainer) => <option key={trainer._id}
                                           value={trainer._id}>{trainer.fullName} · {trainer.specialty}</option>)}
    </select></label>
        <div className="form-grid"><label>Ngày tập<input required type="date" value={form.date}
                                                         onChange={(event) => update('date', event.target.value)}/></label><label>Khung
            giờ<input required pattern="^([01]\\d|2[0-3]):[0-5]\\d\\s*-\\s*([01]\\d|2[0-3]):[0-5]\\d$"
                      value={form.timeSlot} onChange={(event) => update('timeSlot', event.target.value)}
                      placeholder="08:00 - 09:30"/></label></div>
        <p className="input-hint">Dùng định dạng 24 giờ, ví dụ: 08:00 - 09:30.</p>
        <div className="form-actions">
            <button type="button" className="button button-ghost" disabled={saving} onClick={onClose}>Hủy</button>
            <button className="button button-primary" disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu lịch tập'}</button>
        </div>
    </form>;
}
