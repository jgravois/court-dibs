import type { User } from "@prisma/client";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, json, useLoaderData } from "@remix-run/react";

import { getReservations } from "~/models/reservation.server";
import { getSession } from "~/session.server";
import { useOptionalUser } from "~/utils";

import { ReservationList, Rez } from "./ReservationList";

export const meta: MetaFunction = () => [{ title: "Court dibs" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const reservations = await getReservations();

  // next step is to verify that the token in the cookie is still valid
  // with stytch when the application loads with stored credentials
  const session = await getSession(request);
  const token = session.get("stytch_session");
  // confirmation that we can stash an arbitrary value and retrieve it.
  token;

  return json({ reservations });
};

export default function Index() {
  const user: User | undefined = useOptionalUser();
  const data = useLoaderData<typeof loader>();

  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              <img
                className="h-full w-full object-cover"
                src="https://user-images.githubusercontent.com/1500684/157774694-99820c51-8165-4908-a031-34fc371ac0d6.jpg"
                alt="Sonic Youth On Stage"
              />
              <div className="absolute inset-0 bg-[color:rgba(254,204,27,0.5)] mix-blend-multiply" />
            </div>
            <div className="relative px-4 pb-8 pt-16 sm:px-6 sm:pb-14 sm:pt-24 lg:px-8 lg:pb-20 lg:pt-32">
              <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span className="block uppercase text-yellow-500 drop-shadow-md">
                  Court dibs
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-center text-xl text-white sm:max-w-3xl">
                Call dibs on one of our sports ball courts
              </p>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                {user ? (
                  <div className="flex items-center">
                    <span className="max-w-lg text-lg text-white sm:max-w-3xl">
                      Logged in as: {user.email}
                      &nbsp;
                    </span>
                    <Form action="/logout" method="post">
                      <button
                        type="submit"
                        className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
                      >
                        Logout
                      </button>
                    </Form>
                  </div>
                ) : (
                  <div className="mx-auto max-w-sm sm:flex sm:max-w-none sm:justify-center">
                    <Link
                      to="/start"
                      className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
                    >
                      Sign up or login!
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          <ReservationList
            reservations={data.reservations as Rez[]}
            user={user}
          />
        </div>
      </div>
    </main>
  );
}
