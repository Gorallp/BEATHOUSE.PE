/* pago.js
   - modular
   - genera formularios según método
   - valida datos básicos
   - genera boleta visual y descarga PDF
   - genera QR dinámico para billetera
*/

/* ---------- Config (puedes recuperarlo del localStorage si lo prefieres) ---------- */
const producto = JSON.parse(localStorage.getItem("productoSeleccionado")) ||
  { nombre: "Instrumento X", precioFinal: 125.00, cantidad: 1 };

const formArea = document.getElementById("form-area");
const receiptArea = document.getElementById("receipt-area");
const receiptContent = document.getElementById("receipt-content");
const btnDownload = document.getElementById("download-pdf");
const btnCloseReceipt = document.getElementById("close-receipt");

/* ---------- listeners en botones de método ---------- */
document.querySelectorAll(".method-btn").forEach(b => {
  b.addEventListener("click", () => {
    const method = b.getAttribute("data-method");
    renderForm(method);
  });
});

/* ---------- Render del formulario según método ---------- */
function renderForm(tipo) {
  // limpiar
  receiptArea.classList.add("hidden");
  formArea.innerHTML = "";

  // campos comunes
  const commonFields = `
    <label>Nombre completo</label>
    <input id="cliente-nombre" type="text" placeholder="Nombre y apellidos" required>
    <label>DNI / Documento</label>
    <input id="cliente-dni" type="text" placeholder="DNI" required>
    <label>Correo electrónico</label>
    <input id="cliente-email" type="email" placeholder="ejemplo@correo.com" required>
  `;

  if (tipo === "efectivo") {
    formArea.innerHTML = `
      <div class="card">
        <h3>Pago en Efectivo (Contra entrega)</h3>
        ${commonFields}
        <label>Dirección de entrega</label>
        <input id="direccion-entrega" type="text" placeholder="Av. Principal 123, Lima" required>
        <small>Presenta el monto exacto al recibir el producto para evitar cambios.</small>

        <div style="margin-top:10px">
          <strong>Total a pagar: S/. ${producto.precioFinal.toFixed(2)}</strong>
        </div>

        <button class="btn-primary" id="confirm-efectivo">Confirmar y Generar Boleta</button>
      </div>
    `;

    document.getElementById("confirm-efectivo").addEventListener("click", () => {
      // valida
      const nombre = document.getElementById("cliente-nombre").value.trim();
      const dni = document.getElementById("cliente-dni").value.trim();
      const email = document.getElementById("cliente-email").value.trim();
      const direccion = document.getElementById("direccion-entrega").value.trim();

      if (!nombre || !dni || !email || !direccion) {
        Swal.fire({icon:'warning', title:'Complete los datos', text:'Faltan campos obligatorios.'});
        return;
      }

      // simulación confirmación
      Swal.fire({
        title: 'Confirma el pago en efectivo',
        html: `<p>Monto: <b>S/. ${producto.precioFinal.toFixed(2)}</b></p>
               <p>Dirección: ${direccion}</p>`,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
      }).then(result => {
        if (result.isConfirmed) {
          const receiptData = buildReceipt('Efectivo', { nombre, dni, email, direccion });
          showReceipt(receiptData);
        }
      });
    });

  } else if (tipo === "billetera") {
    formArea.innerHTML = `
      <div class="card">
        <h3>Billetera Virtual</h3>
        ${commonFields}
        <label>Proveedor</label>
        <select id="wallet-provider">
          <option value="yape">Yape</option>
          <option value="plin">Plin</option>
          <option value="tunki">Tunki</option>
        </select>

        <label>Número celular / cuenta</label>
        <input id="wallet-number" type="text" placeholder="9XXXXXXXX" required>
        <small>Se generará un QR con el monto exacto para pagar.</small>

        <div style="margin-top:10px">
          <strong>Total a pagar: S/. ${producto.precioFinal.toFixed(2)}</strong>
        </div>

        <div style="margin-top:12px" id="wallet-qr-area"></div>

        <button class="btn-primary" id="generate-qr">Generar QR</button>
        <button class="btn-secondary" id="confirm-wallet" style="margin-left:8px">Marcar como Pagado</button>
      </div>

      <div class="preview-column">
        <div class="qr-box">
          <p>Escanea para pagar</p>
          <div id="qrcode" class="qr-canvas"></div>
          <small id="wallet-instructions" style="display:block;color:#d1d5db;margin-top:10px">Genera el QR para ver instrucciones.</small>
        </div>
      </div>
    `;

    let generatedData = null;
    document.getElementById("generate-qr").addEventListener("click", () => {
      const provider = document.getElementById("wallet-provider").value;
      const number = document.getElementById("wallet-number").value.trim();
      const nombre = document.getElementById("cliente-nombre").value.trim();
      const dni = document.getElementById("cliente-dni").value.trim();
      const email = document.getElementById("cliente-email").value.trim();

      if (!nombre || !dni || !email || !number) {
        Swal.fire({icon:'warning', title:'Complete los datos', text:'Faltan campos obligatorios.'});
        return;
      }

      // payload que iría al pago: aquí solo simulamos
      const payload = {
        provider,
        to: number,
        amount: producto.precioFinal.toFixed(2),
        concept: `Compra BeatHouse - ${producto.nombre}`
      };

      // limpiar QR anterior
      document.getElementById("qrcode").innerHTML = '';

      // generar string simple para QR (en real, sería un link o Payload estándar)
      const qrString = JSON.stringify(payload);
      new QRCode(document.getElementById("qrcode"), { text: qrString, width: 200, height: 200 });

      generatedData = { nombre, dni, email, provider, number, payload };

      document.getElementById("wallet-instructions").innerText = `Escanea y realiza el pago de S/. ${producto.precioFinal.toFixed(2)} con ${provider.toUpperCase()}. Luego toca "Marcar como Pagado".`;

      Swal.fire({icon:'success', title:'QR generado', text:'Escanee el QR desde su app de billetera.'});
    });

    document.getElementById("confirm-wallet").addEventListener("click", () => {
      if (!generatedData) {
        Swal.fire({icon:'info', title:'QR no generado', text:'Genera el QR y realiza el pago antes de confirmar.'});
        return;
      }

      // simular verificación de pago: en producción aquí validarías con la API del proveedor o con backend
      Swal.fire({
        title:'Confirmar pago',
        html:`<p>Monto: <b>S/. ${producto.precioFinal.toFixed(2)}</b></p>
              <p>Proveedor: <b>${generatedData.provider.toUpperCase()}</b></p>`,
        showCancelButton:true,
        confirmButtonText:'Sí, confirmé'
      }).then(res => {
        if (res.isConfirmed) {
          const receiptData = buildReceipt('Billetera Virtual', generatedData);
          showReceipt(receiptData);
        }
      });
    });

  } else if (tipo === "deposito") {
    formArea.innerHTML = `
      <div class="card">
        <h3>Depósito / Transferencia Bancaria</h3>
        ${commonFields}
        <label>Banco</label>
        <input id="bank-name" type="text" placeholder="Banco (ej. BCP, BBVA)" required>
        <label>Número de cuenta / CCI</label>
        <input id="bank-account" type="text" placeholder="Cuenta o CCI" required>
        <label>Código de operación (nro. de voucher)</label>
        <input id="operation-code" type="text" placeholder="Ej. 12345678" required>
        <label>Adjuntar comprobante (imagen / pdf, opcional)</label>
        <input id="comprobante-file" type="file" accept="image/*,.pdf">

        <div style="margin-top:10px">
          <strong>Total a pagar: S/. ${producto.precioFinal.toFixed(2)}</strong>
        </div>

        <button class="btn-primary" id="confirm-deposito">Enviar comprobante y Generar Boleta</button>
      </div>
    `;

    document.getElementById("confirm-deposito").addEventListener("click", async () => {
      const nombre = document.getElementById("cliente-nombre").value.trim();
      const dni = document.getElementById("cliente-dni").value.trim();
      const email = document.getElementById("cliente-email").value.trim();
      const bank = document.getElementById("bank-name").value.trim();
      const account = document.getElementById("bank-account").value.trim();
      const op = document.getElementById("operation-code").value.trim();
      const fileInput = document.getElementById("comprobante-file");

      if (!nombre || !dni || !email || !bank || !account || !op) {
        Swal.fire({icon:'warning', title:'Complete los datos', text:'Faltan campos obligatorios.'});
        return;
      }

      // Si hay comprobante, validar tamaño/tipo (opcional)
      let fileData = null;
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.size > 4 * 1024 * 1024) { // >4MB
          Swal.fire({icon:'error', title:'Archivo muy grande', text:'El comprobante no debe superar 4MB.'});
          return;
        }
        // leer como base64 (ejemplo) para enviar al backend
        fileData = await readFileAsBase64(file);
      }

      // Simular envío al servidor: aquí podrías hacer fetch POST a tu endpoint pago.java
      Swal.fire({
        title:'Confirmar depósito',
        html:`<p>Banco: <b>${bank}</b></p><p>Operación: <b>${op}</b></p>`,
        showCancelButton:true,
        confirmButtonText:'Confirmar'
      }).then(res => {
        if (res.isConfirmed) {
          const payload = { nombre, dni, email, bank, account, op, fileData };
          const receiptData = buildReceipt('Depósito Bancario', payload);
          showReceipt(receiptData);
        }
      });

    });

  } // end if tipo
} // end renderForm


