import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getAppBySlug } from "@/lib/store-data";
import { AppRow } from "@/components/store/app-row";

describe("AppRow", () => {
  const app = getAppBySlug("northstar-notes");

  if (!app) {
    throw new Error("Expected seed app to exist for component tests");
  }

  it("renders a link to the app detail page with core metadata", () => {
    render(<AppRow app={app} rank={2} />);

    expect(
      screen.getByRole("link", { name: /northstar notes/i }),
    ).toHaveAttribute("href", "/apps/northstar-notes");
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Productivity")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders compact mode without dropping the app tagline", () => {
    render(<AppRow app={app} compact />);

    expect(screen.getByText("Write, sort, and connect your thinking.")).toBeInTheDocument();
  });
});
