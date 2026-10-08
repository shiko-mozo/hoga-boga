(function () {
  const D = window.ADMIN_DATA;

  // ---------- i18n ----------
  const STR = {
    en: {
      appName: 'Admin Console', welcome: 'Welcome', logout: 'Logout', search: 'Search…',
      overview: 'Overview', overviewSub: 'Dashboard & KPIs', updated: 'Updated',
      shifts: 'Shifts', workHours: 'Work Hours Reports', rides: 'Ride Management', allRides: 'All Rides',
      liveMap: 'Live Map', disputes: 'Disputes', users: 'Users Management', customers: 'Customers',
      drivers: 'Drivers', admins: 'Admins', stores: 'Stores Management', errands: 'Errands Management',
      instant: 'Instant Delivery', billing: 'Billing & Plans', support: 'Support', vehicles: 'Vehicles & Pricing',
      finance: 'Finance & Payments', wallets: 'Wallets', withdrawals: 'Driver Withdrawals',
      topupRequests: 'Topup Requests', topupMethods: 'Topup Methods', paymentMethods: 'Payment Methods',
      gateways: 'Payment Gateways', content: 'Content', settings: 'System Settings', appearance: 'Appearance',
      operations: 'Operations', marketing: 'Marketing',
      todayRides: "Today's Rides", todayRevenue: "Today's Revenue", weekRevenue: 'Week Revenue',
      onlineDrivers: 'Online Drivers', suspicious: 'Suspicious (7d)',
      perf30: 'Performance (30d)', completion: 'Completion', cancel: 'Cancel', rating: 'Rating',
      status30: 'Ride Status (30d)', completed: 'Completed', cancelled: 'Cancelled', ongoing: 'Ongoing',
      hourly: "Today's Hourly Rides", noRides: 'No rides yet today', ridesAt: 'rides at',
      topDrivers: 'Top Drivers (this week)', ridesWord: 'rides',
      summary: 'Quick Summary', totalRides: 'Total rides', totalRevenue: 'Total revenue',
      monthRevenue: 'Month revenue', activeDrivers: 'Active drivers', suspended: 'Suspended',
      pendingApproval: 'Pending approval', pendingReports: 'Pending reports',
      recentRides: 'Recent Rides', recentUsers: 'Recent Users', all: 'All', customer: 'Customer', driver: 'Driver',
      empty: 'Nothing to show',
    },
    ar: {
      appName: 'لوحة التحكم', welcome: 'مرحباً', logout: 'تسجيل الخروج', search: 'بحث…',
      overview: 'نظرة عامة', overviewSub: 'لوحة المؤشرات', updated: 'آخر تحديث',
      shifts: 'الشفتات', workHours: 'تقارير ساعات العمل', rides: 'إدارة الرحلات', allRides: 'كل الرحلات',
      liveMap: 'الخريطة المباشرة', disputes: 'النزاعات', users: 'إدارة المستخدمين', customers: 'العملاء',
      drivers: 'السائقون', admins: 'المشرفون', stores: 'إدارة المتاجر', errands: 'إدارة المشاوير',
      instant: 'التوصيل الفوري', billing: 'الفوترة والخطط', support: 'الدعم الفني', vehicles: 'المركبات والتسعير',
      finance: 'المالية والمدفوعات', wallets: 'المحافظ', withdrawals: 'سحوبات السائقين',
      topupRequests: 'طلبات الشحن', topupMethods: 'طرق الشحن', paymentMethods: 'طرق الدفع',
      gateways: 'بوابات الدفع', content: 'المحتوى', settings: 'إعدادات النظام', appearance: 'المظهر',
      operations: 'العمليات', marketing: 'التسويق',
      todayRides: 'رحلات اليوم', todayRevenue: 'إيراد اليوم', weekRevenue: 'إيراد الأسبوع',
      onlineDrivers: 'السائقون المتصلون', suspicious: 'مشبوه (7 أيام)',
      perf30: 'الأداء (30 يوم)', completion: 'الإكمال', cancel: 'الإلغاء', rating: 'التقييم',
      status30: 'حالة الرحلات (30 يوم)', completed: 'مكتملة', cancelled: 'ملغاة', ongoing: 'جارية',
      hourly: 'الرحلات حسب الساعة اليوم', noRides: 'لا توجد رحلات اليوم', ridesAt: 'رحلات عند',
      topDrivers: 'أفضل السائقين (هذا الأسبوع)', ridesWord: 'رحلات',
      summary: 'ملخص سريع', totalRides: 'إجمالي الرحلات', totalRevenue: 'إجمالي الإيراد',
      monthRevenue: 'إيراد الشهر', activeDrivers: 'السائقون النشطون', suspended: 'موقوف',
      pendingApproval: 'بانتظار الموافقة', pendingReports: 'بلاغات معلقة',
      recentRides: 'أحدث الرحلات', recentUsers: 'أحدث المستخدمين', all: 'الكل', customer: 'عميل', driver: 'سائق',
      empty: 'لا يوجد شيء',
    },
  };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  let lang = store.get('admin.lang') === 'ar' ? 'ar' : 'en';
  const t = (k) => (STR[lang] && STR[lang][k]) || STR.en[k] || k;

  // ---------- helpers ----------
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const locale = () => (lang === 'ar' ? 'ar' : 'en-US');
  const num = (v, d = 0) => Number(v).toLocaleString(locale(), { minimumFractionDigits: d, maximumFractionDigits: d });
  const money = (v) => `${num(v, 2)} ${D.currency}`;
  const time = (iso) => new Date(iso).toLocaleString(locale(), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const icon = (name, cls = 'w-4 h-4') => `<i data-lucide="${name}" class="${cls}"></i>`;
  const STATUS = {
    completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    cancelled: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    ongoing: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  };

  // ---------- sidebar ----------
  const openGroups = new Set(D.nav.filter((n) => n.open).map((n) => n.key));
  function currentHash() { return location.hash || '#overview'; }

  function renderNav() {
    const h = currentHash();
    $('#nav').innerHTML = D.nav.map((n) => {
      if (n.divider) return '<div class="border-t border-gray-100 dark:border-white/[0.06] my-2 mx-1"></div>';
      if (!n.children) {
        return `<a href="${n.href}" class="nav-item mb-0.5 ${h === n.href ? 'active' : ''}">${icon(n.icon)}<span class="flex-1 text-start">${esc(t(n.key))}</span></a>`;
      }
      const childActive = n.children.some((c) => h.startsWith(c.href));
      const open = openGroups.has(n.key) || childActive;
      return `<div class="mb-0.5">
        <button data-group="${n.key}" class="nav-item ${childActive ? 'text-gray-900 dark:text-white' : ''}" aria-expanded="${open}">
          ${icon(n.icon)}<span class="flex-1 text-start">${esc(t(n.key))}</span>
          ${icon('chevron-down', `w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`)}
        </button>
        <div class="${open ? '' : 'hidden'} ms-[18px] border-s border-gray-200 dark:border-white/[0.08] mt-0.5 mb-1">
          ${n.children.map((c) => `<a href="${c.href}" class="nav-sub ${h.startsWith(c.href) ? '!text-brand font-medium' : ''}">${icon(c.icon, 'w-3.5 h-3.5')}<span class="flex-1 text-start">${esc(t(c.key))}</span></a>`).join('')}
        </div>
      </div>`;
    }).join('');
  }

  $('#nav').addEventListener('click', (e) => {
    const g = e.target.closest('[data-group]');
    if (g) {
      const k = g.dataset.group;
      openGroups.has(k) ? openGroups.delete(k) : openGroups.add(k);
      renderNav(); lucide.createIcons();
    } else if (e.target.closest('a')) {
      toggleSidebar(false);
    }
  });

  function toggleSidebar(show) {
    const sb = $('#sidebar');
    sb.classList.toggle('-translate-x-full', !show);
    sb.classList.toggle('rtl:translate-x-full', !show);
    sb.classList.toggle('translate-x-0', show);
    $('#backdrop').classList.toggle('hidden', !show);
  }
  $('#openSidebar').onclick = () => toggleSidebar(true);
  $('#closeSidebar').onclick = () => toggleSidebar(false);
  $('#backdrop').onclick = () => toggleSidebar(false);
  window.addEventListener('hashchange', () => { renderNav(); lucide.createIcons(); });

  // ---------- widgets ----------
  function renderKpis() {
    $('#kpis').innerHTML = D.kpis.map((k) => {
      let badge = '';
      if (k.live) badge = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>';
      else if (typeof k.delta === 'number') {
        const up = k.delta >= 0;
        badge = `<span class="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${up ? STATUS.completed : STATUS.cancelled}">
          ${icon(up ? 'arrow-up-right' : 'arrow-down-right', 'w-3 h-3')}${Math.abs(k.delta)}%</span>`;
      }
      const val = k.money ? money(k.value) : num(k.value);
      return `<div class="card p-3">
        <div class="flex items-center gap-2 mb-2 justify-between">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:${k.color}1a;color:${k.color}">${icon(k.icon)}</div>
          ${badge}
        </div>
        <div class="text-[17px] font-bold">${val}${k.of ? `<span class="text-[12px] text-gray-400 font-normal">/${num(k.of)}</span>` : ''}</div>
        <div class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">${esc(t(k.key))}</div>
      </div>`;
    }).join('');
  }

  function ring(value, max, color, label, suffix) {
    const r = 26, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(1, value / max));
    return `<div class="flex flex-col items-center gap-1">
      <div class="relative w-16 h-16">
        <svg viewBox="0 0 64 64" class="w-16 h-16 -rotate-90">
          <circle cx="32" cy="32" r="${r}" fill="none" stroke="currentColor" stroke-width="6" class="text-gray-100 dark:text-white/[0.06]"/>
          <circle cx="32" cy="32" r="${r}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"
            stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" style="transition:stroke-dashoffset .8s"/>
        </svg>
        <div class="absolute inset-0 flex items-center justify-center text-[14px] font-bold">${suffix(value)}</div>
      </div>
      <span class="text-[10px] font-medium text-gray-400">${esc(label)}</span>
    </div>`;
  }

  function renderPerformance() {
    const p = D.performance;
    $('#rings').innerHTML =
      ring(p.completion, 100, '#10B981', t('completion'), (v) => `${num(v, 1)}%`) +
      ring(p.cancel, 100, '#EF4444', t('cancel'), (v) => `${num(v, 1)}%`) +
      ring(p.rating, 5, '#F59E0B', t('rating'), (v) => `${num(v, 1)}★`);
  }

  function renderStatus() {
    const total = D.status.reduce((a, s) => a + s.value, 0) || 1;
    $('#statusBars').innerHTML = D.status.map((s) => {
      const pct = Math.round((s.value / total) * 100);
      return `<div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full flex-shrink-0" style="background:${s.color}"></span>
        <span class="text-[11px] text-gray-600 dark:text-gray-400 flex-1">${esc(t(s.key))}</span>
        <span class="text-[11px] font-semibold">${num(s.value)}</span>
        <div class="w-20 h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
          <div class="h-full rounded-full" style="width:${pct}%;background:${s.color}"></div>
        </div>
        <span class="text-[9px] text-gray-400 w-8 text-end">${pct}%</span>
      </div>`;
    }).join('');
  }

  function renderHourly() {
    const max = Math.max(...D.hourly);
    const el = $('#hourly');
    if (!max) { el.innerHTML = `<div class="w-full text-[11px] text-gray-400 text-center self-center">${t('noRides')}</div>`; return; }
    const nowH = new Date().getHours();
    el.innerHTML = D.hourly.map((v, h) =>
      `<div class="flex-1 rounded-t-sm ${h === nowH ? 'bg-brand' : 'bg-brand/40 hover:bg-brand/70'}"
        style="height:${Math.max(2, (v / max) * 100)}%" title="${v} ${t('ridesAt')} ${h}:00"></div>`).join('');
  }

  function renderTopDrivers() {
    const rank = ['bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
                  'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-300',
                  'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400'];
    $('#topDrivers').innerHTML = D.topDrivers.map((d, i) => `
      <div class="bg-gray-50/80 dark:bg-white/[0.03] rounded-lg flex items-center gap-3 px-3 py-2">
        <div class="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold ${rank[i] || 'bg-brand/10 text-brand'}">${i + 1}</div>
        <div class="flex-1 min-w-0">
          <div class="text-[12px] font-semibold truncate">${esc(d.name)}</div>
          <div class="text-[10px] text-gray-400">${num(d.rides)} ${t('ridesWord')} · ${money(d.revenue)}</div>
        </div>
        <div class="flex items-center gap-0.5 text-amber-500">${icon('star', 'w-3 h-3 fill-current')}<span class="text-[11px] font-semibold">${num(d.rating, 1)}</span></div>
      </div>`).join('');
  }

  function renderSummary() {
    $('#summary').innerHTML = D.summary.map((s) => {
      const row = `<div class="w-6 h-6 rounded-md flex items-center justify-center" style="background:${s.color}1a;color:${s.color}">${icon(s.icon, 'w-3.5 h-3.5')}</div>
        <span class="text-[11px] text-gray-500 dark:text-gray-400 flex-1">${esc(t(s.key))}</span>
        <span class="text-[12px] font-bold">${s.money ? money(s.value) : num(s.value)}</span>`;
      return s.link && s.value
        ? `<a href="${s.link}" class="flex items-center gap-2.5 rounded-md -mx-1 px-1 hover:bg-gray-50 dark:hover:bg-white/[0.03]">${row}${icon(lang === 'ar' ? 'chevron-left' : 'chevron-right', 'w-3 h-3 text-gray-400')}</a>`
        : `<div class="flex items-center gap-2.5">${row}</div>`;
    }).join('');
  }

  let rideFilter = 'all', query = '';
  function renderRideFilter() {
    $('#rideFilter').innerHTML = ['all', 'completed', 'cancelled', 'ongoing'].map((f) =>
      `<button data-f="${f}" class="px-2 py-0.5 rounded-md ${f === rideFilter ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.05]'}">${esc(t(f))}</button>`).join('');
  }
  $('#rideFilter').addEventListener('click', (e) => {
    const b = e.target.closest('[data-f]'); if (!b) return;
    rideFilter = b.dataset.f; renderRideFilter(); renderRides(); lucide.createIcons();
  });

  function matches(...fields) {
    return !query || fields.some((f) => f && String(f).toLowerCase().includes(query));
  }

  function renderRides() {
    const rows = D.recentRides
      .filter((r) => rideFilter === 'all' || r.status === rideFilter)
      .filter((r) => matches(r.id, r.customer, r.driver, r.from));
    $('#recentRides').innerHTML = rows.length ? rows.map((r) => `
      <a href="#rides/${r.id}" class="flex items-center gap-3 py-2 px-1 -mx-1 rounded-md hover:bg-gray-50 dark:hover:bg-white/[0.03]">
        <span class="text-[11px] font-mono text-gray-400 w-12">#${r.id}</span>
        <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${STATUS[r.status]}">${esc(t(r.status))}</span>
        <div class="flex-1 min-w-0">
          <div class="text-[12px] font-medium truncate">${esc(r.customer)}${r.driver ? ` · <span class="text-gray-400">${esc(r.driver)}</span>` : ''}</div>
          <div class="text-[10px] text-gray-400 truncate flex items-center gap-1">${icon('map-pin', 'w-3 h-3 flex-shrink-0')}${esc(r.from)}</div>
        </div>
        <div class="text-end">
          <div class="text-[12px] font-semibold">${money(r.fare)}</div>
          <div class="text-[10px] text-gray-400">${time(r.at)}</div>
        </div>
      </a>`).join('') : `<div class="text-[11px] text-gray-400 text-center py-6">${t('empty')}</div>`;
  }

  function renderUsers() {
    const rows = D.recentUsers.filter((u) => matches(u.name, u.email));
    $('#recentUsers').innerHTML = rows.length ? rows.map((u) => `
      <div class="flex items-center gap-2.5 py-1.5">
        <div class="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-[12px] font-bold">${esc((u.name || '?').charAt(0))}</div>
        <div class="flex-1 min-w-0">
          <div class="text-[12px] font-medium truncate">${esc(u.name)}</div>
          <div class="text-[10px] text-gray-400 truncate">${esc(u.email || '—')}</div>
        </div>
        <div class="text-end">
          <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded ${u.role === 'driver' ? STATUS.ongoing : 'bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-gray-400'}">${esc(t(u.role))}</span>
          <div class="text-[9px] text-gray-400 mt-0.5">${time(u.at)}</div>
        </div>
      </div>`).join('') : `<div class="text-[11px] text-gray-400 text-center py-6">${t('empty')}</div>`;
  }

  // ---------- chrome ----------
  function applyStatic() {
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $('#langLabel').textContent = lang === 'ar' ? 'AR' : 'EN';
    $('#adminName').textContent = D.admin.name;
    $('#adminEmail').textContent = D.admin.email;
    $('#welcomeName').textContent = D.admin.name;
    $('#updatedAt').textContent = `${t('updated')} ${new Date().toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' })}`;
  }

  function renderAll() {
    applyStatic(); renderNav(); renderKpis(); renderPerformance(); renderStatus(); renderHourly();
    renderTopDrivers(); renderSummary(); renderRideFilter(); renderRides(); renderUsers();
    lucide.createIcons();
  }

  $('#themeBtn').onclick = () => {
    const dark = document.documentElement.classList.toggle('dark');
    store.set('admin.theme', dark ? 'dark' : 'light');
  };
  $('#langBtn').onclick = () => {
    lang = lang === 'en' ? 'ar' : 'en';
    store.set('admin.lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    renderAll();
  };
  $('#refreshBtn').onclick = () => {
    // Hook your API fetch in here, then call renderAll().
    renderAll();
  };
  $('#search').addEventListener('input', (e) => {
    query = e.target.value.trim().toLowerCase(); renderRides(); renderUsers(); lucide.createIcons();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); $('#search').focus(); }
    if (e.key === 'Escape') toggleSidebar(false);
  });

  renderAll();
})();
