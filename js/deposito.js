import { DepositoStore, SEDES_LIST } from './data.js';

export class DepositoController {
  constructor(app) {
    this.app = app;
    this.currentTab = 'catalogo';
    this.selectedCamping = 'all'; // 'all' or specific sede name
    this.catalogSearchQuery = '';
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.depositoView = document.getElementById('deposito-view');
    this.tabButtons = document.querySelectorAll('.deposito-tab-btn');
    this.sectionPanels = document.querySelectorAll('.deposito-section-panel');

    // Tab Counters
    this.countCatalog = document.getElementById('tab-count-catalog');
    this.countMatrix = document.getElementById('tab-count-matrix');
    this.countDesayuno = document.getElementById('tab-count-desayuno');
    this.countPlanta = document.getElementById('tab-count-planta');

    // 1. Catalog Elements
    this.catalogTbody = document.getElementById('catalog-products-tbody');
    this.catalogSearchInput = document.getElementById('catalog-search-input');
    this.btnOpenAddProduct = document.getElementById('btn-open-add-product');
    this.modalAddProduct = document.getElementById('modal-add-product');
    this.formAddProduct = document.getElementById('form-add-product');
    this.btnCloseProductModal = document.getElementById('btn-close-product-modal');
    this.btnCancelProductModal = document.getElementById('btn-cancel-product-modal');

    // 2. Camping Orders & Individual Remittances Elements
    this.campingPillsContainer = document.getElementById('camping-selector-pills');
    this.viewMatrixAll = document.getElementById('view-matrix-all');
    this.viewRemitoIndividual = document.getElementById('view-remito-individual');
    this.matrixThead = document.getElementById('matrix-campings-thead');
    this.matrixTbody = document.getElementById('matrix-campings-tbody');
    this.individualRemitoTbody = document.getElementById('individual-remito-tbody');
    this.individualCampingTitle = document.getElementById('individual-camping-title');
    this.individualCampingSubtitle = document.getElementById('individual-camping-sub');
    this.btnPrintIndividual = document.getElementById('btn-print-individual');
    this.btnPrintMatrix = document.getElementById('btn-print-matrix');
    
    // Printable Sheet Header Elements
    this.printSheetTitle = document.getElementById('print-sheet-title');
    this.printSheetSubtitle = document.getElementById('print-sheet-subtitle');
    this.printDateSpan = document.getElementById('print-date-display');
    this.printSedeInfo = document.getElementById('print-sede-info');

    // 3. Desayuno Elements
    this.desayunoTbody = document.getElementById('desayuno-requests-tbody');
    this.btnOpenAddDesayuno = document.getElementById('btn-open-add-desayuno');
    this.modalAddDesayuno = document.getElementById('modal-add-desayuno');
    this.formAddDesayuno = document.getElementById('form-add-desayuno');
    this.btnCloseDesayunoModal = document.getElementById('btn-close-desayuno-modal');
    this.btnCancelDesayunoModal = document.getElementById('btn-cancel-desayuno-modal');

    // 4. Planta Elements
    this.plantaTbody = document.getElementById('planta-requests-tbody');
    this.btnOpenAddPlanta = document.getElementById('btn-open-add-planta');
    this.modalAddPlanta = document.getElementById('modal-add-planta');
    this.formAddPlanta = document.getElementById('form-add-planta');
    this.btnClosePlantaModal = document.getElementById('btn-close-planta-modal');
    this.btnCancelPlantaModal = document.getElementById('btn-cancel-planta-modal');

    // Header Back
    this.btnBackToHub = document.getElementById('btn-deposito-back');
  }

