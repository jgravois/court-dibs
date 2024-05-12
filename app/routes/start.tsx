import { Loader } from "@googlemaps/js-api-loader";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, Form, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";

import { createUser, getUserByEmail } from "~/models/user.server";
import { validateCoordinates, validateEmail } from "~/utils";

const HALF = "AIzaSyBI_vhCo";
const OTHER_HALF = "hiRS0dvt5Yk7sAJ-978T_mUwd8";

export const action = async ({ request }: ActionFunctionArgs) => {
  invariant(process.env.STYTCH_PROJECT_ID, "STYTCH_PROJECT_ID must be set");
  invariant(process.env.STYTCH_SECRET, "STYTCH_SECRET must be set");

  const formData = await request.formData();
  const email = formData.get("email");
  const rawCoordinates = formData.get("coordinates") as string;

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

  if (!existingUser) {
    if (typeof rawCoordinates !== "string" || rawCoordinates.length === 0) {
      return json(
        {
          errors: {
            email: null,
            password: null,
            address: "Street address is required",
          },
        },
        { status: 400 },
      );
    }

    const coordinates = rawCoordinates?.split(",") as unknown as [
      number,
      number,
    ];
    if (!validateCoordinates(coordinates)) {
      return json(
        {
          errors: {
            email: null,
            password: null,
            address: "signup is only available to HOA residents",
          },
        },
        { status: 400 },
      );
    }
  }

  const raw = await fetch(
    "https://test.stytch.com/v1/magic_links/email/login_or_create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(
          `${process.env.STYTCH_PROJECT_ID}:${process.env.STYTCH_SECRET}`,
        )}`,
      },

      body: JSON.stringify({
        email,
        login_magic_link_url: "http://localhost:3000/authenticate",
      }),
    },
  );

  const res = await raw.json();

  if (res.user_id && !existingUser) {
    await createUser(email, res.user_id);
  }

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autoCompleteRef = useRef<any>(null);

  useEffect(() => {
    if (actionData?.errors?.address) {
      addressRef.current?.focus();
    }
  }, [actionData]);

  const options = { fields: ["geometry"] };

  useEffect(() => {
    const loader = new Loader({
      apiKey: HALF + OTHER_HALF,
      version: "weekly",
    });

    loader.load().then(async (goo) => {
      const { Autocomplete } = await goo.maps.importLibrary("places");
      autoCompleteRef.current = new Autocomplete(addressRef.current, options);

      autoCompleteRef.current?.addListener("place_changed", async function () {
        if (autoCompleteRef.current && coordinatesRef.current) {
          const { geometry } = await autoCompleteRef.current.getPlace();
          coordinatesRef.current.value = `${geometry.location.lng()},${geometry.location.lat()}`;
        }
      });
    });

    return () => {
      autoCompleteRef.current = null;
    };
  });

  const showAddress = actionData?.errors.address;

  return (
    <>
      <header className="header">
        <div className="header_content">
          <div className="header_left">
            <Link to="/" className="h1">
              Court dibs
            </Link>
            <h2 className="h2">Call dibs on one of our sportsball courts</h2>
            <div className="header_illustration">
              <div className="header_icon header_icon___pickleball">
                <img src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/pickleball-solid.svg?v=1714837585684" />
              </div>
              <div className="header_icon header_icon___tennis">
                <img src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/tennis-ball-solid.svg?v=1714837585529" />
              </div>
              <div className="header_icon header_icon___basketball">
                <img src="https://cdn.glitch.global/5f00a93b-ae9c-4d9a-b9cf-472487408ff8/basketball-solid.svg?v=1714837585367" />
              </div>
            </div>
          </div>
          <div className="header_right"></div>
        </div>
      </header>
      <div className="signUp">
        <div className="signUp_form">
          <p className="signUp_insutructions">
            Sign up or sign in to your account, no password needed!
          </p>
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
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus={true}
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
                    aria-invalid={
                      actionData?.errors?.address ? true : undefined
                    }
                    aria-describedby="street-address-error"
                    className="signUp_input"
                  />
                  {actionData?.errors?.address ? (
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
