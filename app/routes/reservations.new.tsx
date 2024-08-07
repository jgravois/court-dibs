import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import {
  addDays,
  addHours,
  addMinutes,
  subHours,
  startOfToday,
  compareAsc,
} from "date-fns";
import React from "react";
import * as SunCalc from "suncalc";

import { createReservation } from "~/models/reservation.server";
import { Header } from "~/routes/header";
import {
  getSession,
  requireUserId,
  requireValidStytchToken,
  sessionStorage,
} from "~/session.server";
import { dateToHeader, formatTime, getOffset } from "~/utils";

const anotherTimeFormattingFunc = (val: string | null) => {
  if (!val) return;
  const [h, m] = val.split(":");
  return formatTime(Number(h), m == "30");
};

// if an anonymous or stale user gets here, fail fast
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  const userId = await requireUserId(request);
  // we ask stytch to validate the user token at most once every 12 hours
  const lastValidated = await requireValidStytchToken(request);
  session.set("last_validated", lastValidated);

  return json(
    { userId },
    {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    },
  );
};

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

  const start = new Date(`${startDate}T${startTime}:00-07:00`);

  try {
    await createReservation({
      start,
      end: addMinutes(start, Number(duration)),
      court,
      userId,
      openPlay: !!openPlay,
    });
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return json({ errors: { start: (e as any).message } }, { status: 400 });
  }

  return redirect("/");
};

export default function NewReservationPage() {
  const [params] = useSearchParams();
  const actionData = useActionData<typeof action>();

  const startTimeRef = React.useRef<HTMLInputElement>(null);
  const startDateRef = React.useRef<HTMLInputElement>(null);
  const courtRef = React.useRef<HTMLFieldSetElement>(null);
  const durationRef = React.useRef<HTMLFieldSetElement>(null);

  const [tooDark, setTooDark] = React.useState(false);

  const offset = getOffset();
  const rawDate = addHours(params.get("day") as unknown as Date, 0);
  const day = new Date(rawDate.toISOString().slice(0, 19));
  day.setHours(0 + offset);

  const offsetDay = subHours(day, offset);
  const { dusk } = SunCalc.getTimes(addDays(offsetDay, 1), 33.48, -117.68);

  const duskCheck = () => {
    const duration =
      (durationRef.current?.querySelector("input:checked") as HTMLInputElement)
        ?.value ?? 30;

    const end = addMinutes(
      addHours(offsetDay, Number(params.get("start")?.split(":")[0] ?? 0)),
      Number(duration) ?? 0,
    );
    setTooDark(compareAsc(end, dusk) === 1);
  };

  React.useEffect(duskCheck, [dusk, offsetDay, params]);

  const errMessage = actionData?.errors?.start
    ? actionData.errors.start
    : tooDark
    ? "Are you sure? It will be dark before this reservation concludes."
    : undefined;

  return (
    <>
      <Header />
      <div className="container">
        <h1>
          {dateToHeader(day)} @ {anotherTimeFormattingFunc(params.get("start"))}
        </h1>
        <br />
        <hr />
        <br />
        <Form className="newRes_form" method="post">
          <div className="newRes_group">
            <fieldset ref={durationRef} onChange={duskCheck}>
              <legend className="newRes_label">
                How long are you playing?
              </legend>
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
                <label htmlFor="duration90" className="newRes_radio">
                  90 minutes
                  <input
                    type="radio"
                    id="duration90"
                    name="duration"
                    value="90"
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
                    defaultChecked={params.get("court") === "bball"}
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
                    defaultChecked={params.get("court") === "pb"}
                    type="radio"
                    id="court_pb"
                    name="court"
                    value="pb"
                  />
                  <span className="newRes_checkmark"></span>
                </label>
                <label htmlFor="court_10s" className="newRes_radio">
                  Tennis
                  <input
                    defaultChecked={params.get("court") === "10s"}
                    type="radio"
                    id="court_10s"
                    name="court"
                    value="10s"
                  />
                  <span className="newRes_checkmark"></span>
                </label>
              </div>
            </fieldset>
          </div>
          <div className="newRes_group">
            <fieldset>
              <label className="newRes_checkbox" htmlFor="openPlay">
                <div className="newRes_bold">
                  Are neighbors welcome to join?
                </div>
                <input type="checkbox" id="openPlay" name="openPlay" />
                <span className="newRes_box"></span>
              </label>
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
            <input
              name="startTime"
              type="text"
              ref={startTimeRef}
              defaultValue={params.get("start") ?? "08:00"}
            />
          </div>
          {errMessage ? (
            <div className="pt-1 text-red-700" id="title-error">
              {errMessage}
            </div>
          ) : null}
          <div className="newRes_group newRes_group___small">
            <button type="submit" className="newRes_button">
              Reserve
            </button>
            <Link to="/" className="newRes_button newRes_button___outline">
              Cancel
            </Link>
          </div>
        </Form>
      </div>
    </>
  );
}
