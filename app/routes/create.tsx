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
import invariant from "tiny-invariant";

import { Header } from "~/components/Header/Header";
import { createUser } from "~/models/user.server";
import {
  stytchLoginOrCreate,
  validateCoordinates,
  validateEmail,
} from "~/utils";

const HALF = "AIzaSyBI_vhCo";
const OTHER_HALF = "hiRS0dvt5Yk7sAJ-978T_mUwd8";

const ADDRESS_REQUIRED = "Street address is required";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email") || "";

  return json({ email });
}

export const action = async ({ request }: ActionFunctionArgs) => {
  invariant(process.env.STYTCH_PROJECT_ID, "STYTCH_PROJECT_ID must be set");
  invariant(process.env.STYTCH_SECRET, "STYTCH_SECRET must be set");

  const formData = await request.formData();
  const email = formData.get("email");
  const address = formData.get("street-address");
  const rawCoordinates = formData.get("coordinates") as string;

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

  // if new user and no coordinates, error that they are required
  // if new user and coordinates, verify first
  // if valid, call stytch, create user in DB and redirect to same generic landing page
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

  const response = await stytchLoginOrCreate(email);
  if (response.user_id) {
    await createUser({ email, stytchId: response.user_id, address });
  }

  return redirect("/magic");
};

export const meta: MetaFunction = () => [
  { title: "Court dibs - create account" },
];

export default function Create() {
  const { email } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const coordinatesRef = useRef<HTMLInputElement>(null);
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const options = { fields: ["geometry"] };

  useEffect(() => {
    emailRef.current!.value = email;
  }, [email]);

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
          <p>Create an account</p>
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
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  autoComplete="off"
                  required
                  aria-invalid={actionData?.errors?.address ? true : undefined}
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
