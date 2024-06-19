import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

import { getUserByStytchId } from "~/models/user.server";
import { createUserSession, getSession } from "~/session.server";
import { STYTCH_URL_BASE } from "~/utils";

export const meta: MetaFunction = () => [{ title: "Authenticate" }];

// pull the token out of url params, authenticate with stytch
// and instantiate a user session if we get back a valid session_token

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request);

  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  const token = params.get("token");

  if (token) {
    const raw = await fetch(STYTCH_URL_BASE + "/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(
          `${process.env.STYTCH_PROJECT_ID}:${process.env.STYTCH_SECRET}`,
        )}`,
      },

      body: JSON.stringify({ token, session_duration_minutes: 15 }),
    });

    const res = await raw.json();

    const { user_id, session_token } = res;

    if (user_id && session_token) {
      session.set("stytch_session", res.session_token);

      const user = await getUserByStytchId(res.user_id);

      if (user) {
        // eyJ1c2VySWQiOiJjbHV4bzhqMWYwMDAwemt5c255Ym95c2xoIiwic3R5dGNoX3Nlc3Npb24iOiJRT19VR3dsZy12WVlIN0h5R2VoeGM5R1hURERaSHhJTV9sMi1qaFNnZjhkRSJ9.CK1ISzzzzckPqIUFSN4rU%2BtVbv8Vxm%2F0bmSYh6lHueE
        // userId:  cluxo8j1f0000zkysnyboyslh
        // stytchId:  user-test-1649fb03-ac43-4dbb-a7b4-6da4b9ea6c13
        // token:  QO_UGwlg-vYYH7HyGehxc9GXTDDZHxIM_l2-jhSgf8dE
        // QO_UGwlg-vYYH7HyGehxc9GXTDDZHxIM_l2-jhSgf8dE

        console.log("userId: ", user.id);
        console.log("stytchId: ", user_id);
        console.log("token: ", session_token);

        return createUserSession({
          redirectTo: "/",
          remember: false,
          request,
          userId: user.id,
          token: res.session_token,
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
