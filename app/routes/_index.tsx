import type { User } from "@prisma/client";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";

import { getReservations } from "~/models/reservation.server";
import { getSession } from "~/session.server";
import { useOptionalUser } from "~/utils";

import { Header } from "./Header";
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
      <Header />
      <div className="wrapper">
        <ReservationList
          reservations={data.reservations as Rez[]}
          user={user}
        />
      </div>
    </>
  );
}
