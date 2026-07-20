import {Modal} from './Modal';

type ConfirmDialogProps = {
    title: string;
    description: string;
    confirmLabel: string;
    danger?: boolean;
    loading?: boolean;
    onConfirm: () => void;
    onClose: () => void
};

export function ConfirmDialog({
                                  title,
                                  description,
                                  confirmLabel,
                                  danger,
                                  loading,
                                  onConfirm,
                                  onClose
                              }: ConfirmDialogProps) {
    return <Modal title={title} onClose={onClose}><p className="dialog-copy">{description}</p>
        <div className="form-actions">
            <button className="button button-ghost" disabled={loading} onClick={onClose}>Quay lại</button>
            <button className={`button ${danger ? 'button-danger' : 'button-primary'}`} disabled={loading}
                    onClick={onConfirm}>{loading ? 'Đang xử lý…' : confirmLabel}</button>
        </div>
    </Modal>;
}
