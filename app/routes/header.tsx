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
              <img alt="pball" src="/assets/pickleball-solid.svg" />
            </div>
            <div className="header_icon header_icon___tennis">
              <img alt="tennis racquet" src="/assets/tennis-ball-solid.svg" />
            </div>
            <div className="header_icon header_icon___basketball">
              <img alt="bball" src="/assets/basketball-solid.svg" />
            </div>
          </div>
          <Link to="/faq" className="h2" style={{ paddingTop: 10 }}>
            learn more
          </Link>
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
              Sign up or log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
