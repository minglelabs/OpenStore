import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

function resolveHref(href: unknown) {
  if (typeof href === "string") {
    return href;
  }

  if (href && typeof href === "object") {
    if (href instanceof URL) {
      return href.toString();
    }

    if ("pathname" in href) {
      return String((href as { pathname?: unknown }).pathname ?? "");
    }
  }

  return "";
}

vi.mock("next/link", () => {
  return {
    default: ({
      children,
      href,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: unknown }) => {
      return React.createElement(
        "a",
        { href: resolveHref(href), ...props },
        children,
      );
    },
  };
});
