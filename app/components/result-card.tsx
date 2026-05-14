import {
  displayResult,
  formatResultTime,
  formatShortDate,
  hasResultValue,
} from "../lib/result-display";
import type { TodayResultItem } from "../lib/api";

type ResultCardProps = {
  item: TodayResultItem;
  featured?: boolean;
};

export default function ResultCard({ item, featured = false }: ResultCardProps) {
  const isLive = hasResultValue(item.Result);
  const resultLabel = isLive ? displayResult(item.Result) : "Waiting";
  const gameName = item.ShiftName || "Result";

  return (
    <article className={`today-card ${isLive ? "is-live" : "is-waiting"}${featured ? " featured-card" : ""}`}>
      <div className="today-card-top">
        {featured ? (
          <span className={`live-chip${isLive ? " is-blinking is-red-live" : ""}`}>
            {isLive ? "Live" : "Waiting"}
          </span>
        ) : null}
        <span className="time-chip">{formatResultTime(item.ShiftResultTime)}</span>
      </div>
      <strong className={isLive ? "result" : "waiting"}>{resultLabel}</strong>
      <span className="today-card-label">{gameName}</span>
      <span className="date-badge">{formatShortDate(item.ResultDate)}</span>
    </article>
  );
}
