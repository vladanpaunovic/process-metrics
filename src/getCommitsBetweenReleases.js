import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// const REPOSITORY_OWNER = "getsentry";
// const REPOSITORY = "sentry-javascript";
const REPOSITORY_OWNER = "vladanpaunovic";
const REPOSITORY = "process-metrics";

async function getCommitsBetweenReleases() {
  const releases = await await octokit.request(
    `GET /repos/{owner}/{repo}/releases`,
    { owner: REPOSITORY_OWNER, repo: REPOSITORY, per_page: 2 }
  );

  if (!releases.data || !releases.data.length) {
    return { error: "No releases found for this repository" };
  }

  const [currentRelease, lastRelease] = releases.data.map(
    (release) => release.name
  );

  const commitsResponse = await octokit.rest.repos.compareCommits({
    owner: REPOSITORY_OWNER,
    repo: REPOSITORY,
    head: currentRelease,
    base: lastRelease,
  });

  const commits = commitsResponse.data.commits;

  const cleanCommits = commits.map((commitItem) => ({
    sha: commitItem.sha,
    message: commitItem.commit.message,
    date: commitItem.commit.committer.date,
  }));

  return cleanCommits;
}

export default getCommitsBetweenReleases;
