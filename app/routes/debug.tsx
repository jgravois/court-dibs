import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import cn from "classnames";
import { addDays, format, isSameDay } from "date-fns";
import React from "react";

import { Header } from "~/components/Header/Header";
import { changeTimezone, formatTime } from "~/utils";

export const meta: MetaFunction = () => [{ title: "Debug" }];

const rezTimes = [...Array(12).keys()].map((v: number) => v + 8);

const newRezUrl = (
  dateString: string,
  num: number,
  court: string,
  isHalf: boolean,
) =>
  `/reservations/new?day=${dateString}&start=${String(num).padStart(2, "0")}:${
    isHalf ? "30" : "00"
  }&court=${court}`;

const TimeSlots = ({
  court,
  date,
  dateString,
}: {
  court: string;
  date: Date;
  dateString: string;
}) => {
  const offsetNow = changeTimezone(new Date());
  const isToday = offsetNow.getDate() === date.getDate();

  return (
    <div
      className={cn("schedule_content", {
        schedule_content___pickleball: court === "pb",
        schedule_content___basketball: court === "bball",
        schedule_content___tennis: court === "10s",
      })}
    >
      {rezTimes.map((num) => {
        // hide reservation slots that have passed (completely)
        if (isToday && num < offsetNow.getHours()) return null;

        const onHourUrl = newRezUrl(dateString, num, court, false);
        const onHalfHourUrl = newRezUrl(dateString, num, court, true);

        return (
          <div className="schedule_row" key={num}>
            <Link to={onHourUrl} className="schedule_button">
              {formatTime(num, false)}
            </Link>
            <Link to={onHalfHourUrl} className="schedule_button">
              {formatTime(num, true)}
            </Link>
          </div>
        );
      })}
    </div>
  );
};

const maybePrefix = (date: Date) => {
  const offsetNow = changeTimezone(new Date());

  const isToday = date.toDateString() === offsetNow.toDateString();
  const isTomorrow =
    date.toDateString() === addDays(offsetNow, 1).toDateString();

  if (isToday) return "today - ";
  if (isTomorrow) return "tomorrow - ";
  return "";
};

export default function Debug() {
  const offsetNow = changeTimezone(new Date());

  const availableDays = [...Array(3).keys()]
    .map((num) => addDays(offsetNow, num))
    .filter((date) => {
      // omit today from list after 8pm (PT)
      const isToday = isSameDay(offsetNow, date);
      const isPast = isToday && offsetNow.getHours() >= 20;
      return !isPast;
    })
    .map((date, idx) => {
      const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      return (
        <React.Fragment key={date.toISOString()}>
          <nav className="nav" id={"day-" + idx}>
            <div className="nav_content">
              <Link className="nav_link" to={"/#day-" + idx}>
                {maybePrefix(date)}
                {format(date, "iiii, MMMM dd")}
              </Link>
            </div>
          </nav>
          <div className="main">
            <div className="schedule">
              <h3 className="schedule_header">
                <div className="schedule_icon">
                  <img alt="pickleball paddle" src="/assets/pickleball.svg" />
                </div>
                <div>Pickleball</div>
              </h3>
              <TimeSlots court="pb" date={date} dateString={dateString} />
            </div>
          </div>
        </React.Fragment>
      );
    });

  return (
    <>
      <Header />
      <main className="container">{availableDays}</main>
    </>
  );
}