/* ---------- Utilities ---------- */
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsDataURL(file);
  });
}

/* ---------- Construir datos para boleta ---------- */
function buildReceipt(metodo, meta) {
  const now = new Date();
  const receiptNumber = `BH-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*9000)+1000}`;
  return {
    receiptNumber,
    date: now.toLocaleString(),
    metodo,
    producto,
    cliente: {
      nombre: meta.nombre || meta.nombre || 'Cliente',
      dni: meta.dni || meta.dni || '',
      email: meta.email || meta.email || ''
    },
    meta,
    total: producto.precioFinal.toFixed(2)
  };
}

/* ---------- Mostrar boleta en la UI ---------- */
function showReceipt(data) {
  receiptContent.innerHTML = `
    <div class="line"><div><strong>Nro:</strong> ${data.receiptNumber}</div><div><strong>Fecha:</strong> ${data.date}</div></div>
    <div class="line"><div><strong>Cliente:</strong> ${escapeHtml(data.cliente.nombre)}</div><div><strong>DNI:</strong> ${escapeHtml(data.cliente.dni)}</div></div>
    <div class="line"><div><strong>Correo:</strong> ${escapeHtml(data.cliente.email)}</div><div><strong>Método:</strong> ${escapeHtml(data.metodo)}</div></div>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:8px 0">
    <div class="line"><div><strong>Producto:</strong> ${escapeHtml(data.producto.nombre)}</div><div><strong>Cant:</strong> ${data.producto.cantidad}</div></div>
    <div class="line"><div><strong>Subtotal:</strong></div><div>S/. ${data.total}</div></div>
    <div style="margin-top:10px"><strong>Estado:</strong> <span style="color:#a3f3b1">Pago confirmado</span></div>
  `;
  receiptArea.classList.remove("hidden");

  // attach download listener (re-set)
  btnDownload.onclick = () => generatePDF(data);
  btnCloseReceipt.onclick = () => receiptArea.classList.add("hidden");

  // mensaje final
  Swal.fire({
    icon:'success',
    title:'Pago registrado',
    text:`Boleta generada. Nro ${data.receiptNumber}`,
    timer:2000,
    showConfirmButton:false
  });
}

