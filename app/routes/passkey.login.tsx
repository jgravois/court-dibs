import * as webauthnJson from "@github/webauthn-json";
import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import React from "react";
import { ActionFunctionArgs } from "react-router";
import { useFetcher } from "react-router-dom";
import stytch from "stytch";
import invariant from "tiny-invariant";

import { Header } from "~/components/Header";
import { getUserByStytchId } from "~/models/user.server";
import { createUserSession } from "~/session.server";
import { THIRTY_DAYS_IN_MIN } from "~/utils";

export const loader = async () => {
  invariant(process.env.STYTCH_PROJECT_ID, "STYTCH_PROJECT_ID must be set");
  invariant(process.env.STYTCH_SECRET, "STYTCH_SECRET must be set");

  const client = new stytch.Client({
    project_id: process.env.STYTCH_PROJECT_ID,
    secret: process.env.STYTCH_SECRET,
  });

  const stytchId = "user-test-...";

  const resp = await client.webauthn.authenticateStart({
    user_id: stytchId,
    domain: "localhost",
  });

  return json({
    opts: resp.public_key_credential_request_options,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  invariant(process.env.STYTCH_PROJECT_ID, "STYTCH_PROJECT_ID must be set");
  invariant(process.env.STYTCH_SECRET, "STYTCH_SECRET must be set");

  const client = new stytch.Client({
    project_id: process.env.STYTCH_PROJECT_ID,
    secret: process.env.STYTCH_SECRET,
  });

  const formData = await request.formData();

  const params = {
    public_key_credential: formData.get("credential") as string,
    session_duration_minutes: THIRTY_DAYS_IN_MIN,
  };

  const response = await client.webauthn.authenticate(params);

  if (response.status_code === 200 && response.user_id) {
    const user = await getUserByStytchId(response.user_id);

    if (user) {
      return createUserSession({
        redirectTo: "/",
        remember: true,
        request,
        userId: user.id,
        token: response.session_token,
        lastValidated: new Date().valueOf(),
      });
    }
  }

  return json({ message: "something went very wrong" }, { status: 400 });
};

export const meta: MetaFunction = () => [{ title: "Passkey login" }];

export default function PasskeyLogin() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [hasRun, setHasRun] = React.useState(false);

  React.useEffect(() => {
    const doIt = async () => {
      if (hasRun) return;
      console.log("running");
      const credential = await webauthnJson.get({
        publicKey: JSON.parse(data.opts),
      });

      const input: HTMLInputElement | null =
        document.querySelector("#credential");

      if (input) {
        input.value = JSON.stringify(credential);
      }

      const form = document.querySelector("#theform") as HTMLFormElement;
      fetcher.submit(form, { method: "POST" });
      setHasRun(true);
    };
    doIt();
  });

  return (
    <>
      <Header />
      <main className="container">
        <p>Logging in with passkey...</p>
        <Form method="post" id="theform">
          <input
            type="text"
            name="credential"
            id="credential"
            defaultValue=""
          />
          <button type="submit"></button>
        </Form>
      </main>
    </>
  );
}
