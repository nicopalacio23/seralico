/**
 * SERALICO - REFERENTE DE SEDE CONTROLLER (COLONIAS DE VERANO)
 * Solicitud de Insumos a Depósito Central & Censo Dietético Diario (Generales, Diabéticos, Celíacos, Sin Lactosa)
 */

import { SedeStore, DepositoStore, SEDES_LIST } from './data.js';

export class SedeController {
  constructor(app) {
    this.app = app;
    this.currentSede = 'Sede Colón';
    this.currentTab = 'pedidos'; // 'pedidos' | 'dietas'
    this.catalogSearchQuery = '';
    this.selectedCategory = 'all';
    this.orderDraft = {};
    this.dietasDraft = {};
    this.currentUser = null;

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.sedeView = document.getElementById('sede-view');
    this.tabButtons = document.querySelectorAll('.sede-tab-btn');
    this.sectionPanels = document.querySelectorAll('.sede-section-panel');

    // Sede Switcher & Header
    this.selectSedePicker = document.getElementById('sede-current-selector');
    this.sedeTitleHeading = document.getElementById('sede-active-title');
    this.sedeSubtitle = document.getElementById('sede-active-subtitle');
    this.sedeUserBadge = document.getElementById('sede-user-tag');
    this.btnBackToHub = document.getElementById('btn-sede-back');

    // Stats Bar in Sede
    this.statTotalRaciones = document.getElementById('sede-stat-total-raciones');
    this.statEspeciales = document.getElementById('sede-stat-dietas-especiales');
    this.statInsumosItems = document.getElementById('sede-stat-insumos-items');
    this.statInsumosUnits = document.getElementById('sede-stat-insumos-units');

    // 1. Insumos Elements
    this.catalogTbody = document.getElementById('sede-catalog-tbody');
    this.catalogSearchInput = document.getElementById('sede-catalog-search');
    this.categoryFilterSelect = document.getElementById('sede-category-filter');
    this.btnSaveOrder = document.getElementById('btn-save-sede-order');
    this.btnPrintOrder = document.getElementById('btn-print-sede-order');
    this.orderSummaryCount = document.getElementById('sede-order-summary-count');
    this.orderSummaryUnits = document.getElementById('sede-order-summary-units');
    this.orderLastSyncSpan = document.getElementById('sede-order-last-sync');

    // 2. Dietas Elements
    this.inputGenerales = document.getElementById('diet-qty-generales');
    this.inputDiabeticos = document.getElementById('diet-qty-diabeticos');
    this.inputCeliacos = document.getElementById('diet-qty-celiacos');
    this.inputSinLactosa = document.getElementById('diet-qty-sin-lactosa');
    this.textareaObservaciones = document.getElementById('diet-observaciones');
    this.btnSaveDietas = document.getElementById('btn-save-sede-dietas');
    this.btnPrintDietas = document.getElementById('btn-print-sede-dietas');
    this.dietasLastUpdateSpan = document.getElementById('sede-dietas-last-update');
    this.dietasPercentBar = document.getElementById('sede-dietas-percent-bar');
    this.dietPercentGenerales = document.getElementById('diet-pct-generales');
    this.dietPercentDiabeticos = document.getElementById('diet-pct-diabeticos');
    this.dietPercentCeliacos = document.getElementById('diet-pct-celiacos');
    this.dietPercentSinLactosa = document.getElementById('diet-pct-sin-lactosa');
    this.dietTotalDisplay = document.getElementById('diet-total-display');

    // Print Sheet Elements
    this.printSheetTitle = document.getElementById('sede-print-title');
    this.printSheetSubtitle = document.getElementById('sede-print-subtitle');
    this.printSheetSede = document.getElementById('sede-print-sede');
    this.printSheetDate = document.getElementById('sede-print-date');
    this.printSheetBody = document.getElementById('sede-print-body');
  }

