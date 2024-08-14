import { Form, Link } from "@remix-run/react";

import type { User } from "~/models/user.server";
import { useOptionalUser } from "~/utils";

import { InteractiveCourtIcons } from "./InteractiveCourtIcons";
import { StaticCourtIcons } from "./StaticCourtIcons";

export const Header = ({ exposePrefs = false }: { exposePrefs?: boolean }) => {
  const user: User | undefined = useOptionalUser();
  return (
    <header className="header">
      <div className="header_content">
        <div className="header_left">
          <Link to="/" className="h1">
            Court dibs
          </Link>
          <h2 className="h2">Call dibs on one of our sportsball courts</h2>
          {exposePrefs && user ? (
            <InteractiveCourtIcons user={user} />
          ) : (
            <StaticCourtIcons />
          )}
        </div>
        <div className="header_right">
          <div className="header_rightGroup">
            <Link className="header_link___learnMore" to="/faq">
              Learn more
            </Link>
            {user ? (
              <Form action="/logout" method="post">
                <button
                  type="submit"
                  className="header_link header_link___button"
                >
                  Log out
                </button>
              </Form>
            ) : (
              <Link to="/start" className="header_link header_link___button">
                Sign up or log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
