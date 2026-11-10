import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const ui = createInterface({ input, output });
console.log('Configurador de credenciais (não salva dados em arquivo).');
console.log('ATENÇÃO: o terminal pode mostrar a senha digitada. Execute em ambiente privado.');
const email = (await ui.question('E-mail administrativo [teste@gmail.com]: ')).trim().toLowerCase() || 'teste@gmail.com';
const password = await ui.question('Senha administrativa (use a senha escolhida): ');
ui.close();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
  console.error('E-mail inválido ou senha vazia.');
  process.exit(1);
}
if (password.length < 12 || /^\d+$/.test(password)) {
  console.warn('AVISO: a senha escolhida é fraca para um painel na internet. Recomenda-se trocá-la por uma senha única e longa antes de publicar.');
}
const salt = randomBytes(24).toString('hex');
const hash = scryptSync(password, salt, 64).toString('hex');
console.log('\nCopie os seguintes valores SOMENTE para Environment variables da Netlify:');
console.log(`ADMIN_EMAIL=${email}`);
console.log(`ADMIN_PASSWORD_HASH=scrypt$${salt}$${hash}`);
console.log(`SESSION_SECRET=${randomBytes(48).toString('hex')}`);
console.log('\nNão coloque estas variáveis no código nem no Git.');
