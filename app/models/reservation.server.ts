import type { User, Reservation } from "@prisma/client";
import { addDays, addHours, compareAsc, differenceInMinutes } from "date-fns";

import { prisma } from "~/db.server";
import { startOfDay, startOfToday } from "~/utils";

export function getReservation({
  id,
  userId,
}: Pick<Reservation, "id"> & {
  userId: User["id"];
}) {
  userId;
  return prisma.reservation.findFirst({
    select: { id: true, start: true, end: true, court: true, user: true, openPlay: true },
    where: { id },
  });
}

// since we allow anonymous requests, we dont return PII
export function getReservations() {
  return prisma.reservation.findMany({
    select: { id: true, start: true, end: true, court: true, openPlay: true },
  });
}

export async function createReservation({
  start,
  end,
  court,
  openPlay,
  userId,
}: Pick<Reservation, "start" | "end" | "court" | "openPlay"> & {
  userId: User["id"];
}) {
  if (differenceInMinutes(end, start) > 120) {
    throw new Error('Reservations must be two hours or less')
  }

  if (compareAsc(addDays(startOfToday(), 7), start) === -1) {
    throw new Error('Reservations more than seven days in the future are not allowed')
  }

  // if (compareAsc(start, new Date()) === -1) {
  //   throw new Error('You\'re livin in the past dude')
  // }

  // const closestHour = new Date()
  // closestHour.setHours(closestHour.getHours() + 1);
  // closestHour.setMinutes(0, 0, 0); // Resets also seconds and milliseconds

  // if (compareAsc(start, closestHour) === -1) {
  //   throw new Error('Reservations cannot be made until the top of the hour')
  // }

  if (compareAsc(addDays(startOfToday(), 7), start) === -1) {
    throw new Error('Reservations more than seven days away are not allowed')
  }

  if (start.getHours() < 8) {
    throw new Error('Reservations before 8:00 are not allowed')
  }

  // TODO: warn if after dusk
  if (compareAsc(end, addHours(startOfDay(start), 20)) === 1) {
    throw new Error('Reservations must conclude by 20:00')
  }

  const overlaps = await prisma.reservation.findFirst({
    where: {
      AND: { court },
      OR: {
        end: { gt: start },
        start: { lt: end }
      }
    }
  })

  if (overlaps) throw new Error('This would overlap an existing reservation')

  const sameDay = await prisma.reservation.findFirst({
    where: {
      userId,
      court,
      start: {
        gte: startOfDay(start),
        lte: addDays(startOfDay(start), 1)
      }

    }
  })

  if (sameDay) throw new Error('Each court can only be reserved once per day')

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

// TODO: confirm that a hardcoded userId cant be used to bypass auth here
export const deleteReservation = ({
  id,
  userId,
}: Pick<Reservation, "id"> & { userId: User["id"] }) =>
  prisma.reservation.deleteMany({ where: { id, userId } });

