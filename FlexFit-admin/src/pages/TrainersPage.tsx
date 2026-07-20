import {useCallback, useEffect, useMemo, useState} from 'react';
import type {FormEvent} from 'react';
import {ConfirmDialog} from '../components/ConfirmDialog';
import {DataState} from '../components/DataState';
import {Modal} from '../components/Modal';
import {getErrorMessage} from '../services/api';
import {createTrainer, deleteTrainer, getTrainers, updateTrainer} from '../services/trainer.service';
import type {Trainer, TrainerInput} from '../types';
import {formatCurrency} from '../utils/formatters';

const emptyTrainer: TrainerInput = {fullName: '', avatar: '', specialty: '', bio: '', pricePerHour: 0};

export function TrainersPage() {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<TrainerInput>(emptyTrainer);
    const [editing, setEditing] = useState<Trainer | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [deleting, setDeleting] = useState<Trainer | null>(null);
    const [saving, setSaving] = useState(false);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setTrainers(await getTrainers());
        } catch (reason) {
            setError(getErrorMessage(reason));
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        void load();
    }, [load]);
    const visible = useMemo(() => trainers.filter((trainer) => `${trainer.fullName} ${trainer.specialty}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'))), [query, trainers]);

    function openCreate() {
        setError(null);
        setEditing(null);
        setForm(emptyTrainer);
        setFormOpen(true);
    }

    function openEdit(trainer: Trainer) {
        setError(null);
        setEditing(trainer);
        setForm({
            fullName: trainer.fullName,
            avatar: trainer.avatar,
            specialty: trainer.specialty,
            bio: trainer.bio,
            pricePerHour: trainer.pricePerHour
        });
        setFormOpen(true);
    }

    function closeForm() {
        setFormOpen(false);
        setEditing(null);
        setForm(emptyTrainer);
    }

    async function save(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (editing) await updateTrainer(editing._id, form); else await createTrainer(form);
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
            await deleteTrainer(deleting._id);
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
            <div><p className="eyebrow">ĐỘI NGŨ FLEXFIT</p><h1>Quản lý PT</h1><p>Tạo và cập nhật hồ sơ huấn luyện viên
                trên ứng dụng.</p></div>
            <button className="button button-primary" onClick={openCreate}>+ Thêm huấn luyện viên</button>
        </div>
        <section className="panel">
            <div className="table-toolbar"><input aria-label="Tìm PT" value={query}
                                                  onChange={(event) => setQuery(event.target.value)}
                                                  placeholder="Tìm theo tên hoặc chuyên môn…"/><span>{visible.length} PT</span>
            </div>
            <DataState loading={loading} error={error} empty={!loading && !error && visible.length === 0}
                       onRetry={() => void load()}/>{!loading && !error && visible.length > 0 &&
            <div className="table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>Huấn luyện viên</th>
                        <th>Chuyên môn</th>
                        <th>Giá / giờ</th>
                        <th>Giới thiệu</th>
                        <th/>
                    </tr>
                    </thead>
                    <tbody>{visible.map((trainer) => <tr key={trainer._id}>
                        <td>
                            <div className="person-cell"><img src={trainer.avatar} alt="" onError={(event) => {
                                event.currentTarget.style.visibility = 'hidden';
                            }}/><strong>{trainer.fullName}</strong></div>
                        </td>
                        <td>{trainer.specialty}</td>
                        <td>{formatCurrency(trainer.pricePerHour)}</td>
                        <td className="truncate">{trainer.bio}</td>
                        <td className="row-actions">
                            <button className="button button-ghost button-small" onClick={() => openEdit(trainer)}>Sửa
                            </button>
                            <button className="button button-danger button-small"
                                    onClick={() => setDeleting(trainer)}>Xóa
                            </button>
                        </td>
                    </tr>)}</tbody>
                </table>
            </div>}</section>
        {formOpen && <Modal title={editing ? 'Cập nhật huấn luyện viên' : 'Thêm huấn luyện viên'} onClose={closeForm}
                            wide><TrainerForm error={error} form={form} saving={saving} onChange={setForm}
                                              onClose={closeForm} onSubmit={save}/></Modal>}{deleting &&
        <ConfirmDialog title="Xóa huấn luyện viên"
                       description={`Bạn có chắc muốn xóa ${deleting.fullName}? PT có lịch hoặc booking liên quan sẽ không thể bị xóa.`}
                       confirmLabel="Xóa PT" danger loading={saving} onClose={() => setDeleting(null)}
                       onConfirm={() => void remove()}/>}</>;
}

function TrainerForm({error, form, saving, onChange, onClose, onSubmit}: {
    error: string | null;
    form: TrainerInput;
    saving: boolean;
    onChange: (form: TrainerInput) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent) => void
}) {
    const update = <K extends keyof TrainerInput>(key: K, value: TrainerInput[K]) => onChange({...form, [key]: value});
    return <form onSubmit={onSubmit} className="admin-form">{error &&
        <p className="form-error" role="alert">{error}</p>}
        <div className="form-grid"><label>Họ và tên<input required value={form.fullName}
                                                          onChange={(event) => update('fullName', event.target.value)}/></label><label>Chuyên
            môn<input required value={form.specialty} onChange={(event) => update('specialty', event.target.value)}
                      placeholder="Yoga, Boxing…"/></label><label className="form-span-2">Ảnh đại diện (URL)<input
            required type="url" value={form.avatar} onChange={(event) => update('avatar', event.target.value)}
            placeholder="https://…"/></label><label>Giá mỗi giờ (VNĐ)<input required min="0" type="number"
                                                                            value={form.pricePerHour}
                                                                            onChange={(event) => update('pricePerHour', Number(event.target.value))}/></label><label
            className="form-span-2">Giới thiệu<textarea required rows={4} value={form.bio}
                                                        onChange={(event) => update('bio', event.target.value)}/></label>
        </div>
        <div className="form-actions">
            <button type="button" className="button button-ghost" disabled={saving} onClick={onClose}>Hủy</button>
            <button className="button button-primary"
                    disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu huấn luyện viên'}</button>
        </div>
    </form>;
}
