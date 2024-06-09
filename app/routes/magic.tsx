import type { MetaFunction } from "@remix-run/node";

import { Header } from "./Header";

export const meta: MetaFunction = () => [{ title: "Magic" }];

export default function Magic() {
  return (
    <>
      <Header hideLoginLinks />
      <main className="magicLink">
        <p className="magicLink_message">Check your inbox for a magic link.</p>
      </main>
    </>
  );
}
