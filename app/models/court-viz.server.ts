import type { User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { CourtViz } from "@prisma/client";

export async function createCourtViz({ userId, hidePb, hide10s, hideBball }: { userId: User["id"]; hidePb: boolean; hide10s: boolean; hideBball: boolean }) {
  return prisma.courtViz.create({ data: { userId, hidePb, hide10s, hideBball } });
}

export async function updateCourtViz({ userId, hidePb, hide10s, hideBball }: { userId: User["id"]; hidePb: boolean; hide10s: boolean; hideBball: boolean }) {
  return prisma.courtViz.update({
    where: { userId },
    data: { hidePb, hide10s, hideBball },
  });
}


