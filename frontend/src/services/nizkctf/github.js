import { Octokit } from "@octokit/rest";

export const repoNameHandler = repoName => {
  const [owner, repo] = repoName.split("/");
  return { owner, repo };
};

export default class GitHub {
  constructor(token) {
    this.octokit = new Octokit({
      auth: token
    });
  }

  async getUser() {
    const { data } = await this.octokit.request("/user");

    const username = data.login;
    const { name, avatar_url, id } = data;

    return { avatar_url, name, username, id };
  }

  async createFork(repoName) {
    const { owner, repo } = repoNameHandler(repoName);

    const { data } = await this.octokit.repos.createFork({ owner, repo });

    return { path: data.full_name };
  }

  async createOrUpdateFile(
    repoName,
    path,
    message,
    content,
    branch = "master",
    sha = undefined
  ) {
    const { owner, repo } = repoNameHandler(repoName);
    const { data } = await this.octokit.repos.createOrUpdateFile({
      owner,
      repo,
      path,
      message,
      content,
      sha,
      branch
    });
    return { path: data.content.path };
  }

  async createPullRequest(
    sourceRepo,
    sourceBranch,
    title,
    targetRepo,
    targetBranch
  ) {
    const sourceRepoInfo = repoNameHandler(sourceRepo);
    const { owner, repo } = repoNameHandler(targetRepo);

    const head = `${sourceRepoInfo.owner}:${sourceBranch}`;

    const { data } = await this.octokit.pulls.create({
      owner,
      repo,
      title,
      head,
      base: targetBranch,
      maintainer_can_modify: false
    });
    return {
      number: data.number,
      head_sha: data.head.sha,
      base_sha: data.base.sha,
      url: data.html_url
    };
  }

  async listPullRequests(repoName, username, state) {
    const status = state === "opened" ? "open" : state;

    const { owner, repo } = repoNameHandler(repoName);

    const query = `is:pr+repo:${owner}/${repo}+author:${username}+state:${status}`;

    const { data } = await this.octokit.search.issuesAndPullRequests({
      q: query
    });

    return data.items.map(item => ({
      number: item.number,
      state: item.state === "open" ? "opened" : item.state,
      title: item.title,
      url: item.html_url
    }));
  }

  async checkState(repoName, pull_number) {
    const { owner, repo } = repoNameHandler(repoName);

    const { data } = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number
    });

    const { state, number, merged, title, html_url } = data;
    const status = merged ? "merged" : state === "open" ? "opened" : state;

    return { title, state: status, url: html_url, number };
  }

  async createBranch(repoName, branchName, sha) {
    const { owner, repo } = repoNameHandler(repoName);
    const ref = `refs/heads/${branchName}`;

    const { url } = await this.octokit.git.createRef({
      owner,
      repo,
      ref,
      sha
    });
    return { name: branchName, url };
  }

  async listBranches(repoName) {
    const { owner, repo } = repoNameHandler(repoName);
    const { data } = await this.octokit.repos.listBranches({
      owner,
      repo
    });

    return data.map(({ name, commit }) => ({
      name,
      sha: commit.sha,
      url: commit.url
    }));
  }

  async getBranch(repoName, branch) {
    const { owner, repo } = repoNameHandler(repoName);
    const { data } = await this.octokit.repos.getBranch({
      owner,
      repo,
      branch
    });

    return {
      name: data.name,
      sha: data.commit.sha,
      url: data.commit.url
    };
  }

  async getContents(repoName, path = "") {
    const { owner, repo } = repoNameHandler(repoName);

    const { data } = await this.octokit.repos.getContents({
      owner,
      repo,
      path
    });
    return Array.isArray(data)
      ? data.map(({ name, sha, content }) => ({ name, sha, content }))
      : { name: data.name, sha: data.sha, content: data.content };
  }

  async getPullRequest(repoName, pullNumber) {
    const { owner, repo } = repoNameHandler(repoName);

    const { data } = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber
    });

    return {
      number: data.number,
      head_sha: data.head.sha,
      base_sha: data.base.sha
    };
  }

  async updateFromUpstream(originRepo, upstreamRepo, upstreamBranch) {
    const title = "Update from upstream";

    const { owner, repo } = repoNameHandler(originRepo);

    try {
      const { head_sha } = await this.createPullRequest(
        upstreamRepo,
        upstreamBranch,
        title,
        originRepo,
        "upstream"
      );
      await this.__updateRef(owner, repo, "heads/upstream", head_sha);
    } catch (err) {
      if (
        err.errors[0].message.startsWith("A pull request already exists for")
      ) {
        const pullRequest = (
          await this.listPullRequests(originRepo, owner, "opened")
        )[0];
        const { head_sha } = await this.getPullRequest(
          originRepo,
          pullRequest.number
        );
        await this.__updateRef(owner, repo, "heads/upstream", head_sha);
      } else if (!err.errors[0].message.startsWith("No commits between")) {
        throw err;
      }
    }
  }

  async __updateRef(owner, repo, ref, sha) {
    const response = await this.octokit.git.updateRef({
      owner,
      repo,
      ref,
      sha
    });
    return response.data;
  }
}
