import { SerializeFrom } from "@remix-run/node";
import { Link } from "@remix-run/react";
import cn from "classnames";
import { addHours, areIntervalsOverlapping } from "date-fns";

import type { Reservation } from "~/models/reservation.server";
import {
  changeTimezone,
  CourtType,
  formatTime,
  getTimezoneOffset,
} from "~/utils";

const rezTimes = [...Array(12).keys()].map((v: number) => v + 8);

const isOverlapping = (
  r: SerializeFrom<Reservation>,
  date: Date,
  hour: number,
) => {
  const offset = getTimezoneOffset(date);
  date.setHours(0, 0, 0, 0);

  return areIntervalsOverlapping(
    {
      start: new Date(r.start),
      end: new Date(r.end),
    },
    {
      start: addHours(date, hour + offset),
      end: addHours(date, hour + offset + 0.01),
    },
  );
};

const newRezUrl = (
  date: string,
  num: number,
  court: string,
  isHalf: boolean,
) => {
  return `/reservations/new?day=${date}&start=${String(num).padStart(2, "0")}:${
    isHalf ? "30" : "00"
  }&court=${court}`;
};

export const TimeSlots = ({
  reservations,
  isLoggedIn = false,
  court,
  date,
  dateString,
}: {
  reservations: SerializeFrom<Reservation>[];
  isLoggedIn?: boolean;
  court: CourtType;
  date: Date;
  dateString: string;
}) => {
  const offsetNow = changeTimezone(new Date());
  const isToday = offsetNow.getDate() === date.getDate();

  return (
    <div
      className={cn("schedule_content", {
        schedule_content___pickleball: court === "pb",
        schedule_content___basketball: court === "bball",
        schedule_content___tennis: court === "10s",
      })}
    >
      {rezTimes.map((num) => {
        // hide reservation slots that have passed (completely)
        if (isToday && num < offsetNow.getHours()) return null;

        const onHourPrivate = reservations.find(
          (r) => isOverlapping(r, date, num) && !r.openPlay,
        );

        const onHourOpenPlay = reservations.find(
          (r) => isOverlapping(r, date, num) && r.openPlay,
        );

        const halfHourPrivate = reservations.find(
          (r) => isOverlapping(r, date, num + 0.5) && !r.openPlay,
        );

        const halfHourOpenPlay = reservations.find(
          (r) => isOverlapping(r, date, num + 0.5) && r.openPlay,
        );

        const onHourIsReserved = onHourPrivate || onHourOpenPlay;
        const halfHourIsReserved = halfHourPrivate || halfHourOpenPlay;

        const onHourUrl = onHourIsReserved
          ? `/reservations/${onHourPrivate?.id ?? onHourOpenPlay?.id}`
          : isLoggedIn
          ? newRezUrl(dateString, num, court, false)
          : "/start";

        const onHalfHourUrl = halfHourIsReserved
          ? `/reservations/${halfHourPrivate?.id ?? halfHourOpenPlay?.id}`
          : isLoggedIn
          ? newRezUrl(dateString, num, court, true)
          : "/start";

        return (
          <div className="schedule_row" key={num}>
            <Link
              to={onHourUrl}
              className={cn("schedule_button", {
                schedule_button___private: !!onHourPrivate,
                schedule_button___open: !!onHourOpenPlay,
              })}
            >
              {formatTime(num, false)}
            </Link>
            <Link
              to={onHalfHourUrl}
              className={cn("schedule_button", {
                schedule_button___private: !!halfHourPrivate,
                schedule_button___open: !!halfHourOpenPlay,
              })}
            >
              {formatTime(num, true)}
            </Link>
          </div>
        );
      })}
    </div>
  );
};
