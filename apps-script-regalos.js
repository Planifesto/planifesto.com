// ============================================
// GOOGLE APPS SCRIPT - Sistema de Regalos
// Planifesto "Regala Un Planifesto"
// ============================================
//
// INSTRUCCIONES:
// 1. Abre tu Google Sheets donde manejas los pedidos
// 2. Ve a Extensiones > Apps Script
// 3. Agrega este codigo como un archivo nuevo (o al lado de tu enviarArchivos existente)
// 4. La hoja "Regalos" se crea automaticamente la primera vez
// 5. Haz clic en "Implementar" > "Nueva implementacion"
//    - Tipo: "Aplicacion web"
//    - Ejecutar como: "Yo"
//    - Quien tiene acceso: "Cualquier persona"
// 6. Copia la URL y pegala en tu script.js donde dice:
//    const APPS_SCRIPT_URL = 'TU_URL_DE_APPS_SCRIPT_AQUI';
//
// COMO FUNCIONA:
// - Cuando alguien compra un regalo por Stripe/PayPal, la web envia
//   los datos del regalo (comprador, destinatario, dedicatoria) a esta API
// - Los datos se guardan en la hoja "Regalos" como "Pendiente de pago"
// - Cuando el pago aparece en tu hoja principal, ejecuta enviarArchivos()
//   y automaticamente detecta si es un regalo, enviando al destinatario
//   con la dedicatoria incluida
// ============================================

