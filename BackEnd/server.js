const app = require('./app');
const { sequelize } = require('./Models');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

/**
 * Función principal para arrancar el servidor
 */
async function startServer() {
  try {
    // 1. Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida exitosamente.');

    // 2. Sincronizar modelos (solo en desarrollo)
    if (ENV === 'development') {
      // alter: true actualiza las tablas existentes sin borrar datos si es posible
      await sequelize.sync({ alter: true });
      console.log('🔄 Modelos sincronizados con la base de datos (alter: true).');
    }

    // 3. Iniciar escucha de peticiones
    app.listen(PORT, () => {
      console.log(`🚀 Servidor AgroMap corriendo en modo [${ENV}]`);
      console.log(`🔗 URL local: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:');
    console.error(error.message);
    process.exit(1); // Salir con error
  }
}

// Ejecutar arranque
startServer();
