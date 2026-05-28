'use strict';

/**
 * Valores canónicos aceptados para vehicle_type en el módulo delivery.
 * Coinciden con los que envía el frontend desde RegistroDelivery.tsx.
 *
 * Esta constante es la fuente de verdad: úsela en los modelos
 * (validate.isIn) y en los services para validación de entrada.
 */
const VEHICLE_TYPES = Object.freeze(['Carro', 'Moto', 'BiciMoto', 'Bicicleta']);

const isValidVehicleType = (value) => VEHICLE_TYPES.includes(value);

module.exports = { VEHICLE_TYPES, isValidVehicleType };
