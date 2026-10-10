const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const route = fs.readFileSync(path.join(root, 'apps/api/src/routes.ts'), 'utf8');
const guard = fs.readFileSync(path.join(root, 'apps/api/src/module.ts'), 'utf8');
const schema = fs.readFileSync(path.join(root, 'apps/api/prisma/schema.prisma'), 'utf8');
const web = fs.readFileSync(path.join(root, 'apps/web/src/main.tsx'), 'utf8');
test('Perfil protegido em consultas e gravações', () => {
  assert.match(route, /await this\.member\(req\.userId,id\)/);
  assert.match(route, /await this\.member\(req\.userId,b\.profileId,true\)/);
  assert.match(route, /!permitted\.includes\(profileId\)/);
});
test('Transferência exige autorização dos dois perfis e atomicidade', () => {
  assert.match(route, /this\.member\(req\.userId,b\.fromProfileId,true\)/);
  assert.match(route, /this\.member\(req\.userId,b\.toProfileId,true\)/);
  assert.match(route, /this\.db\.\$transaction\(async tx/);
});
test('Transferências são excluídas de receitas e despesas', () => {
  assert.match(route, /if\(e\.type==='INCOME'\)/);
  assert.match(route, /if\(e\.type==='EXPENSE'\)/);
  assert.match(route, /e\.type==='TRANSFER_IN'/);
});
test('Chaves de integridade ligam lançamentos a contas no mesmo perfil', () => {
  assert.match(schema, /account Account @relation\(fields:\[accountId,profileId\]/);
});
test('Sessão não é persistida em localStorage', () => {
  assert.doesNotMatch(web, /localStorage/);
  assert.match(web, /sessionStorage/);
});
test('Cabeçalho Authorization exige Bearer estrito', () => {
  assert.match(guard, /\^Bearer /);
});
test('Categorias exigem perfil autorizado, tipo e nome', () => {
  assert.match(route, /@Get\('profiles\/:id\/categories'\)/);
  assert.match(route, /@Post\('profiles\/:id\/categories'\)/);
  assert.match(route, /CATEGORY_CREATED/);
  assert.match(web, /modal==='category'/);
});
test('Edição de lançamentos valida conta, categoria, autorização e impede transferência isolada', () => {
  assert.match(route, /@Patch\('entries\/:id'\)/);
  assert.match(route, /previous\.transferId/);
  assert.match(route, /previous\.reconciled/);
  assert.match(route, /ENTRY_EDITED/);
  assert.match(web, /modal==='edit_entry'/);
});
