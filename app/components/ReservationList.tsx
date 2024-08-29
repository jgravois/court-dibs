import { SerializeFrom } from "@remix-run/node";
import { Link } from "@remix-run/react";
import cn from "classnames";
import {
  addDays,
  addHours,
  areIntervalsOverlapping,
  format,
  startOfDay,
  // startOfToday,
} from "date-fns";
import React from "react";

import type { Reservation } from "~/models/reservation.server";
import type { User } from "~/models/user.server";
import { changeTimezone, formatTime } from "~/utils";

const rezTimes = [...Array(12).keys()].map((v: number) => v + 8);

type CourtType = "pb" | "bball" | "10s";

// const maybePrefix = (date: Date) => {
//   const today = changeTimezone(startOfToday());
//   const tomorrow = addDays(today, 1);

//   if (date.toDateString() === today.toDateString()) return "today - ";
//   if (date.toDateString() === tomorrow.toDateString()) return "tomorrow - ";

//   return "";
// };

const isOverlapping = (
  r: SerializeFrom<Reservation>,
  date: Date,
  hour: number,
) =>
  areIntervalsOverlapping(
    {
      start: changeTimezone(new Date(r.start)),
      end: changeTimezone(new Date(r.end)),
    },
    {
      start: addHours(date, hour),
      end: addHours(date, hour + 0.01),
    },
  );

const newRezUrl = (date: Date, num: number, court: string, isHalf: boolean) =>
  `/reservations/new?day=${date.toISOString().slice(0, 10)}&start=${String(
    num,
  ).padStart(2, "0")}:${isHalf ? "30" : "00"}&court=${court}`;

const TimeSlots = ({
  reservations,
  isLoggedIn = false,
  court,
  date,
}: {
  reservations: SerializeFrom<Reservation>[];
  isLoggedIn?: boolean;
  court: CourtType;
  date: Date;
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
          ? newRezUrl(date, num, court, false)
          : "/start";

        const onHalfHourUrl = halfHourIsReserved
          ? `/reservations/${halfHourPrivate?.id ?? halfHourOpenPlay?.id}`
          : isLoggedIn
          ? newRezUrl(date, num, court, true)
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

export const ReservationList = ({
  reservations,
  user,
}: {
  reservations: SerializeFrom<Reservation>[];
  user?: User;
}) => {
  const midnightLocal = startOfDay(new Date());

  const availableDays = [...Array(7).keys()]
    .map((num) => {
      const date = addDays(midnightLocal, num);
      // const dateOC = addDays(changeTimezone(midnightLocal), num);
      const existingReservations = reservations;

      // const existingReservations = reservations.filter((r) => {
      //   const startDate = new Date(r.start).toDateString();
      //   return date.toDateString() === startDate;
      // });

      return { date, existingReservations };
    })
    .filter(({ date }) => {
      // omit today from list after 8pm (PT)
      const offsetNow = changeTimezone(new Date());
      const isToday = offsetNow.getDate() === date.getDate();
      const isPast = isToday && offsetNow.getHours() >= 20;
      return !isPast;
    });

  return availableDays.map(({ date, existingReservations }, idx) => (
    <React.Fragment key={date.toISOString()}>
      <nav className="nav" id={"day-" + idx}>
        <div className="nav_content">
          <Link className="nav_link" to={"/#day-" + idx}>
            {/* {maybePrefix(date)} */}
            {format(date, "iiii, MMMM dd")}
          </Link>
        </div>
      </nav>
      <div className="main">
        {user?.courtViz?.hidePb ? null : (
          <div className="schedule">
            <h3 className="schedule_header">
              <div className="schedule_icon">
                <img alt="pickleball paddle" src="/assets/pickleball.svg" />
              </div>
              <div>Pickleball</div>
            </h3>
            <TimeSlots
              reservations={existingReservations.filter(
                (r) => r.court === "pb",
              )}
              isLoggedIn={!!user}
              court="pb"
              date={date}
            />
          </div>
        )}
        {user?.courtViz?.hide10s ? null : (
          <div className="schedule schedule___tennis">
            <h3 className="schedule_header">
              <div className="schedule_icon">
                <img alt="tennis racquet" src="/assets/tennis.svg" />
              </div>
              <div>Tennis</div>
            </h3>
            <TimeSlots
              reservations={existingReservations.filter(
                (r) => r.court === "10s",
              )}
              isLoggedIn={!!user}
              court="10s"
              date={date}
            />
          </div>
        )}
        {user?.courtViz?.hideBball ? null : (
          <div className="schedule schedule___basketball">
            <h3 className="schedule_header">
              <div className="schedule_icon">
                <img alt="basketball" src="/assets/basketball.svg" />
              </div>
              <div>Basketball</div>
            </h3>
            <TimeSlots
              reservations={existingReservations.filter(
                (r) => r.court === "bball",
              )}
              isLoggedIn={!!user}
              court="bball"
              date={date}
            />
          </div>
        )}
      </div>
    </React.Fragment>
  ));
};
