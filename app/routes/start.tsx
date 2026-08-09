import * as webauthnJson from "@github/webauthn-json";
import { Loader } from "@googlemaps/js-api-loader";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import stytch from "stytch";
import invariant from "tiny-invariant";

import { Header } from "~/components/Header/Header";
import { getUserByEmail, getUserByStytchId } from "~/models/user.server";
import { createUserSession } from "~/session.server";
import { THIRTY_DAYS_IN_MIN, STYTCH_BASE, validateEmail } from "~/utils";

const HALF = "AIzaSyBI_vhCo";
const OTHER_HALF = "hiRS0dvt5Yk7sAJ-978T_mUwd8";

// Decode a base64url challenge string into a Uint8Array
function bufferDecode(value: string) {
  let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  base64 = base64.padEnd(base64.length + padLength, "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer; // Returns an ArrayBuffer
}

const callStytch = async (email: string) => {
  const rawResponse = await fetch(
    STYTCH_BASE + "/magic_links/email/login_or_create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(
          `${process.env.STYTCH_PROJECT_ID}:${process.env.STYTCH_SECRET}`,
        )}`,
      },

      body: JSON.stringify({ email }),
    },
  );
  return rawResponse.json();
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  invariant(process.env.STYTCH_PROJECT_ID, "STYTCH_PROJECT_ID must be set");
  invariant(process.env.STYTCH_SECRET, "STYTCH_SECRET must be set");

  const url = new URL(request.url);
  const domain = url.hostname; // e.g., "example.com" (with port stripped)

  const client = new stytch.Client({
    project_id: process.env.STYTCH_PROJECT_ID,
    secret: process.env.STYTCH_SECRET,
  });

  const response = await client.webauthn.authenticateStart({
    domain,
    use_base64_url_encoding: true,
  });
  return json(response);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  invariant(process.env.STYTCH_PROJECT_ID, "STYTCH_PROJECT_ID must be set");
  invariant(process.env.STYTCH_SECRET, "STYTCH_SECRET must be set");

  const formData = await request.formData();
  const email = formData.get("email");
  const credential = formData.get("credential") as string;

  const client = new stytch.Client({
    project_id: process.env.STYTCH_PROJECT_ID,
    secret: process.env.STYTCH_SECRET,
  });

  // authenticate with passkey first (if present)
  if (credential) {
    const params = {
      public_key_credential: formData.get("credential") as string,
      session_duration_minutes: THIRTY_DAYS_IN_MIN,
    };

    const response = await client.webauthn.authenticate(params);

    if (response.status_code === 200 && response.user.user_id) {
      const user = await getUserByStytchId(response.user.user_id);
      if (!user) return redirect("/create");

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

  if (!validateEmail(email)) {
    return json(
      {
        errors: { email: "Email is invalid", password: null, address: null },
      },
      { status: 400 },
    );
  }

  const user = await getUserByEmail(email);
  if (!user) return redirect("/create");

  // for existing users, we call stytch to send a magic link to their email
  await callStytch(email);
  return redirect("magic");
};

export const meta: MetaFunction = () => [{ title: "Court dibs - login" }];

export default function Start() {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const coordinatesRef = useRef<HTMLInputElement>(null);
  const magicRef = useRef<HTMLInputElement>(null);
  const credentialRef = useRef<HTMLInputElement>(null);
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const options = { fields: ["geometry"] };

  // TODO: figure out how to run this async function once, immediately on page load
  const autofillPasskey = async () => {
    // const supported = await isAutofillSupported();
    // if (!supported) return;

    if (!data.public_key_credential_request_options) return;

    const pkOpts = JSON.parse(data.public_key_credential_request_options);

    try {
      const credential = await webauthnJson.get({
        publicKey: {
          challenge: pkOpts.challenge,
          rpId: window.location.hostname,
          userVerification: "preferred",
          // CRITICAL: Do NOT include allowCredentials here.
          // Conditional UI relies entirely on "discoverable credentials".
        },
        mediation: "conditional", // This activates the form autofill integration
      });

      credentialRef.current!.value = JSON.stringify(credential);
      const form = document.querySelector("#theform") as HTMLFormElement;
      form.submit();
    } catch (error) {
      console.error("WebAuthn autofill failed or was aborted:", error);
    }
  };

  useEffect(() => {
    const loader = new Loader({
      apiKey: HALF + OTHER_HALF,
      version: "weekly",
    });

    loader.load().then(async (goo) => {
      const { Autocomplete } = (await goo.maps.importLibrary(
        "places",
      )) as google.maps.PlacesLibrary;

      if (addressRef.current) {
        autoCompleteRef.current = new Autocomplete(
          addressRef.current as HTMLInputElement,
          options,
        );

        autoCompleteRef.current?.addListener(
          "place_changed",
          async function () {
            if (autoCompleteRef.current && coordinatesRef.current) {
              const result = await autoCompleteRef.current.getPlace();
              coordinatesRef.current.value = `${result?.geometry?.location?.lng()},${result?.geometry?.location?.lat()}`;
            }
          },
        );
      }
    });

    return () => {
      autoCompleteRef.current = null;
    };
  });

  return (
    <>
      <Header />
      <div className="container">
        <div className="signUp_form">
          <p>Sign up or log in to your existing account</p>
          <Form method="post" id="theform">
            <div>
              <label htmlFor="email" className="signUp_label">
                Email address
              </label>
              <div>
                <input
                  ref={emailRef}
                  id="email"
                  required
                  name="email"
                  type="email"
                  autoComplete="email webauthn"
                  placeholder="me@website.com"
                  aria-invalid={actionData?.errors?.email ? true : undefined}
                  aria-describedby="email-error"
                  className="signUp_input"
                />
                {actionData?.errors?.email ? (
                  <div className="pt-1 text-red-700" id="email-error">
                    {actionData.errors.email}
                  </div>
                ) : null}
              </div>
            </div>
            <input type="checkbox" onChange={autofillPasskey} />
            <input type="checkbox" name="magic" ref={magicRef} hidden />
            <input type="text" name="credential" ref={credentialRef} hidden />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button type="submit" className="signUp_button">
              Continue
            </button>
          </Form>
        </div>
      </div>
    </>
  );
}
