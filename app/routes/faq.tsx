import type { MetaFunction } from "@remix-run/node";

import { Header } from "./Header";

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
          court dibs is a tool for&nbsp;
          <a
            className="oldschool-link"
            href="http://myhoa.com/marinersvillage/"
          >
            Mariners Village
          </a>
          &nbsp;HOA residents to reserve the pickleball, tennis and basketball
          courts
        </p>
        <p className="faq-q">are reservations mandatory?</p>
        <p className="faq-a">
          no! you can use the facilities on a first come first served basis if
          that&apos;s more your style
        </p>
        <p className="faq-q">what&apos;s the catch?</p>
        <p className="faq-a">
          nothing! court dibs is neighbor-made, free to use, ad-free. none of
          your personal information will be shared with third parties
        </p>
        <p className="faq-q">
          why not just use&nbsp;
          <a
            className="oldschool-link"
            href="https://www.signupgenius.com/go/508044AACA72AAAF94-48435985-mariners#/"
          >
            SignUpGenius
          </a>
          ?
        </p>
        <p className="faq-a">
          here are some things I don&apos;t love about our HOA&apos;s original
          reservation system
        </p>
        <ol className="faq-list">
          <li>
            you can only reserve the pickleball court (i like to play tennis)
          </li>
          <li>only 90 minute reservations are allowed</li>
          <li>
            you can&apos;t specify the start time for your reservation, you have
            to choose one of seven pre-selected options per day
          </li>
          <li>
            a lot of scrolling is required to make a new reservation because
            slots in the past and far into the future are all displayed at once
          </li>
          <li>15 minutes is set aside between reservations unnecessarily</li>
          <li>
            when you reserve a court, your phone number is visible to the entire
            world
          </li>
        </ol>
        <p className="faq-a" style={{ paddingTop: 20 }}>
          as far as i can tell, no one else has ever reserved a court using
          SignUpGenius. I&apos;m hopeful that court dibs will be a little more
          popular.
        </p>
        <p className="faq-q">still have a question?</p>
        <p>
          email:&nbsp;
          <a className="oldschool-link" href="mailto:placeholder@mail.com">
            placeholder@mail.com
          </a>
        </p>
        <p>
          call/text:&nbsp;
          <a className="oldschool-link" href="tel:9490000000">
            (949)xxx-xxxx
          </a>
        </p>
      </main>
    </>
  );
}
