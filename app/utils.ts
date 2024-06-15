import { useMatches } from "@remix-run/react";
import { contains } from "@terraformer/spatial";
import * as dateFns from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { GeoJSON } from "geojson";
import { useMemo } from "react";

import type { User } from "~/models/user.server";

const DEFAULT_REDIRECT = "/";

export const STYTCH_URL_BASE =
  process.env.NODE_ENV === "production"
    ? "https://api.stytch.com/v1/magic_links"
    : "https://test.stytch.com/v1/magic_links";

export const toPacific = (date: Date) => toZonedTime(
  date,
  "America/Los_Angeles",
);

export const startOfToday = () => toPacific(dateFns.startOfToday())
export const startOfDay = (date: Date | string) => toPacific(dateFns.startOfDay(date))
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
      [-117.68496384123713, 33.48204151023167],
      [-117.68388255720208, 33.48203351752436],
      [-117.68372236346755, 33.48176629510631],
      [-117.68265440523655, 33.481751449392135],
      [-117.68149744912218, 33.48175144451878],
      [-117.67842443970255, 33.48174668927008],
      [-117.67732407755909, 33.48353464046207],
      [-117.68435950172221, 33.48353464046207],
      [-117.68496384123713, 33.48204151023167],
    ],
  ],
  type: "Polygon",
};

export const validateCoordinates = (coordinates: [number, number]) =>
  contains(HOA_BOUNDARY as GeoJSON, { type: "Point", coordinates });
