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
    branch = "master",
    sha = undefined
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
  createPullRequest = (owner, repo, title, head, base = "master") =>
    this.octokit.pulls.create({
      owner,
      repo,
      title,
      head,
      base
    });
  createBranch = (owner, repo, ref, sha) =>
    this.octokit.git.createRef({
      owner,
      repo,
      ref,
      sha
    });
}
