// admin.js - Super Admin Dashboard Panel Logic

document.addEventListener('DOMContentLoaded', () => {
  const loginBox = document.getElementById('admin-login-box');
  const dashboardBox = document.getElementById('admin-dashboard-box');
  const loginForm = document.getElementById('admin-login-form');
  const errorMsg = document.getElementById('login-error-msg');
  const togglePassBtn = document.getElementById('toggle-pass-visibility');
  const passInput = document.getElementById('admin-pass');
  const logoutBtn = document.getElementById('btn-admin-logout');
  const clearLogsBtn = document.getElementById('btn-clear-logs');
  const tableBody = document.getElementById('logs-table-body');

  const bookingsTableBody = document.getElementById('bookings-table-body');
  const paymentsTableBody = document.getElementById('payments-table-body');
  const dashboardTitle = document.getElementById('dashboard-title');
  const toastNotification = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');

  let activeTab = 'inquiries';

  initAdmin();

  function initAdmin() {
    checkAuth();
    setupTabSwitching();
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function checkAuth() {
    const isAuth = sessionStorage.getItem('superadmin_authenticated') === 'true';
    if (isAuth) {
      if (loginBox) loginBox.classList.add('hidden');
      if (dashboardBox) dashboardBox.classList.remove('hidden');
      renderActiveTab();
    } else {
      if (loginBox) loginBox.classList.remove('hidden');
      if (dashboardBox) dashboardBox.classList.add('hidden');
    }
  }

  function showToast(msg) {
    if (!toastMessage || !toastNotification) return;
    toastMessage.textContent = msg;
    toastNotification.classList.add('active');
    setTimeout(() => {
      toastNotification.classList.remove('active');
    }, 3000);
  }

  // Handle Authentication submit via Server API
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('admin-user').value.trim();
      const password = passInput.value.trim();

      try {
        const res = await fetch('http://localhost:5000/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const result = await res.json();

        if (res.ok && result.success) {
          sessionStorage.setItem('superadmin_authenticated', 'true');
          errorMsg.textContent = '';
          loginForm.reset();
          checkAuth();
          showToast("Authenticated successfully. Welcome, Super Admin!");
        } else {
          errorMsg.textContent = result.message || 'Invalid credentials. Please try again.';
          if ('vibrate' in navigator) {
            navigator.vibrate([60, 60]);
          }
        }
      } catch (err) {
        console.error(err);
        errorMsg.textContent = 'Server connection error. Please run local server first.';
      }
    });
  }

  // Toggle Password text/password visibility
  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener('click', () => {
      const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passInput.setAttribute('type', type);
      const icon = togglePassBtn.querySelector('i');
      if (icon) {
        if (type === 'password') {
          icon.setAttribute('data-lucide', 'eye');
        } else {
          icon.setAttribute('data-lucide', 'eye-off');
        }
        if (window.lucide) {
          window.lucide.createIcons();
        }
      }
    });
  }

  // Set up dashboard Tab Switching Navigation callbacks
  function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('[data-tab]');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        activeTab = btn.getAttribute('data-tab');

        // Hide all panels, show active
        const panels = document.querySelectorAll('.tab-panel');
        panels.forEach(p => p.classList.add('hidden'));

        const activePanel = document.getElementById(`tab-${activeTab}-content`);
        if (activePanel) activePanel.classList.remove('hidden');

        // Update Header Title depending on active tab
        if (dashboardTitle) {
          if (activeTab === 'inquiries') dashboardTitle.textContent = "Bulk Inquiries Database";
          if (activeTab === 'bookings') dashboardTitle.textContent = "Order Bookings Database";
          if (activeTab === 'payments') dashboardTitle.textContent = "Payment Transaction Records";
        }

        await renderActiveTab();
      });
    });
  }

  async function renderActiveTab() {
    if (activeTab === 'inquiries') {
      await renderInquiries();
    } else if (activeTab === 'bookings') {
      await renderBookings();
    } else if (activeTab === 'payments') {
      await renderPayments();
    }
  }

  async function renderInquiries() {
    if (!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading inquiries...</td></tr>';

    let logs = [];
    try {
      const res = await fetch('http://localhost:5000/api/inquiries');
      if (res.ok) {
        logs = await res.json();
      }
    } catch (e) {
      console.error(e);
    }

    if (logs.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 4rem 1.25rem; color: var(--text-secondary);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem; text-align: center;">📁</div>
            No inquiries received yet. Submit a test inquiry from the storefront to see logs here.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = '';
    logs.forEach(log => {
      const tr = document.createElement('tr');

      const badgeClass = log.type === 'bulk' ? 'bulk' : 'gifting';
      const badgeLabel = log.type === 'bulk' ? 'Bulk Modal' : 'Gifting Form';

      const dateStr = new Date(log.timestamp).toLocaleString();

      let clientInfo = '';
      let requestDetails = '';
      let msgDetails = '';

      if (log.type === 'bulk') {
        clientInfo = `
          <strong>${log.name}</strong><br>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${log.email}</span><br>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${log.phone}</span>
        `;
        requestDetails = `
          <strong>Qty:</strong> ${log.qty}<br>
          <strong>Subj:</strong> ${log.subject}
        `;
        msgDetails = `<div class="message-cell">${log.message || ''}</div>`;
      } else {
        clientInfo = `
          <strong>${log.name}</strong><br>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${log.email}</span>
        `;
        requestDetails = `
          <strong>Company:</strong> ${log.org || 'N/A'}<br>
          <strong>Est. Qty:</strong> ${log.qty || 'N/A'} units
        `;
        msgDetails = `<div class="message-cell">${log.details || ''}</div>`;
      }

      tr.innerHTML = `
        <td><span class="inquiry-badge ${badgeClass}">${badgeLabel}</span></td>
        <td style="white-space: nowrap;">${dateStr}</td>
        <td>${clientInfo}</td>
        <td>${requestDetails}</td>
        <td>${msgDetails}</td>
      `;

      tableBody.appendChild(tr);
    });
  }

  async function renderBookings() {
    if (!bookingsTableBody) return;
    bookingsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading bookings...</td></tr>';

    let bookings = [];
    try {
      const res = await fetch('http://localhost:5000/api/bookings');
      if (res.ok) {
        bookings = await res.json();
      }
    } catch (e) {
      console.error(e);
    }

    if (bookings.length === 0) {
      bookingsTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 4rem 1.25rem; color: var(--text-secondary);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem; text-align: center;">🛍️</div>
            No candle orders booked yet. Place an order from the shop cart.
          </td>
        </tr>
      `;
      return;
    }

    bookingsTableBody.innerHTML = '';
    bookings.forEach(booking => {
      const tr = document.createElement('tr');
      const dateStr = new Date(booking.timestamp).toLocaleString();

      const clientInfo = `
        <strong>${booking.customerInfo.name}</strong><br>
        <span style="font-size:0.75rem; color:var(--text-secondary);">${booking.customerInfo.email}</span><br>
        <span style="font-size:0.75rem; color:var(--text-secondary);">${booking.customerInfo.phone}</span><br>
        <span style="font-size:0.75rem; color:var(--text-danger);">${booking.customerInfo.address}</span>
      `;

      const itemsList = booking.items.map(item => {
        if (item.isCustom) {
          return `• Custom: <strong>${item.name}</strong> (${item.description}) x${item.quantity}`;
        } else {
          return `• Signature: <strong>${item.name}</strong> (${item.description || 'Standard'}) x${item.quantity}`;
        }
      }).join('<br>');

      tr.innerHTML = `
        <td style="font-weight: bold; color: var(--gold-primary);">${booking.orderId}</td>
        <td style="white-space: nowrap;">${dateStr}</td>
        <td>${clientInfo}</td>
        <td style="font-size: 0.8rem; line-height: 1.4;">${itemsList}</td>
        <td style="font-weight: bold;">₹${booking.total}</td>
      `;

      bookingsTableBody.appendChild(tr);
    });
  }

  async function renderPayments() {
    if (!paymentsTableBody) return;
    paymentsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading payments...</td></tr>';

    let payments = [];
    try {
      const res = await fetch('http://localhost:5000/api/payments');
      if (res.ok) {
        payments = await res.json();
      }
    } catch (e) {
      console.error(e);
    }

    if (payments.length === 0) {
      paymentsTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 4rem 1.25rem; color: var(--text-secondary);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem; text-align: center;">💳</div>
            No payment records found yet.
          </td>
        </tr>
      `;
      return;
    }

    paymentsTableBody.innerHTML = '';
    payments.forEach(payment => {
      const tr = document.createElement('tr');
      const dateStr = new Date(payment.timestamp).toLocaleString();

      const statusClass = payment.status === 'Success' ? 'bulk' : 'gifting';

      tr.innerHTML = `
        <td style="font-weight: bold;">${payment.transactionId}</td>
        <td style="color: var(--gold-primary); font-weight: bold;">${payment.orderId}</td>
        <td style="white-space: nowrap;">${dateStr}</td>
        <td style="font-weight: bold;">₹${payment.amount}</td>
        <td>${payment.paymentMethod}</td>
        <td><span class="inquiry-badge ${statusClass}">${payment.status}</span></td>
      `;

      paymentsTableBody.appendChild(tr);
    });
  }

  // Logout Handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('superadmin_authenticated');
      checkAuth();
      showToast("Logged out of Admin Session.");
    });
  }

  // Clear Logs Handler for currently selected active tab context
  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', async () => {
      let deleteUrl = '';
      let tabLabel = '';
      if (activeTab === 'inquiries') {
        deleteUrl = 'http://localhost:5000/api/inquiries';
        tabLabel = 'inquiry logs';
      } else if (activeTab === 'bookings') {
        deleteUrl = 'http://localhost:5000/api/bookings';
        tabLabel = 'order bookings';
      } else if (activeTab === 'payments') {
        deleteUrl = 'http://localhost:5000/api/payments';
        tabLabel = 'payment transaction details';
      }

      if (confirm(`Are you sure you want to delete all local ${tabLabel}? This cannot be undone.`)) {
        try {
          const res = await fetch(deleteUrl, { method: 'DELETE' });
          if (res.ok) {
            await renderActiveTab();
            showToast(`${tabLabel} database cleared.`);
          } else {
            showToast("Error clearing logs from database.");
          }
        } catch (e) {
          console.error(e);
          showToast("Failed to clear database logs.");
        }
      }
    });
  }
});
