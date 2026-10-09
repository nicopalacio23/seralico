/**
 * SERALICO - SUPERUSER & USER MANAGEMENT CONTROLLER
 */

import { UserStore, COLONIAS_ROLES, CAMPINGS_LIST, HOSPITALES_SEDES } from './data.js';

export class AdminController {
  constructor(app) {
    this.app = app;
    this.currentFilter = 'all';
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.adminView = document.getElementById('admin-view');
    this.usersTableBody = document.getElementById('admin-users-tbody');
    this.filterTabs = document.querySelectorAll('.admin-tab-btn');
    this.btnOpenCreateModal = document.getElementById('btn-open-create-user');
    this.btnBackToHub = document.getElementById('btn-admin-back');
    
    // Stats Elements
    this.statTotal = document.getElementById('admin-stat-total');
    this.statHospitales = document.getElementById('admin-stat-hospitales');
    this.statColonias = document.getElementById('admin-stat-colonias');
    this.statSuper = document.getElementById('admin-stat-super');

    // Create User Modal & Form
    this.modal = document.getElementById('modal-create-user');
    this.form = document.getElementById('form-create-user');
    this.btnCloseModal = document.getElementById('btn-close-create-user-modal');
    this.btnCancelModal = document.getElementById('btn-cancel-create-user');

    // Dynamic Form Selectors
    this.inputRoleType = document.getElementById('new-user-role-type');
    this.groupColoniasRole = document.getElementById('group-colonias-role');
    this.selectColoniasRole = document.getElementById('new-user-colonias-role');
    this.groupSede = document.getElementById('group-user-sede');
    this.selectSede = document.getElementById('new-user-sede');
    this.labelSede = document.getElementById('label-user-sede');
    this.noteModuleScope = document.getElementById('note-module-scope');
  }