  bindEvents() {
    // Sede Selector Dropdown
    if (this.selectSedePicker) {
      this.selectSedePicker.addEventListener('change', (e) => {
        this.setSede(e.target.value);
      });
    }

    // Tabs
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-sede-tab');
        this.switchTab(tab);
      });
    });

    // Back button
    if (this.btnBackToHub) {
      this.btnBackToHub.addEventListener('click', (e) => {
        e.preventDefault();
        this.app.navigateTo('landing');
      });
    }

    // Search & Filter Catalog
    if (this.catalogSearchInput) {
      this.catalogSearchInput.addEventListener('input', (e) => {
        this.catalogSearchQuery = e.target.value.toLowerCase().trim();
        this.renderCatalogTable();
      });
    }

    if (this.categoryFilterSelect) {
      this.categoryFilterSelect.addEventListener('change', (e) => {
        this.selectedCategory = e.target.value;
        this.renderCatalogTable();
      });
    }

    // Save Order Button
    if (this.btnSaveOrder) {
      this.btnSaveOrder.addEventListener('click', () => {
        this.saveOrder();
      });
    }

    // Print Order Button
    if (this.btnPrintOrder) {
      this.btnPrintOrder.addEventListener('click', () => {
        this.printOrderReport();
      });
    }

    // Stepper buttons for dietas
    document.querySelectorAll('[data-diet-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-diet-target');
        const step = parseInt(btn.getAttribute('data-diet-step')) || 0;
        const input = document.getElementById(targetId);
        if (input) {
          const currentVal = parseInt(input.value) || 0;
          const newVal = Math.max(0, currentVal + step);
          input.value = newVal;
          this.updateDietasDraftFromInputs();
          this.renderDietasStats();
        }
      });
    });

    // Inputs change for dietas
    [this.inputGenerales, this.inputDiabeticos, this.inputCeliacos, this.inputSinLactosa].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          this.updateDietasDraftFromInputs();
          this.renderDietasStats();
        });
      }
    });

    // Save Dietas Button
    if (this.btnSaveDietas) {
      this.btnSaveDietas.addEventListener('click', () => {
        this.saveDietas();
      });
    }

    // Print Dietas Button
    if (this.btnPrintDietas) {
      this.btnPrintDietas.addEventListener('click', () => {
        this.printDietasReport();
      });
    }
  }

  setSede(sedeName, user = null) {
    if (!SEDES_LIST.includes(sedeName)) {
      this.currentSede = SEDES_LIST[0] || 'Sede Colón';
    } else {
      this.currentSede = sedeName;
    }

    if (user) {
      this.currentUser = user;
    }

    // Load drafts from stores
    this.orderDraft = { ...SedeStore.getSedeOrders(this.currentSede) };
    this.dietasDraft = { ...SedeStore.getDietas(this.currentSede) };

    // Update Selector value if exists
    if (this.selectSedePicker) {
      this.selectSedePicker.value = this.currentSede;
    }

    this.renderAll();
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    this.tabButtons.forEach(btn => {
      if (btn.getAttribute('data-sede-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.sectionPanels.forEach(panel => {
      if (panel.id === `sede-panel-${tabId}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    this.renderAll();
  }

  renderAll() {
    this.populateSedeDropdown();
    this.renderHeaderAndStats();
    this.renderCatalogTable();
    this.renderDietasInputs();
  }

  populateSedeDropdown() {
    if (!this.selectSedePicker) return;
    this.selectSedePicker.innerHTML = '';
    SEDES_LIST.forEach(sede => {
      const opt = document.createElement('option');
      opt.value = sede;
      opt.textContent = `🏢 ${sede}`;
      if (sede === this.currentSede) opt.selected = true;
      this.selectSedePicker.appendChild(opt);
    });
  }

  renderHeaderAndStats() {
    // 1. Header Text
    if (this.sedeTitleHeading) {
      this.sedeTitleHeading.textContent = `Gestión Operativa: ${this.currentSede}`;
    }
    if (this.sedeSubtitle) {
      this.sedeSubtitle.textContent = `Portal del Referente para pedidos a Depósito Central y Censo Dietético Diario.`;
    }
    if (this.sedeUserBadge) {
      const userName = this.currentUser ? this.currentUser.name : `Referente (${this.currentSede})`;
      this.sedeUserBadge.textContent = `👤 ${userName}`;
    }

    // 2. Stats
    const dietas = this.dietasDraft;
    const totalRaciones = (dietas.generales || 0) + (dietas.diabeticos || 0) + (dietas.celiacos || 0) + (dietas.sinLactosa || 0);
    const totalEspeciales = (dietas.diabeticos || 0) + (dietas.celiacos || 0) + (dietas.sinLactosa || 0);

    const orders = this.orderDraft;
    const catalog = DepositoStore.getCatalog().filter(p => p.active !== false);
    
    let requestedItemCount = 0;
    let totalUnits = 0;

    Object.keys(orders).forEach(prdId => {
      const qty = parseInt(orders[prdId]) || 0;
      if (qty > 0) {
        requestedItemCount++;
        totalUnits += qty;
      }
    });

    if (this.statTotalRaciones) this.statTotalRaciones.textContent = totalRaciones.toLocaleString();
    if (this.statEspeciales) this.statEspeciales.textContent = totalEspeciales.toLocaleString();
    if (this.statInsumosItems) this.statInsumosItems.textContent = requestedItemCount;
    if (this.statInsumosUnits) this.statInsumosUnits.textContent = totalUnits.toLocaleString();

    if (this.orderSummaryCount) this.orderSummaryCount.textContent = requestedItemCount;
    if (this.orderSummaryUnits) this.orderSummaryUnits.textContent = totalUnits;
  }

  /* --------------------------------------------------------------------------
     1. CATALOG & ORDERS TO DEPOSITO
     -------------------------------------------------------------------------- */
  renderCatalogTable() {
    if (!this.catalogTbody) return;
    this.catalogTbody.innerHTML = '';

    const allProducts = DepositoStore.getCatalog().filter(p => p.active !== false);
    
    // Filter
    const filtered = allProducts.filter(p => {
      const matchesSearch = !this.catalogSearchQuery || 
        p.name.toLowerCase().includes(this.catalogSearchQuery) || 
        p.code.toLowerCase().includes(this.catalogSearchQuery) ||
        p.category.toLowerCase().includes(this.catalogSearchQuery);
      
      const matchesCat = this.selectedCategory === 'all' || p.category === this.selectedCategory;
      return matchesSearch && matchesCat;
    });

    if (filtered.length === 0) {
      this.catalogTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            No se encontraron productos con el filtro aplicado.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(prd => {
      const currentQty = parseInt(this.orderDraft[prd.id]) || 0;
      const isSelected = currentQty > 0;

      const tr = document.createElement('tr');
      if (isSelected) tr.classList.add('tr-selected-order');

      tr.innerHTML = `
        <td class="font-mono" style="font-weight: 700; color: var(--text-secondary);">${prd.code}</td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">${prd.name}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">Insumo estándar para sedes de colonia</div>
        </td>
        <td>
          <span class="badge-tag font-mono">${prd.category}</span>
        </td>
        <td class="font-mono" style="font-size: 0.8rem; color: var(--text-secondary);">${prd.unit}</td>
        <td style="text-align: center;">
          <span class="font-mono" style="font-size: 0.82rem; font-weight: 600; color: ${prd.stock > 30 ? 'var(--mod-qa-accent)' : '#EA580C'};">
            ${prd.stock} un.
          </span>
        </td>
        <td style="text-align: right;">
          <div class="qty-stepper-control" style="justify-content: flex-end;">
            <button type="button" class="btn-step-sm btn-minus" data-prd-id="${prd.id}">-</button>
            <input type="number" class="input-step-qty font-mono" data-prd-input="${prd.id}" value="${currentQty}" min="0" max="999">
            <button type="button" class="btn-step-sm btn-plus" data-prd-id="${prd.id}">+</button>
            <button type="button" class="btn-step-sm btn-step-quick" data-prd-quick="${prd.id}" data-step="5" title="Sumar 5">+5</button>
          </div>
        </td>
      `;

      // Event listeners for stepper
      const inputEl = tr.querySelector(`[data-prd-input="${prd.id}"]`);
      const minusBtn = tr.querySelector(`.btn-minus`);
      const plusBtn = tr.querySelector(`.btn-plus`);
      const quickBtn = tr.querySelector(`[data-prd-quick="${prd.id}"]`);

      const updateVal = (val) => {
        const clean = Math.max(0, parseInt(val) || 0);
        this.orderDraft[prd.id] = clean;
        inputEl.value = clean;
        if (clean > 0) {
          tr.classList.add('tr-selected-order');
        } else {
          tr.classList.remove('tr-selected-order');
        }
        this.renderHeaderAndStats();
      };

      inputEl.addEventListener('input', (e) => updateVal(e.target.value));
      minusBtn.addEventListener('click', () => updateVal((parseInt(inputEl.value) || 0) - 1));
      plusBtn.addEventListener('click', () => updateVal((parseInt(inputEl.value) || 0) + 1));
      quickBtn.addEventListener('click', () => updateVal((parseInt(inputEl.value) || 0) + 5));

      this.catalogTbody.appendChild(tr);
    });
  }

  saveOrder() {
    SedeStore.saveBulkSedeOrders(this.currentSede, this.orderDraft);
    
    // If DepositoController is active on page, refresh it
    if (this.app.depositoController) {
      this.app.depositoController.renderAll();
    }

    const nowStr = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    if (this.orderLastSyncSpan) {
      this.orderLastSyncSpan.textContent = `Actualizado hoy ${nowStr}`;
    }

    this.renderHeaderAndStats();
    this.renderCatalogTable();

    this.app.showToast({
      title: 'Pedido Enviado a Depósito',
      message: `El pedido de ${this.currentSede} ha sido registrado y sincronizado en Depósito Central.`
    });
  }

  printOrderReport() {
    const catalog = DepositoStore.getCatalog();
    const orders = this.orderDraft;
    const dateStr = new Date().toLocaleDateString('es-AR');

    let rowsHtml = '';
    let totalItems = 0;
    let totalUnits = 0;

    catalog.forEach(prd => {
      const qty = parseInt(orders[prd.id]) || 0;
      if (qty > 0) {
        totalItems++;
        totalUnits += qty;
        rowsHtml += `
          <tr>
            <td style="font-family: monospace; font-weight: bold; border-bottom: 1px solid #ddd; padding: 6px;">${prd.code}</td>
            <td style="border-bottom: 1px solid #ddd; padding: 6px;">${prd.name}</td>
            <td style="border-bottom: 1px solid #ddd; padding: 6px;">${prd.category}</td>
            <td style="border-bottom: 1px solid #ddd; padding: 6px;">${prd.unit}</td>
            <td style="text-align: center; font-family: monospace; font-weight: bold; font-size: 11pt; border-bottom: 1px solid #ddd; padding: 6px; background: #f0fdf4;">${qty}</td>
          </tr>
        `;
      }
    });

    if (totalItems === 0) {
      alert('No hay productos con cantidad mayor a 0 en el pedido de esta sede.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permita las ventanas emergentes para imprimir.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Seralico - Comprobante de Pedido - ${this.currentSede}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 25px; color: #111; }
          .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 20pt; font-weight: bold; letter-spacing: -0.5px; }
          .meta { font-size: 9pt; color: #444; font-family: monospace; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10pt; }
          th { background: #f3f4f6; text-align: left; padding: 8px; border-bottom: 2px solid #333; font-size: 8.5pt; text-transform: uppercase; }
          .summary-box { margin-top: 20px; background: #fafafa; border: 1px solid #ccc; padding: 12px; display: flex; justify-content: space-between; font-size: 10pt; font-family: monospace; }
          .signatures { margin-top: 50px; display: flex; justify-content: space-between; gap: 30px; }
          .sig-box { flex: 1; border-top: 1px solid #000; padding-top: 6px; text-align: center; font-size: 8.5pt; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div style="font-size: 24pt; font-weight: 800; line-height: 1;">Seralico</div>
            <div style="font-size: 8pt; text-transform: uppercase; letter-spacing: 0.5px;">Servicio Argentino de Limpieza y Comida S.A.</div>
            <div class="title" style="margin-top: 6px;">SOLICITUD DE INSUMOS A DEPÓSITO CENTRAL</div>
            <div style="font-size: 12pt; font-weight: 600; color: #0284c7;">DESTINO: ${this.currentSede.toUpperCase()}</div>
          </div>
          <div class="meta" style="text-align: right;">
            <div>FECHA: ${dateStr}</div>
            <div>TEMPORADA ESTIVAL 2026</div>
            <div>SOLICITANTE: ${this.currentUser ? this.currentUser.name : 'Referente de Sede'}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>CÓDIGO</th>
              <th>DESCRIPCIÓN DEL INSUMO</th>
              <th>CATEGORÍA</th>
              <th>PRESENTACIÓN</th>
              <th style="text-align: center;">CANT. SOLICITADA</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="summary-box">
          <div>TOTAL ÍTEMS SOLICITADOS: <strong>${totalItems}</strong></div>
          <div>TOTAL UNIDADES FÍSICAS: <strong>${totalUnits}</strong></div>
          <div>ESTADO: <strong>ENVIADO A PAÑOL CENTRAL</strong></div>
        </div>

        <div class="signatures">
          <div class="sig-box">Firma Referente de Sede (${this.currentSede})</div>
          <div class="sig-box">Firma Recepción Depósito Central (Pañol)</div>
          <div class="sig-box">Firma Despacho Chofer Logística</div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  /* --------------------------------------------------------------------------
     2. CENSO DIETÉTICO (GENERALES, DIABÉTICOS, CELÍACOS, SIN LACTOSA)
     -------------------------------------------------------------------------- */
  renderDietasInputs() {
    const data = this.dietasDraft;
    if (this.inputGenerales) this.inputGenerales.value = data.generales || 0;
    if (this.inputDiabeticos) this.inputDiabeticos.value = data.diabeticos || 0;
    if (this.inputCeliacos) this.inputCeliacos.value = data.celiacos || 0;
    if (this.inputSinLactosa) this.inputSinLactosa.value = data.sinLactosa || 0;
    if (this.textareaObservaciones) this.textareaObservaciones.value = data.observaciones || '';

    if (this.dietasLastUpdateSpan && data.updatedAt) {
      const dateObj = new Date(data.updatedAt);
      const str = dateObj.toLocaleDateString('es-AR') + ' ' + dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      this.dietasLastUpdateSpan.textContent = `Último registro: ${str} (${data.updatedBy || 'Referente'})`;
    }

    this.renderDietasStats();
  }

  updateDietasDraftFromInputs() {
    this.dietasDraft.generales = parseInt(this.inputGenerales ? this.inputGenerales.value : 0) || 0;
    this.dietasDraft.diabeticos = parseInt(this.inputDiabeticos ? this.inputDiabeticos.value : 0) || 0;
    this.dietasDraft.celiacos = parseInt(this.inputCeliacos ? this.inputCeliacos.value : 0) || 0;
    this.dietasDraft.sinLactosa = parseInt(this.inputSinLactosa ? this.inputSinLactosa.value : 0) || 0;
    this.dietasDraft.observaciones = this.textareaObservaciones ? this.textareaObservaciones.value.trim() : '';
  }

  renderDietasStats() {
    const gen = this.dietasDraft.generales || 0;
    const diab = this.dietasDraft.diabeticos || 0;
    const cel = this.dietasDraft.celiacos || 0;
    const lac = this.dietasDraft.sinLactosa || 0;

    const total = gen + diab + cel + lac;
    const totalEspeciales = diab + cel + lac;

    const pctGen = total > 0 ? ((gen / total) * 100).toFixed(1) : '0.0';
    const pctDiab = total > 0 ? ((diab / total) * 100).toFixed(1) : '0.0';
    const pctCel = total > 0 ? ((cel / total) * 100).toFixed(1) : '0.0';
    const pctLac = total > 0 ? ((lac / total) * 100).toFixed(1) : '0.0';

    if (this.dietTotalDisplay) this.dietTotalDisplay.textContent = total.toLocaleString();
    if (this.statTotalRaciones) this.statTotalRaciones.textContent = total.toLocaleString();
    if (this.statEspeciales) this.statEspeciales.textContent = totalEspeciales.toLocaleString();

    if (this.dietPercentGenerales) this.dietPercentGenerales.textContent = `${pctGen}%`;
    if (this.dietPercentDiabeticos) this.dietPercentDiabeticos.textContent = `${pctDiab}%`;
    if (this.dietPercentCeliacos) this.dietPercentCeliacos.textContent = `${pctCel}%`;
    if (this.dietPercentSinLactosa) this.dietPercentSinLactosa.textContent = `${pctLac}%`;

    if (this.dietasPercentBar) {
      this.dietasPercentBar.innerHTML = `
        <div style="width: ${pctGen}%; background: var(--brand-blue); title: Generales ${pctGen}%;" class="diet-bar-segment"></div>
        <div style="width: ${pctDiab}%; background: #10B981; title: Diabéticos ${pctDiab}%;" class="diet-bar-segment"></div>
        <div style="width: ${pctCel}%; background: #F59E0B; title: Celíacos ${pctCel}%;" class="diet-bar-segment"></div>
        <div style="width: ${pctLac}%; background: #8B5CF6; title: Sin Lactosa ${pctLac}%;" class="diet-bar-segment"></div>
      `;
    }
  }

  saveDietas() {
    this.updateDietasDraftFromInputs();
    const updatedUser = this.currentUser ? this.currentUser.name : `Referente (${this.currentSede})`;
    this.dietasDraft.updatedBy = updatedUser;

    const saved = SedeStore.saveDietas(this.currentSede, this.dietasDraft);

    const nowStr = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    if (this.dietasLastUpdateSpan) {
      this.dietasLastUpdateSpan.textContent = `Último registro: Hoy ${nowStr} (${updatedUser})`;
    }

    this.renderHeaderAndStats();

    this.app.showToast({
      title: 'Censo Dietético Actualizado',
      message: `Padrón de ${this.currentSede} guardado y notificado a Planta de Elaboración y Sector Desayuno.`
    });
  }

  printDietasReport() {
    const data = this.dietasDraft;
    const dateStr = new Date().toLocaleDateString('es-AR');
    const total = (data.generales || 0) + (data.diabeticos || 0) + (data.celiacos || 0) + (data.sinLactosa || 0);
    const totalEspeciales = (data.diabeticos || 0) + (data.celiacos || 0) + (data.sinLactosa || 0);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permita las ventanas emergentes para imprimir.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Seralico - Planilla de Censo de Comensales - ${this.currentSede}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 30px; color: #111; }
          .header { border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 18pt; font-weight: bold; letter-spacing: -0.5px; }
          .meta { font-size: 9pt; color: #444; font-family: monospace; }
          .grid-dietas { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 25px 0; }
          .diet-card { border: 1px solid #000; padding: 15px; border-radius: 4px; }
          .diet-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
          .diet-val { font-size: 26pt; font-weight: 800; font-family: monospace; }
          .diet-desc { font-size: 8.5pt; color: #555; }
          .summary-banner { background: #f4f4f5; border: 2px solid #27272a; padding: 15px; border-radius: 4px; margin: 20px 0; display: flex; justify-content: space-between; align-items: center; }
          .obs-box { border: 1px solid #71717a; padding: 12px; border-radius: 4px; margin-top: 15px; min-height: 50px; font-size: 9.5pt; }
          .signatures { margin-top: 60px; display: flex; justify-content: space-between; gap: 30px; }
          .sig-box { flex: 1; border-top: 1px solid #000; padding-top: 6px; text-align: center; font-size: 8.5pt; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div style="font-size: 24pt; font-weight: 800; line-height: 1;">Seralico</div>
            <div style="font-size: 8pt; text-transform: uppercase; letter-spacing: 0.5px;">Servicio Argentino de Limpieza y Comida S.A.</div>
            <div class="title" style="margin-top: 6px;">PLANILLA OFICIAL DE CENSO DIETÉTICO DIARIO</div>
            <div style="font-size: 12pt; font-weight: 600; color: #0284c7;">SEDE: ${this.currentSede.toUpperCase()}</div>
          </div>
          <div class="meta" style="text-align: right;">
            <div>FECHA DEL DÍA: ${dateStr}</div>
            <div>TEMPORADA ESTIVAL 2026</div>
            <div>RESPONSABLE: ${this.currentUser ? this.currentUser.name : 'Referente de Sede'}</div>
          </div>
        </div>

        <div class="summary-banner">
          <div>
            <div style="font-size: 9pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL GENERAL DE VIANDAS Y RACIONES A PREPARAR:</div>
            <div style="font-size: 11pt; color: #555;">(Raciones Estándar: ${data.generales || 0} // Dietas Clínicas Especiales: ${totalEspeciales})</div>
          </div>
          <div style="font-size: 32pt; font-weight: 900; font-family: monospace;">${total}</div>
        </div>

        <div class="grid-dietas">
          <div class="diet-card" style="border-left: 6px solid #0284C7;">
            <div class="diet-title">1. Menú General (Común)</div>
            <div class="diet-val">${data.generales || 0}</div>
            <div class="diet-desc">Comensales sin restricciones dietarias ni patologías diagnosticadas.</div>
          </div>

          <div class="diet-card" style="border-left: 6px solid #10B981;">
            <div class="diet-title">2. Diabéticos (Control Glucémico)</div>
            <div class="diet-val">${data.diabeticos || 0}</div>
            <div class="diet-desc">Plan alimentario hipocalórico / sin azúcares simples agregados.</div>
          </div>

          <div class="diet-card" style="border-left: 6px solid #F59E0B;">
            <div class="diet-title">3. Celíacos (Sin T.A.C.C.)</div>
            <div class="diet-val">${data.celiacos || 0}</div>
            <div class="diet-desc">100% Libre de gluten, manipulación y sellado en área estéril aislada.</div>
          </div>

          <div class="diet-card" style="border-left: 6px solid #8B5CF6;">
            <div class="diet-title">4. Sin Lactosa</div>
            <div class="diet-val">${data.sinLactosa || 0}</div>
            <div class="diet-desc">Preparaciones y colaciones sin derivados lácteos de origen vacuno.</div>
          </div>
        </div>

        <div style="margin-top: 15px;">
          <div style="font-size: 9pt; font-weight: bold; text-transform: uppercase;">Observaciones Médicas / Alertas Bromatológicas Registradas:</div>
          <div class="obs-box">${data.observaciones ? data.observaciones : 'Sin observaciones especiales para la fecha.'}</div>
        </div>

        <div class="signatures">
          <div class="sig-box">Firma Referente de Sede (${this.currentSede})</div>
          <div class="sig-box">Firma Jefa de Planta (Cocina Central)</div>
          <div class="sig-box">Firma Auditor Bromatológico</div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}
