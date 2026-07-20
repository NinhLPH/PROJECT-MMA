import type {ReactNode} from 'react';

type ModalProps = { title: string; children: ReactNode; onClose: () => void; wide?: boolean };

export function Modal({title, children, onClose, wide = false}: ModalProps) {
    return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
        <section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}
                 onMouseDown={(event) => event.stopPropagation()}>
            <header className="modal-header"><h2>{title}</h2>
                <button className="icon-button" onClick={onClose} aria-label="Đóng">×</button>
            </header>
            {children}</section>
    </div>;
}