/* ---------- Generar PDF con jsPDF ---------- */
/* ---------- Generar PDF profesional con logo, RUC y QR ---------- */
async function generatePDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // ---------- CONFIGURABLE: Cambia estos datos a los reales ----------
  const company = {
    name: 'BeatHouse',
    address: 'Puente Bolognesi 207, Arequipa, Perú',
    phone: '+51 982 788 020',
    ruc: 'RUC: 20512345678' 
  };
  // ------------------------------------------------------------------

  // Load logo (logo.png) - you must have logo.png en la misma carpeta
  let logoDataUrl = null;
  try {
    logoDataUrl = await loadImageAsDataURL("recursos/logo.jpg");
  } catch (e) {
    // Si no existe, no rompa: seguiremos sin logo
    console.warn('No se encontró logo.png o no se pudo cargar. Se generará PDF sin logo.', e);
  }

  // Generar QR con la info mínima de la boleta (JSON con nro y total) -> como imagen base64
  const qrPayload = {
    receiptNumber: data.receiptNumber,
    total: data.total,
    cliente: data.cliente.nombre,
    metodo: data.metodo
    // Puedes agregar más campos (idVenta, referenciaBack, url comprobante, etc.)
  };
  const qrDataUrl = await createQRCodeDataURL(JSON.stringify(qrPayload), 180);

  // ---------- Estilos y posiciones ----------
  const marginLeft = 40;
  let cursorY = 48;

  // Header: logo + company name + RUC
  if (logoDataUrl) {
    // dibujar logo a la izquierda
    doc.addImage(logoDataUrl, 'PNG', marginLeft, cursorY - 8, 140, 40);
  }

  // Company name centered-ish
  doc.setFontSize(18);
  doc.setTextColor(34, 34, 34);
  const titleX = logoDataUrl ? marginLeft + 150 : marginLeft;
  doc.text(company.name, titleX, cursorY + 6);

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(company.address, titleX, cursorY + 24);
  doc.text(company.phone, titleX, cursorY + 38);

  // RUC a la derecha
  doc.setFontSize(10);
  doc.setTextColor(10, 10, 10);
  doc.text(company.ruc, pageWidth - marginLeft - doc.getStringUnitWidth(company.ruc) * doc.internal.getFontSize() , cursorY + 8);

  cursorY += 72;

  // Caja de info de recibo (número y fecha)
  doc.setDrawColor(200);
  doc.roundedRect(marginLeft, cursorY - 6, pageWidth - marginLeft * 2, 48, 6, 6, 'S');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(`Boleta: ${data.receiptNumber}`, marginLeft + 12, cursorY + 8);
  doc.text(`Fecha: ${data.date}`, marginLeft + 12, cursorY + 26);
  doc.text(`Método: ${data.metodo}`, pageWidth - marginLeft - 140, cursorY + 8);

  cursorY += 70;

  // Cliente
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text('Datos del cliente:', marginLeft, cursorY);
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Nombre: ${data.cliente.nombre}`, marginLeft + 12, cursorY + 18);
  doc.text(`DNI: ${data.cliente.dni}`, marginLeft + 12, cursorY + 34);
  doc.text(`Correo: ${data.cliente.email}`, marginLeft + 12, cursorY + 50);

  cursorY += 80;

  // Tabla de detalle (Producto / Cant / Precio unit / Subtotal)
  const tableLeft = marginLeft;
  const tableWidth = pageWidth - marginLeft * 2 - 200; // reservar espacio para QR a la derecha
  const col1 = tableLeft + 6; // Producto
  const col2 = tableLeft + Math.floor(tableWidth * 0.55); // Cant
  const col3 = tableLeft + Math.floor(tableWidth * 0.75); // Precio unit
  const col4 = tableLeft + Math.floor(tableWidth * 0.92); // subtotal

  // Cabecera de tabla
  doc.setFillColor(245, 245, 245);
  doc.setDrawColor(220);
  doc.rect(tableLeft, cursorY - 6, tableWidth, 22, 'F'); // rect de cabecera
  doc.setFontSize(10);
  doc.setTextColor(10, 10, 10);
  doc.text('Producto', col1, cursorY + 10);
  doc.text('Cant', col2, cursorY + 10);
  doc.text('Precio c/u', col3, cursorY + 10);
  doc.text('Subtotal', col4, cursorY + 10);

  // Items (si tienes varios, itera; aquí usaremos data.producto o un arreglo)
  cursorY += 26;
  doc.setFontSize(10);
  const items = Array.isArray(data.producto) ? data.producto : [data.producto];
  items.forEach(item => {
    const name = item.nombre || item.name || 'Producto';
    const qty = item.cantidad || item.qty || 1;
    const unit = (item.precioFinal || item.precio || item.price || data.total);
    const subtotal = (Number(unit) * Number(qty)).toFixed(2);

    doc.text(name, col1, cursorY + 10, { maxWidth: col2 - col1 - 6 });
    doc.text(String(qty), col2, cursorY + 10);
    doc.text(`S/. ${Number(unit).toFixed(2)}`, col3, cursorY + 10);
    doc.text(`S/. ${subtotal}`, col4, cursorY + 10);

    cursorY += 18;
  });

  // Totales (derecha)
  cursorY += 6;
  const rightColX = tableLeft + tableWidth - 2;
  doc.setFontSize(11);
  doc.text(`Total: S/. ${data.total}`, rightColX - 120, cursorY + 10);

  // Si hay metadatos (banco/operacion) mostrar
  if (data.meta) {
    cursorY += 28;
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    if (data.metodo === 'Depósito Bancario') {
      doc.text(`Banco: ${data.meta.bank || data.meta.banco || ''}`, marginLeft, cursorY);
      doc.text(`Operación: ${data.meta.op || data.meta.operation || ''}`, marginLeft + 220, cursorY);
      cursorY += 18;
    } else if (data.metodo === 'Billetera Virtual') {
      doc.text(`Proveedor: ${data.meta.provider ? data.meta.provider.toUpperCase() : ''}`, marginLeft, cursorY);
      doc.text(`Destino: ${data.meta.number || data.meta.to || ''}`, marginLeft + 220, cursorY);
      cursorY += 18;
    } else if (data.metodo === 'Efectivo') {
      doc.text(`Dirección: ${data.meta.direccion || ''}`, marginLeft, cursorY);
      cursorY += 18;
    }
  }

  // QR en la columna derecha, con la info de la boleta
  const qrX = tableLeft + tableWidth + 20;
  const qrY = 180;
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, 140, 140);
      doc.setFontSize(9);
      doc.setTextColor(70,70,70);
      doc.text('Escanea para verificar', qrX, qrY + 155);
    } catch (e) {
      console.warn('No se pudo incrustar el QR en el PDF', e);
    }
  }

  // Footer / mensaje
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  const footerY = 760;
  doc.text('Gracias por tu compra en BeatHouse. ¡Que la música siga sonando!', marginLeft, footerY);
  doc.text('Si necesita soporte, contáctenos: soporte@beathouse.com', marginLeft, footerY + 14);

  // Guardar PDF con nombre
  const filename = `${data.receiptNumber}_BeatHouse.pdf`;
  doc.save(filename);
}

/* ---------- Helpers para imágenes/QR ---------- */

// Crea un QR temporal y devuelve dataURL PNG (usa QRCode.js)
function createQRCodeDataURL(text, size = 200) {
  return new Promise((resolve) => {
    // crear contenedor temporal
    const tmp = document.createElement('div');
    tmp.style.position = 'fixed';
    tmp.style.left = '-10000px';
    document.body.appendChild(tmp);

    const qr = new QRCode(tmp, { text: text, width: size, height: size, correctLevel: QRCode.CorrectLevel.H });
    // dar tiempo a que se renderice (QRCode.js usa canvas/img)
    setTimeout(() => {
      // buscar canvas o img
      const canvas = tmp.querySelector('canvas');
      const img = tmp.querySelector('img');
      let dataUrl = null;
      if (canvas) dataUrl = canvas.toDataURL('image/png');
      else if (img) {
        // si es una img, cargarla a canvas
        const c = document.createElement('canvas');
        c.width = size; c.height = size;
        const ctx = c.getContext('2d');
        const image = new Image();
        image.crossOrigin = 'Anonymous';
        image.onload = () => {
          ctx.drawImage(image, 0, 0);
          const d = c.toDataURL('image/png');
          cleanup();
          resolve(d);
        };
        image.src = img.src;
        return;
      }
      cleanup();
      resolve(dataUrl);
    }, 250);

    function cleanup() { try { tmp.remove(); } catch (e) { /* ignore */ } }
  });
}

// Cargar imagen y devolver dataURL (logo)
function loadImageAsDataURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      // dibujar en canvas para obtener dataURL
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}


/* ---------- Helpers ---------- */
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[&<"']/g, m => ({'&':'&amp;','<':'&lt;','"':'&quot;',"'":'&#039;'}[m]));
}

