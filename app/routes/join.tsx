import { Loader } from "@googlemaps/js-api-loader";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { createUser, getUserByEmail } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateCoordinates, validateEmail } from "~/utils";

const HALF = "AIzaSyBI_vhCo";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

const OTHER_HALF = "hiRS0dvt5Yk7sAJ-978T_mUwd8";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const rawCoordinates = formData.get("coordinates");

  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null, address: null } },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      {
        errors: {
          email: null,
          password: "Password is required",
          address: null,
        },
      },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return json(
      {
        errors: {
          email: null,
          password: "Password is too short",
          address: null,
        },
      },
      { status: 400 },
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      {
        errors: {
          email: "A user already exists with this email",
          password: null,
          address: null,
        },
      },
      { status: 400 },
    );
  }

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

  const coordinates = rawCoordinates?.split(",") as unknown as [number, number];
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

  const user = await createUser(email, password);

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user.id,
  });
};

export const meta: MetaFunction = () => [{ title: "Sign Up" }];

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const coordinatesRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autoCompleteRef = useRef<any>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
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

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                required
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.email ? (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.password ? (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="street-address"
              className="block text-sm font-medium text-gray-700"
            >
              Street Address
            </label>
            <div className="mt-1">
              <input
                id="street-address"
                ref={addressRef}
                name="street-address"
                type="text"
                autoComplete="off"
                aria-invalid={actionData?.errors?.address ? true : undefined}
                aria-describedby="street-address-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.address ? (
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
          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Create Account
          </button>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
