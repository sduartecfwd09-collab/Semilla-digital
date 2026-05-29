const socket = require('../socket');
const emailService = require('./emailService');

const notifyProductorVenta = async (productorId, { proformaId, nombreProducto, cantidad, montoBruto, montoNeto, porcentajeComision }) => {
  // 1. Notificación en tiempo real vía Socket.io al canal del productor
  try {
    const io = socket.getIO();
    io.to(`producer_${productorId}`).emit('nuevaVenta', {
      proformaId,
      nombreProducto,
      cantidad,
      montoBruto,
      montoNeto,
      porcentajeComision,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Socket no inicializado (tests) — ignorar silenciosamente
  }

  // 2. Email (fire-and-forget, no bloquea la transacción)
  emailService.sendMail({
    to: null, // El email se resuelve en el controller si se necesita
    subject: `AgroMap — Nueva venta: ${nombreProducto}`,
    text: `Tienes una nueva venta de "${nombreProducto}" (x${cantidad}).\nBruto: ₡${montoBruto} | Neto: ₡${montoNeto} (comisión ${porcentajeComision}%).`,
  }).catch(() => { /* email failure no es crítico */ });
};

module.exports = { notifyProductorVenta };
