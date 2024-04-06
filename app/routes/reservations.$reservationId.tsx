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

export default function ReservationDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const currUser = useUser();

  const { start, end, user } = data.reservation;
  const canDelete = currUser.id === user.id;

  return (
    <div>
      <h3 className="text-2xl font-bold">{format(start, "iiii, MMMM do")}</h3>
      <p className="py-6">
        {user.email}
        <br />
        {format(start, "h:mm bbb")}
        &nbsp;-&nbsp;
        {format(end, "h:mm bbb")}
      </p>

      {canDelete ? (
        <>
          <hr className="my-4" />
          <Form method="post">
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Delete
            </button>
          </Form>
        </>
      ) : null}
    </div>
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
