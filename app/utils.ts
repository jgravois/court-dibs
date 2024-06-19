import { useMatches } from "@remix-run/react";
import { contains } from "@terraformer/spatial";
import { formatInTimeZone, getTimezoneOffset } from "date-fns-tz";
import type { GeoJSON } from "geojson";
import { useMemo } from "react";

import type { User } from "~/models/user.server";

const DEFAULT_REDIRECT = "/";

export const STYTCH_URL_BASE =
  process.env.NODE_ENV === "production"
    ? "https://api.stytch.com/v1/magic_links"
    : "https://test.stytch.com/v1/magic_links";

// hours
export const getClientOffset = (): number =>
  (getTimezoneOffset("America/Los_Angeles", new Date()) / 60 / 60 / 1000) *
  -1;

export const getOffset = () => {
  const serverOffset = new Date().getTimezoneOffset() / 60
  return getClientOffset() - serverOffset
}

export const format = (date: Date | string, format: string) =>
  formatInTimeZone(date, "America/Los_Angeles", format);

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string,
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id],
  );
  return route?.data as Record<string, unknown>;
}

function isUser(user: unknown): user is User {
  return (
    user != null &&
    typeof user === "object" &&
    "email" in user &&
    typeof user.email === "string"
  );
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

const HOA_BOUNDARY = {
  coordinates: [
    [
      [-117.684963, 33.482041],
      [-117.683882, 33.482033],
      [-117.683722, 33.481766],
      [-117.682654, 33.481751],
      [-117.681497, 33.481751],
      [-117.678424, 33.481746],
      [-117.677324, 33.483534],
      [-117.684359, 33.483534],
      [-117.684963, 33.482041],
    ],
  ],
  type: "Polygon",
};

export const validateCoordinates = (coordinates: [number, number]) =>
  contains(HOA_BOUNDARY as GeoJSON, { type: "Point", coordinates });
