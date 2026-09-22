import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { PHOTOS } from "./annie-photos.ts";
import { assetPath } from "./asset.ts";

describe("assetPath", () => {
  it("leaves a root-relative path alone when there is no base path", () => {
    // Under `node --test` NEXT_PUBLIC_ASSET_BASE is unset, which is the
    // same state as dev and as a custom-domain build.
    assert.equal(assetPath("/annie/hero.jpg"), "/annie/hero.jpg");
  });

  it("passes absolute URLs and data URIs straight through", () => {
    assert.equal(assetPath("https://example.com/a.jpg"), "https://example.com/a.jpg");
    assert.equal(assetPath("data:image/gif;base64,AAA"), "data:image/gif;base64,AAA");
  });

  it("passes relative paths straight through", () => {
    assert.equal(assetPath("hero.jpg"), "hero.jpg");
  });
});

describe("photo manifest paths", () => {
  it("are root-relative, so the base path can be applied to them", () => {
    // A path that does not start with "/" would silently skip the
    // prefix and 404 on the project site.
    for (const [id, photo] of Object.entries(PHOTOS)) {
      assert.ok(photo, id);
      assert.ok(
        photo.src.startsWith("/"),
        `${id} src "${photo.src}" must be root-relative`,
      );
    }
  });

  it("point at files under public/", () => {
    for (const [id, photo] of Object.entries(PHOTOS)) {
      assert.match(photo!.src, /^\/annie\/[\w-]+\.(jpg|png|webp)$/, id);
    }
  });
});
