import { addMinutes } from "date-fns";
import * as SunCalc from "suncalc";

const LAT_LONG = [-117.68, 33.48].reverse() as [number, number];

// determine whether a America/Los_Angeles reservation
// concludes before dusk in Orange County
// making sure to disregard the timezone of the browser (and server!)
export const DuskCalculator = ({
  date,
  duration,
  startTime,
}: {
  date: string;
  duration: string;
  startTime: string;
}) => {
  const start = new Date(`${date}T${startTime}:00-07:00`);
  const end = addMinutes(start, Number(duration));
  const { dusk } = SunCalc.getTimes(start, ...LAT_LONG);

  const tooDark =
    end.getHours() * 60 + end.getMinutes() >
    dusk.getHours() * 60 + dusk.getMinutes();

  return tooDark ? (
    <div className="pt-1 text-red-700">
      Are you sure? It will be dark before this reservation concludes.
    </div>
  ) : null;
};
