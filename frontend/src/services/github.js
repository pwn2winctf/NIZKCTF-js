import { Octokit } from "@octokit/rest";

export default class GitHub {
  constructor(token) {
    this.octokit = new Octokit({
      auth: token
    });
  }

  getUser = () => this.octokit.request("/user");
}
