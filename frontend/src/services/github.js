import { Octokit } from "@octokit/rest";

class GitHub {
  constructor(token) {
    this.octokit = new Octokit({
      auth: token
    });
  }

  getUser = () => this.octokit.request("/user");
}

export default (function() {
  let instance;

  function createInstance(token) {
    const github = new GitHub(token);
    return github;
  }

  return {
    getInstance: function(token) {
      if (!instance) {
        instance = createInstance(token);
      }
      return instance;
    }
  };
})();
