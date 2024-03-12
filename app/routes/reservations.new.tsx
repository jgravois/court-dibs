import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { createReservation } from "~/models/reservation.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const start = formData.get("start");

  if (typeof start !== "string" || start.length === 0) {
    return json({ errors: { start: "start is required" } }, { status: 400 });
  }

  await createReservation({ start: new Date(), end: new Date(), userId });

  return redirect("/reservations");
};

export default function NewReservationPage() {
  const actionData = useActionData<typeof action>();
  const startRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.start) {
      startRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Start Time: </span>
          <input
            ref={startRef}
            name="start"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.start ? true : undefined}
            aria-errormessage={
              actionData?.errors?.start ? "start-error" : undefined
            }
            type="time"
          />
        </label>
        {actionData?.errors?.start ? (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.start}
          </div>
        ) : null}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
