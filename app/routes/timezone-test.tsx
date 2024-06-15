import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { startOfToday } from "date-fns";
import { useRef } from "react";

import { Header } from "./Header";
import { dateToHeader } from "./ReservationList";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const startTime = formData.get("startTime");
  const startDate = formData.get("startDate");

  if (typeof startTime !== "string" || startTime === "") {
    return json({ errors: { start: "start is required" } }, { status: 400 });
  }

  if (typeof startDate !== "string" || startTime.length < 1) {
    return json(
      { errors: { start: "start date is required" } },
      { status: 400 },
    );
  }

  // https://www.30secondsofcode.org/js/s/parse-or-serialize-cookie/
  const clientOffset = request.headers
    .get("cookie")
    ?.split(";")
    .map((v) => v.split("="))
    .reduce(
      (acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
        return acc;
      },
      {} as Record<string, string>,
    ).utcOffset;

  const serverOffset = new Date().getTimezoneOffset() / 60;
  const diff = serverOffset - (Number(clientOffset) ?? serverOffset);

  const [hour, min] = startTime.split(":") as [string, string];
  const rawDate = `${startDate}T${Number(hour) - diff}:${min}:00`;
  const start = new Date(rawDate);
  console.log(diff, start, rawDate);

  return redirect("/");
};

export default function NewReservationPage() {
  const [params] = useSearchParams();
  const actionData = useActionData<typeof action>();

  const startTimeRef = useRef<HTMLInputElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Header />
      <div className="container">
        <Form className="newRes_form" method="post">
          <div className="newRes_group">
            <div className="newRes_stack">
              <p className="newRes_label">What day?</p>
              <p>{dateToHeader(params.get("day") as unknown as Date)}</p>
            </div>
          </div>

          <div>
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
          {actionData?.errors?.start ? (
            <div className="pt-1 text-red-700" id="title-error">
              {actionData.errors.start}
            </div>
          ) : null}

          <div className="newRes_group newRes_group___small">
            <button type="submit" className="newRes_button">
              Submit
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
