import { json } from "@remix-run/node";
import { Form, Link, Outlet } from "@remix-run/react";

import { getReservations } from "~/models/reservation.server";
import { useUser } from "~/utils";

export const loader = async () => {
  const reservations = await getReservations();
  return json({ reservations });
};

export default function ReservationsPage() {
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to="/">Court dibs</Link>
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
        <div className="h-full w-1/3 border-r bg-gray-50"></div>
        <div className="h-full w-1/3">
          <Outlet />
        </div>
        <div className="h-full w-1/3 border-r bg-gray-50"></div>
      </main>
    </div>
  );
}
