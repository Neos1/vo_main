const ENV = 'development' //process.env.NODE_ENV == 'production'? process.env.NODE_ENV : 'development';
const IMAGE_PATH = './img/';
const SOL_PATH_REGEXP = new RegExp(/(\"|\')((\.{1,2}\/){1,})(\w+\/){0,}?(\w+\.(?:sol))(\"|\')/g);
const SOL_IMPORT_REGEXP = new RegExp(/(import)*.(\"|\')((\.{1,2}\/){1,})(\w+\/){0,}?(\w+\.(?:sol))(\"|\')(;)/g);
const SOL_VERSION_REGEXP = new RegExp(/(pragma).(solidity).((\^)?)([0-9](.)?){1,}/g);


window.__ENV = ENV;

export {
    ENV,
    IMAGE_PATH,
    SOL_PATH_REGEXP,
    SOL_IMPORT_REGEXP,
    SOL_VERSION_REGEXP
};