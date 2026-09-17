import { seedDemo } from "@/lib/seed";
import { prisma } from "@/lib/prisma";

const r = await seedDemo();
console.log("Seed concluído:", r);
await prisma.$disconnect();
