import type { MetaFunction } from "@remix-run/node";

import { Header } from "~/components/Header/Header";

export const meta: MetaFunction = () => [{ title: "Magic" }];

export default function Magic() {
  return (
    <>
      <Header />
      <main className="container">
        <p className="magicLink_message">
          Check your inbox for a magic link to finish signing in
        </p>
      </main>
    </>
  );
}
