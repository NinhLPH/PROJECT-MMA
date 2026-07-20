export function DataState({loading, error, empty, onRetry}: {
    loading: boolean;
    error?: string | null;
    empty: boolean;
    onRetry: () => void
}) {
    if (loading) return <div className="data-state"><span className="spinner"/>Đang tải dữ liệu…</div>;
    if (error) return <div className="data-state error-state"><strong>Không thể tải dữ
        liệu.</strong><span>{error}</span>
        <button className="button button-ghost" onClick={onRetry}>Thử lại</button>
    </div>;
    if (empty) return <div className="data-state"><strong>Chưa có dữ liệu.</strong><span>Hãy tạo bản ghi đầu tiên để bắt đầu quản lý.</span>
    </div>;
    return null;
}
