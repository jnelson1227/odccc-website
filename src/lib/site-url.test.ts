import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

/**
 * SITE_URL and IS_INDEXABLE are resolved once at module load from the
 * environment, so each case needs a fresh module registry.
 */
async function load(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return import("./site-url");
}

describe("SITE_URL", () => {
  const saved = { ...process.env };

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
  });

  afterEach(() => {
    process.env = { ...saved };
  });

  it("prefers an explicit NEXT_PUBLIC_SITE_URL", async () => {
    const { SITE_URL } = await load({
      NEXT_PUBLIC_SITE_URL: "https://oregonccc.com",
      VERCEL_PROJECT_PRODUCTION_URL: "odccc-website.vercel.app",
    });
    expect(SITE_URL).toBe("https://oregonccc.com");
  });

  it("falls back to the Vercel production URL", async () => {
    const { SITE_URL } = await load({
      VERCEL_PROJECT_PRODUCTION_URL: "odccc-website.vercel.app",
    });
    expect(SITE_URL).toBe("https://odccc-website.vercel.app");
  });

  it("strips a trailing slash", async () => {
    const { SITE_URL } = await load({ NEXT_PUBLIC_SITE_URL: "https://oregonccc.com/" });
    expect(SITE_URL).toBe("https://oregonccc.com");
  });

  it("uses the real domain for local builds", async () => {
    const { SITE_URL } = await load({});
    expect(SITE_URL).toBe("https://oregonccc.com");
  });
});

describe("IS_INDEXABLE", () => {
  const saved = { ...process.env };

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
  });

  afterEach(() => {
    process.env = { ...saved };
  });

  it("is false on the vercel.app alias, so the staging URL stays out of search", async () => {
    const { IS_INDEXABLE } = await load({
      VERCEL_PROJECT_PRODUCTION_URL: "odccc-website.vercel.app",
    });
    expect(IS_INDEXABLE).toBe(false);
  });

  it("is false for a deploy-specific vercel.app host too", async () => {
    const { IS_INDEXABLE } = await load({
      VERCEL_PROJECT_PRODUCTION_URL: "odccc-website-9qc1jbnol-jnelson1227s-projects.vercel.app",
    });
    expect(IS_INDEXABLE).toBe(false);
  });

  it("turns itself on at cutover, when NEXT_PUBLIC_SITE_URL becomes the real domain", async () => {
    const { IS_INDEXABLE } = await load({
      NEXT_PUBLIC_SITE_URL: "https://oregonccc.com",
      VERCEL_PROJECT_PRODUCTION_URL: "odccc-website.vercel.app",
    });
    expect(IS_INDEXABLE).toBe(true);
  });

  it("does not mistake a domain that merely contains vercel.app for an alias", async () => {
    const { IS_INDEXABLE } = await load({
      NEXT_PUBLIC_SITE_URL: "https://vercel.app.oregonccc.com",
    });
    expect(IS_INDEXABLE).toBe(true);
  });
});
