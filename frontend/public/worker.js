
self.sodium = {
    onload: function (sodium) {
        postMessage({ message: "ready" });
    }
};

onmessage = function (event) {
    if (event.data.cmd === 'start-work') {
        try {
            let hash = sodium.crypto_pwhash(
                sodium.crypto_sign_SEEDBYTES,
                event.data.value.password,
                buffer.Buffer.from(event.data.value.salt, "base64"),
                event.data.value.opslimit,
                event.data.value.memlimit,
                sodium.crypto_pwhash_ALG_ARGON2ID13
            );

            postMessage({
                message: 'completed',
                result: hash
            });
        } catch (err) {
            postMessage({
                message: 'error',
                result: err
            });
        }
    }
};

importScripts('/NIZKCTF-js/lib/sodium.js');
importScripts('/NIZKCTF-js/lib/buffer.js');

