const ENV = 'production'//process.env.NODE_ENV !== 'production' ? 'development' : 'production';
const IMAGE_PATH = './img/';

window.__ENV = ENV;

export {
    ENV,
    IMAGE_PATH,
};
