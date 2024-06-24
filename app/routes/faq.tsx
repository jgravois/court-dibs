import type { MetaFunction } from "@remix-run/node";

import { Header } from "~/routes/header";

export const meta: MetaFunction = () => [
  { title: "Frequently asked questions" },
];

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
          &nbsp;HOA residents to reserve the pickleball, tennis and basketball
          courts
        </p>
        <p className="faq-q">Are reservations mandatory?</p>
        <p className="faq-a">
          No! You can still use the facilities on a first come first served
          basis if that&apos;s more your style
        </p>
        <p className="faq-q">Is an account required?</p>
        <p className="faq-a">
          No account is required to view court reservations. HOA residents are
          eligible to sign up and create new ones.
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
          , free to use, and ad-free. Your your personal information will never
          be shared with third parties
        </p>

        <p className="faq-q">
          Why not just use&nbsp;
          <a
            className="oldschool-link"
            href="https://www.signupgenius.com/go/508044AACA72AAAF94-48435985-mariners#/"
          >
            SignUpGenius
          </a>
          ?
        </p>
        <p className="faq-a">
          Here are some things I don&apos;t love about our HOA&apos;s original
          reservation system:
        </p>
        <ol className="faq-list">
          <li>
            You can only reserve the pickleball court (i like to play tennis)
          </li>
          <li>Only 90 minute reservations are allowed</li>
          <li>
            You can&apos;t specify the start time for your reservation, you have
            to choose one of seven pre-selected options per day
          </li>
          <li>
            A lot of scrolling is required to make a new reservation because
            slots in the past and far into the future are all displayed at once
          </li>
          <li>15 minutes is set aside between reservations unnecessarily</li>
          <li>
            When you reserve a court, your phone number is visible to the entire
            world
          </li>
        </ol>
        <p className="faq-a" style={{ paddingTop: 20 }}>
          As far as i can tell, no one else has ever reserved a court using
          SignUpGenius. I&apos;m hopeful that court dibs will be a little more
          popular.
        </p>
        <p className="faq-q">Still have a question? feedback?</p>
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
        <p className="faq-a">
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
          {" "}
          icons courtesy of&nbsp;
          <a className="oldschool-link" href="https://fontawesome.com/">
            font awesome
          </a>
          , image courtesy of&nbsp;
          <a
            className="oldschool-link"
            href="https://unsplash.com/photos/silhouette-photo-of-basketball-system-57rD2oDZquc"
          >
            @nicholasjio/unsplash
          </a>
        </p>
      </main>
    </>
  );
}
