const bcrypt = require('bcrypt');
const { Usuario } = require('../src/models');

async function run() {
  try {
    const hashed = await bcrypt.hash('secret123', 10);
    const [updated] = await Usuario.update(
      { password: hashed },
      { where: { email: 'admin@agromap.com' } }
    );
    console.log(`Updated admin password: ${updated} rows affected.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
