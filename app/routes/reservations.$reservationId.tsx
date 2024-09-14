import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { formatDistanceToNow } from "date-fns";
import invariant from "tiny-invariant";

import { Header } from "~/components/Header/Header";
import { deleteReservation, getReservation } from "~/models/reservation.server";
import { maybeUserId, requireUserId } from "~/session.server";
import { format, useOptionalUser } from "~/utils";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await maybeUserId(request);

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
    <div className="existingRes_courtType">
      <div className="existingRes_courtIcon">
        <img alt="pball" src="/assets/pickleball-solid.svg" />
      </div>
      &nbsp;Pickleball
    </div>
  ) : val === "10s" ? (
    <div className="existingRes_courtType">
      <div className="existingRes_courtIcon">
        <img alt="tennis racquet" src="/assets/tennis-ball-solid.svg" />
      </div>
      &nbsp;Tennis
    </div>
  ) : (
    <div className="existingRes_courtType">
      <div className="existingRes_courtIcon">
        <img alt="bball" src="/assets/basketball-solid.svg" />
      </div>
      &nbsp;Basketball
    </div>
  );

export default function ReservationDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const currUser = useOptionalUser();

  const { start, end, user, court, openPlay, createdAt } = data.reservation;
  const isAnon = !currUser;
  const canDelete = user && currUser?.id === user.id;

  return (
    <>
      <Header />
      <div className="container">
        <div className="existingRes_stack">
          <p className="existingRes_label">{format(start, "iiii, MMMM dd ")}</p>
          {courtIcon(court)}
          <p>
            {format(start, "h:mm bbb")}
            &nbsp;-&nbsp;
            {format(end, "h:mm bbb")}
          </p>
          <p>{openPlay ? "Neighbors welcome" : "Private reservation"}</p>
          {/* {isAnon ? null : <p>{user.email}</p>} */}
          {isAnon ? null : (
            <p>
              {`${user.email} called dibs ${formatDistanceToNow(createdAt, {
                addSuffix: true,
              })}`}
            </p>
          )}
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
