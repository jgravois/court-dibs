import { Loader } from "@googlemaps/js-api-loader";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

import { createUser, getUserByEmail } from "~/models/user.server";
import { STYTCH_URL_BASE, validateCoordinates, validateEmail } from "~/utils";

import { Header } from "./Header";

const HALF = "AIzaSyBI_vhCo";
const OTHER_HALF = "hiRS0dvt5Yk7sAJ-978T_mUwd8";

const ADDRESS_REQUIRED = "Street address is required";

const callStytch = async (email: string, baseUrl: string) => {
  const rawResponse = await fetch(STYTCH_URL_BASE + "/email/login_or_create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(
        `${process.env.STYTCH_PROJECT_ID}:${process.env.STYTCH_SECRET}`,
      )}`,
    },

    body: JSON.stringify({
      email,
      login_magic_link_url: baseUrl + "/authenticate",
    }),
  });
  return rawResponse.json();
};

export const action = async ({ request }: ActionFunctionArgs) => {
  invariant(process.env.STYTCH_PROJECT_ID, "STYTCH_PROJECT_ID must be set");
  invariant(process.env.STYTCH_SECRET, "STYTCH_SECRET must be set");

  const formData = await request.formData();
  const email = formData.get("email");
  const rawCoordinates = formData.get("coordinates") as string;
  const baseUrl = formData.get("baseUrl") as string;

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null, address: null } },
      { status: 400 },
    );
  }

  // for existing users, we call stytch
  // (TODO: redirect to generic landing page instead of signing them in
  // if new user and no coordinates, error that they are required
  // if new user and coordinates, verify first
  // if valid, call stytch, create user in DB and redirect to same generic landing page
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    await callStytch(email, baseUrl);
    return redirect("/magic");
  }

  if (typeof rawCoordinates !== "string" || rawCoordinates.length === 0) {
    return json(
      {
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
        errors: {
          email: null,
          password: null,
          address: "Sign up is only available to HOA residents",
        },
      },
      { status: 400 },
    );
  }

  const response = await callStytch(email, baseUrl);
  if (response.user_id) await createUser(email, response.user_id);

  return redirect("/magic");
};

export const meta: MetaFunction = () => [{ title: "Sign up or login" }];

export default function Start() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const coordinatesRef = useRef<HTMLInputElement>(null);
  const baseUrlRef = useRef<HTMLInputElement>(null);
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
      <Header hideLoginLinks />
      <div className="container">
        <div className="signUp_form">
          <p>Sign up or log in to your account, no password needed!</p>
          <Form method="post">
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
            <input
              type="text"
              name="baseUrl"
              ref={baseUrlRef}
              value={window.location.origin}
              style={{ display: "none" }}
            />
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
