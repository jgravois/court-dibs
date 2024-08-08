import { addHours, addMinutes } from "date-fns";
import * as SunCalc from "suncalc";

const LAT_LONG = [-117.68, 33.48].reverse() as [number, number];

export const DuskCalculator = ({
  day,
  duration,
  start,
}: {
  day: Date;
  duration: string;
  start: string;
}) => {
  const [hour, minute] = start.split(":");
  const toAdd = Number(hour) + Number(minute) / 60;
  const end = addMinutes(addHours(day, toAdd), Number(duration));

  const { dusk } = SunCalc.getTimes(day, ...LAT_LONG);

  return end.getTime() > dusk.getTime() ? (
    <div className="pt-1 text-red-700">
      Are you sure? It will be dark before this reservation concludes.
    </div>
  ) : null;
};
