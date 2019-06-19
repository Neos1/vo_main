
const ejsWallet = require('ethereumjs-wallet');
const hdKey = require('ethereumjs-wallet/hdkey');
const bip39 = require('bip39')
const walletHdPath = "m/44'/60'/0'/0/0";

const createWallet = ({mnemonic, password, action}) => {
  let wallet = hdKey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
                    .derivePath(walletHdPath)
                    .deriveChild(0)
                    .getWallet();

  let privateKey = wallet.getPrivateKeyString();
  let v3wallet = wallet.toV3(password);

  let message = {
    action,
    privateKey,
    wallet,
    v3wallet,
  }
  console.log(message)
  return message;
};

const readWallet = ({input, password}) =>{
  try {
    return ejsWallet
            .fromV3(input, password)  
            .getPrivateKeyString();
  } catch (e) {
    return e;
  }
}


onmessage = (e)=> {

  const { payload } = e.data;
  const { action } = payload;
  let response;

  switch (action) {
    case 'create':
      response = createWallet(payload);
      break;
    case 'read':
      response = readWallet(payload);
      break;
    case 'recover':
      response = createWallet(payload);
      break;
    default:
      response = null 
      break;
  }

  //console.log(response);

  if (response instanceof Error) {
    response = null;
  }
  
  self.postMessage(response);
}