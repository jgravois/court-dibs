import type { User, Reservation } from "@prisma/client";

import { prisma } from "~/db.server";

export function getReservation({
  id,
  userId,
}: Pick<Reservation, "id"> & {
  userId: User["id"];
}) {
  userId;
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
      openPlay: true,
    },
  });
}

export function createReservation({
  start,
  end,
  court,
  openPlay,
  userId,
}: Pick<Reservation, "start" | "end" | "court" | "openPlay"> & {
  userId: User["id"];
}) {
  return prisma.reservation.create({
    data: {
      start,
      end,
      court,
      openPlay,
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
