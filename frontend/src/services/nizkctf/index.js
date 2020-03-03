import GitHub from "./github";
import libsodium from "./libsodium";
import { getTeamPath } from "../../utils";

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

    const content = Buffer.from(proof).toString("base64");

    await this._push(message, path, content, "submissions.csv");
  }

  async _lookupFlag(flag, challenge) {
    const { scrypt_ops_limit, scrypt_mem_limit } = {
      scrypt_ops_limit: 33554432,
      scrypt_mem_limit: 402653184
    };

    const decodedPk = Buffer.from(challenge.pk, "base64");
    const decodedSalt = Buffer.from(challenge.salt, "base64");

    const challengeSeed = await libsodium.cryptoPwhashScryptsalsa208sha256(
      flag,
      decodedSalt,
      scrypt_ops_limit,
      scrypt_mem_limit
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

  async _push(message, path, content, fileName, pullRequest = true) {
    await this._pull();
    const encodedContent = new Buffer(content).toString("base64");

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
