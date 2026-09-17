// Cria (ou redefine a senha de) um usuário.
//
//   bun run scripts/criar-usuario.ts <nome> <usuario> <admin|auxiliar> [senha]
//
// Sem senha, gera uma forte e imprime UMA vez — no banco só fica o hash scrypt.

export {};
import { prisma } from "@/lib/prisma";
import { criarUsuario, gerarSenha, hashSenha, isPapel, normalizaUsuario } from "@/lib/usuarios";

const [nome, usuario, papel, senhaArg] = process.argv.slice(2);
if (!nome || !usuario || !isPapel(papel)) {
  console.error("uso: bun run scripts/criar-usuario.ts <nome> <usuario> <admin|auxiliar> [senha]");
  process.exit(1);
}

const senha = senhaArg || gerarSenha();
const login = normalizaUsuario(usuario);
const existente = await prisma.user.findUnique({ where: { username: login } });

if (existente) {
  await prisma.user.update({
    where: { id: existente.id },
    data: { passwordHash: await hashSenha(senha), role: papel, name: nome },
  });
  console.log(`ATUALIZADO (senha redefinida)`);
} else {
  await criarUsuario({ name: nome, username: login, senha, role: papel });
  console.log(`CRIADO`);
}

console.log(`  nome   : ${nome}`);
console.log(`  usuario: ${login}`);
console.log(`  senha  : ${senha}`);
console.log(`  papel  : ${papel}`);
await prisma.$disconnect();
