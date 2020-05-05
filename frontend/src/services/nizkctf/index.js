import GitHub from "./github";
import GitLab from "./gitlab";
import libsodium from "./libsodium";
import { getTeamPath } from "../../utils";

import { deployPath } from "../../config";

const repohostDict = { github: GitHub, gitlab: GitLab };

export default class NIZKCTF {
  constructor(token, local, upstream, repohost, team = undefined) {
    if (!repohostDict[repohost]) {
      throw new TypeError(`Invalid repohost: ${repohost}`);
    }
    this.token = token;
    this.local = local;
    this.upstream = upstream;

    this.api = new repohostDict[repohost](this.token);
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
    try {
      await this._push(message, path, content, "team.json");
      return keys;
    } catch (err) {
      if (err.message.includes('"sha" wasn\'t supplied.')) {
        throw new Error("There is already a team with that name");
      } else {
        console.error(err);
        throw new Error(err);
      }
    }
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
      const { sha, content } = await this.api.getContents(
        this.upstream,
        `${path}/${challenge.id}.csv`
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
      `${challenge.id}.csv`,
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

    const file = `${path}/${fileName}`;

    const branches = await this.api.listBranches(this.local);

    const shaOfUpstream = branches.find(item => item.name === "upstream").sha;

    await this.api.createBranch(this.local, branch, shaOfUpstream);

    await this.api.createOrUpdateFile(
      this.local,
      file,
      message,
      encodedContent,
      branch,
      shaOfFile
    );

    if (pullRequest) {
      const response = await this.api.createPullRequest(
        this.local,
        branch,
        message,
        this.upstream,
        "master"
      );
      return response;
    }
  }

  async _pull() {
    return this.api.updateFromUpstream(this.local, this.upstream, "master");
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

    const onCompleted = event => {
      worker.terminate();
      resolve(event.data.result);
    };

    const onError = event => {
      worker.terminate();
      reject(event.data.result);
    };

    const action = { ready: onReady, completed: onCompleted, error: onError };

    worker.onmessage = event => {
      action[event.data.message](event);
    };
  });

export { GitHub, GitLab, libsodium };
