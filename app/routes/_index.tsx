import type { User } from "@prisma/client";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, json, useLoaderData } from "@remix-run/react";

import { getReservations } from "~/models/reservation.server";
import { getSession } from "~/session.server";
import { useOptionalUser } from "~/utils";

import { ReservationList, Rez } from "./ReservationList";

export const meta: MetaFunction = () => [{ title: "Court dibs" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const reservations = await getReservations();

  // next step is to verify that the token in the cookie is still valid
  // with stytch when the application loads with stored credentials
  const session = await getSession(request);
  const token = session.get("stytch_session");
  // confirmation that we can stash an arbitrary value and retrieve it.
  token;

  return json({ reservations });
};

export default function Index() {
  const user: User | undefined = useOptionalUser();
  const data = useLoaderData<typeof loader>();

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
            {user ? (
              <>
                <p className="header_user">{user.email}</p>
                <Form action="/logout" method="post">
                  <button type="submit" className="header_link">
                    Logout
                  </button>
                </Form>
              </>
            ) : (
              <Link to="/start" className="header_link header_link___button">
                Sign up or sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      <div className="wrapper">
        <ReservationList
          reservations={data.reservations as Rez[]}
          user={user}
        />
      </div>
    </>
  );
}
