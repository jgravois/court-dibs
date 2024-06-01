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
    <div className="newRes">
      <Form className="newRes_form" method="post">
        <div className="newRes_group">
          <div className="newRes_stack">
            <label className="newRes_label" htmlFor="startTime">
              <span>What time are you starting?</span>
            </label>
            <select
              className="newRes_select"
              name="startTime"
              id="startTime"
              ref={startTimeRef}
            >
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
          </div>
          <fieldset>
            <label className="newRes_checkbox" htmlFor="openPlay">
              <div className="newRes_bold">Are neighbors welcome to join?</div>
              <input type="checkbox" id="openPlay" name="openPlay" />
              <span className="newRes_box newRes_box___check"></span>
            </label>
          </fieldset>
        </div>
        <div className="newRes_group">
          <fieldset ref={durationRef}>
            <legend className="newRes_label">How long are you playing?</legend>
            <div>
              <label htmlFor="duration30" className="newRes_radio">
                30 minutes
                <input
                  type="radio"
                  id="duration30"
                  name="duration"
                  value="30"
                />
                <span className="newRes_checkmark"></span>
              </label>
              <label htmlFor="duration60" className="newRes_radio">
                1 hour
                <input
                  defaultChecked
                  type="radio"
                  id="duration60"
                  name="duration"
                  value="60"
                />
                <span className="newRes_checkmark"></span>
              </label>
              <label htmlFor="duration120" className="newRes_radio">
                2 hours
                <input
                  type="radio"
                  id="duration120"
                  name="duration"
                  value="120"
                />
                <span className="newRes_checkmark"></span>
              </label>
            </div>
          </fieldset>
          <fieldset ref={courtRef}>
            <legend className="newRes_label">Which court?</legend>
            <div>
              <label htmlFor="court_bball" className="newRes_radio">
                Basketball
                <input
                  type="radio"
                  id="court_bball"
                  name="court"
                  value="bball"
                />
                <span className="newRes_checkmark"></span>
              </label>
              <label htmlFor="court_pb" className="newRes_radio">
                Pickleball
                <input
                  defaultChecked
                  type="radio"
                  id="court_pb"
                  name="court"
                  value="pb"
                />
                <span className="newRes_checkmark"></span>
              </label>
              <label htmlFor="court_10s" className="newRes_radio">
                Tennis
                <input type="radio" id="court_10s" name="court" value="10s" />
                <span className="newRes_checkmark"></span>
              </label>
            </div>
          </fieldset>
        </div>
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

        <div className="newRes_group newRes_group___small">
          <button type="submit" className="newRes_button">
            Reserve
          </button>
          <button
            type="submit"
            className="newRes_button newRes_button___outline"
          >
            Cancel
          </button>
        </div>
      </Form>
    </div>
  );
}
