const fs = require('fs');
const path = require('path');
const dir = 'BackEnd/src/seeders';
const files = fs.readdirSync(dir);

const replacements = {
  "'11111111-1111-1111-1111-111111111111'": 1,
  "'22222222-2222-2222-2222-222222222222'": 2,
  "'33333333-3333-3333-3333-333333333333'": 3,
  "'44444444-4444-4444-4444-444444444444'": 4,
  "'55555555-5555-5555-5555-555555555555'": 5,
  "'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'": 1,
  "'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'": 2,
  "'cccccccc-cccc-cccc-cccc-cccccccccccc'": 3
};

files.forEach(file => {
  if (!file.endsWith('.js')) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [uuidStr, intVal] of Object.entries(replacements)) {
    if (content.includes(uuidStr)) {
      content = content.split(uuidStr).join(intVal);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed UUIDs in ' + file);
  }
});
