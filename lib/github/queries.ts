export const VIEWER_QUERY = `
  query ViewerForPrMentor {
    viewer {
      id
      databaseId
      login
      name
      avatarUrl
      url
    }
    rateLimit {
      cost
      remaining
      resetAt
    }
  }
`;

export const REPOSITORIES_QUERY = `
  query ViewerRepositoriesForPrMentor($first: Int!) {
    viewer {
      repositories(
        first: $first
        ownerAffiliations: OWNER
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        nodes {
          id
          databaseId
          name
          nameWithOwner
          url
          isPrivate
          updatedAt
          pullRequests(first: 5, states: OPEN, orderBy: { field: UPDATED_AT, direction: DESC }) {
            nodes {
              id
              number
              title
              url
              state
              updatedAt
            }
          }
        }
      }
    }
    rateLimit {
      cost
      remaining
      resetAt
    }
  }
`;

export const PULL_REQUEST_OVERVIEW_QUERY = `
  query PullRequestOverviewForPrMentor(
    $owner: String!
    $repo: String!
    $number: Int!
  ) {
    repository(owner: $owner, name: $repo) {
      id
      databaseId
      name
      nameWithOwner
      url
      isPrivate
      owner {
        login
      }
      pullRequest(number: $number) {
        id
        databaseId
        number
        title
        url
        state
        baseRefName
        headRefName
        mergeable
        createdAt
        updatedAt
        mergedAt
        author {
          login
        }
        comments(first: 20) {
          nodes {
            id
            databaseId
            body
            url
            createdAt
            updatedAt
            author {
              login
            }
          }
        }
        reviewThreads(first: 20) {
          nodes {
            id
            isResolved
            path
            line
            comments(first: 10) {
              nodes {
                id
                databaseId
                body
                url
                path
                line
                createdAt
                updatedAt
                author {
                  login
                }
              }
            }
          }
        }
        commits(first: 20) {
          nodes {
            commit {
              id
              oid
              messageHeadline
              messageBody
              committedDate
              url
              author {
                name
                email
                user {
                  login
                }
              }
            }
          }
        }
        files(first: 50) {
          nodes {
            path
            changeType
            additions
            deletions
          }
        }
      }
    }
    rateLimit {
      cost
      remaining
      resetAt
    }
  }
`;
