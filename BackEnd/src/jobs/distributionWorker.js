const { Queue, Worker, QueueEvents } = require('bullmq');
const { Sequelize } = require('sequelize');
const { sequelize, DeliveryOrder, DeliveryDriver, DeliveryRating, DriverLocation } = require('../models');
const socket = require('../socket');

// Configure Redis connection
const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
};

const distributionQueue = new Queue('DistributionQueue', { connection });
const timeoutQueue = new Queue('TimeoutQueue', { connection });

// Helper para calcular "score" del repartidor
async function getBestDriver(pickup_address) {
  const drivers = await DeliveryDriver.findAll({
    where: { status: 'active' },
    include: [{ model: DeliveryRating, as: 'ratings' }]
  });

  if (drivers.length === 0) return null;

  let bestDriver = null;
  let bestScore = -Infinity;

  for (const driver of drivers) {
    // Promedio de ratings
    const avgRating = driver.ratings.length 
      ? driver.ratings.reduce((acc, r) => acc + r.rating, 0) / driver.ratings.length 
      : 5; 

    // Simulación de proximidad geográfica (En producción: usar fórmula de Haversine con coordenadas reales)
    const proximityScore = Math.random() * 10; 

    // Score final (Se prioriza el rating alto y la proximidad menor)
    const score = (avgRating * 2) - proximityScore;

    if (score > bestScore) {
      bestScore = score;
      bestDriver = driver;
    }
  }

  return bestDriver;
}

// Worker principal de distribución
const distributionWorker = new Worker('DistributionQueue', async job => {
  const { orderId, retryCount } = job.data;
  
  const transaction = await sequelize.transaction();
  try {
    // Uso de LOCK.UPDATE para evitar race conditions
    const order = await DeliveryOrder.findByPk(orderId, { transaction, lock: transaction.LOCK.UPDATE });
    
    if (!order || order.status !== 'pending') {
      await transaction.rollback();
      return;
    }

    if (retryCount >= 3) {
      order.status = 'manual_review';
      await order.save({ transaction });
      await transaction.commit();
      console.log(`[BullMQ] Orden ${orderId} escalada a manual_review (Superó los 3 reintentos).`);
      return;
    }

    const bestDriver = await getBestDriver(order.pickup_address);
    
    if (!bestDriver) {
      await transaction.rollback();
      console.log(`[BullMQ] No hay drivers activos para orden ${orderId}. Reintentando en breve...`);
      await distributionQueue.add('distribute', { orderId, retryCount: retryCount + 1 }, { delay: 10000 });
      return;
    }

    order.driver_id = bestDriver.id;
    order.status = 'assigned';
    await order.save({ transaction });
    await transaction.commit();
    console.log(`[BullMQ] Orden ${orderId} asignada a driver ${bestDriver.id}`);
    
    try {
      socket.getIO().to(`order_${orderId}`).emit('orderAssigned', { orderId, driverId: bestDriver.id });
    } catch (e) {
      console.log('Socket no disponible en este contexto');
    }

    // Programar revisión del timeout (15 segundos)
    await timeoutQueue.add('checkTimeout', { orderId, driverId: bestDriver.id, retryCount }, { delay: 15000 });

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

    // Si pasaron 15s y la orden sigue "assigned" al mismo driver, asumimos timeout
    if (order.status === 'assigned' && order.driver_id === driverId) {
      order.driver_id = null;
      order.status = 'pending';
      await order.save({ transaction });
      await transaction.commit();
      
      console.log(`[BullMQ] Driver ${driverId} no aceptó la orden ${orderId} en 15s. Reasignando...`);
      await distributionQueue.add('distribute', { orderId, retryCount: retryCount + 1 });
    } else {
      await transaction.rollback();
    }
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}, { connection });

module.exports = {
  distributionQueue,
  timeoutQueue
};
