import { Link, useNavigate } from "@remix-run/react";
import cn from "classnames";
import {
  addDays,
  addHours,
  areIntervalsOverlapping,
  isSameDay,
  startOfDay,
  subHours,
} from "date-fns";
import React from "react";

import type { User } from "~/models/user.server";
import { dateToHeader, formatTime, getOffset } from "~/utils";

// it would be nicer to use Reservation from @prisma/client
// but start/end are serialized to strings by useLoaderData 🙃
export interface Rez {
  id: string;
  start: string;
  end: string;
  court: string;
  openPlay: boolean;
}

const rezTimes = [...Array(12).keys()].map((v: number) => v + 8);

type CourtType = "pb" | "bball" | "10s";

const isOverlapping = (r: Rez, date: Date, hour: number) =>
  areIntervalsOverlapping(
    { start: r.start, end: r.end },
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
  reservations: Rez[];
  isLoggedIn?: boolean;
  court: CourtType;
  date: Date;
}) => {
  const navigate = useNavigate();

  const offsetNow = subHours(new Date(), getOffset());
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
        const isPast = num <= offsetNow.getHours() && isToday;
        const isJustPast = num === offsetNow.getHours() && isToday;

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

        if (
          isPast &&
          !(isJustPast && (onHourIsReserved || halfHourIsReserved))
        ) {
          return null;
        }

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
            <button
              className={cn("schedule_button", {
                schedule_button___private: !!onHourPrivate,
                schedule_button___open: !!onHourOpenPlay,
              })}
              onClick={() => navigate(onHourUrl)}
            >
              {formatTime(num, false)}
            </button>
            <button
              className={cn("schedule_button", {
                schedule_button___private: !!halfHourPrivate,
                schedule_button___open: !!halfHourOpenPlay,
              })}
              onClick={() => navigate(onHalfHourUrl)}
            >
              {formatTime(num, true)}
            </button>
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
  reservations: Rez[];
  user?: User;
}) => {
  const availableDays = [...Array(7).keys()]
    .map((num) => {
      const offset = getOffset();
      const rawDate = addDays(startOfDay(subHours(new Date(), offset)), num);
      // 12:00am wherever code is running
      const date = new Date(rawDate.toISOString().slice(0, 19));

      date.setHours(0 + offset);

      const existingReservations = reservations.filter((r) =>
        isSameDay(startOfDay(subHours(r.start, offset)), date),
      );

      return { date, existingReservations };
    })
    .filter(({ date }) => {
      // omit today from list after 8pm (PT)
      const offsetNow = subHours(new Date(), getOffset());
      const isToday = offsetNow.getDate() === date.getDate();
      const isPast = isToday && offsetNow.getHours() >= 20;
      return !isPast;
    });

  return availableDays.map(({ date, existingReservations }, idx) => (
    <React.Fragment key={date.toISOString()}>
      <nav className="nav" id={"day-" + idx}>
        <div className="nav_content">
          <Link className="nav_link" to={"/#day-" + idx}>
            {dateToHeader(date)}
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
