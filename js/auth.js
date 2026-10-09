/**
 * SERALICO - ENTERPRISE AUTHENTICATION CONTROLLER (UPDATED WITH HOSPITALES & COLONIAS ROLES)
 */

import { MODULES_DATA, UserStore, HOSPITALES_SEDES, CAMPINGS_LIST, COLONIAS_ROLES } from './data.js';

export class AuthController {
  constructor(app) {
    this.app = app;
    this.currentModuleId = 'calidad';
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.authCodeTag = document.getElementById('auth-module-code');
    this.authTitle = document.getElementById('auth-module-title');
    this.authSubtitle = document.getElementById('auth-module-sub');
    this.authScopeBanner = document.getElementById('auth-scope-banner');
    this.authPills = document.querySelectorAll('.auth-module-pill');
    
    // Form controls
    this.authForm = document.getElementById('auth-form');
    this.userInput = document.getElementById('auth-username');
    this.passwordInput = document.getElementById('auth-password');
    this.sedeSelect = document.getElementById('auth-sede');
    this.labelSede = document.getElementById('label-auth-sede');
    this.passwordToggleBtn = document.getElementById('btn-toggle-password');
    this.submitBtn = document.getElementById('btn-auth-submit');
    this.btnBack = document.getElementById('btn-back-to-hub');
    this.demoChipsContainer = document.getElementById('auth-demo-chips');

    // Modal elements
    this.modal = document.getElementById('auth-success-modal');
    this.modalTitle = document.getElementById('modal-module-title');
    this.modalUserBadge = document.getElementById('modal-user-badge');
    this.modalScopeNote = document.getElementById('modal-scope-note');
    this.modalCloseBtn = document.getElementById('btn-close-modal');
    this.modalLogoutBtn = document.getElementById('btn-modal-logout');
    this.modalAdminBtn = document.getElementById('btn-modal-go-admin');
  }

