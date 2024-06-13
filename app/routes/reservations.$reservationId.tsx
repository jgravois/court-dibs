import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { format } from "date-fns";
import invariant from "tiny-invariant";

import { deleteReservation, getReservation } from "~/models/reservation.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

import { Header } from "./Header";

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
      <img
        alt="pball"
        src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/pickleball-solid.svg?v=1714837585684"
      />
    </div>
  ) : val === "10s" ? (
    <div className="existingRes_courtIcon">
      <img
        alt="tennis racquet"
        src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/tennis-ball-solid.svg?v=1714837585529"
      />
    </div>
  ) : (
    <div className="existingRes_courtIcon">
      <img
        alt="bball"
        src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/basketball-solid.svg?v=1714837585367"
      />
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
          <p>{openPlay ? "Open play" : null}</p>
          <p>{courtIcon(court)}</p>
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
