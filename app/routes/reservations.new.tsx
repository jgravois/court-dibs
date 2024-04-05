import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { addMinutes, startOfToday } from "date-fns";
import { useEffect, useRef } from "react";

import { createReservation } from "~/models/reservation.server";
import { requireUserId } from "~/session.server";

// const onChange = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
//   evt.preventDefault();
//   if (startTimeRef.current?.value) {
//     startTimeRef.current.value = evt.currentTarget.innerText;
//   }
// };

// const Duration = ({
//   st,
//   onClick,
// }: {
//   st: string;
//   onClick: (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
// }) => (
//   <button
//     className="rounded bg-green-500 px-4 py-2 text-white"
//     onClick={onClick}
//   >
//     {st}
//   </button>
// );

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const startTime = formData.get("startTime");
  const startDate = formData.get("startDate");
  const duration = formData.get("duration");

  if (typeof startTime !== "string" || startTime === "") {
    return json({ errors: { start: "start is required" } }, { status: 400 });
  }

  if (typeof startDate !== "string" || startTime.length < 1) {
    return json(
      { errors: { start: "start date is required" } },
      { status: 400 },
    );
  }

  if (typeof duration !== "string" || duration === "") {
    return json({ errors: { start: "duration is required" } }, { status: 400 });
  }

  const start = new Date(`${startDate}T${startTime}:00`);
  await createReservation({
    start,
    end: addMinutes(start, Number(duration)),
    userId,
  });

  return redirect("/reservations");
};

export default function NewReservationPage() {
  const [params] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const startTimeRef = useRef<HTMLSelectElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const durationRef = useRef<HTMLFieldSetElement>(null);

  useEffect(() => {
    if (actionData?.errors?.start) {
      startTimeRef.current?.focus();
    }
  }, [actionData]);

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
          <span>What time are you starting?</span>
          <select name="startTime" id="startTime" ref={startTimeRef}>
            <option value="08:00">8:00 am</option>
            <option value="09:00">9:00 am</option>
            <option value="10:00">10:00 am</option>
          </select>

          <fieldset ref={durationRef}>
            <legend>How long are you going to play?</legend>
            <div>
              <input type="radio" id="duration30" name="duration" value="30" />
              <label htmlFor="duration30">30 minutes</label>

              <input
                defaultChecked
                type="radio"
                id="duration60"
                name="duration"
                value="60"
              />
              <label htmlFor="duration60">1 hour</label>

              <input
                type="radio"
                id="duration120"
                name="duration"
                value="120"
              />
              <label htmlFor="duration120">2 hours</label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Which court?</legend>

            <div>
              <input
                type="checkbox"
                id="pickleball"
                name="pickleball"
                defaultChecked
              />
              <label htmlFor="pickleball">Pickleball 🏓</label>
            </div>

            <div>
              <input type="checkbox" id="basketball" name="basketball" />
              <label htmlFor="basketball">Basketball 🏀</label>
            </div>

            <div>
              <input type="checkbox" id="tennis" name="tennis" />
              <label htmlFor="tennis">Tennis 🎾</label>
            </div>
          </fieldset>

          <fieldset>
            <input type="checkbox" id="openPlay" name="openPlay" />
            <label htmlFor="openPlay">randos are welcome to join</label>
          </fieldset>

          <div style={{ display: "none" }}>
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
