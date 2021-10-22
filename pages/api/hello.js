import getCommitsBetweenReleases from "../../src/getCommitsBetweenReleases";

export default async function hello(req, res) {
  const cleanCommits = await getCommitsBetweenReleases();

  res.status(200).json(cleanCommits);
}
