import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { getSession } from './services/api';
import { AdminLayout } from './layouts/AdminLayout';
import { BookingsPage } from './pages/BookingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SchedulesPage } from './pages/SchedulesPage';
import { TrainersPage } from './pages/TrainersPage';

function ProtectedRoutes() {
  const session = getSession();
  if (!session || session.user.role !== 'admin') return <Navigate replace to="/login" />;
  return <AdminLayout><Outlet /></AdminLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/trainers" element={<TrainersPage />} />
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
