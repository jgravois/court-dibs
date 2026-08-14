import type { User } from "@prisma/client";
import type { MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";

import { Header } from "~/components/Header/Header";
import { getReservationCount } from "~/models/reservation.server";
import { useOptionalUser } from "~/utils";

export const meta: MetaFunction = () => [{ title: "Court dibs - faq" }];

export const loader = async () =>
  json({ rezCount: await getReservationCount() });

export default function FAQ() {
  const user: User | undefined = useOptionalUser();
  return (
    <>
      <Header />
      <main className="container">
        <p className="faq-q">What is court dibs?</p>
        <p className="faq-a">
          Court dibs is a tool for Mariners Village residents to reserve the
          pickleball, tennis and basketball courts
        </p>
        <p className="faq-q">Are reservations mandatory?</p>
        <p className="faq-a">
          No! You can still use the facilities on a &lsquo;first come, first
          served&rsquo; basis if that&rsquo;s more your style
        </p>
        <p className="faq-q">Is an account required?</p>
        <p className="faq-a">
          No account is required to view upcoming court reservations. Only HOA
          residents are eligible to sign up for an account and reserve court
          time.
        </p>
        <p className="faq-q">
          Do I have to create <i>another</i> password?
        </p>
        <p className="faq-a">
          Nope. Court dibs doesn&rsquo;t support creating passwords. To log in
          you can either have a temporary link delivered to your email inbox or
          use a <a href={user ? "/passkeys/create" : undefined}>passkey 🫆</a>
        </p>
        <p className="faq-q">What&rsquo;s the catch?</p>
        <p className="faq-a">
          Nothing! Court dibs is open source,{" "}
          <a
            className="oldschool-link"
            href="https://github.com/jgravois/court-dibs"
          >
            neighbor-made
          </a>{" "}
          and provided free of charge. Browsing is not tracked and personal
          information will never be sold or shared with third parties.
        </p>
        <p className="faq-q">
          What was wrong with&nbsp;
          <a
            className="oldschool-link"
            href="https://www.signupgenius.com/go/508044AACA72AAAF94-48435985-mariners#/"
          >
            SignUpGenius
          </a>
          ?
        </p>
        <p className="faq-a" style={{ paddingBottom: 15 }}>
          Our HOA&rsquo;s old reservation system had a few rough edges:
        </p>
        <ol className="faq-list">
          <li>Only 90 minute reservations were allowed</li>
          <li>Only seven pre-selected start times per day were available</li>
          <li>
            Slots in the past and far into the future were all displayed at once
          </li>
          <li>15 minutes were set aside between reservations unnecessarily</li>
          <li>Resident phone numbers were visible to the entire world</li>
          <li>The tennis court could not be reserved</li>
        </ol>
        <p style={{ paddingTop: 20 }} className="faq-q">
          Questions/feedback
        </p>
        <p className="faq-a">
          <a className="oldschool-link" href="mailto:courtdibs.sjc@gmail.com">
            courtdibs.sjc@gmail.com
          </a>
        </p>
        <p className="faq-q">Credits</p>
        <p>
          this website was created by&nbsp;
          <a className="oldschool-link" href="https://github.com/jgravois">
            @jgravois
          </a>
          &nbsp;with some design help from&nbsp;
          <a className="oldschool-link" href="https://github.com/mel-thomas">
            @mel-thomas
          </a>
          &nbsp;🎨
        </p>
        <p className="faq-a">
          <a className="oldschool-link" href="https://fontawesome.com/">
            font awesome
          </a>
          &nbsp;icons, photo courtesy of&nbsp;
          <a
            className="oldschool-link"
            href="https://unsplash.com/photos/silhouette-photo-of-basketball-system-57rD2oDZquc"
          >
            @nicholasjio/unsplash
          </a>
        </p>
        <p className="faq-a">
          So far, dibs has been called on a court&nbsp;
          <strong>{useLoaderData<typeof loader>().rezCount}</strong>
          &nbsp;times
        </p>
      </main>
    </>
  );
}
