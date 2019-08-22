import {
  SOL_PATH_REGEXP,
  SOL_IMPORT_REGEXP,
  SOL_VERSION_REGEXP,
} from '../../../constants/common';


const unite = (type) => {
  const path_to_voter = window.__ENV === 'production' ?
    path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, './contracts/Voter') :
    path.join(window.process.env.INIT_CWD, './contracts/Voter');
  const path_to_erc = window.__ENV === 'production' ?
    path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, './contracts') :
    path.join(window.process.env.INIT_CWD, './contracts');

  const path_to_contract = type == 'token' ? path_to_erc : path_to_voter;

  const compiler = 'pragma solidity ^0.4.24;';
  try {
    let mainContract;
    let imports;
    const files = {};
    const rootFile = type == 'token' ? "./ERC20.sol" : "./Voter.sol";
    mainContract = fs.readFileSync(path.join(path_to_contract, rootFile), 'utf8');

    while (mainContract.match(SOL_IMPORT_REGEXP)) {
      imports = mainContract.match(SOL_PATH_REGEXP);
      imports.forEach((file) => {
        file = file.replace(new RegExp(/(\'|\")/g), '');
        const absolute_path = path.join(path_to_contract, file);
        if (!files[absolute_path]) {
          let add_sol = fs.readFileSync(absolute_path, 'utf8');
          add_sol = add_sol.replace(add_sol.match(SOL_VERSION_REGEXP), '');
          mainContract = mainContract.replace(mainContract.match(SOL_IMPORT_REGEXP)[0], add_sol);
          files[absolute_path] = true;
        } else {
          mainContract = mainContract.replace(mainContract.match(SOL_IMPORT_REGEXP)[0], '');
        }
      });
    }
    mainContract = mainContract.replace(SOL_VERSION_REGEXP, compiler);
    mainContract = mainContract.replace(new RegExp(/(calldata)/g), '');
    fs.writeFileSync(path.join(path_to_contract, './output.sol'), mainContract, 'utf8');
  } catch (e) {
  }
};

export {
  unite,
};