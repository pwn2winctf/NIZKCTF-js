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

  async mergePullRequest(owner, repo, pull_number) {
    const response = await this.octokit.pulls.merge({
      owner,
      repo,
      pull_number
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

  async getRef(owner, repo, ref) {
    const response = await this.octokit.git.getRef({ owner, repo, ref });
    return response.data;
  }

  async updateRef(owner, repo, ref, sha) {
    const response = await this.octokit.git.updateRef({
      owner,
      repo,
      ref,
      sha
    });
    return response.data;
  }

  async getContents(owner, repo, path) {
    const response = await this.octokit.repos.getContents({
      owner,
      repo,
      path
    });
    return response.data;
  }
}
