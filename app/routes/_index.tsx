import type { User } from "@prisma/client";
import type { MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";

import { getReservations } from "~/models/reservation.server";
import { Header } from "~/routes/header";
import { ReservationList, Rez } from "~/routes/reservation-list";
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
