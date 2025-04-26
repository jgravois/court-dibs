import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import type { User } from "~/models/user.server";
import { getUserById } from "~/models/user.server";
import { STYTCH_BASE } from "~/utils";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userId";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserId(
  request: Request,
): Promise<User["id"] | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function maybeUserId(
  request: Request
) {
  return await getUserId(request);
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/start?${searchParams}`);
  }
  return userId;
}

export async function requireValidStytchToken(
  request: Request
) {
  const session = await getSession(request);
  const session_token = session.get("stytch_session");
  const lastValidated = session.get('last_validated')

  // we validate stytch tokens at most once a minute
  const stale = new Date().valueOf() - lastValidated > 1000 * 60
  if (!stale) return lastValidated

  const rawResponse = await fetch(
    STYTCH_BASE + "/sessions/authenticate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(
          `${process.env.STYTCH_PROJECT_ID}:${process.env.STYTCH_SECRET}`,
        )}`,
      },

      body: JSON.stringify({
        session_token,
        session_duration_minutes: 43200
      }),
    },
  );
  const parsed = await rawResponse.json();
  if (parsed.status_code !== 200) {
    throw await logout(request)
  }
  return new Date().valueOf()
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
  token,
  lastValidated,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
  token?: string;
  lastValidated?: number;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);

  if (token) session.set("stytch_session", token);
  if (lastValidated) session.set("last_validated", lastValidated);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 30 // 30 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  const session_token = session.get("stytch_session");

  // invalidate token
  await fetch(
    STYTCH_BASE + "/sessions/revoke",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(
          `${process.env.STYTCH_PROJECT_ID}:${process.env.STYTCH_SECRET}`,
        )}`,
      },
      body: JSON.stringify({ session_token }),
    },
  );

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
