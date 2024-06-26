import type { User } from "@prisma/client";
import { Form, Link } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

export function Header() {
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
        </div>
        <div className="header_right">
          <div className="header_rightGroup">
            {user ? (
              <Form action="/logout" method="post">
                <button type="submit" className="header_user">
                  {user.email}
                </button>
              </Form>
            ) : (
              <Link to="/start" className="header_link header_link___button">
                Sign up or log in
              </Link>
            )}
            <Link className="header_link___learnMore" to="/faq">
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
