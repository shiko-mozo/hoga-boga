// Mock data — replace with calls to your own API.
// All names and values below are fictional placeholders.
window.ADMIN_DATA = {
  admin: { name: 'Admin User', email: 'admin@example.com' },
  currency: 'USD',

  // Sidebar: `children` makes a collapsible group. Labels are i18n keys or plain text.
  nav: [
    { key: 'overview', icon: 'layout-dashboard', href: '#overview' },
    { divider: true },
    { key: 'shifts', icon: 'calendar-clock', href: '#shifts' },
    { key: 'workHours', icon: 'timer', href: '#work-hours' },
    { key: 'rides', icon: 'car', children: [
      { key: 'allRides', icon: 'list', href: '#rides' },
      { key: 'liveMap', icon: 'map', href: '#rides/map' },
      { key: 'disputes', icon: 'shield-alert', href: '#rides/disputes' },
    ] },
    { key: 'users', icon: 'users', children: [
      { key: 'customers', icon: 'user', href: '#users/customers' },
      { key: 'drivers', icon: 'id-card', href: '#users/drivers' },
      { key: 'admins', icon: 'shield', href: '#users/admins' },
    ] },
    { key: 'stores', icon: 'store', href: '#stores' },
    { key: 'errands', icon: 'shopping-bag', href: '#errands' },
    { key: 'instant', icon: 'zap', href: '#instant' },
    { key: 'billing', icon: 'receipt', href: '#billing' },
    { key: 'support', icon: 'life-buoy', href: '#support' },
    { key: 'vehicles', icon: 'truck', href: '#vehicles' },
    { key: 'finance', icon: 'wallet', open: true, children: [
      { key: 'wallets', icon: 'wallet-cards', href: '#finance/wallets' },
      { key: 'withdrawals', icon: 'arrow-up-from-line', href: '#finance/withdrawals' },
      { key: 'topupRequests', icon: 'arrow-down-to-line', href: '#finance/topups' },
      { key: 'topupMethods', icon: 'coins', href: '#finance/topup-methods' },
      { key: 'paymentMethods', icon: 'credit-card', href: '#finance/payment-methods' },
      { key: 'gateways', icon: 'plug', href: '#finance/gateways' },
    ] },
    { key: 'content', icon: 'file-text', href: '#content' },
    { key: 'settings', icon: 'settings', href: '#settings' },
    { key: 'appearance', icon: 'palette', href: '#appearance' },
    { key: 'operations', icon: 'activity', href: '#operations' },
    { key: 'marketing', icon: 'megaphone', href: '#marketing' },
  ],

  kpis: [
    { key: 'todayRides', icon: 'car', color: '#567DF4', value: 42, delta: 12 },
    { key: 'todayRevenue', icon: 'banknote', color: '#10B981', value: 1840.5, money: true, delta: -4 },
    { key: 'weekRevenue', icon: 'trending-up', color: '#8B5CF6', value: 12930.2, money: true, delta: 8 },
    { key: 'onlineDrivers', icon: 'radio', color: '#F59E0B', value: 18, of: 64, live: true },
    { key: 'customers', icon: 'users', color: '#06B6D4', value: 5120 },
    { key: 'suspicious', icon: 'shield-alert', color: '#EF4444', value: 2 },
  ],

  performance: { completion: 78.4, cancel: 21.6, rating: 4.7 },

  status: [
    { key: 'completed', value: 612, color: '#10B981' },
    { key: 'cancelled', value: 169, color: '#EF4444' },
    { key: 'ongoing', value: 11, color: '#567DF4' },
  ],

  hourly: [0,0,1,0,0,1,2,4,6,5,3,4,6,7,5,4,3,5,6,4,3,2,1,0],

  topDrivers: [
    { name: 'Driver One', rides: 21, revenue: 820.4, rating: 4.9 },
    { name: 'Driver Two', rides: 18, revenue: 701.1, rating: 4.8 },
    { name: 'Driver Three', rides: 15, revenue: 598.0, rating: 4.7 },
    { name: 'Driver Four', rides: 12, revenue: 455.3, rating: 4.6 },
    { name: 'Driver Five', rides: 9, revenue: 371.9, rating: 4.9 },
  ],

  summary: [
    { key: 'totalRides', icon: 'car', color: '#567DF4', value: 8240 },
    { key: 'totalRevenue', icon: 'banknote', color: '#10B981', value: 312004.12, money: true },
    { key: 'monthRevenue', icon: 'calendar', color: '#8B5CF6', value: 40211.0, money: true },
    { key: 'activeDrivers', icon: 'id-card', color: '#F59E0B', value: 64 },
    { key: 'suspended', icon: 'ban', color: '#EF4444', value: 1 },
    { key: 'pendingApproval', icon: 'hourglass', color: '#06B6D4', value: 7, link: '#users/drivers?status=pending' },
    { key: 'pendingReports', icon: 'flag', color: '#EC4899', value: 0 },
  ],

  recentRides: [
    { id: 1050, status: 'completed', customer: 'Customer A', driver: 'Driver One', from: 'Main St — Downtown', fare: 18.25, at: '2026-10-08T09:40:00' },
    { id: 1049, status: 'cancelled', customer: 'Customer B', driver: null, from: 'Park Ave — Riverside', fare: 12.0, at: '2026-10-08T09:12:00' },
    { id: 1048, status: 'ongoing', customer: 'Customer C', driver: 'Driver Two', from: 'Station Rd — Old Town', fare: 22.7, at: '2026-10-08T08:55:00' },
    { id: 1047, status: 'completed', customer: 'Customer D', driver: 'Driver Three', from: 'Harbor Blvd — Marina', fare: 9.5, at: '2026-10-08T08:21:00' },
    { id: 1046, status: 'cancelled', customer: 'Customer E', driver: 'Driver Four', from: 'Hill St — Uptown', fare: 15.1, at: '2026-10-08T07:47:00' },
    { id: 1045, status: 'completed', customer: 'Customer F', driver: 'Driver Five', from: 'Lake Rd — Northside', fare: 30.0, at: '2026-10-08T07:03:00' },
  ],

  recentUsers: [
    { name: 'New User 1', email: 'user1@example.com', role: 'customer', at: '2026-10-08T09:39:00' },
    { name: 'New User 2', email: null, role: 'customer', at: '2026-10-08T09:10:00' },
    { name: 'New Driver', email: 'driver@example.com', role: 'driver', at: '2026-10-08T08:30:00' },
    { name: 'New User 3', email: 'user3@example.com', role: 'customer', at: '2026-10-08T07:58:00' },
    { name: 'New User 4', email: null, role: 'customer', at: '2026-10-08T07:12:00' },
  ],
};
