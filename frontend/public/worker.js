
self.sodium = {
    onload: function (sodium) {
        postMessage({message: "submit-flag"});
    }
};

onmessage = function (ev) {
    switch (ev.data.cmd) {
        case 'start-work':
            let startTime = new Date();
            let hash = sodium.crypto_pwhash_scryptsalsa208sha256(
                sodium.crypto_sign_SEEDBYTES,
                ev.data.value.password,
                buffer.Buffer.from(ev.data.value.salt.salt, "base64"),
                33554432,
                402653184
            );

            postMessage({
                message: 'worker-completed',
                result: `crypto_pwhash finish in ${((new Date()) - startTime) / 1000} seconds.`
            });
            break;
    }
};


importScripts('lib/sodium.js');
importScripts('lib/buffer.js');

