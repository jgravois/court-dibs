import type { MetaFunction } from "@remix-run/node";

import { HeaderLeft } from "./HeaderLeft";

export const meta: MetaFunction = () => [{ title: "Magic" }];

export default function Magic() {
  return (
    <>
      <header className="header">
        <div className="header_content">
          <HeaderLeft />
          <div className="header_right"></div>
        </div>
      </header>
      <main className="magicLink">
        <p className="magicLink_message">Check your inbox for a magic link.</p>
      </main>
    </>
  );
}