  bindEvents() {
    // Module Pill Selector inside Auth
    this.authPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const moduleId = pill.getAttribute('data-module');
        if (moduleId && MODULES_DATA[moduleId]) {
          this.setModule(moduleId, true);
        }
      });
    });

    // Password visibility toggle
    if (this.passwordToggleBtn) {
      this.passwordToggleBtn.addEventListener('click', () => {
        const isPassword = this.passwordInput.type === 'password';
        this.passwordInput.type = isPassword ? 'text' : 'password';
        this.passwordToggleBtn.innerHTML = isPassword 
          ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
          : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      });
    }

    // Back to hub button
    if (this.btnBack) {
      this.btnBack.addEventListener('click', (e) => {
        e.preventDefault();
        this.app.navigateTo('landing');
      });
    }

    // Form submit
    if (this.authForm) {
      this.authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Modal buttons
    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', () => this.closeSuccessModal());
    }

    if (this.modalLogoutBtn) {
      this.modalLogoutBtn.addEventListener('click', () => {
        this.closeSuccessModal();
        this.app.navigateTo('landing');
      });
    }

    if (this.modalAdminBtn) {
      this.modalAdminBtn.addEventListener('click', () => {
        this.closeSuccessModal();
        this.app.navigateTo('admin');
      });
    }
  }

  setModule(moduleId, updateUrl = true) {
    const mod = MODULES_DATA[moduleId] || MODULES_DATA.calidad;
    this.currentModuleId = mod.id;

    if (this.authCodeTag) this.authCodeTag.textContent = mod.code;
    if (this.authTitle) this.authTitle.textContent = mod.title;
    if (this.authSubtitle) this.authSubtitle.textContent = mod.scope;

    // Notice about shared Hospital credentials vs independent Colonias credentials
    if (this.authScopeBanner) {
      if (mod.domain === 'hospitales') {
        this.authScopeBanner.innerHTML = `
          <strong>ℹ️ Control Hospitalario:</strong> Las credenciales son unificadas (un mismo usuario opera tanto <strong>Control de Calidad</strong> como <strong>Control de Stock</strong> en hospitales).
        `;
        this.authScopeBanner.style.display = 'block';
      } else {
        this.authScopeBanner.innerHTML = `
          <strong>☀️ Módulo Colonias de Verano:</strong> Acceso independiente para Referentes de camping, Depósito central, Planta, RRHH, Auditor o Sector desayuno.
        `;
        this.authScopeBanner.style.display = 'block';
      }
    }

    // Update active pill
    this.authPills.forEach(pill => {
      if (pill.getAttribute('data-module') === mod.id) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Populate Sede / Camping dropdown
    if (this.sedeSelect) {
      this.sedeSelect.innerHTML = '';
      if (mod.domain === 'hospitales') {
        if (this.labelSede) this.labelSede.textContent = 'Hospital / Sede Operativa';
        HOSPITALES_SEDES.forEach(sede => {
          const opt = document.createElement('option');
          opt.value = sede;
          opt.textContent = sede;
          this.sedeSelect.appendChild(opt);
        });
      } else {
        if (this.labelSede) this.labelSede.textContent = 'Camping / Sede Asignada';
        CAMPINGS_LIST.forEach(camping => {
          const opt = document.createElement('option');
          opt.value = camping;
          opt.textContent = camping;
          this.sedeSelect.appendChild(opt);
        });
      }
    }

    // Render quick autofill chips
    this.renderDemoChips(mod);

    // Update Submit button
    if (this.submitBtn) {
      const btnText = this.submitBtn.querySelector('.btn-label');
      if (btnText) {
        btnText.textContent = `Iniciar Sesión en ${mod.title}`;
      }
    }

    if (updateUrl) {
      window.location.hash = `auth/${mod.id}`;
    }
  }

  renderDemoChips(mod) {
    if (!this.demoChipsContainer) return;
    this.demoChipsContainer.innerHTML = '';

    const users = UserStore.getUsers().filter(u => u.active !== false);

    if (mod.domain === 'hospitales') {
      const hospUser = users.find(u => u.roleType === 'hospitales') || { username: 'hospitales@seralico.com.ar', name: 'Supervisor Hospitalario' };

      this.demoChipsContainer.innerHTML = `
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.4rem; font-weight: 600;">Usuario de prueba:</div>
        <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
          <button type="button" class="demo-btn-inline font-mono" data-user="${hospUser.username}">
            🏥 Usuario Hospitales (Calidad + Stock)
          </button>
        </div>
      `;
    } else {
      // Colonias specific roles
      const colUsers = users.filter(u => u.roleType === 'colonias');
      let chipsHtml = `<div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.4rem; font-weight: 600;">Roles de prueba de Colonias:</div><div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">`;
      
      colUsers.forEach(u => {
        chipsHtml += `<button type="button" class="demo-btn-inline font-mono" data-user="${u.username}" title="${u.roleLabel}">
          ${u.roleLabel}
        </button>`;
      });

      chipsHtml += `</div>`;
      this.demoChipsContainer.innerHTML = chipsHtml;
    }

    // Attach click listeners to chips
    this.demoChipsContainer.querySelectorAll('[data-user]').forEach(btn => {
      btn.addEventListener('click', () => {
        const uname = btn.getAttribute('data-user');
        const matched = users.find(u => u.username === uname);
        if (this.userInput) this.userInput.value = uname;
        if (this.passwordInput) this.passwordInput.value = 'seralico2026';
        if (matched && matched.sede && this.sedeSelect) {
          this.sedeSelect.value = matched.sede;
        }
        this.app.showToast({ title: 'Credenciales Cargadas', message: `Usuario: ${uname}` });
      });
    });
  }

  async handleLogin() {
    const user = this.userInput.value.trim();
    const pass = this.passwordInput.value.trim();
    const sede = this.sedeSelect.value;
    const mod = MODULES_DATA[this.currentModuleId];

    if (!user || !pass) {
      this.app.showToast({
        title: 'Campos Requeridos',
        message: 'Por favor ingrese su usuario y contraseña.'
      });
      return;
    }

    // Validate against UserStore
    const authenticatedUser = UserStore.findUser(user, pass);

    if (!authenticatedUser) {
      this.app.showToast({
        title: 'Error de Autenticación',
        message: 'Usuario o contraseña incorrectos, o cuenta inactiva.'
      });
      return;
    }

    // Verify module permissions
    const hasAccess = UserStore.checkAccess(authenticatedUser, this.currentModuleId);

    if (!hasAccess) {
      if (authenticatedUser.scope === 'colonias' && (this.currentModuleId === 'calidad' || this.currentModuleId === 'stock')) {
        this.app.showToast({
          title: 'Acceso Restringido',
          message: 'Esta cuenta solo tiene permisos para el Módulo de Colonias de Verano.'
        });
      } else if (authenticatedUser.scope === 'hospitales' && this.currentModuleId === 'colonias') {
        this.app.showToast({
          title: 'Acceso Restringido',
          message: 'Esta cuenta es de Control Hospitalario (Calidad y Stock) y no tiene acceso a Colonias de Verano.'
        });
      }
      return;
    }

    // Loading latency
    this.submitBtn.disabled = true;
    const originalContent = this.submitBtn.innerHTML;
    this.submitBtn.innerHTML = `<span>Validando acceso...</span>`;

    await new Promise(resolve => setTimeout(resolve, 600));

    this.submitBtn.disabled = false;
    this.submitBtn.innerHTML = originalContent;

    // Open Success Modal
    this.openSuccessModal(mod, authenticatedUser, sede);
  }

  openSuccessModal(mod, user, sede) {
    if (this.modalTitle) {
      this.modalTitle.textContent = `${mod.title} — Sesión Iniciada`;
    }
    if (this.modalUserBadge) {
      this.modalUserBadge.textContent = `${user.name} (${user.roleLabel}) // Sede: ${sede}`;
    }
    if (this.modalScopeNote) {
      if (user.roleType === 'superadmin') {
        this.modalScopeNote.innerHTML = `
          <strong>Rol Superusuario:</strong> Tiene acceso maestro global a todos los módulos y a la administración de usuarios.
        `;
        if (this.modalAdminBtn) this.modalAdminBtn.style.display = 'inline-flex';
      } else if (user.roleType === 'hospitales') {
        this.modalScopeNote.innerHTML = `
          <strong>Acceso Hospitalario:</strong> Con esta misma credencial también puede ingresar al módulo de <strong>${mod.id === 'calidad' ? 'Control de Stock' : 'Control de Calidad'}</strong>.
        `;
        if (this.modalAdminBtn) this.modalAdminBtn.style.display = 'none';
      } else if (user.coloniasRole === 'deposito_central') {
        this.modalScopeNote.innerHTML = `
          <strong>Depósito Central Colonias:</strong> Acceso a Catálogo de Insumos, Matriz de Pedidos por Sede, y Solicitudes de Desayuno y Planta.
        `;
        if (this.modalAdminBtn) {
          this.modalAdminBtn.style.display = 'inline-flex';
          this.modalAdminBtn.textContent = 'Ingresar al Panel de Depósito Central →';
          this.modalAdminBtn.onclick = () => {
            this.closeSuccessModal();
            this.app.navigateTo('deposito');
          };
        }
      } else if (user.coloniasRole === 'referente_camping') {
        const targetSede = user.sede || sede || 'Sede Colón';
        this.modalScopeNote.innerHTML = `
          <strong>Referente de Sede (${targetSede}):</strong> Acceso al menú para pedir insumos a Depósito Central y al Censo Dietético Diario (Generales, Diabéticos, Celíacos, Sin Lactosa).
        `;
        if (this.modalAdminBtn) {
          this.modalAdminBtn.style.display = 'inline-flex';
          this.modalAdminBtn.textContent = `Ingresar al Panel de ${targetSede} →`;
          this.modalAdminBtn.onclick = () => {
            this.closeSuccessModal();
            this.app.showSedeView(targetSede, user);
          };
        }
      } else {
        this.modalScopeNote.innerHTML = `
          <strong>Acceso Colonias:</strong> Habilitado como <em>${user.roleLabel}</em> para la temporada estival.
        `;
        if (this.modalAdminBtn) this.modalAdminBtn.style.display = 'none';
      }
    }
    if (this.modal) {
      this.modal.classList.add('open');
    }
  }

  closeSuccessModal() {
    if (this.modal) {
      this.modal.classList.remove('open');
    }
  }
}
