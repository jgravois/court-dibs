import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { createCourtViz, updateCourtViz } from "~/models/court-viz.server";
import { getUserById } from "~/models/user.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  try {
    const opts = {
      userId,
      hidePb: formData.get("hidePb") !== "on",
      hide10s: formData.get("hide10s") !== "on",
      hideBball: formData.get("hideBball") !== "on",
    };

    const user = await getUserById(userId);

    if (user?.courtViz) {
      updateCourtViz(opts);
    } else {
      await createCourtViz(opts);
    }
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return json({ errors: { start: (e as any).message } }, { status: 400 });
  }

  return json({ success: true }, { status: 200 });
};
