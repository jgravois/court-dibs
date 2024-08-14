import { type User, Prisma } from "@prisma/client";
import { addDays, addHours, compareAsc, differenceInMinutes, startOfDay, startOfToday, subHours } from "date-fns";

import { prisma } from "~/db.server";
import { getOffset } from "~/utils";

export function getReservation({
  id,
  userId,
}: Pick<Reservation, "id"> & {
  userId: User["id"] | undefined;
}) {
  return prisma.reservation.findFirst({
    select: { id: true, start: true, end: true, court: true, user: !!userId, openPlay: true },
    where: { id },
  });
}

const reservationSelect = Prisma.validator<Prisma.ReservationArgs>()({
  select: { id: true, start: true, end: true, court: true, openPlay: true },
})

export type Reservation = Prisma.ReservationGetPayload<typeof reservationSelect>

// since we allow anonymous requests, we dont return PII
export function getReservations() {
  return prisma.reservation.findMany({
    select: { ...reservationSelect.select }
  });
}

export async function createReservation({
  start,
  end,
  court,
  openPlay,
  userId,
}: Omit<Reservation, 'id'> & {
  userId: User["id"];
}) {
  process.env.TZ = 'America/Los_Angeles'

  if (differenceInMinutes(end, start) > 120) {
    throw new Error('Reservations must be two hours or less')
  }

  if (compareAsc(addDays(startOfToday(), 7), start) === -1) {
    throw new Error('Reservations more than seven days in the future are not allowed')
  }

  if (compareAsc(start, new Date()) === -1) {
    throw new Error('You\'re livin in the past dude')
  }

  if (compareAsc(addDays(startOfToday(), 7), start) === -1) {
    throw new Error('Reservations more than seven days away are not allowed')
  }

  if (start.getHours() < 8) {
    throw new Error('Reservations cannot commence before 8:00 am')
  }

  if (compareAsc(subHours(end, getOffset()), addHours(startOfDay(start), 20)) === 1) {
    throw new Error('Reservations must conclude by 8:00 pm')
  }

  const overlaps = await prisma.reservation.findFirst({
    where: {
      AND: { court },
      OR: { end: { gt: start }, start: { lt: end } }
    }
  })

  if (overlaps) throw new Error('This would overlap an existing reservation')

  const sameDay = await prisma.reservation.findFirst({
    where: {
      userId,
      court,
      start: { gte: startOfDay(start), lte: addDays(startOfDay(start), 1) }
    }
  })

  if (sameDay) throw new Error('Each court can only be reserved once per day')

  return prisma.reservation.create({
    data: {
      start,
      end,
      court,
      openPlay,
      user: { connect: { id: userId } },
    },
  });
}

// TODO: confirm that a hardcoded userId cant be used to bypass auth here
export const deleteReservation = ({
  id,
  userId,
}: Pick<Reservation, "id"> & { userId: User["id"] }) =>
  prisma.reservation.deleteMany({ where: { id, userId } });

