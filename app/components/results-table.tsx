"use client";

import {
  displayResult,
  formatResultTime,
  formatShortDate,
  getRecentDateLabels,
} from "../lib/result-display";
import type { RecentResultItem } from "../lib/api";
import type { WeekPivotRow } from "../lib/result-display";

type RecentTableProps = {
  rows: RecentResultItem[];
};

type WeekTableProps = {
  dates: string[];
  rows: WeekPivotRow[];
};

type ResultsTableProps =
  | ({ variant: "recent" } & RecentTableProps)
  | ({ variant: "week" } & WeekTableProps);

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td className="empty-cell" colSpan={colSpan}>
        No results available
      </td>
    </tr>
  );
}

export function RecentResultsTable({ rows }: RecentTableProps) {
  const { date1, date2 } = getRecentDateLabels(rows);

  return (
    <div className="table-wrap">
      <table className="chart-table">
        <thead>
          <tr>
            <th>Game</th>
            <th>Time</th>
            <th>{formatShortDate(date1)}</th>
            <th>{formatShortDate(date2)}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr key={`${row.ShiftId}-${row.ShiftName}-${row.AddDate}`}>
                <th scope="row">
                  <span
                    className="shift-chip"
                    style={row.ShiftColor ? { backgroundColor: row.ShiftColor } : undefined}
                  >
                    {row.ShiftName}
                  </span>
                </th>
                <td>{formatResultTime(row.ShiftResultTime)}</td>
                <td>{displayResult(row.Result1)}</td>
                <td>{displayResult(row.Result2)}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={4} />
          )}
        </tbody>
      </table>
    </div>
  );
}

export function WeekResultsTable({ dates, rows }: WeekTableProps) {
  return (
    <div className="table-wrap">
      <table className="chart-table">
        <thead>
          <tr>
            <th>Game</th>
            <th>Time</th>
            {dates.map((date) => (
              <th key={date}>{formatShortDate(date)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr key={row.name}>
                <th scope="row">
                  <span
                    className="shift-chip"
                    style={row.color ? { backgroundColor: row.color } : undefined}
                  >
                    {row.name}
                  </span>
                </th>
                <td>{formatResultTime(row.time)}</td>
                {dates.map((date) => (
                  <td key={`${row.name}-${date}`}>{row.values[date] ?? "XX"}</td>
                ))}
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={Math.max(dates.length + 2, 3)} />
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function ResultsTable(props: ResultsTableProps) {
  if (props.variant === "week") {
    return <WeekResultsTable dates={props.dates} rows={props.rows} />;
  }

  return <RecentResultsTable rows={props.rows} />;
}
