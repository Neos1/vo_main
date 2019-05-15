/*-------------------------------------------------------*/
/* declarations */

function preparePath(lng, path) { return `/${path}`; }
function getRoutePrefix() { return ':lng'; }

/*-------------------------------------------------------*/
/* export */

export {
    getRoutePrefix,
    preparePath,
};