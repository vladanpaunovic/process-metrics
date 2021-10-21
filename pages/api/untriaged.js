import axios from "axios";
import insertRows from "../../src/insertRow";
import { v4 as uuidv4 } from "uuid";

const repositories = [
  "sentry-php",
  "sentry-javascript",
  "sentry-ruby",
  "sentry-elixir",
  "sentry-cli",
  "sentry-laravel",
  "sentry-symfony",
  "sentry-webpack-plugin",
  "sentry-wizard",
  "sentry-python",
  "sentry-go",
];

/**
 *
 * @param {number} page
 * @returns Promise<any[]>
 */
async function fetchPage(page) {
  const authHeader = `token ${process.env.GITHUB_TOKEN}`;
  const options = {
    headers: {
      Authorization: authHeader,
      Accept: "application/vnd.github.inertia-preview+json",
    },
  };

  const url = `https://api.github.com/projects/columns/13449624/cards?per_page=100&page=${String(
    page
  )}`;

  const response = await axios.get(url, options);

  return response.data;
}

async function fetchIssues() {
  const issues = [];
  for (let i = 1; i; i++) {
    const response = await fetchPage(i);
    if (!response.length) {
      break;
    }

    issues.push(...response);
  }

  return issues;
}

function countIssuesPerRepository(issues) {
  const issuesPerRepository = repositories.map((value) => {
    const filtered = issues.filter((issue) =>
      issue.content_url.includes(value)
    );
    return { repository: value, count: filtered.length };
  });

  return issuesPerRepository;
}

function mapIssueToRepositoryName(issue) {
  return repositories.find((repo) => issue.content_url.includes(repo));
}

export default async function hello(req, res) {
  const batchId = uuidv4();
  const issues = await fetchIssues();
  const issesPerRepository = countIssuesPerRepository(issues);

  const output = issues.map((issue) => ({
    github_id: issue.id,
    repository: mapIssueToRepositoryName(issue),
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    content_url: issue.content_url,
    inserted_at: new Date(),
    batch_id: batchId,
  }));

  const insertedRows = await insertRows({
    datasetId: "triaging",
    tableId: "untriaged_issues",
    rows: output,
  });

  res.status(200).json(output);
}
