import GitHub from "./github";
import libsodium from "./libsodium";
import { getTeamPath } from "../../utils";

import { deployPath } from "@/config";

export default class NIZKCTF {
  constructor(token, local, upstream, team = undefined) {
    this.token = token;
    this.local = { owner: local.owner, repository: local.repository };
    this.upstream = { owner: upstream.owner, repository: upstream.repository };

    this.github = new GitHub(this.token);
    this.team = team;
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

    await this._push(message, path, content, "team.json");
    return keys;
  }

  async submitFlag(flag, challenge) {
    const keys = await this._lookupFlag(flag, challenge);

    if (!keys) {
      throw new Error("This is not the correct flag.");
    }

    const proof = await this._createProof(challenge, keys.privateKey);

    const path = getTeamPath(this.team.name);
    const message = `Proof: found flag for ${challenge.id}`;

    const newProof = Buffer.from(proof).toString("base64");

    let currentContent = newProof;
    let shaOfFile = undefined;

    try {
      const { sha, content } = await this.github.getContents(
        this.upstream.owner,
        this.upstream.repository,
        `${path}/submissions.csv`
      );

      const decodedContent = new Buffer.from(content, "base64").toString();
      shaOfFile = sha;

      currentContent = currentContent.concat("\n", decodedContent);
    } catch (err) {
      console.error(err);
    }

    return this._push(
      message,
      path,
      currentContent,
      "submissions.csv",
      true,
      shaOfFile
    );
  }

  async _lookupFlag(flag, challenge) {
    const decodedPk = Buffer.from(challenge.pk, "base64");
    const decodedSalt = Buffer.from(challenge.salt, "base64");

    const { opslimit, memlimit } = challenge;

    const challengeSeed = await cryptoPwhash(
      flag,
      decodedSalt,
      opslimit,
      memlimit
    );
    const keys = await libsodium.cryptoSignSeedKeypair(challengeSeed);

    if (decodedPk.compare(Buffer.from(keys.publicKey)) !== 0) {
      return null;
    }

    return keys;
  }

  async _createProof(challenge, privateKey) {
    const decodedTeamSk = Buffer.from(this.team.sign_sk, "base64");

    const membershipProof = await libsodium.cryptoSign(
      challenge.id,
      decodedTeamSk
    );
    const proof = await libsodium.cryptoSign(membershipProof, privateKey);
    return proof;
  }

  async _push(
    message,
    path,
    content,
    fileName,
    pullRequest = true,
    shaOfFile = undefined
  ) {
    await this._pull();
    const encodedContent = Buffer.from(content).toString("base64");

    const branch = await libsodium.randomString(10);

    const ref = `refs/heads/${branch}`;
    const file = `${path}/${fileName}`;

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
      file,
      message,
      encodedContent,
      branch,
      shaOfFile
    );

    if (pullRequest) {
      const response = await this.github.createPullRequest(
        this.upstream.owner,
        this.upstream.repository,
        message,
        `${this.local.owner}:${branch}`
      );
      return response;
    }
  }

  async _pull() {
    const title = "Update from upstream";
    const head = `${this.upstream.owner}:master`;

    return this.github
      .createPullRequest(this.local.owner, this.local.repository, title, head)
      .catch(() => {})
      .then(({ head }) => {
        return this.github.updateRef(
          this.local.owner,
          this.local.repository,
          "heads/master",
          head.sha
        );
      })
      .catch(() => {});
  }
}

const cryptoPwhash = (password, salt, opslimit, memlimit) =>
  new Promise((resolve, reject) => {
    const worker = new Worker(`${deployPath}/worker.js`);

    const onReady = () => {
      worker.postMessage({
        cmd: "start-work",
        value: {
          password,
          salt,
          opslimit,
          memlimit
        }
      });
    };

    const onCompleted = () => {
      worker.terminate();
      resolve(event.data.result);
    };

    const onError = () => {
      worker.terminate();
      reject(event.data.result);
    };

    const action = { ready: onReady, completed: onCompleted, error: onError };

    worker.onmessage = event => {
      action[event.data.message]();
    };
  });

export { GitHub, libsodium };
