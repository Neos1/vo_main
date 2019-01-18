/*-------------------------------------------------------*/
/* declarations */

function preparePath(lng, path) { return `/${lng}${path}`; }
function getRoutePrefix() { return ':lng'; }

/*-------------------------------------------------------*/
/* export */

export {
    getRoutePrefix,
    preparePath,
};