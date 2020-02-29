import { Octokit } from "@octokit/rest";

export default class GitHub {
  constructor(token) {
    this.octokit = new Octokit({
      auth: token
    });
  }

  async getUser() {
    const response = await this.octokit.request("/user");
    return response.data;
  }

  async createFork(owner, repo) {
    const response = await this.octokit.repos.createFork({ owner, repo });
    return response.data;
  }

  async createOrUpdateFile(
    owner,
    repo,
    path,
    message,
    content,
    branch = "master",
    sha = undefined
  ) {
    const response = await this.octokit.repos.createOrUpdateFile({
      owner,
      repo,
      path,
      message,
      content,
      sha,
      branch
    });
    return response.data;
  }

  async createPullRequest(owner, repo, title, head, base = "master") {
    const response = await this.octokit.pulls.create({
      owner,
      repo,
      title,
      head,
      base
    });
    return response.data;
  }

  async createBranch(owner, repo, ref, sha) {
    const response = await this.octokit.git.createRef({
      owner,
      repo,
      ref,
      sha
    });
    return response.data;
  }

  async listBranches(owner, repo) {
    const response = await this.octokit.repos.listBranches({
      owner,
      repo
    });
    return response.data;
  }
}
