import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { addMinutes, startOfToday } from "date-fns";
import { useEffect, useRef } from "react";

import { createReservation } from "~/models/reservation.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const startTime = formData.get("startTime");
  const startDate = formData.get("startDate");
  const duration = formData.get("duration");
  const court = formData.get("court");
  const openPlay = formData.get("openPlay");

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

  if (typeof duration !== "string" || duration === "") {
    return json({ errors: { start: "duration is required" } }, { status: 400 });
  }

  if (typeof court !== "string" || court === "") {
    return json({ errors: { start: "court is required" } }, { status: 400 });
  }

  const start = new Date(`${startDate}T${startTime}:00`);
  await createReservation({
    start,
    end: addMinutes(start, Number(duration)),
    court,
    userId,
    openPlay: !!openPlay,
  });

  return redirect("/");
};

export default function NewReservationPage() {
  const [params] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const startTimeRef = useRef<HTMLSelectElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const courtRef = useRef<HTMLFieldSetElement>(null);
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
        width: "80%",
      }}
    >
      <div>
        <label htmlFor="startTime">
          <span>What time are you starting?</span>
        </label>
        <br />
        <select name="startTime" id="startTime" ref={startTimeRef}>
          <option value="08:00">8:00 am</option>
          <option value="09:00">9:00 am</option>
          <option value="10:00">10:00 am</option>
          <option value="11:00">11:00 am</option>
          <option value="12:00">12:00 pm</option>
          <option value="13:00">1:00 pm</option>
          <option value="14:00">2:00 pm</option>
          <option value="15:00">3:00 pm</option>
          <option value="16:00">4:00 pm</option>
          <option value="17:00">5:00 pm</option>
          <option value="18:00">6:00 pm</option>
        </select>
        <br />
        <br />
        <fieldset ref={durationRef}>
          <legend>How long are you playing?</legend>
          <div>
            <div className="flex items-center">
              <input type="radio" id="duration30" name="duration" value="30" />
              <label htmlFor="duration30">30 minutes</label>
            </div>
            <div className="flex items-center">
              <input
                defaultChecked
                type="radio"
                id="duration60"
                name="duration"
                value="60"
              />
              <label htmlFor="duration60">1 hour</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="duration120"
                name="duration"
                value="120"
              />
              <label htmlFor="duration120">2 hours</label>
            </div>
          </div>
        </fieldset>
        <br />

        <fieldset ref={courtRef}>
          <legend>which court?</legend>

          <div className="flex items-center">
            <input type="radio" id="court_bball" name="court" value="bball" />
            <label htmlFor="court_bball">Basketball 🏀</label>
          </div>
          <div className="flex items-center">
            <input
              defaultChecked
              type="radio"
              id="court_pb"
              name="court"
              value="pb"
            />
            <label htmlFor="court_pb">Pickleball 🏓</label>
          </div>
          <div className="flex items-center">
            <input type="radio" id="court_10s" name="court" value="10s" />
            <label htmlFor="court_10s">Tennis 🎾</label>
          </div>
        </fieldset>
        <br />
        <fieldset>
          <div className="flex">
            <div className="flex items-center h-7">
              <input
                type="checkbox"
                id="openPlay"
                name="openPlay"
                className="w-4 h-4"
              />
            </div>
            <div className="ms-2">
              <label htmlFor="openPlay">Open play</label>
              <p className="text-xs ">others are welcome to join you</p>
            </div>
          </div>
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
