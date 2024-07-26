import { Form, Link, useFetcher } from "@remix-run/react";
import { ChangeEventHandler } from "react";

import type { User } from "~/models/user.server";
import { useOptionalUser } from "~/utils";

export function Header() {
  const user: User | undefined = useOptionalUser();
  const fetcher = useFetcher();

  const submit: ChangeEventHandler = (event) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = (event.target as any).form;
    fetcher.submit(form, { method: "POST" });
  };

  return (
    <header className="header">
      <div className="header_content">
        <div className="header_left">
          <Link to="/" className="h1">
            Court dibs
          </Link>
          <h2 className="h2">Call dibs on one of our sportsball courts</h2>
          <fetcher.Form method="post" action="/some/route">
            <div className="header_illustration">
              {user ? (
                <label className="checkbox_wrapper">
                  <div className="header_icon header_icon___pickleball">
                    <img alt="pball" src="/assets/pickleball-solid.svg" />
                  </div>
                  <input
                    className="checkbox_input"
                    id="hidePb"
                    name="hidePb"
                    type="checkbox"
                    defaultChecked={!user.courtViz?.hidePb}
                    onChange={submit}
                  />
                </label>
              ) : (
                <div className="header_icon header_icon___pickleball">
                  <img alt="pball" src="/assets/pickleball-solid.svg" />
                </div>
              )}

              {user ? (
                <label className="checkbox_wrapper">
                  <div className="header_icon header_icon___tennis">
                    <img
                      alt="tennis racquet"
                      src="/assets/tennis-ball-solid.svg"
                    />
                  </div>
                  <input
                    className="checkbox_input"
                    id="hide10s"
                    name="hide10s"
                    type="checkbox"
                    defaultChecked={!user.courtViz?.hide10s}
                    onChange={submit}
                  />
                </label>
              ) : (
                <div className="header_icon header_icon___tennis">
                  <img
                    alt="tennis racquet"
                    src="/assets/tennis-ball-solid.svg"
                  />
                </div>
              )}
              {user ? (
                <label className="checkbox_wrapper">
                  <div className="header_icon header_icon___basketball">
                    <img alt="bball" src="/assets/basketball-solid.svg" />
                  </div>
                  <input
                    className="checkbox_input"
                    id="hideBball"
                    name="hideBball"
                    type="checkbox"
                    defaultChecked={!user.courtViz?.hideBball}
                    onChange={submit}
                  />
                </label>
              ) : (
                <div className="header_icon header_icon___basketball">
                  <img alt="bball" src="/assets/basketball-solid.svg" />
                </div>
              )}
            </div>
          </fetcher.Form>
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