// ---- RECIBIR DATOS DE REGALO DESDE LA WEB ----

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Regalos');

    // Si no existe la hoja, crearla con encabezados
    if (!sheet) {
      sheet = ss.insertSheet('Regalos');
      sheet.appendRow([
        'ID Orden', 'Comprador', 'Email Comprador', 'Destinatario',
        'Email Destinatario', 'Dedicatoria', 'Producto', 'ID Producto',
        'Metodo Pago', 'Fecha', 'Estado'
      ]);
      sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
    }

    sheet.appendRow([
      data.orderId || '',
      data.buyerName || '',
      data.buyerEmail || '',
      data.recipientName || '',
      data.recipientEmail || '',
      data.dedication || '',
      data.product || '',
      data.productId || '',
      data.paymentMethod || data.paymentType || '',
      data.timestamp || new Date().toISOString(),
      'Pendiente de pago'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, orderId: data.orderId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Regalos API activa' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- BUSCAR SI UN PEDIDO ES REGALO (en datos ya cargados) ----
// Busca por email del comprador en los datos de la hoja "Regalos"
// datosRegalos: array de datos ya leidos de la hoja Regalos
// hojaRegalos: referencia a la hoja para marcar como Enviado

function buscarRegalo(emailComprador, datosRegalos, hojaRegalos) {
  if (!emailComprador || !datosRegalos || datosRegalos.length <= 1) return null;

  for (var i = datosRegalos.length - 1; i >= 1; i--) {
    var estado = datosRegalos[i][10];           // Columna K: Estado
    if (estado === 'Pendiente de pago') {
      var emailRegalos = datosRegalos[i][2];    // Columna C: Email Comprador

      if (emailRegalos &&
          emailComprador.toLowerCase().trim() === emailRegalos.toString().toLowerCase().trim()) {
        // Marcar como procesado en la hoja y en el cache
        hojaRegalos.getRange(i + 1, 11).setValue('Enviado');
        datosRegalos[i][10] = 'Enviado';

        return {
          comprador: datosRegalos[i][1],
          destinatario: datosRegalos[i][3],
          emailDestinatario: datosRegalos[i][4],
          dedicatoria: datosRegalos[i][5],
          productId: datosRegalos[i][7],
          fila: i + 1
        };
      }
    }
  }

  return null;
}

// Convierte emojis (surrogate pairs) a entidades HTML numericas
// Usa charCodeAt en vez de codePointAt para compatibilidad total
function emojiToHtml(str) {
  if (!str) return '';
  return String(str).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(pair) {
    var hi = pair.charCodeAt(0);
    var lo = pair.charCodeAt(1);
    var cp = ((hi - 0xD800) * 0x400) + (lo - 0xDC00) + 0x10000;
    return '&#' + cp + ';';
  });
}

// ---- ENVIAR ARCHIVOS (MODIFICADO PARA REGALOS) ----
// Reemplaza tu funcion enviarArchivos() existente con esta version
// Detecta automaticamente si un pedido es un regalo y envia al destinatario

function enviarArchivos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getActiveSheet();
  const datos = hoja.getDataRange().getValues();

  // Leer datos de Regalos UNA SOLA VEZ (no por cada fila)
  const hojaRegalos = ss.getSheetByName('Regalos');
  const datosRegalos = hojaRegalos ? hojaRegalos.getDataRange().getValues() : [];

  // Archivos por nombre de producto (como llegan de Stripe/PayPal via Zapier)
  const archivos = {
    "Plantilla Parejas PRO (25% OFF)":"https://drive.google.com/file/d/1PtT-DQoq8iryfBvMpmm2ZosFr7ORJ5kf/view?usp=sharing",
    "Plantilla Parejas PRO (50% OFF)":"https://drive.google.com/file/d/1PtT-DQoq8iryfBvMpmm2ZosFr7ORJ5kf/view?usp=sharing",
    "Plantilla Parejas PRO (25% OFF ADICIONAL TALLER)":"https://drive.google.com/file/d/1PtT-DQoq8iryfBvMpmm2ZosFr7ORJ5kf/view?usp=sharing",
    "COMBO PLANIFESTO": "https://drive.google.com/file/d/144PTqfSCD53KI3E5Kz7IPTroH0S2XJvb/view?usp=sharing",
    "COMBO PLANIFESTO (25% OFF TALLER)": "https://drive.google.com/file/d/144PTqfSCD53KI3E5Kz7IPTroH0S2XJvb/view?usp=sharing",
    "Plantilla PLANIFESTO": "https://drive.google.com/file/d/1En2u64fiXpK-e6OwnAJ3GomPBs0vBwVu/view?usp=sharing",
    "Plantilla PLANIFESTO (10% OFF)": "https://drive.google.com/file/d/1En2u64fiXpK-e6OwnAJ3GomPBs0vBwVu/view?usp=sharing",
    "Plantilla PLANIFESTO (25% OFF TALLER)": "https://drive.google.com/file/d/1En2u64fiXpK-e6OwnAJ3GomPBs0vBwVu/view?usp=sharing",
    "Plantilla PLANIFESTO NEUTRA": "https://drive.google.com/file/d/1hHgsFifi5TRb_09JBlqJpEJfn-74s4wv/view?usp=sharing",
    "Plantilla PLANIFESTO NEUTRA (25% OFF TALLER)": "https://drive.google.com/file/d/1hHgsFifi5TRb_09JBlqJpEJfn-74s4wv/view?usp=sharing",
    "Mi Planifesto PRO": "https://drive.google.com/file/d/1diVGJogI9m9U6ndqYgeYGRcJEnjdrheZ/view?usp=sharing",
    "Mi Planifesto PRO (25% OFF TALLER)": "https://drive.google.com/file/d/1diVGJogI9m9U6ndqYgeYGRcJEnjdrheZ/view?usp=sharing",
    "Mi Planifesto PRO NEUTRA": "https://drive.google.com/file/d/1E3EAUMrwlfCebJK0CmupMkDKmbzYJB3Q/view?usp=sharing",
    "Mi Planifesto PRO NEUTRA (25% OFF TALLER)": "https://drive.google.com/file/d/1E3EAUMrwlfCebJK0CmupMkDKmbzYJB3Q/view?usp=sharing",
    "Planificador de viajes (25%OFF)": "https://drive.google.com/file/d/1YDaN1MNcErdmhDXAaSFEXCGkwpva-1W2/view?usp=sharing",
    "GUIA DE INVERSIONES": "https://drive.google.com/file/d/1CAGKIf3LGrIaaOSMZonuzlI37XeF_Kpr/view?usp=sharing",
    "GUIA DE INVERSIONES 101 - ACTUALIZADA 2026":"https://drive.google.com/file/d/1kOJwIwww8Ubzn3FLD1eIXYPnexzO9Igw/view?usp=sharing"
  };

  // Archivos por ID de producto (como llegan de la web en modo regalo)
  const archivosPorId = {
    "comboPlanifesto": "https://drive.google.com/file/d/144PTqfSCD53KI3E5Kz7IPTroH0S2XJvb/view?usp=sharing",
    "plantillaPro": "https://drive.google.com/file/d/1diVGJogI9m9U6ndqYgeYGRcJEnjdrheZ/view?usp=sharing",
    "plantillaProNeutra": "https://drive.google.com/file/d/1E3EAUMrwlfCebJK0CmupMkDKmbzYJB3Q/view?usp=sharing",
    "plantillaBasica": "https://drive.google.com/file/d/1En2u64fiXpK-e6OwnAJ3GomPBs0vBwVu/view?usp=sharing",
    "plantillaBasicaNeutra": "https://drive.google.com/file/d/1hHgsFifi5TRb_09JBlqJpEJfn-74s4wv/view?usp=sharing",
    "plantillaParejas": "https://drive.google.com/file/d/1PtT-DQoq8iryfBvMpmm2ZosFr7ORJ5kf/view?usp=sharing",
    "bundleFinanzas": "https://drive.google.com/file/d/1kOJwIwww8Ubzn3FLD1eIXYPnexzO9Igw/view?usp=sharing",
    "planificadorViajes": "https://drive.google.com/file/d/1YDaN1MNcErdmhDXAaSFEXCGkwpva-1W2/view?usp=sharing",
    "guiaInversion": "https://drive.google.com/file/d/1CAGKIf3LGrIaaOSMZonuzlI37XeF_Kpr/view?usp=sharing"
  };

  for (let i = 1; i < datos.length; i++) {
    const email = datos[i][0];     // Columna A: email comprador
    const producto = datos[i][1];  // Columna B: producto
    const monto = datos[i][2];     // Columna C: monto
    const enviado = datos[i][4];   // Columna E: estado envio
    const nombre = datos[i][5];    // Columna F: nombre comprador

    if (enviado === "Enviado") continue;
    if (!email) continue;  // Saltar filas vacias

    // Buscar si este pedido es un regalo (usando datos ya cargados)
    const regalo = buscarRegalo(email, datosRegalos, hojaRegalos);

    if (regalo) {
      // --- ES UN REGALO: enviar al destinatario ---
      const enlaceArchivo = archivosPorId[regalo.productId] || archivos[producto];
      if (!enlaceArchivo) continue;

      const asuntoRegalo = "Te han regalado un Planifesto!";
      const dedicatoriaSafe = emojiToHtml(regalo.dedicatoria);
      const compradorSafe = emojiToHtml(regalo.comprador);
      const dedicatoriaHTML = dedicatoriaSafe
        ? `<div style="background: #fff0f3; border-left: 4px solid #e8415c; padding: 15px; margin: 15px 0; border-radius: 8px;">
             <strong>Dedicatoria de ${compradorSafe}:</strong><br><br>
             <em>"${dedicatoriaSafe}"</em>
           </div>`
        : '';

      const mensajeRegalo = `
        <html><head><meta charset="UTF-8"></head><body>
        <div style="font-family: 'Poppins', Arial, sans-serif;">
          <p>Hola, <strong>${regalo.destinatario}</strong>! &#10084;&#65039;</p>

          <p><strong>${regalo.comprador}</strong> te ha regalado un producto de Planifesto! &#127873;</p>

          ${dedicatoriaHTML}

          <p>Dentro del PDF encontraras tu regalo PLANIFESTO &#10024;<br>
          Te prometo que es super facil de usar y te ayudara a tener tus finanzas e inversiones bajo control!</p>

          <p>Si en algun momento te sientes perdida o tienes dudas, no te preocupes! Escribenos CON CONFIANZA</p>

          <p>Esperamos que le saques todo el provecho a esta herramienta!</p>

          <p>Un abrazo enorme!<br><br>
          P.D: recuerda ver el videotutorial &#10024; esta en el PDF</p>

          <p>- Liss</p>

          <p>Aqui tienes tu archivo:<br>
          <a href="${enlaceArchivo}" style="background: #e8415c; color: white; padding: 10px 25px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 10px 0;">Descargar mi regalo &#127873;</a></p>

          <p><strong>Producto:</strong> ${producto}<br>
          <em>Regalado por ${regalo.comprador}</em></p>

          <hr><br>
          <p>Si tienes alguna duda o necesitas soporte, puedes escribirnos al siguiente correo:<br>
          <strong>planifestord@gmail.com</strong></p>
        </div>
        </body></html>
      `;

      // Enviar al destinatario del regalo
      GmailApp.sendEmail(regalo.emailDestinatario, asuntoRegalo, "", { htmlBody: mensajeRegalo });

      // Notificar al comprador que el regalo fue enviado
      const mensajeConfirmacion = `
        <html><head><meta charset="UTF-8"></head><body>
        <div style="font-family: 'Poppins', Arial, sans-serif;">
          <p>Hola, <strong>${nombre || regalo.comprador}</strong>! &#127873;</p>

          <p>Te confirmamos que tu regalo ha sido enviado exitosamente a <strong>${regalo.destinatario}</strong>!</p>

          <p><strong>Producto regalado:</strong> ${producto}<br>
          <strong>Enviado a:</strong> ${regalo.emailDestinatario}</p>

          <p>Gracias por regalar un Planifesto! &#10084;&#65039;</p>

          <p>- Liss</p>

          <hr><br>
          <p>Si tienes alguna duda, escribenos a:<br>
          <strong>planifestord@gmail.com</strong></p>
        </div>
        </body></html>
      `;

      GmailApp.sendEmail(email, "Tu regalo Planifesto ha sido enviado!", "", { htmlBody: mensajeConfirmacion });

    } else {
      // --- NO ES REGALO: envio normal al comprador ---
      const enlaceArchivo = archivos[producto];
      if (!enlaceArchivo) continue;

      const asunto = "Tu compra en Planifesto";
      const mensaje = `
        <html><head><meta charset="UTF-8"></head><body>
        Hey, ${nombre}! &#10084;&#65039;<br><br>
        Dentro del PDF encontraras tu compra PLANIFESTO &#10024;<br><br>

        Te prometo que es super facil de usar y te ayudara a tener tus finanzas e inversiones bajo control como toda una boss!<br><br>

        Si en algun momento te sientes perdida o tienes dudas, no te preocupes! Escribeme CON CONFIANZA<br><br>

        Espero que le saques todo el provecho a esta herramienta!<br><br>

        Un abrazo enorme!<br><br>

        P.D: recuerda ver el videotutorial &#10024; esta en el PDF<br><br>

        - Liss<br><br>

        Aqui tienes tu archivo:<br>
        <a href="${enlaceArchivo}">Descargar</a><br><br>

        Detalles de tu compra:<br>
        <strong>Producto:</strong> ${producto}<br>
        <strong>Monto:</strong> $${monto}<br><br>

        <hr><br>
        Si tienes alguna duda o necesitas soporte, puedes escribirnos al siguiente correo:<br>
        <strong>planifestord@gmail.com</strong><br><br>
        </body></html>
      `;

      GmailApp.sendEmail(email, asunto, "", { htmlBody: mensaje });
    }

    hoja.getRange(i + 1, 5).setValue("Enviado");
  }
}