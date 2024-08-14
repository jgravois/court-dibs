import { useFetcher } from "@remix-run/react";
import { ChangeEventHandler } from "react";

import type { User } from "~/models/user.server";

export const InteractiveCourtIcons = ({ user }: { user: User }) => {
  const fetcher = useFetcher();

  const submit: ChangeEventHandler = (event) => {
    const form = (event.target as HTMLFormElement).form;
    fetcher.submit(form, { method: "POST" });
  };

  return (
    <fetcher.Form method="post" action="/some/route">
      <div className="header_illustration">
        <label className="checkbox_wrapper">
          <input
            className="checkbox_input"
            id="hidePb"
            name="hidePb"
            type="checkbox"
            defaultChecked={!user.courtViz?.hidePb}
            onChange={submit}
          />
          <div className="header_checkmark">
            <img alt="check" src="/assets/check-solid.svg" />
          </div>
          <div className="header_icon header_icon___check header_icon___pickleball">
            <img alt="pball" src="/assets/pickleball-solid.svg" />
          </div>
        </label>
        <label className="checkbox_wrapper">
          <input
            className="checkbox_input"
            id="hide10s"
            name="hide10s"
            type="checkbox"
            defaultChecked={!user.courtViz?.hide10s}
            onChange={submit}
          />
          <div className="header_checkmark">
            <img alt="check" src="/assets/check-solid.svg" />
          </div>
          <div className="header_icon header_icon___check header_icon___tennis">
            <img alt="tennis racquet" src="/assets/tennis-ball-solid.svg" />
          </div>
        </label>
        <label className="checkbox_wrapper">
          <input
            className="checkbox_input"
            id="hideBball"
            name="hideBball"
            type="checkbox"
            defaultChecked={!user.courtViz?.hideBball}
            onChange={submit}
          />
          <div className="header_checkmark">
            <img alt="check" src="/assets/check-solid.svg" />
          </div>
          <div className="header_icon header_icon___check header_icon___basketball">
            <img alt="bball" src="/assets/basketball-solid.svg" />
          </div>
        </label>
      </div>
    </fetcher.Form>
  );
};
