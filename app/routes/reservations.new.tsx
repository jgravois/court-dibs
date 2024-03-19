import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { addHours, startOfToday } from "date-fns";
import { useEffect, useRef } from "react";

import { createReservation } from "~/models/reservation.server";
import { requireUserId } from "~/session.server";

const StartTime = ({
  st,
  onClick,
}: {
  st: string;
  onClick: (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) => (
  <button
    className="rounded bg-green-500 px-4 py-2 text-white"
    onClick={onClick}
  >
    {st}
  </button>
);

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const startTime = formData.get("startTime");
  const startDate = formData.get("startDate");

  if (typeof startTime !== "string" || startTime === "") {
    return json({ errors: { start: "start is required" } }, { status: 400 });
  }

  if (typeof startTime !== "string" || startTime.length < 1) {
    return json(
      { errors: { start: "start date is required" } },
      { status: 400 },
    );
  }

  const start = new Date(`${startDate}T${startTime}:00`);
  await createReservation({ start, end: addHours(start, 1), userId });

  return redirect("/reservations");
};

export default function NewReservationPage() {
  const [params] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const startTimeRef = useRef<HTMLInputElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.start) {
      startTimeRef.current?.focus();
    }
  }, [actionData]);

  const startTimes = ["09:00", "10:00", "11:00"];

  const onChange = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    evt.preventDefault();
    if (startTimeRef.current?.value) {
      startTimeRef.current.value = evt.currentTarget.innerText;
    }
  };

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "33%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Start Time: </span>
          {startTimes.map((st) => (
            <StartTime key={st} st={st} onClick={onChange} />
          ))}
          <div style={{ display: "none" }}>
            <input
              name="startTime"
              ref={startTimeRef}
              type="text"
              defaultValue=""
            />
            <input
              name="startDate"
              ref={startDateRef}
              type="text"
              defaultValue={
                params.get("day") ?? startOfToday().toISOString().slice(0, 10)
              }
            />
          </div>
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
