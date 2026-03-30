import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock NextResponse and NextRequest
const mockRewrite = vi.fn((url: URL) => ({ type: "rewrite", url }));
const mockNext = vi.fn(() => ({ type: "next" }));

vi.mock("next/server", () => ({
  NextResponse: {
    rewrite: (url: URL) => mockRewrite(url),
    next: () => mockNext(),
  },
  NextRequest: vi.fn(),
}));

function createMockRequest(hostname: string, pathname: string = "/") {
  return {
    headers: {
      get: (name: string) => (name === "host" ? hostname : null),
    },
    nextUrl: {
      pathname,
      port: "",
    },
    url: `https://${hostname}${pathname}`,
  };
}

describe("middleware routing", () => {
  beforeEach(() => {
    mockRewrite.mockClear();
    mockNext.mockClear();
  });

  it("passes through requests with no subdomain", async () => {
    const { middleware } = await import("../middleware");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware(createMockRequest("philhie.com") as any);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRewrite).not.toHaveBeenCalled();
  });

  it("ignores www subdomain", async () => {
    const { middleware } = await import("../middleware");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware(createMockRequest("www.philhie.com") as any);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRewrite).not.toHaveBeenCalled();
  });

  it("rewrites subdomain requests", async () => {
    const { middleware } = await import("../middleware");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware(createMockRequest("it.philhie.com") as any);
    expect(mockRewrite).toHaveBeenCalled();
    const url = mockRewrite.mock.calls[0][0] as URL;
    expect(url.pathname).toBe("/subdomains/it/");
  });

  it("passes through localhost requests", async () => {
    const { middleware } = await import("../middleware");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware(createMockRequest("localhost:3000") as any);
    expect(mockNext).toHaveBeenCalled();
  });

  it("passes through Vercel preview URLs", async () => {
    const { middleware } = await import("../middleware");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware(createMockRequest("my-project.vercel.app") as any);
    expect(mockNext).toHaveBeenCalled();
  });
});
