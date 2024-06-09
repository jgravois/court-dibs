import type { User } from "@prisma/client";
import { Form, Link } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

export function Header({
  hideLoginLinks = false,
}: {
  hideLoginLinks?: boolean;
}) {
  const user: User | undefined = useOptionalUser();

  return (
    <header className="header">
      <div className="header_content">
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
        <div className="header_right">
          {hideLoginLinks ? null : user ? (
            <>
              <p className="header_user">{user.email}</p>
              <Form action="/logout" method="post">
                <button
                  type="submit"
                  className="header_link header_link___button"
                >
                  Sign out
                </button>
              </Form>
            </>
          ) : (
            <Link to="/start" className="header_link header_link___button">
              Sign up or sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
