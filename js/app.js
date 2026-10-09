/**
 * SERALICO - ENTERPRISE APPLICATION CONTROLLER
 */

import { AuthController } from './auth.js';
import { AdminController } from './admin.js';
import { DepositoController } from './deposito.js';
import { SupabaseService } from './supabase.js';
import { DataSync } from './data.js';

class SeralicoEnterpriseApp {
  constructor() {
    this.initTheme();
    this.authController = new AuthController(this);
    this.adminController = new AdminController(this);
    this.depositoController = new DepositoController(this);
    this.bindGlobalEvents();
    this.initRouter();
    this.initClock();
    this.initSupabaseSync();
  }

  /* --------------------------------------------------------------------------
     Theme Management
     -------------------------------------------------------------------------- */
  initTheme() {
    const savedTheme = localStorage.getItem('seralico_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeButton(savedTheme);

    const themeToggleBtn = document.getElementById('btn-theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('seralico_theme', next);
        this.updateThemeButton(next);
      });
    }
  }

  updateThemeButton(theme) {
    const btn = document.getElementById('btn-theme-toggle');
    if (!btn) return;
    if (theme === 'dark') {
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
      btn.setAttribute('title', 'Modo Claro');
    } else {
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      btn.setAttribute('title', 'Modo Oscuro');
    }
  }

  /* --------------------------------------------------------------------------
     Live Clock (Argentina UTC-3)
     -------------------------------------------------------------------------- */
  initClock() {
    const clockEl = document.getElementById('telemetry-clock');
    if (!clockEl) return;

    const updateTime = () => {
      const now = new Date();
      const options = { timeZone: 'America/Argentina/Buenos_Aires', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const timeStr = now.toLocaleTimeString('es-AR', options);
      clockEl.textContent = `ARG ${timeStr}`;
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  /* --------------------------------------------------------------------------
     Supabase Connection & Real-time Sync
     -------------------------------------------------------------------------- */
  async initSupabaseSync() {
    this.updateSupabaseStatusDisplay();

    // Bind Supabase modal buttons
    const btnOpenSupabase = document.getElementById('btn-open-supabase-modal');
    const footerStatus = document.getElementById('footer-supabase-status');
    const btnCloseSupabase = document.getElementById('btn-close-supabase-modal');
    const modalSupabase = document.getElementById('modal-supabase-config');
    const formSupabase = document.getElementById('form-supabase-config');
    const btnTestSupabase = document.getElementById('btn-test-supabase');

    const openModal = () => {
      const { url, anonKey } = SupabaseService.getCredentials();
      const urlInput = document.getElementById('supabase-project-url');
      const keyInput = document.getElementById('supabase-anon-key');
      if (urlInput) urlInput.value = url || '';
      if (keyInput) keyInput.value = anonKey || '';
      this.updateSupabaseStatusDisplay();
      if (modalSupabase) modalSupabase.classList.add('open');
    };

    if (btnOpenSupabase) btnOpenSupabase.addEventListener('click', openModal);
    if (footerStatus) footerStatus.addEventListener('click', openModal);

    if (btnCloseSupabase) {
      btnCloseSupabase.addEventListener('click', () => {
        if (modalSupabase) modalSupabase.classList.remove('open');
      });
    }

    if (btnTestSupabase) {
      btnTestSupabase.addEventListener('click', async () => {
        const urlInput = document.getElementById('supabase-project-url');
        const keyInput = document.getElementById('supabase-anon-key');
        if (urlInput && keyInput) {
          SupabaseService.saveCredentials(urlInput.value, keyInput.value);
        }

        btnTestSupabase.textContent = 'Verificando...';
        btnTestSupabase.disabled = true;

        const res = await SupabaseService.testConnection();
        btnTestSupabase.textContent = 'Probar Conexión';
        btnTestSupabase.disabled = false;

        if (res.success) {
          this.showToast({ title: 'Supabase Conectado', message: 'Conexión a la base de datos PostgreSQL exitosa.' });
          this.updateSupabaseStatusDisplay(true);
        } else {
          this.showToast({ title: 'Error de Conexión', message: res.message || 'No se pudo conectar a Supabase.' });
          this.updateSupabaseStatusDisplay(false, res.message);
        }
      });
    }

    if (formSupabase) {
      formSupabase.addEventListener('submit', async (e) => {
        e.preventDefault();
        const urlInput = document.getElementById('supabase-project-url');
        const keyInput = document.getElementById('supabase-anon-key');

        if (urlInput && keyInput) {
          SupabaseService.saveCredentials(urlInput.value, keyInput.value);
        }

        const res = await SupabaseService.testConnection();
        if (res.success) {
          this.showToast({ title: 'Configuración Guardada', message: 'Sincronizando datos con Supabase...' });
          if (modalSupabase) modalSupabase.classList.remove('open');
          await DataSync.syncAllFromSupabase();
          this.adminController.renderUsers();
          this.depositoController.renderAll();
          this.updateSupabaseStatusDisplay(true);
        } else {
          this.showToast({ title: 'Atención', message: 'Credenciales guardadas localmente. ' + res.message });
          if (modalSupabase) modalSupabase.classList.remove('open');
          this.updateSupabaseStatusDisplay(false, res.message);
        }
      });
    }

    // Try initial background sync if configured
    if (SupabaseService.isConfigured()) {
      const conn = await SupabaseService.testConnection();
      if (conn.success) {
        await DataSync.syncAllFromSupabase();
        this.adminController.renderUsers();
        this.depositoController.renderAll();
        this.updateSupabaseStatusDisplay(true);
      } else {
        this.updateSupabaseStatusDisplay(false, conn.message);
      }
    } else {
      this.updateSupabaseStatusDisplay(false);
    }
  }

  updateSupabaseStatusDisplay(connected = null, errorMsg = '') {
    const footerStatus = document.getElementById('footer-supabase-status');
    const modalBadge = document.getElementById('supabase-status-badge');
    const modalDetail = document.getElementById('supabase-status-detail');

    const isConfigured = SupabaseService.isConfigured();

    if (connected === true) {
      if (footerStatus) {
        footerStatus.innerHTML = `🟢 <span style="color: #10B981; font-weight: 600;">Supabase Cloud: Conectado</span>`;
      }
      if (modalBadge) {
        modalBadge.innerHTML = '🟢 Conectado y Sincronizado';
        modalBadge.style.background = 'rgba(16, 185, 129, 0.15)';
        modalBadge.style.color = '#059669';
      }
      if (modalDetail) {
        modalDetail.textContent = 'Conexión activa con PostgreSQL Cloud en Supabase. Las altas, bajas y modificaciones se sincronizan automáticamente.';
      }
    } else if (isConfigured) {
      if (footerStatus) {
        footerStatus.innerHTML = `🟠 <span style="color: #F59E0B;">Supabase: Reconectando...</span>`;
      }
      if (modalBadge) {
        modalBadge.innerHTML = '🟠 Configurado (Pendiente validación)';
        modalBadge.style.background = 'rgba(245, 158, 11, 0.15)';
        modalBadge.style.color = '#D97706';
      }
      if (modalDetail) {
        modalDetail.textContent = errorMsg ? `Detalle: ${errorMsg}` : 'Verificando conexión con el servidor Supabase...';
      }
    } else {
      if (footerStatus) {
        footerStatus.innerHTML = `⚪ <span style="color: var(--text-muted);">Supabase: Modo Local (Click para conectar)</span>`;
      }
      if (modalBadge) {
        modalBadge.innerHTML = '⚪ Modo Local (Sin Credenciales)';
        modalBadge.style.background = 'rgba(100, 116, 139, 0.15)';
        modalBadge.style.color = 'var(--text-muted)';
      }
      if (modalDetail) {
        modalDetail.textContent = 'El sistema opera en almacenamiento local seguro (LocalStorage). Configure su Project URL y Anon Key para sincronizar con Supabase Cloud.';
      }
    }
  }

  /* --------------------------------------------------------------------------
     Router & Views
     -------------------------------------------------------------------------- */
  initRouter() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }

  handleRoute() {
    const hash = window.location.hash.replace(/^#/, '');

    if (hash === 'admin') {
      this.showAdminView();
    } else if (hash === 'deposito' || hash === 'colonias/deposito') {
      this.showDepositoView();
    } else if (hash.startsWith('auth/')) {
      const moduleId = hash.split('/')[1];
      this.showAuthView(moduleId || 'calidad');
    } else if (hash === 'auth') {
      this.showAuthView('calidad');
    } else {
      this.showHubView();
    }
  }

  navigateTo(view, param = null) {
    if (view === 'admin') {
      window.location.hash = 'admin';
    } else if (view === 'deposito') {
      window.location.hash = 'deposito';
    } else if (view === 'auth') {
      window.location.hash = param ? `auth/${param}` : 'auth';
    } else {
      window.location.hash = 'hub';
    }
  }

  showHubView() {
    const hubView = document.getElementById('hub-view');
    const authView = document.getElementById('auth-view');
    const adminView = document.getElementById('admin-view');
    const depositoView = document.getElementById('deposito-view');

    const updateDom = () => {
      if (hubView) hubView.style.display = 'flex';
      if (authView) authView.style.display = 'none';
      if (adminView) adminView.style.display = 'none';
      if (depositoView) depositoView.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (document.startViewTransition) {
      document.startViewTransition(updateDom);
    } else {
      updateDom();
    }
  }

  showAuthView(moduleId = 'calidad') {
    const hubView = document.getElementById('hub-view');
    const authView = document.getElementById('auth-view');
    const adminView = document.getElementById('admin-view');
    const depositoView = document.getElementById('deposito-view');

    this.authController.setModule(moduleId, false);

    const updateDom = () => {
      if (hubView) hubView.style.display = 'none';
      if (authView) authView.style.display = 'block';
      if (adminView) adminView.style.display = 'none';
      if (depositoView) depositoView.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (document.startViewTransition) {
      document.startViewTransition(updateDom);
    } else {
      updateDom();
    }
  }

  showAdminView() {
    const hubView = document.getElementById('hub-view');
    const authView = document.getElementById('auth-view');
    const adminView = document.getElementById('admin-view');
    const depositoView = document.getElementById('deposito-view');

    this.adminController.renderUsers();

    const updateDom = () => {
      if (hubView) hubView.style.display = 'none';
      if (authView) authView.style.display = 'none';
      if (adminView) adminView.style.display = 'block';
      if (depositoView) depositoView.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (document.startViewTransition) {
      document.startViewTransition(updateDom);
    } else {
      updateDom();
    }
  }

  showDepositoView() {
    const hubView = document.getElementById('hub-view');
    const authView = document.getElementById('auth-view');
    const adminView = document.getElementById('admin-view');
    const depositoView = document.getElementById('deposito-view');

    this.depositoController.renderAll();

    const updateDom = () => {
      if (hubView) hubView.style.display = 'none';
      if (authView) authView.style.display = 'none';
      if (adminView) adminView.style.display = 'none';
      if (depositoView) depositoView.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (document.startViewTransition) {
      document.startViewTransition(updateDom);
    } else {
      updateDom();
    }
  }

  /* --------------------------------------------------------------------------
     Global Events
     -------------------------------------------------------------------------- */
  bindGlobalEvents() {
    // Module Card Action Buttons in Hub
    const moduleActionButtons = document.querySelectorAll('[data-action="open-module"]');
    moduleActionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const moduleId = btn.getAttribute('data-module');
        this.navigateTo('auth', moduleId);
      });
    });

    // Discreet Super Admin Triggers (Hidden / Private Access)
    // 1. Double-click or Triple-click on Brand Logo
    const brandLogo = document.querySelector('.brand-identity');
    if (brandLogo) {
      let clickCount = 0;
      let clickTimer = null;
      brandLogo.addEventListener('click', (e) => {
        clickCount++;
        if (clickCount >= 3) {
          e.preventDefault();
          clickCount = 0;
          clearTimeout(clickTimer);
          this.navigateTo('admin');
          this.showToast({ title: 'Acceso Superusuario', message: 'Ingresando al panel de administración...' });
        } else {
          clearTimeout(clickTimer);
          clickTimer = setTimeout(() => { clickCount = 0; }, 600);
        }
      });
    }

    // 2. Secret Keyboard Shortcut: Alt + S or Ctrl + Shift + S
    document.addEventListener('keydown', (e) => {
      if ((e.altKey && e.key.toLowerCase() === 's') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's')) {
        e.preventDefault();
        this.navigateTo('admin');
        this.showToast({ title: 'Acceso Superusuario', message: 'Ingresando al panel de administración...' });
      }

      // ESC returns to hub or closes modal
      if (e.key === 'Escape') {
        this.authController.closeSuccessModal();
        this.adminController.closeCreateModal();
        const modalSupabase = document.getElementById('modal-supabase-config');
        if (modalSupabase) modalSupabase.classList.remove('open');
        if (window.location.hash.startsWith('#auth') || window.location.hash === '#admin') {
          this.navigateTo('hub');
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     Toast Dispatcher
     -------------------------------------------------------------------------- */
  showToast({ title = '', message = '', duration = 3500 }) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <span class="toast-close">&times;</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    const removeToast = () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    };

    toast.querySelector('.toast-close').addEventListener('click', removeToast);
    setTimeout(removeToast, duration);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.seralicoApp = new SeralicoEnterpriseApp();
});
