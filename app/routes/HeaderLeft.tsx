import { Link } from "@remix-run/react";

export const HeaderLeft = () => (
  <div className="header_left">
    <Link to="/" className="h1">
      Court dibs
    </Link>
    <h2 className="h2">Call dibs on one of our sportsball courts</h2>
    <div className="header_illustration">
      <div className="header_icon header_icon___pickleball">
        <img
          alt="pball"
          src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/pickleball-solid.svg?v=1714837585684"
        />
      </div>
      <div className="header_icon header_icon___tennis">
        <img
          alt="tennis racquet"
          src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/tennis-ball-solid.svg?v=1714837585529"
        />
      </div>
      <div className="header_icon header_icon___basketball">
        <img
          alt="bball"
          src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/basketball-solid.svg?v=1714837585367"
        />
      </div>
    </div>
  </div>
);
