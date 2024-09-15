import { SerializeFrom } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { addDays, format, isSameDay } from "date-fns";
import React from "react";

import { TimeSlots } from "~/components/TimeSlots";
import type { Reservation } from "~/models/reservation.server";
import type { User } from "~/models/user.server";
import { changeTimezone, maybePrefix } from "~/utils";

const DAYS_TO_DISPLAY = [...Array(7).keys()];
export const ReservationList = ({
  reservations,
  user,
}: {
  reservations: SerializeFrom<Reservation>[];
  user?: User;
}) => {
  const offsetNow = changeTimezone(new Date());

  const days = DAYS_TO_DISPLAY.map((num) => {
    const date = addDays(offsetNow, num);
    const existingReservations = reservations;

    // TODO: reenable
    // .filter((r) => {
    //   const startDate = new Date(r.start).toDateString();
    //   return date.toDateString() === startDate;
    // });

    const dateString = format(date, "yyyy-MM-dd");

    return { date, existingReservations, dateString };
  }).filter(({ date }) => {
    // omit today from list after 8pm (PT)
    const isToday = isSameDay(offsetNow, date);
    const isPast = isToday && offsetNow.getHours() >= 20;
    return !isPast;
  });

  return days.map(({ date, existingReservations, dateString }, idx) => (
    <React.Fragment key={dateString}>
      <nav className="nav" id={"day-" + idx}>
        <div className="nav_content">
          <Link className="nav_link" to={"/#day-" + idx}>
            {maybePrefix(date)}
            {format(date, "iiii, MMMM dd")}
          </Link>
        </div>
      </nav>
      <div className="main">
        {user?.courtViz?.hidePb ? null : (
          <div className="schedule">
            <h3 className="schedule_header">
              <div className="schedule_icon">
                <img alt="pickleball paddle" src="/assets/pickleball.svg" />
              </div>
              <div>Pickleball</div>
            </h3>
            <TimeSlots
              reservations={existingReservations.filter(
                (r) => r.court === "pb",
              )}
              isLoggedIn={!!user}
              court="pb"
              date={date}
              dateString={dateString}
            />
          </div>
        )}
        {user?.courtViz?.hide10s ? null : (
          <div className="schedule schedule___tennis">
            <h3 className="schedule_header">
              <div className="schedule_icon">
                <img alt="tennis racquet" src="/assets/tennis.svg" />
              </div>
              <div>Tennis</div>
            </h3>
            <TimeSlots
              reservations={existingReservations.filter(
                (r) => r.court === "10s",
              )}
              isLoggedIn={!!user}
              court="10s"
              date={date}
              dateString={dateString}
            />
          </div>
        )}
        {user?.courtViz?.hideBball ? null : (
          <div className="schedule schedule___basketball">
            <h3 className="schedule_header">
              <div className="schedule_icon">
                <img alt="basketball" src="/assets/basketball.svg" />
              </div>
              <div>Basketball</div>
            </h3>
            <TimeSlots
              reservations={existingReservations.filter(
                (r) => r.court === "bball",
              )}
              isLoggedIn={!!user}
              court="bball"
              date={date}
              dateString={dateString}
            />
          </div>
        )}
      </div>
    </React.Fragment>
  ));
};
