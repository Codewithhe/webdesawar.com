"use client";

import { useMemo, useState } from "react";
import {
  displayResult,
  formatResultTime,
  formatShortDate,
} from "../lib/result-display";
import type { TodayResultItem } from "../lib/api";

type ResultsExplorerProps = {
  rows: TodayResultItem[];
};

export default function ResultsExplorer({ rows }: ResultsExplorerProps) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "time">("date");

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const nextRows = rows.filter((row) =>
      normalizedQuery ? row.ShiftName?.toLowerCase().includes(normalizedQuery) : true
    );

    return [...nextRows].sort((left, right) => {
      const leftDate = `${left.ResultDate ?? ""} ${left.ShiftResultTime ?? ""}`;
      const rightDate = `${right.ResultDate ?? ""} ${right.ShiftResultTime ?? ""}`;

      if (sortBy === "time") {
        return (left.ShiftResultTime ?? "").localeCompare(right.ShiftResultTime ?? "");
      }

      return rightDate.localeCompare(leftDate);
    });
  }, [query, rows, sortBy]);

  return (
    <section className="chart-card">
      <div className="results-toolbar">
        <label className="search-field">
          <span>Search by game</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Shift name"
          />
        </label>
        <label className="search-field">
          <span>Sort by</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as "date" | "time")}>
            <option value="date">Result date</option>
            <option value="time">Shift time</option>
          </select>
        </label>
      </div>

      <div className="table-wrap">
        <table className="chart-table">
          <thead>
            <tr>
              <th>Game</th>
              <th>Date</th>
              <th>Time</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length ? (
              filteredRows.map((row) => (
                <tr key={`${row.ResultId}-${row.ShiftId}-${row.ShiftName}`}>
                  <th scope="row">
                    <span
                      className="shift-chip"
                      style={row.ShiftColor ? { backgroundColor: row.ShiftColor } : undefined}
                    >
                      {row.ShiftName}
                    </span>
                  </th>
                  <td>{formatShortDate(row.ResultDate)}</td>
                  <td>{formatResultTime(row.ShiftResultTime)}</td>
                  <td>{displayResult(row.Result)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="empty-cell" colSpan={4}>
                  No results available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
