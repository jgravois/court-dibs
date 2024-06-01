import type { User } from "@prisma/client";
import { useNavigate } from "@remix-run/react";
import cn from "classnames";
import {
  addDays,
  addHours,
  areIntervalsOverlapping,
  format,
  isEqual,
  isToday,
  isTomorrow,
  startOfDay,
  startOfToday,
} from "date-fns";
import React from "react";

// it would be nicer to use Reservation from @prisma/client
// but start/end are serialized to strings by useLoaderData 🙃
export interface Rez {
  id: string;
  start: string;
  end: string;
  court: string;
  openPlay: boolean;
}

const dateToHeader = (date: Date) => {
  const prefix = isToday(date)
    ? "Today - "
    : isTomorrow(date)
    ? "Tomorrow - "
    : "";

  return prefix + format(date, "iiii, MMMM dd");
};

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

const Guts = ({
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
  isLoggedIn;

  const navigate = useNavigate();

  return (
    <div
      className={cn("schedule_content", {
        schedule_content___pickleball: court === "pb",
        schedule_content___basketball: court === "bball",
        schedule_content___tennis: court === "10s",
      })}
    >
      {rezTimes.map((num) => {
        const onHourPrivate = reservations.some(
          (r) => isOverlapping(r, date, num) && !r.openPlay,
        );

        const onHourOpenPlay = reservations.some(
          (r) => isOverlapping(r, date, num) && r.openPlay,
        );

        const halfHourPrivate = reservations.some(
          (r) => isOverlapping(r, date, num + 0.5) && !r.openPlay,
        );

        const halfHourOpenPlay = reservations.some(
          (r) => isOverlapping(r, date, num + 0.5) && r.openPlay,
        );

        const canReserveOnHour = !onHourPrivate && !onHourOpenPlay;
        const canReserveOnHalfHour = !halfHourPrivate && !halfHourOpenPlay;

        return (
          <div className="schedule_row" key={num}>
            <button
              className={cn("schedule_button", {
                schedule_button___private: onHourPrivate,
                schedule_button___open: onHourOpenPlay,
              })}
              onClick={() =>
                canReserveOnHour
                  ? navigate(
                      `/reservations/new?day=${date
                        .toISOString()
                        .slice(0, 10)}&start=${
                        String(num).padStart(2, "0") + ":00"
                      }`,
                    )
                  : undefined
              }
            >
              {num + ":00"}
            </button>
            <button
              className={cn("schedule_button", {
                schedule_button___private: halfHourPrivate,
                schedule_button___open: halfHourOpenPlay,
              })}
              onClick={() =>
                canReserveOnHalfHour
                  ? navigate(
                      `/reservations/new?day=${date
                        .toISOString()
                        .slice(0, 10)}&start=${
                        String(num).padStart(2, "0") + ":30"
                      }`,
                    )
                  : console.log("cant touch this")
              }
            >
              {num + ":30"}
            </button>
          </div>
        );
      })}
    </div>
  );
};

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
}) => (
  <div
    className={cn("schedule", {
      schedule___basketball: court === "bball",
      schedule___tennis: court === "10s",
    })}
  >
    <h3 className="schedule_header">
      <div className="schedule_icon">
        {court === "pb" ? (
          <img
            alt="pickleball paddle"
            src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/pickleball.svg?v=1714921535243"
          />
        ) : court === "10s" ? (
          <img
            alt="tennis racquet"
            src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/tennis.svg?v=1714921535054"
          />
        ) : (
          <img
            alt="basketball"
            src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/basketball.svg?v=1714921534845"
          />
        )}
      </div>
      {court === "pb" ? (
        <div>Pickleball</div>
      ) : court === "10s" ? (
        <div>Tennis</div>
      ) : (
        <div>Basketball</div>
      )}
    </h3>
    <Guts
      reservations={reservations}
      isLoggedIn={isLoggedIn}
      court={court}
      date={date}
    />
  </div>
);

export const ReservationList = ({
  reservations,
  user,
}: {
  reservations: Rez[];
  user?: User;
}) => {
  const availableDays = [...Array(7).keys()].map((num) => {
    const date = addDays(startOfToday(), num);
    return {
      date,
      existingReservations: reservations.filter((r) =>
        isEqual(startOfDay(r.start), date),
      ),
    };
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
        <TimeSlots
          reservations={existingReservations.filter((r) => r.court === "pb")}
          isLoggedIn={!!user}
          court="pb"
          date={date}
        />
        <TimeSlots
          reservations={existingReservations.filter((r) => r.court === "bball")}
          isLoggedIn={!!user}
          court="bball"
          date={date}
        />
        <TimeSlots
          reservations={existingReservations.filter((r) => r.court === "10s")}
          isLoggedIn={!!user}
          court="10s"
          date={date}
        />
      </main>
    </React.Fragment>
  ));
};
