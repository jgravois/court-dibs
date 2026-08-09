import * as webauthnJson from "@github/webauthn-json";
import { Loader } from "@googlemaps/js-api-loader";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import stytch from "stytch";
import invariant from "tiny-invariant";

import { Header } from "~/components/Header/Header";
import { createUser, getUserByEmail } from "~/models/user.server";
import { createUserSession } from "~/session.server";
import {
  THIRTY_DAYS_IN_MIN,
  STYTCH_BASE,
  validateCoordinates,
  validateEmail,
} from "~/utils";

const HALF = "AIzaSyBI_vhCo";
const OTHER_HALF = "hiRS0dvt5Yk7sAJ-978T_mUwd8";

const ADDRESS_REQUIRED = "Street address is required";

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

export const action = async ({ request }: ActionFunctionArgs) => {
  invariant(process.env.STYTCH_PROJECT_ID, "STYTCH_PROJECT_ID must be set");
  invariant(process.env.STYTCH_SECRET, "STYTCH_SECRET must be set");

  const url = new URL(request.url);
  const domain = url.hostname; // e.g., "example.com" (with port stripped)

  const formData = await request.formData();
  const email = formData.get("email");
  const address = formData.get("street-address");
  const rawCoordinates = formData.get("coordinates") as string;
  const magic = formData.get("magic");
  const credential = formData.get("credential") as string;

  const client = new stytch.Client({
    project_id: process.env.STYTCH_PROJECT_ID,
    secret: process.env.STYTCH_SECRET,
  });

  if (!validateEmail(email)) {
    return json(
      {
        userExists: false,
        opts: null,
        errors: { email: "Email is invalid", password: null, address: null },
      },
      { status: 400 },
    );
  }

  // for existing users, we call stytch
  // if new user and no coordinates, error that they are required
  // if new user and coordinates, verify first
  // if valid, call stytch, create user in DB and redirect to same generic landing page
  const user = await getUserByEmail(email);

  if (user) {
    if (magic === "on") {
      await callStytch(email);
      return redirect("/magic");
    }

    if (credential !== "") {
      const params = {
        public_key_credential: formData.get("credential") as string,
        session_duration_minutes: THIRTY_DAYS_IN_MIN,
      };

      const response = await client.webauthn.authenticate(params);

      if (response.status_code === 200 && response.user_id) {
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

    try {
      const resp = await client.webauthn.authenticateStart({
        user_id: user.stytchId,
        domain,
      });

      return json(
        {
          userExists: true,
          opts: resp.public_key_credential_request_options,
          errors: { address: null, email: null },
        },
        { status: 200 },
      );
    } catch (error) {
      // user hasn't created a passkey for this domain yet
      return json(
        {
          userExists: true,
          opts: null,
          errors: { address: null, email: null },
        },
        { status: 200 },
      );
    }
  }

  if (
    typeof address !== "string" ||
    address.length === 0 ||
    typeof rawCoordinates !== "string" ||
    rawCoordinates.length === 0
  ) {
    return json(
      {
        userExists: false,
        opts: null,
        errors: {
          email: null,
          password: null,
          address: ADDRESS_REQUIRED,
        },
      },
      { status: 200 },
    );
  }

  const coordinates = rawCoordinates?.split(",") as unknown as [number, number];
  if (!validateCoordinates(coordinates)) {
    return json(
      {
        userExists: false,
        opts: null,
        errors: {
          email: null,
          password: null,
          address: "Sign up is only available to HOA residents",
        },
      },
      { status: 400 },
    );
  }

  const response = await callStytch(email);
  if (response.user_id) {
    await createUser({ email, stytchId: response.user_id, address });
  }

  return redirect("/magic");
};

export const meta: MetaFunction = () => [{ title: "Court dibs - login" }];

export default function Start() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const coordinatesRef = useRef<HTMLInputElement>(null);
  const magicRef = useRef<HTMLInputElement>(null);
  const credentialRef = useRef<HTMLInputElement>(null);
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [showAddress, setShowAddress] = useState(false);

  const options = { fields: ["geometry"] };

  useEffect(() => {
    if (!showAddress && actionData?.errors.address === ADDRESS_REQUIRED) {
      setShowAddress(true);
    }
  }, [actionData?.errors.address, showAddress, setShowAddress]);

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
                  autoComplete="email"
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
            {showAddress ? (
              <div>
                <label htmlFor="street-address" className="signUp_label">
                  Street Address
                </label>
                <div className="mt-1">
                  <input
                    id="street-address"
                    ref={addressRef}
                    name="street-address"
                    type="text"
                    autoComplete="off"
                    required
                    aria-invalid={
                      actionData?.errors?.address ? true : undefined
                    }
                    aria-describedby="street-address-error"
                    className="signUp_input"
                  />
                  {actionData?.errors?.address &&
                  actionData?.errors?.address !== ADDRESS_REQUIRED ? (
                    <div className="pt-1 text-red-700" id="password-error">
                      {actionData.errors.address}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
            <input
              type="text"
              name="coordinates"
              ref={coordinatesRef}
              style={{ display: "none" }}
            />
            <input type="checkbox" name="magic" ref={magicRef} hidden />
            <input
              type="text"
              autoComplete="none"
              name="credential"
              ref={credentialRef}
              hidden
            />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            {!actionData?.userExists && (
              <button type="submit" className="signUp_button">
                Continue
              </button>
            )}
          </Form>
          {actionData?.userExists && (
            <div style={{ display: "flex", gap: "20px" }}>
              <button
                className="signUp_button"
                onClick={() => {
                  if (magicRef.current) magicRef.current.checked = true;
                  const form = document.querySelector(
                    "#theform",
                  ) as HTMLFormElement;
                  form.submit();
                }}
              >
                Email me a magic link
              </button>
              <button
                className="signUp_button"
                onClick={async () => {
                  const credential = await webauthnJson.get({
                    publicKey: JSON.parse(actionData.opts ?? ""),
                  });

                  if (credentialRef.current) {
                    credentialRef.current.value = JSON.stringify(credential);
                  }

                  const form = document.querySelector(
                    "#theform",
                  ) as HTMLFormElement;
                  form.submit();
                }}
              >
                I&rsquo;ll use a passkey 🫆
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
