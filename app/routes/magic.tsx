import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Magic" }];

export default function Magic() {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <p>check your inbox for a magic link</p>
      </div>
    </div>
  );
}
