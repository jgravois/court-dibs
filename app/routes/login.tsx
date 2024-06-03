import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import React from "react";
import invariant from "tiny-invariant";

import { getUserByEmail } from "~/models/user.server";
import { validateEmail } from "~/utils";

import { HeaderLeft } from "./HeaderLeft";

const NO_USER_FOUND = "No user found";

export const action = async ({ request }: ActionFunctionArgs) => {
  invariant(process.env.STYTCH_PROJECT_ID, "STYTCH_PROJECT_ID must be set");
  invariant(process.env.STYTCH_SECRET, "STYTCH_SECRET must be set");

  const formData = await request.formData();
  const email = formData.get("email");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null, address: null } },
      { status: 400 },
    );
  }

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return json(
      { errors: { email: NO_USER_FOUND, password: null } },
      { status: 400 },
    );
  }

  await fetch("https://test.stytch.com/v1/magic_links/email/login_or_create", {
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
  });

  return redirect("/magic");
};

export const meta: MetaFunction = () => [{ title: "Log in" }];

export default function Start() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <header className="header">
        <div className="header_content">
          <HeaderLeft />
          <div className="header_right"></div>
        </div>
      </header>
      <div className="signUp">
        <div className="signUp_form">
          <p>Log in to your account, no password needed!</p>
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
                {actionData?.errors?.email === NO_USER_FOUND ? (
                  <div className="pt-1" id="email-error">
                    No account found. Would you like to&nbsp;
                    <Link className="tradLink" to="/signup">
                      sign up
                    </Link>
                    ?
                  </div>
                ) : actionData?.errors?.email ? (
                  <div className="pt-1 text-red-700" id="email-error">
                    {actionData.errors.email}
                  </div>
                ) : null}
              </div>
            </div>
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
