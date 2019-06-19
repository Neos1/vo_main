const ejsWallet = require('ethereumjs-wallet');

onmessage = async (e) => {

  const { keystore, password } = JSON.parse(e.data);
  let privateKey
  try {
    privateKey = await ejsWallet.fromV3(keystore, password).getPrivateKeyString();
    self.postMessage({privateKey: privateKey, error: null});
  } catch (error) {
    self.postMessage({error:'error', privateKey: null});
  }
}