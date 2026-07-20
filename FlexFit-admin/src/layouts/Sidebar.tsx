import {NavLink} from 'react-router-dom';
import {navigationItems} from '../constants/navigation';

export function Sidebar() {
    return (
        <aside className="sidebar">
            <NavLink className="brand" to="/">
                <span className="brand-mark">FF</span>
                <span><strong>FLEXFIT</strong><small>ADMIN CONSOLE</small></span>
            </NavLink>
            <nav className="sidebar-nav" aria-label="Điều hướng quản trị">
                <p className="nav-caption">QUẢN TRỊ HỆ THỐNG</p>
                {navigationItems.map((item) => (
                    <NavLink key={item.to} end={item.end} to={item.to}
                             className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                        {item.label}
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-footer">FLEXFIT PLATFORM<br/><span>Admin workspace · v1.0</span></div>
        </aside>
    );
}
