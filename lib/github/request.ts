export function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function parsePullRequestParams(url: URL) {
  const owner = url.searchParams.get("owner")?.trim();
  const repo = url.searchParams.get("repo")?.trim();
  const number = Number(url.searchParams.get("number"));

  if (!owner || !repo || !Number.isInteger(number) || number < 1) {
    return null;
  }

  return {
    owner,
    repo,
    number
  };
}
