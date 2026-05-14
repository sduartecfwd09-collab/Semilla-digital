const fs = require('fs');
const path = require('path');
const dir = 'BackEnd/Migrations';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (!file.endsWith('.js')) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace primary keys
  if (content.includes('type: Sequelize.UUID') && content.includes('primaryKey: true')) {
    content = content.replace(/type:\s*Sequelize\.UUID,[\s\S]*?defaultValue:\s*Sequelize\.UUIDV4,/, 'type: Sequelize.INTEGER,\n        autoIncrement: true,');
    modified = true;
  }

  // Replace foreign keys accurately
  const fkPatterns = [
    'usuario_id', 'user_id', 'feria_id', 'puesto_id', 'producto_id', 'receta_id', 'distrito_id', 'canton_id', 'provincia_id', 'direccion_id', 'role_id'
  ];

  fkPatterns.forEach(pattern => {
    // Only replace the type directly following the key
    const regex = new RegExp(`(${pattern}:\\s*\\{\\s*)type:\\s*Sequelize\\.UUID`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, '$1type: Sequelize.INTEGER');
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed UUIDs in ' + file);
  }
});
