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
  const toastNotification = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');

  initAdmin();

  function initAdmin() {
    checkAuth();
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function checkAuth() {
    const isAuth = sessionStorage.getItem('superadmin_authenticated') === 'true';
    if (isAuth) {
      if (loginBox) loginBox.classList.add('hidden');
      if (dashboardBox) dashboardBox.classList.remove('hidden');
      renderLogs();
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

  // Handle Authentication submit
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('admin-user').value.trim();
      const password = passInput.value.trim();

      // Default Secure Credentials
      if (username === 'superadmin' && password === 'adminpassword123') {
        sessionStorage.setItem('superadmin_authenticated', 'true');
        errorMsg.textContent = '';
        loginForm.reset();
        checkAuth();
        showToast("Authenticated successfully. Welcome, Super Admin!");
      } else {
        errorMsg.textContent = 'Invalid credentials. Please try again.';
        if ('vibrate' in navigator) {
          navigator.vibrate([60, 60]);
        }
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

  async function renderLogs() {
    if (!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading logs...</td></tr>';

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
        msgDetails = `<div class="message-cell">${log.message}</div>`;
      } else {
        clientInfo = `
          <strong>${log.name}</strong><br>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${log.email}</span>
        `;
        requestDetails = `
          <strong>Company:</strong> ${log.org}<br>
          <strong>Est. Qty:</strong> ${log.qty} units
        `;
        msgDetails = `<div class="message-cell">${log.details}</div>`;
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

  // Logout Handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('superadmin_authenticated');
      checkAuth();
      showToast("Logged out of Admin Session.");
    });
  }

  // Clear Logs Handler
  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', async () => {
      if (confirm("Are you sure you want to delete all local inquiry logs? This cannot be undone.")) {
        try {
          const res = await fetch('http://localhost:5000/api/inquiries', { method: 'DELETE' });
          if (res.ok) {
            renderLogs();
            showToast("Inquiry database cleared.");
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  }
});