  bindEvents() {
    // Navigation Tabs
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });

    // Back to Hub
    if (this.btnBackToHub) {
      this.btnBackToHub.addEventListener('click', (e) => {
        e.preventDefault();
        this.app.navigateTo('landing');
      });
    }

    // 1. Catalog Search & Add Modal
    if (this.catalogSearchInput) {
      this.catalogSearchInput.addEventListener('input', (e) => {
        this.catalogSearchQuery = e.target.value.toLowerCase().trim();
        this.renderCatalog();
      });
    }

    if (this.btnOpenAddProduct) {
      this.btnOpenAddProduct.addEventListener('click', () => {
        if (this.formAddProduct) this.formAddProduct.reset();
        if (this.modalAddProduct) this.modalAddProduct.classList.add('open');
      });
    }

    if (this.btnCloseProductModal) this.btnCloseProductModal.addEventListener('click', () => this.closeProductModal());
    if (this.btnCancelProductModal) this.btnCancelProductModal.addEventListener('click', () => this.closeProductModal());

    if (this.formAddProduct) {
      this.formAddProduct.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddProduct();
      });
    }

    // 2. Print Handlers (Individual & General Matrix)
    if (this.btnPrintIndividual) {
      this.btnPrintIndividual.addEventListener('click', () => {
        this.setupPrintSheetForCamping(this.selectedCamping);
        window.print();
      });
    }

    if (this.btnPrintMatrix) {
      this.btnPrintMatrix.addEventListener('click', () => {
        this.setupPrintSheetForMatrix();
        window.print();
      });
    }

    // 3. Desayuno Modal & Form
    if (this.btnOpenAddDesayuno) {
      this.btnOpenAddDesayuno.addEventListener('click', () => {
        if (this.formAddDesayuno) this.formAddDesayuno.reset();
        if (this.modalAddDesayuno) this.modalAddDesayuno.classList.add('open');
      });
    }
    if (this.btnCloseDesayunoModal) this.btnCloseDesayunoModal.addEventListener('click', () => this.closeDesayunoModal());
    if (this.btnCancelDesayunoModal) this.btnCancelDesayunoModal.addEventListener('click', () => this.closeDesayunoModal());
    if (this.formAddDesayuno) {
      this.formAddDesayuno.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddDesayuno();
      });
    }

    // 4. Planta Modal & Form
    if (this.btnOpenAddPlanta) {
      this.btnOpenAddPlanta.addEventListener('click', () => {
        if (this.formAddPlanta) this.formAddPlanta.reset();
        if (this.modalAddPlanta) this.modalAddPlanta.classList.add('open');
      });
    }
    if (this.btnClosePlantaModal) this.btnClosePlantaModal.addEventListener('click', () => this.closePlantaModal());
    if (this.btnCancelPlantaModal) this.btnCancelPlantaModal.addEventListener('click', () => this.closePlantaModal());
    if (this.formAddPlanta) {
      this.formAddPlanta.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddPlanta();
      });
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    this.tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.sectionPanels.forEach(panel => {
      if (panel.id === `${tabId}-panel`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    this.renderAll();
  }

  closeProductModal() {
    if (this.modalAddProduct) this.modalAddProduct.classList.remove('open');
  }

  closeDesayunoModal() {
    if (this.modalAddDesayuno) this.modalAddDesayuno.classList.remove('open');
  }

  closePlantaModal() {
    if (this.modalAddPlanta) this.modalAddPlanta.classList.remove('open');
  }

  handleAddDesayuno() {
    const item = document.getElementById('des-item-name').value.trim();
    const quantity = document.getElementById('des-item-qty').value.trim();
    const category = document.getElementById('des-item-category').value;
    const urgency = document.getElementById('des-item-urgency').value;
    const notes = document.getElementById('des-item-notes').value.trim();

    if (!item || !quantity) return;

    DepositoStore.addDesayunoRequest({
      item,
      quantity,
      category,
      urgency,
      notes,
      requestedBy: 'Mariana López (Sector Desayuno)'
    });

    this.closeDesayunoModal();
    this.renderDesayuno();
    this.updateBadgeCounts();
    this.app.showToast({
      title: 'Solicitud Recibida',
      message: `Nuevo pedido de Desayuno "${item}" ingresado a la bandeja de Depósito.`
    });
  }

  handleAddPlanta() {
    const item = document.getElementById('pln-item-name').value.trim();
    const quantity = document.getElementById('pln-item-qty').value.trim();
    const category = document.getElementById('pln-item-category').value;
    const urgency = document.getElementById('pln-item-urgency').value;
    const notes = document.getElementById('pln-item-notes').value.trim();

    if (!item || !quantity) return;

    DepositoStore.addPlantaRequest({
      item,
      quantity,
      category,
      urgency,
      notes,
      requestedBy: 'Estela Romero (Jefa de Planta)'
    });

    this.closePlantaModal();
    this.renderPlanta();
    this.updateBadgeCounts();
    this.app.showToast({
      title: 'Solicitud Recibida',
      message: `Nuevo pedido de Planta "${item}" ingresado a la bandeja de Depósito.`
    });
  }

  renderAll() {
    this.renderCatalog();
    this.renderCampingSelectorPills();
    this.renderCampingOrdersView();
    this.renderDesayuno();
    this.renderPlanta();
    this.updateBadgeCounts();
  }

  updateBadgeCounts() {
    const catalog = DepositoStore.getCatalog();
    const desayuno = DepositoStore.getDesayunoRequests().filter(r => r.status !== 'Despachado');
    const planta = DepositoStore.getPlantaRequests().filter(r => r.status !== 'Despachado');

    if (this.countCatalog) this.countCatalog.textContent = catalog.length;
    if (this.countMatrix) this.countMatrix.textContent = SEDES_LIST.length + ' Sedes';
    if (this.countDesayuno) this.countDesayuno.textContent = desayuno.length;
    if (this.countPlanta) this.countPlanta.textContent = planta.length;
  }

  /* --------------------------------------------------------------------------
     1. CATALOG MANAGEMENT (Insumos que pueden pedir los Referentes de Sede)
     -------------------------------------------------------------------------- */
  renderCatalog() {
    if (!this.catalogTbody) return;
    const products = DepositoStore.getCatalog();

    const filtered = products.filter(p => {
      if (!this.catalogSearchQuery) return true;
      return p.name.toLowerCase().includes(this.catalogSearchQuery) ||
             p.code.toLowerCase().includes(this.catalogSearchQuery) ||
             p.category.toLowerCase().includes(this.catalogSearchQuery);
    });

    this.catalogTbody.innerHTML = '';

    if (filtered.length === 0) {
      this.catalogTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No se encontraron productos en el catálogo.</td></tr>`;
      return;
    }

    filtered.forEach(p => {
      const tr = document.createElement('tr');
      const isLowStock = p.stock <= 20;

      tr.innerHTML = `
        <td class="font-mono" style="font-weight: 600; color: var(--brand-blue);">${p.code}</td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${p.name}</div>
        </td>
        <td>
          <span class="badge-role badge-role-colonias" style="font-size: 0.72rem;">${p.category}</span>
        </td>
        <td>
          <span style="color: var(--text-secondary); font-size: 0.8rem;">${p.unit}</span>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="number" class="matrix-qty-input" value="${p.stock}" min="0" data-stock-id="${p.id}" style="width: 70px;">
            <span class="font-mono" style="font-size: 0.72rem; color: ${isLowStock ? '#ef4444' : 'var(--text-muted)'}; font-weight: ${isLowStock ? '700' : '500'};">
              ${isLowStock ? '⚠️ STOCK BAJO' : 'OK'}
            </span>
          </div>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-outline-subtle" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; color: #ef4444;" data-delete-product="${p.id}" title="Eliminar producto">
            Eliminar
          </button>
        </td>
      `;

      this.catalogTbody.appendChild(tr);
    });

    // Stock change handler
    this.catalogTbody.querySelectorAll('[data-stock-id]').forEach(input => {
      input.addEventListener('change', () => {
        const id = input.getAttribute('data-stock-id');
        const val = input.value;
        DepositoStore.updateProductStock(id, val);
        this.renderCampingOrdersView();
        this.app.showToast({ title: 'Stock Actualizado', message: `Nuevo stock registrado en depósito.` });
      });
    });

    // Delete Product handler
    this.catalogTbody.querySelectorAll('[data-delete-product]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-product');
        if (confirm('¿Desea eliminar este producto del catálogo disponible para las sedes?')) {
          DepositoStore.deleteProduct(id);
          this.renderAll();
          this.app.showToast({ title: 'Producto Removido', message: 'El producto ya no estará disponible para pedidos de sedes.' });
        }
      });
    });
  }

  handleAddProduct() {
    const name = document.getElementById('new-prd-name').value.trim();
    const category = document.getElementById('new-prd-category').value;
    const unit = document.getElementById('new-prd-unit').value.trim();
    const stock = parseInt(document.getElementById('new-prd-stock').value) || 0;

    if (!name || !unit) {
      this.app.showToast({ title: 'Error', message: 'Complete el nombre y la presentación del producto.' });
      return;
    }

    const newPrd = DepositoStore.addProduct({ name, category, unit, stock });
    this.closeProductModal();
    this.renderAll();

    this.app.showToast({
      title: 'Producto Creado',
      message: `"${name}" habilitado para pedidos de los Referentes de Sede.`
    });
  }

  /* --------------------------------------------------------------------------
     2. SEDE ORDERS & INDIVIDUAL PRINTABLE REMITTANCE PER SEDE
     -------------------------------------------------------------------------- */
  renderCampingSelectorPills() {
    if (!this.campingPillsContainer) return;
    this.campingPillsContainer.innerHTML = '';

    // "Todas las Sedes" pill
    const allBtn = document.createElement('button');
    allBtn.className = `camping-pill-btn ${this.selectedCamping === 'all' ? 'active' : ''}`;
    allBtn.textContent = '📊 Vista General (Todas las Sedes)';
    allBtn.addEventListener('click', () => {
      this.selectedCamping = 'all';
      this.renderCampingSelectorPills();
      this.renderCampingOrdersView();
    });
    this.campingPillsContainer.appendChild(allBtn);

    // Pills for each Sede
    SEDES_LIST.forEach(sede => {
      const btn = document.createElement('button');
      btn.className = `camping-pill-btn ${this.selectedCamping === sede ? 'active' : ''}`;
      btn.textContent = `🏢 ${sede}`;
      btn.addEventListener('click', () => {
        this.selectedCamping = sede;
        this.renderCampingSelectorPills();
        this.renderCampingOrdersView();
      });
      this.campingPillsContainer.appendChild(btn);
    });
  }

  renderCampingOrdersView() {
    if (this.selectedCamping === 'all') {
      if (this.viewMatrixAll) this.viewMatrixAll.style.display = 'block';
      if (this.viewRemitoIndividual) this.viewRemitoIndividual.style.display = 'none';
      this.renderMatrixTable();
    } else {
      if (this.viewMatrixAll) this.viewMatrixAll.style.display = 'none';
      if (this.viewRemitoIndividual) this.viewRemitoIndividual.style.display = 'block';
      this.renderIndividualRemito(this.selectedCamping);
    }
  }

  renderIndividualRemito(sede) {
    if (!this.individualRemitoTbody) return;

    if (this.individualCampingTitle) {
      this.individualCampingTitle.textContent = `Remito de Despacho: ${sede}`;
    }
    if (this.individualCampingSubtitle) {
      this.individualCampingSubtitle.textContent = `Detalle exclusivo de insumos solicitados para entrega individual en ${sede}.`;
    }

    const products = DepositoStore.getCatalog();
    const allOrders = DepositoStore.getCampingOrders();
    const campingOrders = allOrders[sede] || {};

    this.individualRemitoTbody.innerHTML = '';

    // Filter products requested by this sede (or show all with stock)
    const items = products.map(p => ({
      ...p,
      requestedQty: campingOrders[p.id] || 0
    })).filter(item => item.requestedQty > 0 || item.stock > 0);

    if (items.length === 0) {
      this.individualRemitoTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No hay pedidos registrados para esta sede.</td></tr>`;
      return;
    }

    items.forEach(item => {
      const tr = document.createElement('tr');
      const isDeficit = item.requestedQty > item.stock;

      tr.innerHTML = `
        <td class="font-mono" style="font-weight: 600; color: var(--brand-blue);">${item.code}</td>
        <td>
          <div style="font-weight: 700; color: var(--text-primary);">${item.name}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${item.category}</div>
        </td>
        <td style="font-size: 0.8rem; color: var(--text-secondary);">${item.unit}</td>
        <td class="font-mono" style="text-align: center; font-weight: 700; font-size: 0.88rem; background: var(--bg-surface-subtle);">
          ${item.stock}
        </td>
        <td style="text-align: center;">
          <input type="number" min="0" class="matrix-qty-input font-mono" style="width: 65px;" value="${item.requestedQty}" data-camping="${sede}" data-pid="${item.id}">
        </td>
        <td style="text-align: center;">
          <span class="status-pill-badge ${isDeficit ? 'status-pendiente' : 'status-despachado'}">
            ${isDeficit ? `Stock Insuficiente (${item.stock}/${item.requestedQty})` : 'Disponible ✓'}
          </span>
        </td>
      `;

      this.individualRemitoTbody.appendChild(tr);
    });

    // Change qty listener
    this.individualRemitoTbody.querySelectorAll('.matrix-qty-input').forEach(input => {
      input.addEventListener('change', () => {
        const camp = input.getAttribute('data-camping');
        const pid = input.getAttribute('data-pid');
        const qty = input.value;
        DepositoStore.updateCampingOrderQty(camp, pid, qty);
        this.renderIndividualRemito(camp);
      });
    });
  }

  renderMatrixTable() {
    if (!this.matrixThead || !this.matrixTbody) return;

    const products = DepositoStore.getCatalog();
    const orders = DepositoStore.getCampingOrders();

    // 1. Build Header: [Producto | Unidad | Stock Depósito | Sede 1 | Sede 2 | ... | TOTAL PEDIDO]
    let theadHtml = `
      <tr>
        <th style="min-width: 200px;">Producto / Insumo</th>
        <th>Presentación</th>
        <th style="text-align: center; background: var(--bg-surface-subtle); color: var(--text-primary);">Stock Depósito</th>
    `;

    SEDES_LIST.forEach(sede => {
      theadHtml += `<th class="camping-col-header" title="${sede}">🏢 ${sede}</th>`;
    });

    theadHtml += `
        <th class="total-col-cell" style="min-width: 100px;">TOTAL PEDIDO</th>
        <th style="text-align: center;">Disponibilidad</th>
      </tr>
    `;

    this.matrixThead.innerHTML = theadHtml;

    // 2. Build Body Rows per Product
    this.matrixTbody.innerHTML = '';

    if (products.length === 0) {
      this.matrixTbody.innerHTML = `<tr><td colspan="${SEDES_LIST.length + 5}" style="text-align: center; padding: 2rem; color: var(--text-muted);">No hay productos registrados en el catálogo.</td></tr>`;
      return;
    }

    products.forEach(p => {
      const tr = document.createElement('tr');
      let totalQty = 0;
      let campingCellsHtml = '';

      SEDES_LIST.forEach(sede => {
        const campingOrders = orders[sede] || {};
        const qty = campingOrders[p.id] || 0;
        totalQty += qty;

        campingCellsHtml += `
          <td class="camping-col-cell">
            <input type="number" min="0" class="matrix-qty-input" value="${qty}" data-camping="${sede}" data-pid="${p.id}">
          </td>
        `;
      });

      const stockDeficit = totalQty > p.stock;

      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: var(--text-primary);">${p.name}</div>
          <div class="font-mono" style="font-size: 0.72rem; color: var(--text-muted);">${p.code} • ${p.category}</div>
        </td>
        <td style="font-size: 0.78rem; color: var(--text-secondary);">${p.unit}</td>
        <td class="font-mono" style="text-align: center; font-weight: 700; font-size: 0.9rem; background: var(--bg-surface-subtle);">
          ${p.stock}
        </td>
        ${campingCellsHtml}
        <td class="total-col-cell font-mono" style="font-size: 0.95rem; color: ${stockDeficit ? '#ef4444' : 'var(--text-primary)'};">
          ${totalQty}
        </td>
        <td style="text-align: center;">
          <span class="status-pill-badge ${stockDeficit ? 'status-pendiente' : 'status-despachado'}">
            ${stockDeficit ? `Faltan ${totalQty - p.stock}` : 'OK'}
          </span>
        </td>
      `;

      this.matrixTbody.appendChild(tr);
    });

    // Matrix input change listener
    this.matrixTbody.querySelectorAll('.matrix-qty-input').forEach(input => {
      input.addEventListener('change', () => {
        const sede = input.getAttribute('data-camping');
        const pid = input.getAttribute('data-pid');
        const qty = input.value;
        DepositoStore.updateCampingOrderQty(sede, pid, qty);
        this.renderMatrixTable();
      });
    });
  }

  setupPrintSheetForCamping(sede) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    if (this.printSheetTitle) this.printSheetTitle.textContent = `REMITO INDIVIDUAL DE DESPACHO A SEDE`;
    if (this.printSheetSubtitle) this.printSheetSubtitle.textContent = `SEDE DESTINO: ${sede.toUpperCase()}`;
    if (this.printDateSpan) this.printDateSpan.textContent = dateStr;
    if (this.printSedeInfo) this.printSedeInfo.textContent = `REMITO N° REM-${Date.now().toString().slice(-6)} // DEPÓSITO CENTRAL: Parque Roca`;
  }

  setupPrintSheetForMatrix() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    if (this.printSheetTitle) this.printSheetTitle.textContent = `MATRIZ GENERAL DE DISTRIBUCIÓN Y CARGA LOGÍSTICA`;
    if (this.printSheetSubtitle) this.printSheetSubtitle.textContent = `CONSOLIDADO COMPARATIVO DE PEDIDOS (TODAS LAS SEDES)`;
    if (this.printDateSpan) this.printDateSpan.textContent = dateStr;
    if (this.printSedeInfo) this.printSedeInfo.textContent = `HOJA DE RUTA CONSOLIDADA // DEPÓSITO CENTRAL: Parque Roca`;
  }

  /* --------------------------------------------------------------------------
     3. SECTOR DESAYUNO (RECEPTION & FULFILLMENT BY DEPOSITO)
     -------------------------------------------------------------------------- */
  renderDesayuno() {
    if (!this.desayunoTbody) return;
    const requests = DepositoStore.getDesayunoRequests();

    this.desayunoTbody.innerHTML = '';

    if (requests.length === 0) {
      this.desayunoTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No hay solicitudes pendientes del Sector Desayuno.</td></tr>`;
      return;
    }

    requests.forEach(req => {
      const tr = document.createElement('tr');
      let statusClass = 'status-pendiente';
      if (req.status === 'En Preparación') statusClass = 'status-preparacion';
      if (req.status === 'Despachado') statusClass = 'status-despachado';

      tr.innerHTML = `
        <td class="font-mono" style="font-size: 0.75rem; color: var(--text-muted);">${req.date}</td>
        <td>
          <div style="font-weight: 700; color: var(--text-primary);">${req.item}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${req.notes || ''}</div>
        </td>
        <td class="font-mono" style="font-weight: 700; font-size: 0.88rem; color: var(--brand-navy-900);">${req.quantity}</td>
        <td><span class="badge-role badge-role-colonias">${req.category}</span></td>
        <td><span style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">${req.requestedBy}</span></td>
        <td>
          <span class="status-pill-badge ${statusClass}">${req.status}</span>
        </td>
        <td style="text-align: right;">
          <select class="form-select font-mono" data-desayuno-status-id="${req.id}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; width: auto; display: inline-block;">
            <option value="Pendiente" ${req.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="En Preparación" ${req.status === 'En Preparación' ? 'selected' : ''}>En Preparación</option>
            <option value="Despachado" ${req.status === 'Despachado' ? 'selected' : ''}>Despachado ✓</option>
          </select>
        </td>
      `;

      this.desayunoTbody.appendChild(tr);
    });

    this.desayunoTbody.querySelectorAll('[data-desayuno-status-id]').forEach(select => {
      select.addEventListener('change', () => {
        const id = select.getAttribute('data-desayuno-status-id');
        DepositoStore.updateDesayunoStatus(id, select.value);
        this.renderDesayuno();
        this.updateBadgeCounts();
        this.app.showToast({ title: 'Estado Actualizado', message: `Solicitud de Desayuno actualizada a "${select.value}".` });
      });
    });
  }

  /* --------------------------------------------------------------------------
     4. PLANTA DE ELABORACION (RECEPTION & FULFILLMENT BY DEPOSITO)
     -------------------------------------------------------------------------- */
  renderPlanta() {
    if (!this.plantaTbody) return;
    const requests = DepositoStore.getPlantaRequests();

    this.plantaTbody.innerHTML = '';

    if (requests.length === 0) {
      this.plantaTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No hay solicitudes pendientes de Planta de Elaboración.</td></tr>`;
      return;
    }

    requests.forEach(req => {
      const tr = document.createElement('tr');
      let statusClass = 'status-pendiente';
      if (req.status === 'En Preparación') statusClass = 'status-preparacion';
      if (req.status === 'Despachado') statusClass = 'status-despachado';

      tr.innerHTML = `
        <td class="font-mono" style="font-size: 0.75rem; color: var(--text-muted);">${req.date}</td>
        <td>
          <div style="font-weight: 700; color: var(--text-primary);">${req.item}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${req.notes || ''}</div>
        </td>
        <td class="font-mono" style="font-weight: 700; font-size: 0.88rem; color: var(--brand-navy-900);">${req.quantity}</td>
        <td><span class="badge-role badge-role-colonias">${req.category}</span></td>
        <td><span style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">${req.requestedBy}</span></td>
        <td>
          <span class="status-pill-badge ${statusClass}">${req.status}</span>
        </td>
        <td style="text-align: right;">
          <select class="form-select font-mono" data-planta-status-id="${req.id}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; width: auto; display: inline-block;">
            <option value="Pendiente" ${req.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="En Preparación" ${req.status === 'En Preparación' ? 'selected' : ''}>En Preparación</option>
            <option value="Despachado" ${req.status === 'Despachado' ? 'selected' : ''}>Despachado ✓</option>
          </select>
        </td>
      `;

      this.plantaTbody.appendChild(tr);
    });

    this.plantaTbody.querySelectorAll('[data-planta-status-id]').forEach(select => {
      select.addEventListener('change', () => {
        const id = select.getAttribute('data-planta-status-id');
        DepositoStore.updatePlantaStatus(id, select.value);
        this.renderPlanta();
        this.updateBadgeCounts();
        this.app.showToast({ title: 'Estado Actualizado', message: `Solicitud de Planta actualizada a "${select.value}".` });
      });
    });
  }
}
