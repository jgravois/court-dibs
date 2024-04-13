import type { User, Reservation } from "@prisma/client";

import { prisma } from "~/db.server";

export function getReservation({
  id,
  userId,
}: Pick<Reservation, "id"> & {
  userId: User["id"];
}) {
  userId
  return prisma.reservation.findFirst({
    select: { id: true, start: true, end: true, court: true, user: true },
    where: { id },
  });
}

// since we allow anonymous requests, we dont return PII
export function getReservations() {
  return prisma.reservation.findMany({
    select: {
      id: true,
      start: true,
      end: true,
      court: true,
    },
  });
}

export function createReservation({
  start,
  end,
  court,
  userId,
}: Pick<Reservation, "start" | "end" | "court"> & {
  userId: User["id"];
}) {
  return prisma.reservation.create({
    data: {
      start,
      end,
      court,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteReservation({
  id,
  userId,
}: Pick<Reservation, "id"> & { userId: User["id"] }) {
  return prisma.reservation.deleteMany({
    where: { id, userId },
  });
}
