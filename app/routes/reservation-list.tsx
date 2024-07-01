import type { User } from "@prisma/client";
import { useNavigate } from "@remix-run/react";
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
import { Tooltip } from "react-tooltip";

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

        const handleOnHourClick = () =>
          !isLoggedIn
            ? // only show reservation details to logged in users
              undefined
            : // if court is already reserved, show details
            onHourIsReserved
            ? navigate(
                `/reservations/${onHourPrivate?.id ?? onHourOpenPlay?.id}`,
              )
            : navigate(
                `/reservations/new?day=${date
                  .toISOString()
                  .slice(0, 10)}&start=${
                  String(num).padStart(2, "0") + ":00"
                }&court=${court}`,
              );

        const handleHalfHourClick = () =>
          !isLoggedIn
            ? undefined
            : halfHourIsReserved
            ? navigate(
                `/reservations/${halfHourPrivate?.id ?? halfHourOpenPlay?.id}`,
              )
            : navigate(
                `/reservations/new?day=${date
                  .toISOString()
                  .slice(0, 10)}&start=${
                  String(num).padStart(2, "0") + ":30"
                }&court=${court}`,
              );

        return (
          <div className="schedule_row" key={num}>
            <button
              data-tooltip-id={
                onHourIsReserved && !isLoggedIn ? "taken-tooltip" : undefined
              }
              data-tooltip-content={
                onHourPrivate ? "Private reservation" : "Neighbors welcome"
              }
              className={cn("schedule_button", {
                schedule_button___private: !!onHourPrivate,
                schedule_button___open: !!onHourOpenPlay,
                schedule_button___anon: !isLoggedIn,
              })}
              onClick={handleOnHourClick}
            >
              {formatTime(num, false)}
            </button>
            <button
              className={cn("schedule_button", {
                schedule_button___private: !!halfHourPrivate,
                schedule_button___open: !!halfHourOpenPlay,
                schedule_button___anon: !isLoggedIn,
              })}
              onClick={handleHalfHourClick}
              data-tooltip-id={
                halfHourIsReserved && !isLoggedIn ? "taken-tooltip" : undefined
              }
              data-tooltip-content={
                halfHourPrivate ? "Private reservation" : "Neighbors welcome"
              }
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
  const availableDays = [...Array(7).keys()].map((num) => {
    const offset = getOffset();
    const rawDate = addDays(startOfDay(subHours(new Date(), offset)), num);
    // 12:00am wherever code is running
    const date = new Date(rawDate.toISOString().slice(0, 19));

    date.setHours(0 + offset);

    const existingReservations = reservations.filter((r) =>
      isSameDay(startOfDay(subHours(r.start, offset)), date),
    );

    return { date, existingReservations };
  });

  return availableDays.map(({ date, existingReservations }) => (
    <React.Fragment key={date.toISOString()}>
      <nav className="nav">
        <div className="nav_content">
          <a href="/" className="nav_link">
            {dateToHeader(date)}&nbsp;
          </a>
        </div>
      </nav>
      <main className="main">
        <div className="schedule">
          <h3 className="schedule_header">
            <div className="schedule_icon">
              <img alt="pickleball paddle" src="/assets/pickleball.svg" />
            </div>
            <div>Pickleball</div>
          </h3>
          <TimeSlots
            reservations={existingReservations.filter((r) => r.court === "pb")}
            isLoggedIn={!!user}
            court="pb"
            date={date}
          />
        </div>
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
        <div className="schedule schedule___tennis">
          <h3 className="schedule_header">
            <div className="schedule_icon">
              <img alt="tennis racquet" src="/assets/tennis.svg" />
            </div>
            <div>Tennis</div>
          </h3>
          <TimeSlots
            reservations={existingReservations.filter((r) => r.court === "10s")}
            isLoggedIn={!!user}
            court="10s"
            date={date}
          />
        </div>
        <Tooltip
          id="taken-tooltip"
          openEvents={{ mouseover: true, focus: true, click: true }}
        />
      </main>
    </React.Fragment>
  ));
};
