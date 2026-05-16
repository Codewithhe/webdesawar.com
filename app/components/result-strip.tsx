import { getGameCardLabel, getGameCardStyle, getStripClassName } from "../lib/game-display";
import {
  displayResult,
  formatResultTime,
  formatShortDate,
  hasResultValue,
  isPriorityStripGame,
} from "../lib/result-display";
import type { TodayResultItem } from "../lib/api";

type ResultStripProps = {
  item: TodayResultItem;
};

export default function ResultStrip({ item }: ResultStripProps) {
  const isPriority = isPriorityStripGame(item.ShiftName);
  const currentText = displayResult(item.Result);
  const isLive = hasResultValue(item.Result);
  const currentLabel = isLive ? currentText : "Waiting";
  const previousLabel = hasResultValue(item.PreviousResult)
    ? displayResult(item.PreviousResult)
    : "—";
  const stripStyle = getGameCardStyle(item.ShiftName, false);

  return (
    <article className={getStripClassName(item.ShiftName, isLive, isPriority)} style={stripStyle}>
      <div className="result-strip-head">
        <span className="result-strip-name">{getGameCardLabel(item.ShiftName, false)}</span>
        <span className="result-strip-time">{formatResultTime(item.ShiftResultTime)}</span>
      </div>
      <strong className={`result-strip-current${isLive ? " is-live" : ""}`}>{currentLabel}</strong>
      <div className="result-strip-previous">
        <span className="result-strip-previous-label">
          कल ({formatShortDate(item.PreviousDate)})
        </span>
        <span className="result-strip-previous-value">{previousLabel}</span>
      </div>
    </article>
  );
}
