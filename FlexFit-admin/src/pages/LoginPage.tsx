import {useState} from 'react';
import type {FormEvent} from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import {getSession, getErrorMessage} from '../services/api';
import {loginAdmin} from '../services/auth.service';

export function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    if (getSession()?.user.role === 'admin') return <Navigate replace to="/"/>;

    async function submit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await loginAdmin(email.trim(), password);
            navigate('/', {replace: true});
        } catch (reason) {
            setError(getErrorMessage(reason));
        } finally {
            setLoading(false);
        }
    }

    return <main className="login-page">
        <section className="login-intro"><span className="brand-mark">FF</span><p className="header-kicker">FLEXFIT
            MANAGEMENT</p><h1>Quản lý vận hành.<br/><em>Kiểm soát từng lịch tập.</em></h1><p>Đăng nhập bằng tài khoản
            quản trị để quản lý PT, lịch tập và các booking của học viên.</p></section>
        <form className="login-card" onSubmit={submit}><p className="header-kicker">ADMIN SIGN IN</p><h2>Chào mừng trở
            lại</h2>
            {error &&
                <p className="form-error" role="alert">{error}</p>}<label>Email<input required type="email"
                                                                                      autoComplete="email" value={email}
                                                                                      onChange={(event) => setEmail(event.target.value)}
                                                                                      placeholder="admin@flexfit.vn"/></label><label>Mật
                khẩu<input required minLength={6} type="password" autoComplete="current-password" value={password}
                           onChange={(event) => setPassword(event.target.value)} placeholder="••••••••"/></label>
            <button className="button button-primary button-full"
                    disabled={loading}>{loading ? 'Đang đăng nhập…' : 'Vào trang quản trị'}</button>
        </form>
    </main>;
}
