import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => [{ title: "Magic" }];

export default function Magic() {
  return (
    <>
      <header className="header">
        <div className="header_content">
          <div className="header_left">
            <Link to="/" className="h1">
              Court dibs
            </Link>
            <h2 className="h2">Call dibs on one of our sportsball courts</h2>
            <div className="header_illustration">
              <div className="header_icon header_icon___pickleball">
                <img src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/pickleball-solid.svg?v=1714837585684" />
              </div>
              <div className="header_icon header_icon___tennis">
                <img src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/tennis-ball-solid.svg?v=1714837585529" />
              </div>
              <div className="header_icon header_icon___basketball">
                <img src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/basketball-solid.svg?v=1714837585367" />
              </div>
            </div>
          </div>
          <div className="header_right"></div>
        </div>
      </header>
      <main className="magicLink">
        <p className="magicLink_message">Check your inbox for a magic link.</p>
      </main>
    </>
  );
}
