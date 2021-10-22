import { Octokit } from "octokit";
import { REPOSITORY } from "./config";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export const mapCommit = (commit) => ({
  sha: commit.sha,
  message: commit.commit.message,
  date: commit.commit.committer.date,
});

async function getCommitsBetweenReleases() {
  const releases = await await octokit.request(
    `GET /repos/{owner}/{repo}/releases`,
    { owner: REPOSITORY.OWNER, repo: REPOSITORY.REPO, per_page: 2 }
  );

  if (!releases.data || !releases.data.length) {
    return { error: "No releases found for this repository" };
  }

  const [currentRelease, lastRelease] = releases.data.map(
    (release) => release.name
  );

  const commitsResponse = await octokit.rest.repos.compareCommits({
    owner: REPOSITORY.OWNER,
    repo: REPOSITORY.REPO,
    head: currentRelease,
    base: lastRelease,
  });

  const commits = commitsResponse.data.commits;

  const cleanCommits = commits.map(mapCommit);

  return cleanCommits;
}

export default getCommitsBetweenReleases;
