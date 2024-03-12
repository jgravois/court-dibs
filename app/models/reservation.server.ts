import type { User, Reservation } from "@prisma/client";

import { prisma } from "~/db.server";

export function getReservation({
  id,
  userId,
}: Pick<Reservation, "id"> & {
  userId: User["id"];
}) {
  return prisma.reservation.findFirst({
    select: { id: true, start: true, end: true },
    where: { id, userId },
  });
}

export function getReservations() {
  return prisma.reservation.findMany({
    select: { id: true, start: true, end: true },
  });
}

export function createReservation({
  start,
  end,
  userId,
}: Pick<Reservation, "start" | "end"> & {
  userId: User["id"];
}) {
  return prisma.reservation.create({
    data: {
      start,
      end,
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
