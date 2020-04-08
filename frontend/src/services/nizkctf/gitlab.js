import { Gitlab } from "@gitbeaker/node";

export default class GitLab {
  constructor(token) {
    this.api = new Gitlab({
      oauthToken: token
    });
  }

  async getUser() {
    const response = await this.api.Users.current();
    const { avatar_url, name, username } = response;
    return { avatar_url, name, username };
  }

  async createFork(repo) {
    try {
      const response = await this.api.Projects.fork(repo);
      return { path: response[0].path_with_namespace };
    } catch (error) {
      const response = await this.api.Projects.forks(repo, { owned: true });
      return { path: response[0].id };
    }
  }

  async createOrUpdateFile(
    repo,
    path,
    message,
    content,
    branch = "master",
    sha = undefined
  ) {
    try {
      const response = await this.api.RepositoryFiles.edit(
        repo,
        path,
        branch,
        content,
        message,
        {
          last_commit_id: sha
        }
      );
      return { path: response.file_path };
    } catch (err) {
      const response = await this.api.RepositoryFiles.create(
        repo,
        path,
        branch,
        content,
        message
      );
      return { path: response.file_path };
    }
  }

  async createPullRequest(
    sourceRepo,
    sourceBranch,
    title,
    targetRepo,
    targetBranch
  ) {
    const { iid, diff_refs } = await this.api.MergeRequests.create(
      sourceRepo,
      sourceBranch,
      targetBranch,
      title,
      {
        target_project_id: targetRepo
      }
    );

    return {
      number: iid,
      base_sha: diff_refs.base_sha,
      head_sha: diff_refs.head_sha
    };
  }
  async listPullRequests(projectId, authorUsername, state) {
    const response = await this.api.MergeRequests.all({
      projectId,
      authorUsername,
      state
    });

    return response.map(({ iid, title, state, web_url }) => ({
      number: iid,
      title,
      state,
      url: web_url
    }));
  }

  // TODO
  async checkState(owner, repo, pull_number) {
    console.log(owner, repo, pull_number);
  }

  // TODO
  async getRef(owner, repo, ref) {
    console.log(owner, repo, ref);
  }

  // TODO
  async updateRef(owner, repo, ref, sha) {
    console.log(owner, repo, ref, sha);
  }

  // TODO
  async getContents(owner, repo, path) {
    console.log(owner, repo, path);
  }

  // TODO CHECK
  async createBranch(repo, branch, sha) {
    const response = await this.api.Branches.create(repo, branch, sha);
    return response;
  }

  // TODO
  async listBranches(repo) {
    console.log(repo);
  }
}
