import {useNavigate} from 'react-router-dom';
import {logoutAdmin} from '../services/auth.service';
import type {User} from '../types';

export function Header({user}: { user: User }) {
    const navigate = useNavigate();
    const initials = user.fullName.split(/\s+/).map((part) => part[0]).join('').slice(-2).toUpperCase();

    function handleLogout() {
        logoutAdmin();
        navigate('/login', {replace: true});
    }

    return (
        <header className="top-header">
            <div><p className="header-kicker">FLEXFIT MANAGEMENT</p><p className="header-title">Không gian quản trị</p>
            </div>
            <div className="admin-actions">
                <div className="admin-identity"><span
                    className="avatar">{initials}</span><span><strong>{user.fullName}</strong><small>QUẢN TRỊ VIÊN</small></span>
                </div>
                <button className="button button-ghost" onClick={handleLogout}>Đăng xuất</button>
            </div>
        </header>
    );
}
