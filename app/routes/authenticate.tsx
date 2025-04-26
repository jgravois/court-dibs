import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

import { getUserByStytchId } from "~/models/user.server";
import { createUserSession } from "~/session.server";
import { STYTCH_BASE, THIRTY_DAYS_IN_MIN } from "~/utils";

export const meta: MetaFunction = () => [{ title: "Authenticate" }];

// pull the token out of url params, authenticate with stytch
// and instantiate a user session if we get back a valid session_token

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  const token = params.get("token");

  if (token) {
    const raw = await fetch(STYTCH_BASE + "/magic_links/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(
          `${process.env.STYTCH_PROJECT_ID}:${process.env.STYTCH_SECRET}`,
        )}`,
      },

      // valid range is 5 minutes to 527040 minutes
      body: JSON.stringify({
        token,
        session_duration_minutes: THIRTY_DAYS_IN_MIN,
      }),
    });

    const res = await raw.json();

    const { user_id, session_token } = res;

    if (user_id && session_token) {
      const user = await getUserByStytchId(res.user_id);

      if (user) {
        return createUserSession({
          redirectTo: "/",
          remember: true,
          request,
          userId: user.id,
          token: res.session_token,
          lastValidated: new Date().valueOf(),
        });
      }
    }
  }

  return json({ message: "something went very wrong" }, { status: 400 });
};

export default function Authenticate() {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8"></div>
    </div>
  );
}
