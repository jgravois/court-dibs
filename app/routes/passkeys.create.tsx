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

  const url = new URL(request.url);
  const domain = url.hostname; // e.g., "example.com" (with port stripped)

  const { stytchId } = await requireUser(request);

  const client = new stytch.Client({
    project_id: process.env.STYTCH_PROJECT_ID,
    secret: process.env.STYTCH_SECRET,
  });

  const response = await client.webauthn.registerStart({
    user_id: stytchId,
    domain,
  });

  return json({ publicKey: response.public_key_credential_creation_options });
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
  const credentialRef = React.useRef<HTMLInputElement>(null);
  const [duplicateFailure, setDuplicateFailure] = React.useState(false);

  const createCredential = async () => {
    try {
      const credential = await webauthnJson.create({
        publicKey: JSON.parse(data.publicKey),
      });
      credentialRef.current!.value = JSON.stringify(credential);

      const form = document.querySelector("#theform") as HTMLFormElement;
      fetcher.submit(form, { method: "POST" });
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((e as any).message === DUPLICATE_ATTEMPT) {
        setDuplicateFailure(true);
      }
    }
  };

  const msg = duplicateFailure ? (
    <p>A passkey 🫆 has already been created.</p>
  ) : (
    <p>
      Passkeys 🫆 allow you to sign in from a recognized device without having a
      temporary code delivered to your email inbox.
    </p>
  );

  return (
    <>
      <Header />
      <main className="container">
        {msg}
        <Form method="post" id="theform">
          <input
            ref={credentialRef}
            type="text"
            id="credential"
            name="credential"
            hidden
          />
        </Form>
        {duplicateFailure ? null : (
          <>
            <button className="signUp_button" onClick={createCredential}>
              Create passkey 🫆
            </button>
            &nbsp;<a href="/">Cancel</a>
          </>
        )}
      </main>
    </>
  );
}
