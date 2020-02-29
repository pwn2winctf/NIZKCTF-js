import libsodium from "libsodium-wrappers";

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
  }
};
