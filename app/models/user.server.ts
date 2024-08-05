import { Prisma } from "@prisma/client";

import { prisma } from "~/db.server";

const courtViz: Prisma.UserInclude = {
  courtViz: true,
}

const UserWithCourtViz = Prisma.validator<Prisma.UserArgs>()({
  include: courtViz,
})

export type User = Prisma.UserGetPayload<typeof UserWithCourtViz>

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id }, include: courtViz });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email }, include: courtViz });
}

export async function getUserByStytchId(stytchId: User["stytchId"]) {
  return prisma.user.findUnique({ where: { stytchId }, include: courtViz });
}

export async function createUser({ email, stytchId, address }: { email: User["email"]; stytchId: string; address: string }) {
  return prisma.user.create({
    data: { email, stytchId, address },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}
