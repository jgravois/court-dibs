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
    <>
      <header className="header">
        <div className="header_content">
          <div className="header_left">
            <Link to="/" className="h1">
              Court dibs
            </Link>
            <h2 className="h2">Call dibs on one of our sportsball courts</h2>
            <div className="header_illustration">
              <div className="header_icon header_icon___pickleball">
                <img src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/pickleball-solid.svg?v=1714837585684" />
              </div>
              <div className="header_icon header_icon___tennis">
                <img src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/tennis-ball-solid.svg?v=1714837585529" />
              </div>
              <div className="header_icon header_icon___basketball">
                <img src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/basketball-solid.svg?v=1714837585367" />
              </div>
            </div>
          </div>
          <div className="header_right">
            <p className="header_user">{user.email}</p>
            <Form action="/logout" method="post">
              <button type="submit" className="header_link">
                Sign out
              </button>
            </Form>
          </div>
        </div>
      </header>
      <main className="flex h-full bg-white">
        <div className="h-full w-1/3 border-r bg-gray-50"></div>
        <div className="h-full w-1/3">
          <Outlet />
        </div>
        <div className="h-full w-1/3 border-r bg-gray-50"></div>
      </main>
    </>
  );
}
