import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePositiveInt, parsePullRequestParams } from "@/lib/github/request";

describe("GitHub request helpers", () => {
  it("parses positive integers with a fallback", () => {
    assert.equal(parsePositiveInt("5", 10), 5);
    assert.equal(parsePositiveInt("0", 10), 10);
    assert.equal(parsePositiveInt("abc", 10), 10);
    assert.equal(parsePositiveInt(null, 10), 10);
  });

  it("parses pull request query parameters", () => {
    const url = new URL(
      "http://localhost:3000/api/github/pull-request?owner=TinotendaMuponda&repo=github-pr-mentor-ai&number=12"
    );

    assert.deepEqual(parsePullRequestParams(url), {
      owner: "TinotendaMuponda",
      repo: "github-pr-mentor-ai",
      number: 12
    });
  });

  it("rejects invalid pull request query parameters", () => {
    const url = new URL(
      "http://localhost:3000/api/github/pull-request?owner=TinotendaMuponda&repo=github-pr-mentor-ai&number=abc"
    );

    assert.equal(parsePullRequestParams(url), null);
  });
});
