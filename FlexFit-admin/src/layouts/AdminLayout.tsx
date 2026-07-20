import type {ReactNode} from 'react';
import {Navigate} from 'react-router-dom';
import {getSession} from '../services/api';
import {Header} from './Header';
import {Sidebar} from './Sidebar';

export function AdminLayout({children}: { children: ReactNode }) {
    const session = getSession();
    if (!session) return <Navigate replace to="/login"/>;
    return <div className="admin-shell"><Sidebar/>
        <main className="main-panel"><Header user={session.user}/>
            <section className="content-area">{children}</section>
        </main>
    </div>;
}
