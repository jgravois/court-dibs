import * as webauthnJson from "@github/webauthn-json";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import React from "react";
import { useFetcher } from "react-router-dom";
import stytch from "stytch";
import invariant from "tiny-invariant";

import { Header } from "~/components/Header/Header";
import { requireUser } from "~/session.server";

const DUPLICATE_ATTEMPT =
  "The user attempted to register an authenticator that contains one of the credentials already registered with the relying party.";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  invariant(process.env.STYTCH_PROJECT_ID, "STYTCH_PROJECT_ID must be set");
  invariant(process.env.STYTCH_SECRET, "STYTCH_SECRET must be set");

  const { stytchId } = await requireUser(request);

  const client = new stytch.Client({
    project_id: process.env.STYTCH_PROJECT_ID,
    secret: process.env.STYTCH_SECRET,
  });

  const resp = await client.webauthn.registerStart({
    user_id: stytchId,
    domain: "localhost",
  });

  return json({ publicKey: resp.public_key_credential_creation_options });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  invariant(process.env.STYTCH_PROJECT_ID, "STYTCH_PROJECT_ID must be set");
  invariant(process.env.STYTCH_SECRET, "STYTCH_SECRET must be set");

  const client = new stytch.Client({
    project_id: process.env.STYTCH_PROJECT_ID,
    secret: process.env.STYTCH_SECRET,
  });

  const { stytchId } = await requireUser(request);
  const formData = await request.formData();

  const params = {
    user_id: stytchId,
    public_key_credential: formData.get("credential") as string,
  };

  await client.webauthn.register(params);

  return redirect("/");
};

export const meta: MetaFunction = () => [{ title: "Passkey" }];

export default function Passkey() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [hasRun, setHasRun] = React.useState(false);

  React.useEffect(() => {
    const doIt = async () => {
      if (hasRun) return;

      try {
        const credential = await webauthnJson.create({
          publicKey: JSON.parse(data.publicKey),
        });
        const input: HTMLInputElement | null =
          document.querySelector("#credential");

        if (input) {
          input.value = JSON.stringify(credential);
        }

        const form = document.querySelector("#theform") as HTMLFormElement;
        fetcher.submit(form, { method: "POST" });
        setHasRun(true);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((e as any).message === DUPLICATE_ATTEMPT) {
          // etc.
        }
      }
    };
    doIt();
  });

  return (
    <>
      <Header />
      <main className="container">
        <p>Creating passkey...</p>
        <Form method="post" id="theform">
          <input
            type="text"
            id="credential"
            name="credential"
            defaultValue=""
          />
        </Form>
      </main>
    </>
  );
}
