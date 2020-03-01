import GitHub from "./github";
import libsodium from "./libsodium";
import { getTeamPath } from "../../utils";

export default class NIZKCTF {
  constructor(token, local, upstream) {
    this.token = token;
    this.local = { owner: local.owner, repository: local.repository };
    this.upstream = { owner: upstream.owner, repository: upstream.repository };

    this.github = new GitHub(this.token);
  }

  async createTeam({ name, countries }) {
    const keys = await libsodium.createTeamKeys();

    const team = {
      crypt_pk: keys.crypt_pk,
      sign_pk: keys.sign_pk,
      name,
      countries
    };

    const path = getTeamPath(name);
    const message = `Register team ${name}`;

    const content = JSON.stringify(team);

    await this._push(message, path, content);
    return keys;
  }

  async _push(message, path, content, pullRequest = true) {
    await this._pull();
    const encodedContent = new Buffer(content).toString("base64");

    const branch = await libsodium.randomString(10);

    const ref = `refs/heads/${branch}`;
    const fileName = `${path}/team.json`;

    const branches = await this.github.listBranches(
      this.local.owner,
      this.local.repository
    );

    const shaOfMaster = branches.find(item => item.name === "master").commit
      .sha;

    await this.github.createBranch(
      this.local.owner,
      this.local.repository,
      ref,
      shaOfMaster
    );

    await this.github.createOrUpdateFile(
      this.local.owner,
      this.local.repository,
      fileName,
      message,
      encodedContent,
      branch
    );

    if (pullRequest) {
      await this.github.createPullRequest(
        this.upstream.owner,
        this.upstream.repository,
        message,
        `${this.local.owner}:${branch}`
      );
    }
  }

  async _pull() {
    const ref = "heads/master";

    const [upstreamRef, localRef] = await Promise.all([
      this.github.getRef(this.upstream.owner, this.upstream.repository, ref),
      this.github.getRef(this.local.owner, this.local.repository, ref)
    ]);

    if (upstreamRef.object.sha !== localRef.object.sha) {
      await this.github.updateRef(
        this.local.owner,
        this.local.repository,
        ref,
        upstreamRef.object.sha
      );
    }
  }
}

export { GitHub, libsodium };
