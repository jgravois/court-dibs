import type { User } from "@prisma/client";
import type { MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";

import { Header } from "~/components/Header";
import { ReservationList } from "~/components/ReservationList";
import { getReservations } from "~/models/reservation.server";
import { useOptionalUser } from "~/utils";

export const meta: MetaFunction = () => [{ title: "Court dibs" }];

export const loader = async () => {
  const reservations = await getReservations();

  return json({ reservations });
};

export default function Index() {
  const user: User | undefined = useOptionalUser();
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Header user={user} />
      <main className="wrapper">
        <ReservationList reservations={data.reservations} user={user} />
      </main>
    </>
  );
}
