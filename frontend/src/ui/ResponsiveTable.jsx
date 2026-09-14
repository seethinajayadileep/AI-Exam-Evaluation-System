import React from "react";

function ResponsiveTable({ columns, rows, empty }) {
  return (
    <div className="ui-table-wrap table-wrapper">
      <table className="ui-table desktop-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>{empty || "No rows."}</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.key}>{row.cells[column.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="ui-cards submission-cards">
        {rows.length === 0 ? (
          <p>{empty || "No rows."}</p>
        ) : (
          rows.map((row) => (
            <article key={row.id} className="submission-card ui-card">
              {row.card}
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export default ResponsiveTable;
