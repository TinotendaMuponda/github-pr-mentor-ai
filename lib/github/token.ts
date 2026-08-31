import { decryptText } from "@/lib/auth/crypto";
import { prisma } from "@/lib/prisma";

export class GitHubTokenError extends Error {
  constructor(
    message: string,
    readonly status = 401
  ) {
    super(message);
    this.name = "GitHubTokenError";
  }
}

export async function getGitHubAccessTokenForUser(userId: string) {
  const account = await prisma.gitHubAccount.findFirst({
    where: {
      userId,
      accessTokenCiphertext: {
        not: null
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  if (!account?.accessTokenCiphertext) {
    throw new GitHubTokenError("No GitHub account token found for this user.");
  }

  const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new GitHubTokenError(
      "TOKEN_ENCRYPTION_KEY is required to decrypt GitHub tokens.",
      500
    );
  }

  return decryptText(account.accessTokenCiphertext, encryptionKey);
}
