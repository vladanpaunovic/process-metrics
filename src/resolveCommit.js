import { Octokit } from "octokit";
import { REPOSITORY } from "./config";
import { mapCommit } from "./getCommitsBetweenReleases";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function resolveCommit(sha) {
  const associatedPRs = await await octokit.request(
    `GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls`,
    {
      owner: REPOSITORY.OWNER,
      repo: REPOSITORY.REPO,
      commit_sha: sha,
    }
  );

  if (!associatedPRs.data.length) {
    return [];
  }

  const latestPR = associatedPRs.data[0].number;

  const commits = await await octokit.request(
    `GET /repos/{owner}/{repo}/pulls/{pull_number}/commits`,
    {
      owner: REPOSITORY.OWNER,
      repo: REPOSITORY.REPO,
      pull_number: latestPR,
    }
  );

  return commits.data.map(mapCommit);
}

export default resolveCommit;
