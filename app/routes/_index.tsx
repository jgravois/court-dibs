import type { User } from "@prisma/client";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, json, useLoaderData } from "@remix-run/react";

import { getReservations } from "~/models/reservation.server";
import { getSession } from "~/session.server";
import { useOptionalUser } from "~/utils";

import { HeaderLeft } from "./HeaderLeft";
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
          <HeaderLeft />
          <div className="header_right">
            {user ? (
              <>
                <p className="header_user">{user.email}</p>
                <Form action="/logout" method="post">
                  <button
                    type="submit"
                    className="header_link header_link___button"
                  >
                    Sign out
                  </button>
                </Form>
              </>
            ) : (
              <div className="loginButtons">
                <Link to="/signup" className="header_link header_link___button">
                  Sign up
                </Link>
                <Link to="/login" className="header_link header_link___button">
                  Log in
                </Link>
              </div>
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
