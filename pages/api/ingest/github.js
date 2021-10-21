import insertRows from "../../../src/insertRow";

const EVENT_TYPE = {
  PING: "ping",
  PUSH: "push",
  PULL_REQUEST: "pull_request",
  PULL_REQUEST_REVIEW: "pull_request_review",
  PULL_REQUEST_REVIEW_COMMENT: "pull_request_review_comment",
  ISSUES: "issues",
  ISSUE_COMMENT: "issue_comment",
  CHECK_RUN: "check_run",
  CHECK_SUITE: "check_suite",
  STATUS: "status",
  DEPLOYMENT_STATUS: "deployment_status",
  RELEASE: "release",
};

function constructEvent(eventType, signature, payload) {
  const source = "github";
  let time_created;
  let e_id;

  switch (eventType) {
    case EVENT_TYPE.PUSH: {
      time_created = payload.head_commit.timestamp;
      e_id = payload.head_commit.id;
      break;
    }
    case EVENT_TYPE.PULL_REQUEST: {
      time_created = payload.pull_request.updated_at;
      e_id = `${payload.repository.name}/${payload.number}`;
      break;
    }
    case EVENT_TYPE.PULL_REQUEST_REVIEW: {
      time_created = payload.review.submitted_at;
      e_id = payload.review.id;
      break;
    }
    case EVENT_TYPE.PULL_REQUEST_REVIEW_COMMENT: {
      time_created = payload.comment.updated_at;
      e_id = payload.comment.id;
      break;
    }
    case EVENT_TYPE.ISSUES: {
      time_created = payload.issue.updated_at;
      e_id = `${payload.repository.name}/${payload.issue.number}`;
      break;
    }
    case EVENT_TYPE.ISSUE_COMMENT: {
      time_created = payload.comment.updated_at;
      e_id = payload.comment.id;
      break;
    }
    case EVENT_TYPE.CHECK_RUN: {
      time_created =
        payload.check_run.completed_at || payload.check_run.started_at;
      e_id = payload.check_run.id;
      break;
    }
    case EVENT_TYPE.CHECK_SUITE: {
      time_created =
        payload.check_suite.updated_at || payload.check_run.created_at;
      e_id = payload.check_suite.id;
      break;
    }
    case EVENT_TYPE.DEPLOYMENT_STATUS: {
      time_created = payload.deployment_status.updated_at;
      e_id = payload.deployment_status.id;
      break;
    }
    case EVENT_TYPE.STATUS:
    case EVENT_TYPE.PING: {
      time_created = payload.hook.created_at;
      e_id = payload.hook_id;
      break;
    }
    case EVENT_TYPE.RELEASE: {
      time_created = payload.release.published_at || payload.release.created_at;
      e_id = payload.release.id;
      break;
    }

    default: {
      throw new Error("Not recognised event type");
    }
  }

  const github_event = {
    event_type: eventType,
    id: e_id,
    metadata: JSON.stringify(payload),
    time_created,
    signature,
    source,
  };

  return github_event;
}

export default async function github(req, res) {
  if (!req.headers["x-github-event"]) {
    throw new Error("Github not found");
  }

  const payload = JSON.parse(req.body.payload);

  const githubEvent = constructEvent(
    req.headers["x-github-event"],
    req.headers["x-hub-signature"],
    payload
  );

  const insertedRows = await insertRows({
    datasetId: "four_keys",
    tableId: "events_raw",
    rows: githubEvent,
  });

  res.status(200).json(githubEvent);
}
