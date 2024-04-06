import type { User } from "@prisma/client";
import { Link, NavLink } from "@remix-run/react";
import {
  addDays,
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
}

const dateToHeader = (date: Date) => {
  const prefix = isToday(date)
    ? "Today - "
    : isTomorrow(date)
    ? "Tomorrow - "
    : "";

  return prefix + format(date, "iiii, MMMM do");
};

const DayList = ({
  reservations,
  isLoggedIn = false,
}: {
  reservations: Rez[];
  isLoggedIn?: boolean;
}) => {
  return reservations.length === 0 ? (
    <p className="p-4">No reservations yet</p>
  ) : (
    <ol>
      {reservations
        .sort((a, b) => (a.start.valueOf() > b.start.valueOf() ? 1 : -1))
        .map((rez) => (
          <li key={rez.id}>
            {isLoggedIn ? (
              <NavLink
                className={({ isActive }) =>
                  `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                }
                to={"/reservations/" + rez.id}
              >
                {format(rez.start, "h:mm bbb")}
                &nbsp;-&nbsp;
                {format(rez.end, "h:mm bbb")}
              </NavLink>
            ) : (
              <p className="p-2">
                {format(rez.start, "h:mm bbb")}
                &nbsp;-&nbsp;
                {format(rez.end, "h:mm bbb")}
              </p>
            )}
          </li>
        ))}
    </ol>
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
      <h1 className="text-2xl font-bold">
        {dateToHeader(date)}&nbsp;
        {user ? (
          <Link
            to={`/reservations/new?day=${date.toISOString().slice(0, 10)}`}
            className="text-blue-500"
          >
            +
          </Link>
        ) : null}
      </h1>
      <DayList reservations={existingReservations} isLoggedIn={!!user} />
    </React.Fragment>
  ));
};
