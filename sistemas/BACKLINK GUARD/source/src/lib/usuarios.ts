// Senhas e usuários. Fica SEPARADO de lib/auth.ts de propósito: aqui usamos
// node:crypto (scrypt), que não roda no runtime do proxy. O auth.ts precisa ser
// leve e compatível com Edge porque o proxy valida o cookie em toda requisição.

import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { prisma } from "@/lib/prisma";

const scrypt = promisify(scryptCb) as (
  senha: string,
  salt: Buffer,
  tamanho: number,
) => Promise<Buffer>;

const TAMANHO_HASH = 64;

export type Papel = "admin" | "auxiliar";

export function isPapel(v: unknown): v is Papel {
  return v === "admin" || v === "auxiliar";
}

/** Gera "scrypt$<salt>$<hash>". Salt novo a cada senha. */
export async function hashSenha(senha: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(senha, salt, TAMANHO_HASH);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

/** Confere a senha em tempo constante (não vaza informação pelo tempo). */
export async function conferirSenha(senha: string, guardado: string): Promise<boolean> {
  const partes = guardado.split("$");
  if (partes.length !== 3 || partes[0] !== "scrypt") return false;
  try {
    const salt = Buffer.from(partes[1], "hex");
    const esperado = Buffer.from(partes[2], "hex");
    const obtido = await scrypt(senha, salt, esperado.length);
    return obtido.length === esperado.length && timingSafeEqual(obtido, esperado);
  } catch {
    return false;
  }
}

/** Normaliza o login: minúsculo, sem espaços nas pontas. */
export function normalizaUsuario(u: string): string {
  return u.trim().toLowerCase();
}

/** Senha forte e legível para ditar por telefone, sem caracteres ambíguos. */
export function gerarSenha(tamanho = 14): string {
  const alfabeto = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(tamanho);
  let s = "";
  for (const b of bytes) s += alfabeto[b % alfabeto.length];
  return s;
}

export async function criarUsuario(opts: {
  name: string;
  username: string;
  senha: string;
  role: Papel;
}) {
  return prisma.user.create({
    data: {
      name: opts.name.trim(),
      username: normalizaUsuario(opts.username),
      passwordHash: await hashSenha(opts.senha),
      role: opts.role,
    },
  });
}

/** Autentica e devolve o usuário, ou null. */
export async function autenticar(usuario: string, senha: string) {
  const u = await prisma.user.findUnique({
    where: { username: normalizaUsuario(usuario) },
  });
  if (!u) return null;
  if (!(await conferirSenha(senha, u.passwordHash))) return null;
  await prisma.user.update({
    where: { id: u.id },
    data: { lastLoginAt: new Date() },
  });
  return u;
}
