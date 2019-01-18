function Storage() {
    try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return sessionStorage;
    } catch (err) {
        var cookie = {
            getItem: function(name) {
                var matches = document.cookie.match(new RegExp( "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
                return matches ? decodeURIComponent(matches[1]) : undefined;
            },
            setItem: function(name, value, options) {
                var options = options || {},
                    expires = options.expires,
                    updatedCookie;
        
                if (typeof expires == "number" && expires) {
                    var d = new Date();
                    d.setTime(d.getTime() + expires * 1000);
                    expires = options.expires = d;
                }
                if (expires && expires.toUTCString) {
                    options.expires = expires.toUTCString();
                }
        
                value = encodeURIComponent(value);
                updatedCookie = name + "=" + value;
        
                for (var propName in options) {
                    updatedCookie += "; " + propName;
                    var propValue = options[propName];
                    if (propValue !== true) {
                        updatedCookie += "=" + propValue;
                    }
                }
        
                document.cookie = updatedCookie;
            },
            removeItem: function (name) {
                this.setItem(name, "", {
                    path: '/',
                    expires: -1
                });
            }
        };
        return cookie;
    }
};

var storage = new Storage();
window.storage = storage;

export default storage;
export {Storage};