  bindEvents() {
    // Filter Tabs
    this.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.getAttribute('data-filter');
        this.renderUsers();
      });
    });

    // Back to Hub
    if (this.btnBackToHub) {
      this.btnBackToHub.addEventListener('click', (e) => {
        e.preventDefault();
        this.app.navigateTo('landing');
      });
    }

    // Open Modal
    if (this.btnOpenCreateModal) {
      this.btnOpenCreateModal.addEventListener('click', () => {
        this.openCreateModal();
      });
    }

    // Close Modal
    if (this.btnCloseModal) this.btnCloseModal.addEventListener('click', () => this.closeCreateModal());
    if (this.btnCancelModal) this.btnCancelModal.addEventListener('click', () => this.closeCreateModal());

    // Role Type Change in Form
    if (this.inputRoleType) {
      this.inputRoleType.addEventListener('change', () => {
        this.updateFormFieldsForRole();
      });
    }

    // Colonias Role Change in Form
    if (this.selectColoniasRole) {
      this.selectColoniasRole.addEventListener('change', () => {
        this.updateColoniasSedeOptions();
      });
    }

    // Submit Create User Form
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateUserSubmit();
      });
    }
  }

  openCreateModal() {
    if (this.form) this.form.reset();
    this.updateFormFieldsForRole();
    if (this.modal) this.modal.classList.add('open');
  }

  closeCreateModal() {
    if (this.modal) this.modal.classList.remove('open');
  }

  updateFormFieldsForRole() {
    const roleType = this.inputRoleType.value;

    if (roleType === 'hospitales') {
      this.groupColoniasRole.style.display = 'none';
      this.groupSede.style.display = 'block';
      this.labelSede.textContent = 'Hospital / Sede Asignada';
      this.noteModuleScope.textContent = '✓ Este usuario podrá ingresar tanto a Control de Calidad como a Control de Stock con estas mismas credenciales.';
      
      // Populate Hospital sedes
      this.selectSede.innerHTML = '';
      HOSPITALES_SEDES.forEach(sede => {
        const opt = document.createElement('option');
        opt.value = sede;
        opt.textContent = sede;
        this.selectSede.appendChild(opt);
      });
    } else if (roleType === 'colonias') {
      this.groupColoniasRole.style.display = 'block';
      this.noteModuleScope.textContent = '✓ Este usuario tendrá acceso independiente exclusivo al Módulo de Colonias de Verano.';
      this.updateColoniasSedeOptions();
    } else {
      // Superadmin
      this.groupColoniasRole.style.display = 'none';
      this.groupSede.style.display = 'block';
      this.labelSede.textContent = 'Sede Administrativa';
      this.noteModuleScope.textContent = '✓ Acceso total de administración y gestión de usuarios en todos los módulos.';
      this.selectSede.innerHTML = '<option value="Sede Central CABA">Sede Central CABA</option>';
    }
  }

  updateColoniasSedeOptions() {
    const colRoleId = this.selectColoniasRole.value;
    const colRole = COLONIAS_ROLES.find(r => r.id === colRoleId);

    this.groupSede.style.display = 'block';
    this.selectSede.innerHTML = '';

    if (colRole && colRole.requiresCamping) {
      this.labelSede.textContent = 'Camping / Sede de Colonia';
      CAMPINGS_LIST.forEach(camping => {
        const opt = document.createElement('option');
        opt.value = camping;
        opt.textContent = camping;
        this.selectSede.appendChild(opt);
      });
    } else if (colRoleId === 'deposito_central') {
      this.labelSede.textContent = 'Depósito';
      this.selectSede.innerHTML = '<option value="Parque Roca (Centro Logístico)">Parque Roca (Centro Logístico)</option><option value="Depósito Central Avellaneda">Depósito Central Avellaneda</option>';
    } else if (colRoleId === 'planta_elaboracion') {
      this.labelSede.textContent = 'Planta de Cocina';
      this.selectSede.innerHTML = '<option value="Planta Gastronómica Mataderos">Planta Gastronómica Mataderos</option><option value="Cocina Central Norte">Cocina Central Norte</option>';
    } else {
      this.labelSede.textContent = 'Ubicación / Cobertura';
      this.selectSede.innerHTML = '<option value="Todas las sedes estivales">Todas las sedes estivales</option><option value="Sede Central CABA">Sede Central CABA</option>';
    }
  }

  handleCreateUserSubmit() {
    const name = document.getElementById('new-user-name').value.trim();
    const username = document.getElementById('new-user-username').value.trim();
    const password = document.getElementById('new-user-password').value.trim();
    const roleType = this.inputRoleType.value;
    const sede = this.selectSede.value;

    if (!name || !username || !password) {
      this.app.showToast({ title: 'Error', message: 'Por favor complete todos los campos requeridos.' });
      return;
    }

    let roleLabel = '';
    let scope = '';
    let coloniasRole = null;

    if (roleType === 'hospitales') {
      roleLabel = 'Supervisor Hospitalario (Calidad + Stock)';
      scope = 'hospitales';
    } else if (roleType === 'colonias') {
      const colRoleId = this.selectColoniasRole.value;
      const colRole = COLONIAS_ROLES.find(r => r.id === colRoleId);
      roleLabel = colRole ? colRole.label : 'Personal de Colonias';
      scope = 'colonias';
      coloniasRole = colRoleId;
    } else {
      roleLabel = 'Superusuario / Admin General';
      scope = 'all';
    }

    const newUser = UserStore.addUser({
      name,
      username,
      password,
      roleType,
      coloniasRole,
      roleLabel,
      scope,
      sede
    });

    this.closeCreateModal();
    this.renderUsers();

    this.app.showToast({
      title: 'Usuario Creado Exitosamente',
      message: `${name} habilitado con usuario ${username}`
    });
  }

  renderUsers() {
    const users = UserStore.getUsers();
    
    // Update Stats
    const totalCount = users.length;
    const hospCount = users.filter(u => u.roleType === 'hospitales').length;
    const colCount = users.filter(u => u.roleType === 'colonias').length;
    const superCount = users.filter(u => u.roleType === 'superadmin').length;

    if (this.statTotal) this.statTotal.textContent = totalCount;
    if (this.statHospitales) this.statHospitales.textContent = hospCount;
    if (this.statColonias) this.statColonias.textContent = colCount;
    if (this.statSuper) this.statSuper.textContent = superCount;

    // Filter
    let filtered = users;
    if (this.currentFilter === 'hospitales') {
      filtered = users.filter(u => u.roleType === 'hospitales');
    } else if (this.currentFilter === 'colonias') {
      filtered = users.filter(u => u.roleType === 'colonias');
    } else if (this.currentFilter === 'superadmin') {
      filtered = users.filter(u => u.roleType === 'superadmin');
    }

    if (!this.usersTableBody) return;
    this.usersTableBody.innerHTML = '';

    if (filtered.length === 0) {
      this.usersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No se encontraron usuarios en este filtro.</td></tr>`;
      return;
    }

    filtered.forEach(u => {
      const tr = document.createElement('tr');
      
      let badgeClass = 'badge-role-colonias';
      let scopeLabel = 'Colonias';
      if (u.roleType === 'hospitales') {
        badgeClass = 'badge-role-hospitales';
        scopeLabel = 'Hospitales (Calidad + Stock)';
      } else if (u.roleType === 'superadmin') {
        badgeClass = 'badge-role-superadmin';
        scopeLabel = 'Superusuario';
      }

      tr.innerHTML = `
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${u.name}</div>
          <div class="font-mono" style="font-size: 0.75rem; color: var(--text-muted);">${u.username}</div>
        </td>
        <td>
          <span class="badge-role ${badgeClass}">
            ${scopeLabel}
          </span>
        </td>
        <td>
          <div style="font-weight: 500;">${u.roleLabel}</div>
        </td>
        <td>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">${u.sede || '-'}</div>
        </td>
        <td>
          <span class="font-mono" style="font-size: 0.75rem; color: ${u.active ? 'var(--mod-qa-accent)' : 'var(--text-muted)'};">
            ${u.active ? '● ACTIVO' : '○ INACTIVO'}
          </span>
        </td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button class="btn btn-outline-subtle" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" data-action="toggle-status" data-id="${u.id}" title="${u.active ? 'Desactivar' : 'Activar'}">
              ${u.active ? 'Desactivar' : 'Activar'}
            </button>
            ${u.roleType !== 'superadmin' ? `
              <button class="btn btn-outline-subtle" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; color: #ef4444;" data-action="delete-user" data-id="${u.id}" title="Eliminar usuario">
                Eliminar
              </button>
            ` : ''}
          </div>
        </td>
      `;

      this.usersTableBody.appendChild(tr);
    });

    // Bind action buttons in table
    this.usersTableBody.querySelectorAll('[data-action="toggle-status"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        UserStore.toggleUserStatus(id);
        this.renderUsers();
      });
    });

    this.usersTableBody.querySelectorAll('[data-action="delete-user"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('¿Está seguro de eliminar este usuario?')) {
          UserStore.deleteUser(id);
          this.renderUsers();
          this.app.showToast({ title: 'Usuario Eliminado', message: 'El usuario ha sido removido del sistema.' });
        }
      });
    });
  }
}
