import { Octokit } from "octokit";
import getCommitsBetweenReleases from "../../src/getCommitsBetweenReleases";
import resolveCommit from "../../src/resolveCommit";

export default async function hello(req, res) {
  const fromReleases = await getCommitsBetweenReleases();

  const allll = await Promise.all(
    fromReleases.map((commit) => resolveCommit(commit.sha))
  );

  const allCommits = allll.flat(1);

  res.status(200).json({ fromReleases, allll, allCommits });
}
