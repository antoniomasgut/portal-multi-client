import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ Error: El fitxer .env no existeix. Copia .env.example a .env.');
  process.exit(1);
}

dotenv.config();

const CRITICAL_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'GROQ_API_KEY',
  'SMTP_USER',
  'SMTP_PASS'
];

let missing = 0;

console.log('🔍 Verificant variables d\'entorn...');

CRITICAL_VARS.forEach(v => {
  if (!process.env[v] || process.env[v].includes('placeholder')) {
    console.warn(`⚠️  Atenció: ${v} no està configurada o té un valor per defecte.`);
    missing++;
  } else {
    console.log(`✅ ${v} està configurada.`);
  }
});

if (missing > 0) {
  console.log(`\nℹ️  S'han trobat ${missing} avisos. El sistema podria no funcionar completament en algunes àrees (IA o Email).`);
} else {
  console.log('\n🚀 Totes les variables crítiques semblen correctament configurades!');
}
