import libsodium from "libsodium-wrappers-sumo";

export default {
  async createTeamKeys() {
    await libsodium.ready;

    const {
      publicKey: crypt_pk,
      privateKey: crypt_sk
    } = await libsodium.crypto_box_keypair();
    const {
      publicKey: sign_pk,
      privateKey: sign_sk
    } = await libsodium.crypto_sign_keypair();

    return {
      crypt_pk: Buffer.from(crypt_pk).toString("base64"),
      crypt_sk: Buffer.from(crypt_sk).toString("base64"),
      sign_pk: Buffer.from(sign_pk).toString("base64"),
      sign_sk: Buffer.from(sign_sk).toString("base64")
    };
  },

  async randomString(size) {
    await libsodium.ready;
    return libsodium.randombytes_buf(size, "hex").toLowerCase();
  },

  async cryptoPwhashScryptsalsa208sha256(password, salt, opsLimit, memLimit) {
    await libsodium.ready;

    return await libsodium.crypto_pwhash_scryptsalsa208sha256(
      libsodium.crypto_sign_SEEDBYTES,
      password,
      salt,
      opsLimit,
      memLimit
    );
  },

  async cryptoSignSeedKeypair(seed) {
    await libsodium.ready;
    return await libsodium.crypto_sign_seed_keypair(seed);
  },

  async cryptoSign(message, privateKey) {
    await libsodium.ready;
    return await libsodium.crypto_sign(message, privateKey)
  }
};
