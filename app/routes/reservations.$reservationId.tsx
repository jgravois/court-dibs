import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { deleteReservation, getReservation } from "~/models/reservation.server";
import { Header } from "~/routes/header";
import { requireUserId } from "~/session.server";
import { format, useUser } from "~/utils";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.reservationId, "reservationId not found");

  const reservation = await getReservation({
    id: params.reservationId,
    userId,
  });

  if (!reservation) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ reservation });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.reservationId, "reservationId not found");

  await deleteReservation({ id: params.reservationId, userId });

  return redirect("/");
};

const courtIcon = (val: string) =>
  val === "pb" ? (
    <div className="existingRes_courtIcon">
      <img alt="pball" src="/assets/pickleball-solid.svg" />
    </div>
  ) : val === "10s" ? (
    <div className="existingRes_courtIcon">
      <img alt="tennis racquet" src="/assets/tennis-ball-solid.svg" />
    </div>
  ) : (
    <div className="existingRes_courtIcon">
      <img alt="bball" src="/assets/basketball-solid.svg" />
    </div>
  );

export default function ReservationDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const currUser = useUser();

  const { start, end, user, court, openPlay } = data.reservation;
  const canDelete = currUser.id === user.id;

  return (
    <>
      <Header />
      <div className="container">
        <div className="existingRes_stack">
          <p className="existingRes_label">{format(start, "iiii, MMMM dd")}</p>
          <p>{user.email}</p>
          <p>
            {format(start, "h:mm bbb")}
            &nbsp;-&nbsp;
            {format(end, "h:mm bbb")}
          </p>
          <p>{openPlay ? "Neighbors welcome" : null}</p>
          {courtIcon(court)}
          {canDelete ? (
            <>
              <hr className="my-4" />
              <Form method="post">
                <button type="submit" className="newRes_button">
                  Delete
                </button>
              </Form>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Reservation not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
