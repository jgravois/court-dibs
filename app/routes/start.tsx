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
import {
  stytchLoginOrCreate,
  THIRTY_DAYS_IN_MIN,
  validateEmail,
} from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  invariant(process.env.STYTCH_PROJECT_ID, "STYTCH_PROJECT_ID must be set");
  invariant(process.env.STYTCH_SECRET, "STYTCH_SECRET must be set");

  const url = new URL(request.url);
  const domain = url.hostname; // make sure to strip port (if present)

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
  if (!user) return redirect(`/create?email=${encodeURIComponent(email)}`);

  // for existing users, we call stytch to send a magic link to their email
  await stytchLoginOrCreate(email);
  return redirect("/magic");
};

export const meta: MetaFunction = () => [{ title: "Court dibs - login" }];

export default function Start() {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const credentialRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // we only want to make this call once
    const controller = new AbortController();

    if (!data.public_key_credential_request_options) return;
    const rawOptions = JSON.parse(data.public_key_credential_request_options);

    const fetchCredential = async () => {
      try {
        const PKCredential = PublicKeyCredential as PublicKeyCredentialWithJSON;
        const publicKeyOptions = PKCredential.parseRequestOptionsFromJSON({
          ...rawOptions,
          rpId: window.location.hostname,
          userVerification: "preferred",
          // Ensure allowCredentials is not set for conditional UI/autofill
          allowCredentials: [],
        });

        // 4. Call native navigator.credentials.get
        const credential = await navigator.credentials.get({
          publicKey: publicKeyOptions,
          mediation: "conditional", // Triggers autofill/passkey dropdown
          signal: controller.signal,
        });

        credentialRef.current!.value = JSON.stringify(credential);
        const form = document.querySelector("#theform") as HTMLFormElement;
        form.submit();
      } catch (err) {
        if ((err as Error).name === "AbortError") return; // Ignore intentional aborts
        console.error(err);
      }
    };

    fetchCredential();

    // Cleanup cancels the pending request on unmount
    return () => controller.abort();
  }, [data.public_key_credential_request_options]);

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
