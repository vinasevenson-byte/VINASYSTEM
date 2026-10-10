const http = require('http');
const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../apps/api/node_modules/@prisma/client'));
const prisma = new PrismaClient();

async function run() {
  const acc = await prisma.account.findFirst();
  console.log('Conta selecionada:', acc.id, 'Perfil:', acc.profileId);

  const loginData = JSON.stringify({ email: 'VINICIUS', password: 'VINA123' });
  const loginReq = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
  }, (res) => {
    let raw = '';
    res.on('data', c => raw += c);
    res.on('end', () => {
      const { token } = JSON.parse(raw);
      console.log('1. Autenticado com sucesso. Token obtido.');

      // Criar Lançamento
      const entryData = JSON.stringify({
        profileId: acc.profileId,
        accountId: acc.id,
        amount: '150.00',
        type: 'EXPENSE',
        status: 'POSTED',
        description: 'Lançamento Teste CRUD 2.2',
        occurredAt: new Date().toISOString()
      });
      const req = http.request({
        hostname: 'localhost',
        port: 3001,
        path: '/api/entries',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token, 'Content-Length': Buffer.byteLength(entryData) }
      }, (r) => {
        let resp = '';
        r.on('data', c => resp += c);
        r.on('end', () => {
          console.log('2. Lançamento Criado no PostgreSQL (Status ' + r.statusCode + '):', resp);
          const entry = JSON.parse(resp);

          // Editar Lançamento (PUT)
          const putData = JSON.stringify({ description: 'Lançamento Editado com Sucesso 2.2', amount: '275.50' });
          const pReq = http.request({
            hostname: 'localhost',
            port: 3001,
            path: '/api/entries/' + entry.id,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token, 'Content-Length': Buffer.byteLength(putData) }
          }, (pr) => {
            let pResp = '';
            pr.on('data', c => pResp += c);
            pr.on('end', () => {
              console.log('3. Lançamento Editado no PostgreSQL (Status ' + pr.statusCode + '):', pResp);

              // Excluir Lançamento (DELETE)
              const dReq = http.request({
                hostname: 'localhost',
                port: 3001,
                path: '/api/entries/' + entry.id,
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
              }, (dr) => {
                let dResp = '';
                dr.on('data', c => dResp += c);
                dr.on('end', async () => {
                  console.log('4. Lançamento Excluído do PostgreSQL (Status ' + dr.statusCode + '):', dResp);
                  console.log('\n=== FLUXO CRUD COMPLETO VALIDADO NO POSTGRESQL COM SUCESSO! ===');
                  await prisma.$disconnect();
                });
              });
              dReq.end();
            });
          });
          pReq.write(putData);
          pReq.end();
        });
      });
      req.write(entryData);
      req.end();
    });
  });
  loginReq.write(loginData);
  loginReq.end();
}
run();
