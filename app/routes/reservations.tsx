import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
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

import { getReservations } from "~/models/reservation.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

interface Rez {
  id: string;
  start: string; // date going in, string coming out 🤷
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

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  userId;
  const reservations = await getReservations();
  return json({ reservations, day: params.day });
};

const DayList = ({ reservations }: { reservations: Rez[] }) => {
  return reservations.length === 0 ? (
    <p className="p-4">No reservations yet</p>
  ) : (
    <ol>
      {reservations.map((rez) => (
        <li key={rez.id}>
          <NavLink
            className={({ isActive }) =>
              `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
            }
            to={rez.id}
          >
            {new Date(rez.start).toLocaleTimeString()}
            &nbsp;-&nbsp;
            {new Date(rez.end).toLocaleTimeString()}
          </NavLink>
        </li>
      ))}
    </ol>
  );
};

export default function ReservationsPage() {
  const data: { reservations: Rez[]; foo?: string } =
    useLoaderData<typeof loader>();

  const user = useUser();

  const availableDays = [...Array(7).keys()].map((num) => {
    const date = addDays(startOfToday(), num);
    return {
      date,
      existingReservations: data.reservations.filter((r) =>
        isEqual(startOfDay(r.start), date),
      ),
    };
  });

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Court dibs</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-2/3 border-r bg-gray-50">
          {availableDays.map(({ date, existingReservations }) => (
            <React.Fragment key={date.toISOString()}>
              <h1 className="text-2xl font-bold">
                {dateToHeader(date)}&nbsp;
                <Link
                  to={`new?day=${date.toISOString().slice(0, 10)}`}
                  className="text-blue-500"
                >
                  +
                </Link>
              </h1>
              <DayList reservations={existingReservations} />
            </React.Fragment>
          ))}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
