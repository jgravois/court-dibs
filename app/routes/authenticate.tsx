import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";

export const loader = async () => {
  return json({});
};

export const meta: MetaFunction = () => [{ title: "Authenticate" }];

// TODO: pull token out of url params, call stytch endpoint below and use result from THAT to
// instantiate a user session

// curl --request POST \\
// --url https://test.stytch.com/v1/magic_links/authenticate \\
// -u 'PROJECT_ID:SECRET' \\
// -H 'Content-Type: application/json' \\
// -d '{
//   "token": "SeiGwdj5lKkrEVgcEY3QNJXt6srxS3IK2Nwkar6mXD4="
// }'

// return createUserSession({
//   redirectTo,
//   remember: false,
//   request,
//   userId,
// });

export default function Authenticate() {
  const [searchParams] = useSearchParams();
  searchParams;

  // retrieve ?token=abc

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <p>placeholder</p>
      </div>
    </div>
  );
}
