const { Queue, Worker } = require('bullmq');
const { sequelize, DeliveryOrder, DeliveryDriver, DeliveryRating, DriverLocation } = require('../models');
const socket = require('../socket');

// Configure Redis connection
const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
};

let distributionQueue;
let timeoutQueue;

try {
  distributionQueue = new Queue('DistributionQueue', { connection });
  timeoutQueue = new Queue('TimeoutQueue', { connection });
} catch (e) {
  console.log('[BullMQ] Redis no disponible. La distribución automática está deshabilitada.');
  distributionQueue = { add: async () => console.log('[BullMQ] Job ignorado (Redis offline)') };
  timeoutQueue = { add: async () => console.log('[BullMQ] Job ignorado (Redis offline)') };
}

// Helper para calcular "score" del repartidor
async function getBestDriver(pickupLat, pickupLng) {
  const drivers = await DeliveryDriver.findAll({
    where: { status: 'AVAILABLE' },
  });

  if (drivers.length === 0) return null;

  let bestDriver = null;
  let bestScore = -Infinity;

  for (const driver of drivers) {
    // Check if driver has capacity
    if (driver.active_orders >= driver.max_orders) continue;

    const driverRating = parseFloat(driver.rating) || 5;

    // Calculate proximity score (Haversine if coords available, random otherwise)
    let proximityScore = Math.random() * 10; // Fallback
    if (pickupLat && pickupLng && driver.current_lat && driver.current_lng) {
      const R = 6371; // Earth radius in km
      const dLat = (parseFloat(pickupLat) - parseFloat(driver.current_lat)) * Math.PI / 180;
      const dLng = (parseFloat(pickupLng) - parseFloat(driver.current_lng)) * Math.PI / 180;
      const a = Math.sin(dLat/2) ** 2 + 
                Math.cos(parseFloat(driver.current_lat) * Math.PI / 180) * 
                Math.cos(parseFloat(pickupLat) * Math.PI / 180) * 
                Math.sin(dLng/2) ** 2;
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      proximityScore = distance; // Lower is better
    }

    // Load factor (fewer orders = better)
    const loadFactor = driver.active_orders / driver.max_orders;

    // Score: higher is better (rating bonus - distance penalty - load penalty)
    const score = (driverRating * 2) - proximityScore - (loadFactor * 5);

    if (score > bestScore) {
      bestScore = score;
      bestDriver = driver;
    }
  }

  return bestDriver;
}

// Worker principal de distribución
try {
  const distributionWorker = new Worker('DistributionQueue', async job => {
    const { orderId, retryCount } = job.data;
    
    const transaction = await sequelize.transaction();
    try {
      const order = await DeliveryOrder.findByPk(orderId, { transaction, lock: transaction.LOCK.UPDATE });
      
      if (!order || !['PENDING', 'QUEUED'].includes(order.status)) {
        await transaction.rollback();
        return;
      }

      if (retryCount >= 3) {
        order.status = 'MANUAL_REVIEW';
        await order.save({ transaction });
        await transaction.commit();
        console.log(`[BullMQ] Orden ${orderId} escalada a MANUAL_REVIEW (Superó los 3 reintentos).`);
        return;
      }

      const bestDriver = await getBestDriver(order.pickup_lat, order.pickup_lng);
      
      if (!bestDriver) {
        await transaction.rollback();
        console.log(`[BullMQ] No hay drivers disponibles para orden ${orderId}. Reintentando en 10s...`);
        await distributionQueue.add('distribute', { orderId, retryCount: retryCount + 1 }, { delay: 10000 });
        return;
      }

      order.driver_id = bestDriver.id;
      order.status = 'ASSIGNED';
      order.assigned_at = new Date();
      order.assignment_attempts += 1;
      await order.save({ transaction });
      await transaction.commit();
      console.log(`[BullMQ] Orden ${orderId} asignada a driver ${bestDriver.id}`);
      
      try {
        const io = socket.getIO();
        io.to(`order_${orderId}`).emit('orderStatusUpdated', { orderId, status: 'ASSIGNED', driverId: bestDriver.id });
        io.to(`driver_${bestDriver.user_id}`).emit('newOrderAssigned', { orderId });
      } catch (e) {
        console.log('Socket no disponible en este contexto');
      }

      // Programar revisión del timeout
      const settings = await require('../models').DeliverySetting.findByPk(1);
      const timeout = settings ? settings.accept_timeout_seconds * 1000 : 15000;
      await timeoutQueue.add('checkTimeout', { orderId, driverId: bestDriver.id, retryCount }, { delay: timeout });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }, { connection });

  // Worker para revisar si el driver aceptó a tiempo
  const timeoutWorker = new Worker('TimeoutQueue', async job => {
    const { orderId, driverId, retryCount } = job.data;
    
    const transaction = await sequelize.transaction();
    try {
      const order = await DeliveryOrder.findByPk(orderId, { transaction, lock: transaction.LOCK.UPDATE });
      
      if (!order) {
        await transaction.rollback();
        return;
      }

      // Si la orden sigue ASSIGNED al mismo driver, timeout
      if (order.status === 'ASSIGNED' && order.driver_id === driverId) {
        order.driver_id = null;
        order.status = 'PENDING';
        await order.save({ transaction });
        await transaction.commit();
        
        console.log(`[BullMQ] Driver ${driverId} no aceptó la orden ${orderId}. Reasignando...`);
        await distributionQueue.add('distribute', { orderId, retryCount: retryCount + 1 });
      } else {
        await transaction.rollback();
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }, { connection });

} catch (e) {
  console.log('[BullMQ] Workers no iniciados (Redis offline). La distribución automática requiere Redis.');
}

module.exports = {
  distributionQueue,
  timeoutQueue
};
