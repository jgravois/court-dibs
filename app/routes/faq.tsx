import type { MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";

import { Header } from "~/components/Header/Header";
import { getReservationCount } from "~/models/reservation.server";

export const meta: MetaFunction = () => [{ title: "Court dibs - faq" }];

export const loader = async () =>
  json({ rezCount: await getReservationCount() });

export default function FAQ() {
  return (
    <>
      <Header />
      <main className="container">
        <p className="faq-q">What is court dibs?</p>
        <p className="faq-a">
          Court dibs is a tool for&nbsp;
          <a
            className="oldschool-link"
            href="http://myhoa.com/marinersvillage/"
          >
            Mariners Village
          </a>
          &nbsp;residents to reserve the pickleball, tennis and basketball
          courts
        </p>
        <p className="faq-q">Are reservations mandatory?</p>
        <p className="faq-a">
          No! You can still use the facilities on a &apos;first come, first
          served&apos; basis if that&apos;s more your style
        </p>
        <p className="faq-q">Is an account required?</p>
        <p className="faq-a">
          No account is required to view court reservations. Only HOA residents
          are eligible to sign up and create new ones.
        </p>
        <p className="faq-q">What&apos;s the catch?</p>
        <p className="faq-a">
          Nothing! Court dibs is&nbsp;
          <a
            className="oldschool-link"
            href="https://github.com/jgravois/court-dibs"
          >
            neighbor-made
          </a>
          , free to use, and ad-free. Your personal information will never be
          shared with third parties.
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
          Our HOA&apos;s previous reservation system had a few rough edges:
        </p>
        <ol className="faq-list">
          <li>Only 90 minute reservations were allowed</li>
          <li>
            You had to choose between seven pre-selected start times per day
          </li>
          <li>
            Slots in the past and far into the future were all displayed at
            once, leading to too much scrolling
          </li>
          <li>15 minutes were set aside between reservations unnecessarily</li>
          <li>
            When you reserved a court, your phone number was visible to the
            entire world
          </li>
          <li>You could not reserve the tennis court</li>
        </ol>
        <p style={{ paddingTop: 20 }} className="faq-q">
          Questions/feedback
        </p>
        <p className="faq-a">
          <a className="oldschool-link" href="mailto:placeholder@mail.com">
            courtdibs.sjc@gmail.com
          </a>
          &nbsp;/&nbsp;
          <a className="oldschool-link" href="tel:+19093074532">
            (909)307-4532
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
          icons courtesy of&nbsp;
          <a className="oldschool-link" href="https://fontawesome.com/">
            font awesome
          </a>
          , photo courtesy of&nbsp;
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
