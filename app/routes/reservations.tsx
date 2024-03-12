import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { addDays, isEqual, isToday, startOfDay, startOfToday } from "date-fns";

import { getReservations } from "~/models/reservation.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Rez = { id: string; start: string; end: string };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  userId;
  const reservations = await getReservations();
  return json({ reservations });
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
            📝 {rez.start.valueOf()}
          </NavLink>
        </li>
      ))}
    </ol>
  );
};

export default function ReservationsPage() {
  const data: { reservations: Rez[] } = useLoaderData<typeof loader>();
  const user = useUser();

  const todays = data.reservations.filter((r) => isToday(r.start));
  const tomorrows = data.reservations.filter((r) =>
    isEqual(startOfDay(r.start), startOfDay(addDays(startOfToday(), 1))),
  );

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Reservations</Link>
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
        <div className="h-full w-2/4 border-r bg-gray-50">
          <h1>Today</h1>

          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Reservation
          </Link>
          <DayList reservations={todays} />

          <h1>Tomorrow</h1>

          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Reservation
          </Link>

          <DayList reservations={tomorrows} />

          <h2>Out further</h2>

          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Reservation
          </Link>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
