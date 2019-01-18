const lng = {};
const locales = {
    "ru": "Русский",
    "en": "English",
    "de": "Germany",
    "cn": "China",
    "pt": "Portugal",
    "es": "Español",
    "jp": "Japan",
    "in": "India",
    "fr": "Français",
    "el": "ελληνικά"
};
const available = {
    "ru": {
        "name": "Russia",
        "flag": "lang_ru.png",
        "class": "ru",
        "active": true
    },
    "de": {
        "name": "Germany",
        "flag": "lang_germany.png",
        "class": "gm",
        "active": false
    },
    "cn": {
        "name": "China",
        "flag": "lang_china.png",
        "class": "cn",
        "active": false
    },
    "en": {
        "name": "United Kingdom",
        "flag": "lang_uk.png",
        "class": "en",
        "active": true
    },
    "es": {
        "name": "Spain",
        "flag": "lang_spain.png",
        "class": "sp",
        "active": false
    },
    "in": {
        "name": "India",
        "flag": "lang_india.png",
        "class": "in",
        "active": false
    },
    "pt": {
        "name": "Portugal",
        "flag": "lang_portugal.png",
        "class": "pt",
        "active": false
    },
    "jp": {
        "name": "Japanese",
        "flag": "lang_japanese.png",
        "class": "jp",
        "active": false
    }
};

export default lng;
export {
    lng,
    locales,
    available
}