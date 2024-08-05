import type { User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { CourtViz } from "@prisma/client";

export async function upsertCourtViz({ userId, hidePb, hide10s, hideBball }: { userId: User["id"]; hidePb: boolean; hide10s: boolean; hideBball: boolean }) {
  const update = { hidePb, hide10s, hideBball }
  return prisma.courtViz.upsert({
    where: { userId }, update, create: { userId, ...update },
  });
}

