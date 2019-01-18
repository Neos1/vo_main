var gasPrice = web3.utils.toHex(1000000000),
    gasLimit = web3.utils.toHex(21000);

var address2nonce = {};

function signTx(txParams, hdpath, keystore, password, callback) {
    var rawTx,
        keystore = keystore,
        password = password,
        tx;
    getNonce(txParams.from)
        .then(function(nonce) {
            txParams.nonce = web3.utils.toHex(nonce);
            txParams.gasPrice = txParams.gasPrice ? txParams.gasPrice : gasPrice;
            txParams.gasLimit = txParams.gasLimit ? txParams.gasLimit : gasLimit;
            rawTx = txParams.abi && txParams.functionName && txParams.args ? 
                lightwallet.txutils.functionTx(txParams.abi, txParams.functionName, txParams.args, txParams) :
                lightwallet.txutils.valueTx(txParams);
            keystore.keyFromPassword(password, function(err, key) {
                if (!keystore.isDerivedKeyCorrect(key)) {
                    callback(new Error('wrong_password'), false);
                    return
                }
                tx = lightwallet.signing.signTx(keystore, key, rawTx, txParams.from, hdpath);
                if (callback) callback(false, tx);
            });
        }).catch(e => {
            if (callback) callback(e, false);
            return;
        })
}

function sendTransaction(tx, from) {
    address2nonce[from]++;
    return web3.eth.sendSignedTransaction("0x" + tx)
}

function getNonce(address) {
    return new Promise((resolve, reject) => {
        if (!address2nonce[address]) {
            web3.eth.getTransactionCount(address, 'pending').then(function(nonce) {
                address2nonce[address] = +nonce;
                resolve(nonce)
            }).catch(e => {
                reject(e);
            })
        } else {
            resolve(address2nonce[address]);
        }
    })
}

function decreaseNonce(address) {
    if (address2nonce[address]) address2nonce[address] -= 1;
}

export default signTx;
export { getNonce, signTx, sendTransaction, decreaseNonce }