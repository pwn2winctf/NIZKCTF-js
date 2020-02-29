import { Octokit } from "@octokit/rest";

export default class GitHub {
  constructor(token) {
    this.octokit = new Octokit({
      auth: token
    });
  }

  getUser = () => this.octokit.request("/user");
  createFork = (owner, repo) => this.octokit.repos.createFork({ owner, repo });
  createOrUpdateFile = (
    owner,
    repo,
    path,
    message,
    content,
    sha = undefined,
    branch = "master"
  ) =>
    this.octokit.repos.createOrUpdateFile({
      owner,
      repo,
      path,
      message,
      content,
      sha,
      branch
    });
}
