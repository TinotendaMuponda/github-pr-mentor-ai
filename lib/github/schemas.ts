import { z } from "zod";

const rateLimitSchema = z.object({
  cost: z.number(),
  remaining: z.number(),
  resetAt: z.string()
});

const actorSchema = z
  .object({
    login: z.string()
  })
  .nullable();

export const viewerResponseSchema = z.object({
  viewer: z.object({
    id: z.string(),
    databaseId: z.number().nullable(),
    login: z.string(),
    name: z.string().nullable(),
    avatarUrl: z.string().url(),
    url: z.string().url()
  }),
  rateLimit: rateLimitSchema
});

export const repositoriesResponseSchema = z.object({
  viewer: z.object({
    repositories: z.object({
      nodes: z.array(
        z.object({
          id: z.string(),
          databaseId: z.number().nullable(),
          name: z.string(),
          nameWithOwner: z.string(),
          url: z.string().url(),
          isPrivate: z.boolean(),
          updatedAt: z.string(),
          pullRequests: z.object({
            nodes: z.array(
              z.object({
                id: z.string(),
                number: z.number(),
                title: z.string(),
                url: z.string().url(),
                state: z.string(),
                updatedAt: z.string()
              })
            )
          })
        })
      )
    })
  }),
  rateLimit: rateLimitSchema
});

export const pullRequestOverviewResponseSchema = z.object({
  repository: z
    .object({
      id: z.string(),
      databaseId: z.number().nullable(),
      name: z.string(),
      nameWithOwner: z.string(),
      url: z.string().url(),
      isPrivate: z.boolean(),
      owner: z.object({
        login: z.string()
      }),
      pullRequest: z
        .object({
          id: z.string(),
          databaseId: z.number().nullable(),
          number: z.number(),
          title: z.string(),
          url: z.string().url(),
          state: z.string(),
          baseRefName: z.string(),
          headRefName: z.string(),
          mergeable: z.string(),
          createdAt: z.string(),
          updatedAt: z.string(),
          mergedAt: z.string().nullable(),
          author: actorSchema,
          comments: z.object({
            nodes: z.array(
              z.object({
                id: z.string(),
                databaseId: z.number().nullable(),
                body: z.string(),
                url: z.string().url(),
                createdAt: z.string(),
                updatedAt: z.string(),
                author: actorSchema
              })
            )
          }),
          reviewThreads: z.object({
            nodes: z.array(
              z.object({
                id: z.string(),
                isResolved: z.boolean(),
                path: z.string().nullable(),
                line: z.number().nullable(),
                comments: z.object({
                  nodes: z.array(
                    z.object({
                      id: z.string(),
                      databaseId: z.number().nullable(),
                      body: z.string(),
                      url: z.string().url(),
                      path: z.string().nullable(),
                      line: z.number().nullable(),
                      createdAt: z.string(),
                      updatedAt: z.string(),
                      author: actorSchema
                    })
                  )
                })
              })
            )
          }),
          commits: z.object({
            nodes: z.array(
              z.object({
                commit: z.object({
                  id: z.string(),
                  oid: z.string(),
                  messageHeadline: z.string(),
                  messageBody: z.string(),
                  committedDate: z.string(),
                  url: z.string().url(),
                  author: z
                    .object({
                      name: z.string().nullable(),
                      email: z.string().nullable(),
                      user: z
                        .object({
                          login: z.string()
                        })
                        .nullable()
                    })
                    .nullable()
                })
              })
            )
          }),
          files: z.object({
            nodes: z.array(
              z.object({
                path: z.string(),
                changeType: z.string(),
                additions: z.number(),
                deletions: z.number()
              })
            )
          })
        })
        .nullable()
    })
    .nullable(),
  rateLimit: rateLimitSchema
});

export type PullRequestOverviewResponse = z.infer<
  typeof pullRequestOverviewResponseSchema
>;
