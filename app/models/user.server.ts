import type { User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserByStytchId(stytchId: User["stytchId"]) {
  return prisma.user.findUnique({ where: { stytchId } });
}

export async function createUser({ email, stytchId, address }: { email: User["email"]; stytchId: string; address: string }) {
  return prisma.user.create({
    data: { email, stytchId, address },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}
