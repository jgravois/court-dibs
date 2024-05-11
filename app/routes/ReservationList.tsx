import type { User } from "@prisma/client";
import { Link, NavLink } from "@remix-run/react";
import {
  addDays,
  format,
  isEqual,
  isToday,
  isTomorrow,
  startOfDay,
  startOfToday,
} from "date-fns";
import React from "react";

const courtEmoji = (court: string) =>
  court === "pb" ? `🏓` : court === "bball" ? `🏀` : `🎾`;

// it would be nicer to use Reservation from @prisma/client
// but start/end are serialized to strings by useLoaderData 🙃
export interface Rez {
  id: string;
  start: string;
  end: string;
  court: string;
  openPlay: boolean;
}

const dateToHeader = (date: Date) => {
  const prefix = isToday(date)
    ? "Today - "
    : isTomorrow(date)
    ? "Tomorrow - "
    : "";

  return prefix + format(date, "iiii, MMMM dd");
};

const DayList = ({
  reservations,
  isLoggedIn = false,
}: {
  reservations: Rez[];
  isLoggedIn?: boolean;
}) => {
  return reservations.length === 0 ? (
    <main className="main">
      <div className="schedule">
        <h3 className="schedule_header">
          <div className="schedule_icon">
            <img src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/pickleball.svg?v=1714921535243" />
          </div>
          <div>Pickleball</div>
        </h3>
        <div className="schedule_content schedule_content___pickleball">
          <div className="schedule_row">
            <button className="schedule_button">8:00</button>
            <button className="schedule_button">8:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">9:00</button>
            <button className="schedule_button">9:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">10:00</button>
            <button className="schedule_button">10:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">11:00</button>
            <button className="schedule_button">11:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">12:00</button>
            <button className="schedule_button">12:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">1:00</button>
            <button className="schedule_button">1:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">2:00</button>
            <button className="schedule_button">2:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button schedule_button___open">
              <div>3:00</div>
            </button>
            <button className="schedule_button schedule_button___open">
              <div>3:30</div>
            </button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button schedule_button___open">
              <div>4:00</div>
            </button>
            <button className="schedule_button schedule_button___open">
              <div>4:30</div>
            </button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">5:00</button>
            <button className="schedule_button">5:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">6:00</button>
            <button className="schedule_button">6:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">7:00</button>
            <button className="schedule_button">7:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">8:00</button>
            <button className="schedule_button">8:30</button>
          </div>
        </div>
      </div>
      <div className="schedule schedule___tennis">
        <h3 className="schedule_header">
          <div className="schedule_icon">
            <img src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/tennis.svg?v=1714921535054" />
          </div>
          <div>Tennis</div>
        </h3>
        <div className="schedule_content schedule_content___tennis">
          <div className="schedule_row">
            <button className="schedule_button schedule_button___private">
              <div>8:00</div>
            </button>
            <button className="schedule_button schedule_button___private">
              <div>8:30</div>
            </button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button schedule_button___private">
              <div>9:00</div>
            </button>
            <button className="schedule_button schedule_button___private">
              <div>9:30</div>
            </button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">10:00</button>
            <button className="schedule_button">10:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">11:00</button>
            <button className="schedule_button">11:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">12:00</button>
            <button className="schedule_button">12:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">1:00</button>
            <button className="schedule_button">1:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button schedule_button___open">
              <div>2:00</div>
            </button>
            <button className="schedule_button schedule_button___open">
              <div>2:30</div>
            </button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">3:00</button>
            <button className="schedule_button">3:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">4:00</button>
            <button className="schedule_button">4:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">5:00</button>
            <button className="schedule_button">5:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">6:00</button>
            <button className="schedule_button">6:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">7:00</button>
            <button className="schedule_button">7:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">8:00</button>
            <button className="schedule_button">8:30</button>
          </div>
        </div>
      </div>
      <div className="schedule schedule___basketball">
        <h3 className="schedule_header">
          <div className="schedule_icon">
            <img src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/basketball.svg?v=1714921534845" />
          </div>
          <div>Basketball</div>
        </h3>
        <div className="schedule_content schedule_content___basketball">
          <div className="schedule_row">
            <button className="schedule_button">8:00</button>
            <button className="schedule_button">8:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">9:00</button>
            <button className="schedule_button">9:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">10:00</button>
            <button className="schedule_button">10:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">11:00</button>
            <button className="schedule_button">11:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">12:00</button>
            <button className="schedule_button">12:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">1:00</button>
            <button className="schedule_button">1:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">2:00</button>
            <button className="schedule_button">2:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">3:00</button>
            <button className="schedule_button">3:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">4:00</button>
            <button className="schedule_button">4:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">5:00</button>
            <button className="schedule_button">5:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">6:00</button>
            <button className="schedule_button">6:30</button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button schedule_button___private">
              <div>7:00</div>
            </button>
            <button className="schedule_button schedule_button___private">
              <div>7:30</div>
            </button>
          </div>
          <div className="schedule_row">
            <button className="schedule_button">8:00</button>
            <button className="schedule_button">8:30</button>
          </div>
        </div>
      </div>
    </main>
  ) : (
    <ol>
      {reservations
        .sort((a, b) => (a.start.valueOf() > b.start.valueOf() ? 1 : -1))
        .map((rez) => (
          <li key={rez.id}>
            {isLoggedIn ? (
              <NavLink
                className={({ isActive }) =>
                  `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                }
                to={"/reservations/" + rez.id}
              >
                {courtEmoji(rez.court)}&nbsp;
                {format(rez.start, "h:mm bbb")}
                &nbsp;-&nbsp;
                {format(rez.end, "h:mm bbb")}
                &nbsp;
                {rez.openPlay ? "🌍" : ""}
              </NavLink>
            ) : (
              <p className="p-2">
                {courtEmoji(rez.court)}&nbsp;
                {format(rez.start, "h:mm bbb")}
                &nbsp;-&nbsp;
                {format(rez.end, "h:mm bbb")}
              </p>
            )}
          </li>
        ))}
    </ol>
  );
};

export const ReservationList = ({
  reservations,
  user,
}: {
  reservations: Rez[];
  user?: User;
}) => {
  const availableDays = [...Array(7).keys()].map((num) => {
    const date = addDays(startOfToday(), num);
    return {
      date,
      existingReservations: reservations.filter((r) =>
        isEqual(startOfDay(r.start), date),
      ),
    };
  });

  return availableDays.map(({ date, existingReservations }) => (
    <React.Fragment key={date.toISOString()}>
      <nav className="nav">
        <div className="nav_content">
          <a href="" className="nav_link">
            {dateToHeader(date)}&nbsp;
          </a>
        </div>
      </nav>
      <>
        {user ? (
          <Link
            to={`/reservations/new?day=${date.toISOString().slice(0, 10)}`}
            className="text-blue-500"
          >
            +
          </Link>
        ) : null}
      </>
      <DayList reservations={existingReservations} isLoggedIn={!!user} />
    </React.Fragment>
  ));
};
