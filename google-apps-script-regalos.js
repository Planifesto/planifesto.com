/**
 * INSTRUCCIONES DE DESPLIEGUE:
 *
 * 1. Abre Google Sheets (puede ser el mismo donde manejas los pedidos, o uno nuevo)
 * 2. Ve a Extensiones > Apps Script
 * 3. Borra el contenido por defecto y pega TODO este código
 * 4. Crea una hoja llamada "Regalos" en tu Google Sheet
 * 5. En la fila 1 de "Regalos", pon estos encabezados:
 *    A1: ID Orden | B1: Comprador | C1: Destinatario | D1: Email Destinatario
 *    E1: Dedicatoria | F1: Producto | G1: ID Producto | H1: Fecha
 *    I1: Método de Pago | J1: Estado
 * 6. En Apps Script, ve a Implementar > Nueva implementación
 * 7. Tipo: "Aplicación web"
 * 8. Ejecutar como: "Yo" (tu cuenta)
 * 9. Quién tiene acceso: "Cualquiera"
 * 10. Dale click a "Implementar"
 * 11. Copia la URL que te da y pégala en script.js donde dice APPS_SCRIPT_URL
 *
 * IMPORTANTE: Cada vez que modifiques este código, debes crear una NUEVA implementación
 * (no editar la existente) para que los cambios se reflejen.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Regalos');

    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Regalos');
      sheet.getRange(1, 1, 1, 10).setValues([[
        'ID Orden', 'Comprador', 'Destinatario', 'Email Destinatario',
        'Dedicatoria', 'Producto', 'ID Producto', 'Fecha',
        'Método de Pago', 'Estado'
      ]]);
    }

    sheet.appendRow([
      data.orderId || '',
      data.buyerName || '',
      data.recipientName || '',
      data.recipientEmail || '',
      data.dedication || '',
      data.product || '',
      data.productId || '',
      data.timestamp || new Date().toISOString(),
      data.paymentMethod || '',
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

// Necesario para que funcione CORS con las peticiones del sitio web
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Gift API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
