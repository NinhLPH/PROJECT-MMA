export const navigationItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/trainers', label: 'Quản lý PT', end: false },
  { to: '/schedules', label: 'Lịch tập', end: false },
  { to: '/bookings', label: 'Đặt lịch', end: false },
] as const;
