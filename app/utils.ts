import { tz, TZDate } from "@date-fns/tz";
import { useMatches } from "@remix-run/react";
import { contains } from "@terraformer/spatial";
import { addDays, format as dateFnsFormat } from "date-fns";
import type { GeoJSON } from "geojson";
import { useMemo } from "react";

import type { User } from "~/models/user.server";

export type CourtType = "pb" | "bball" | "10s";

const DEFAULT_REDIRECT = "/";

const STYTCH_SUBDOMAIN = process.env.NODE_ENV === "production" ? 'api' : 'test'
export const STYTCH_BASE = `https://${STYTCH_SUBDOMAIN}.stytch.com/v1`

export const maybePrefix = (date: Date) => {
  const offsetNow = changeTimezone(new Date());

  const isToday = date.toDateString() === offsetNow.toDateString();
  const isTomorrow =
    date.toDateString() === addDays(offsetNow, 1).toDateString();

  if (isToday) return "today - ";
  if (isTomorrow) return "tomorrow - ";
  return "";
};

export const anotherTimeFormattingFunc = (val: string | null) => {
  if (!val) return;
  const [h, m] = val.split(":");
  return formatTime(Number(h), m == "30");
};

// 7 or 8 (from GMT) depending on the season
export const getPacificOffset = (rawDate: string) => {
  const [year, month, day] = rawDate.split("-").map((val) => Number(val));
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#monthindex
  const monthIdx = month - 1
  return new TZDate(year, monthIdx, day, "America/Los_Angeles").getTimezoneOffset() / 60;
}

export const getTimezoneOffsetMs = (date: Date) => {
  const invdate = new Date(
    date.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
    }),
  );
  return (date.getTime() - invdate.getTime())
}

// https://stackoverflow.com/questions/15141762/how-to-initialize-a-javascript-date-to-a-particular-time-zone
export const changeTimezone = (date: Date) => new Date(date.getTime() - getTimezoneOffsetMs(date));

export const getTimezoneOffset = (date: Date) => {
  return getTimezoneOffsetMs(date) / 60 / 60 / 1000
}

export const format = (date: Date | string, format: string) =>
  dateFnsFormat(date, format, { in: tz("America/Los_Angeles") });

export const formatTime = (rawHour: number, isHalf = false): string => {
  const hour = rawHour - (rawHour > 12 ? 12 : 0)
  const min = isHalf ? "30" : "00"
  const suffix = rawHour >= 12 ? 'pm' : 'am'
  return `${hour}:${min} ${suffix}`
}

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
