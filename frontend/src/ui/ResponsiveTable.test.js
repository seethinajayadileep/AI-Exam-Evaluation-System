import { render, screen } from "@testing-library/react";
import ResponsiveTable from "./ResponsiveTable";

test("renders a table on desktop and card copies for small screens", () => {
  render(
    <ResponsiveTable
      empty="Nothing here"
      columns={[{ key: "title", header: "Title" }, { key: "status", header: "Status" }]}
      rows={[
        {
          id: "1",
          cells: { title: "Ohm’s law", status: "Graded" },
          card: <h3>Ohm’s law</h3>
        }
      ]}
    />
  );

  expect(screen.getByRole("table")).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "Title" })).toBeInTheDocument();
  expect(screen.getAllByText("Ohm’s law").length).toBeGreaterThan(1);
});

test("shows the empty state in both table and cards", () => {
  render(
    <ResponsiveTable
      empty="No submissions found matching the criteria."
      columns={[{ key: "title", header: "Title" }]}
      rows={[]}
    />
  );
  expect(screen.getAllByText("No submissions found matching the criteria.").length).toBeGreaterThan(0);
});
