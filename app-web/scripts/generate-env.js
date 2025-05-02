// Description: Script pour générer le fichier environment.ts à partir d'un template et des variables d'environnement
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const env = dotenv.config({ path: path.resolve(__dirname, '../../.env') }).parsed;
if (!env || !env.API_URL) {
  console.error('❌ Impossible de charger API_URL depuis .env');
  process.exit(1);
}

const tplPath = path.resolve(__dirname, '../src/environments/environment.ts.template');
let content = fs.readFileSync(tplPath, 'utf8');

content = content.replace(/__API_URL__/g, env.API_URL);


const outPath = path.resolve(__dirname, '../src/environments/environment.ts');
fs.writeFileSync(outPath, content, 'utf8');

console.log(`✅ src/environments/environment.ts généré avec apiUrl=${env.API_URL}`);
