window.fs = window.require('fs');
const path = require('path')
const ACCOUNTS = window.__ENV == 'development'
    ? JSON.parse(window.fs.readFileSync("C:/Users/User/Documents/git/voter/src/wallets.json", 'utf8'))
    : JSON.parse(window.fs.readFileSync(path.join(window.process.env.PORTABLE_EXECUTABLE_DIR, 'wallets/wallets.json'), 'utf8'))
/*{
    "0xd6cd1cf10a681cabe674942459d1b2f955c7bd69": {
        wallet_object: {
            "salt": "6NPFL80CtnvS9YZaoP4NbaUZ8RlCR601KPX/SX7ybf0=",
            "encSeed": {
                "nonce": "XSEFXxb7d5Jr1i2Jxo66ApXiJtd9AkXr",
                "encStr": "rf9j2EX6aiP1YPcjYPY6ef9TP0IV1mWjQh7BxpuF4ratSORm6FeAk27MsMSk48A21hCW9BU1ku2AGecof9TMltP7TYtcWtTbZTeZb47MbaMQDYD9EKnt84dAUOWnAQ2CMDsZ7ZMJnr4tCboLn8wuaC9HnyRbU4owrDxayFzGQhYisBg9AJ56pA=="
            },
            "hdIndex": 1,
            "version": 3,
            "addresses": ["d6cd1cf10a681cabe674942459d1b2f955c7bd69"],
            "encPrivKeys": {
                "d6cd1cf10a681cabe674942459d1b2f955c7bd69": {
                    "key": "hn23eKwaJfH+uFL7t34/cNOgfFxCUGxjMBtG2FGxBQeOrtc72w4vZ7LiEMv5V173",
                    "nonce": "Np40LDEvMWpQenOIQkdoGIYPQeg35x64"
                }
            },
            "hdPathString": "m/44'/60'/0'/0",
            "encHdRootPriv": {
                "nonce": "EGA0Jeb+8W1oRDhPrtpq/j8DF6R3MY21",
                "encStr": "YTPD4w4MxRB9JYJG0jnLeXQiFAA4KOIXtfBZmOQIBrYVnbJ4LDY8cbXg9LA9lZK2x31mAcSq8lh3KE9ToJYkyMlmwUTy1hN/NhH4/hv17p/rEh2EXdZERwJIWEZ9KkBfWFRTg/0mD/vNkfXOMVVVvPApjGoImuFge4xHII0Rlw=="
            }
        },
        name: "Александр"
    },
    "0x105b1d0000e6a126385421b50a30e3988c3c2d21": {
        wallet_object: {
            "salt": "unISTTUWambvx0Gln2BgJQlLOj87AHJ3GK+p8u0IH3Q=",
            "encSeed": {
                "nonce": "UBMHzLKjFqz3rnhoe2VLzIZ8CHeHILMm",
                "encStr": "iBHRk16+7fGgFmLMeumb0Sre9RGWyuuRtwG1PuGDfegLYRKcQRXkTjUxzuPV/awQohlWbxvOWhNiOFIEnR+g9mWdAO3tuTMPGGCWP2vmxWLzmROROa1Cwqhy3hj9bN2OYf+2XlPNJBjmA0VP8eobu9bQlR3+0PpOesT6OjX9q23vWn3Ckpz1AA=="
            },
            "hdIndex": 1,
            "version": 3,
            "addresses": ["105b1d0000e6a126385421b50a30e3988c3c2d21"],
            "encPrivKeys": {
                "105b1d0000e6a126385421b50a30e3988c3c2d21": {
                    "key": "NF0U9q4M7OCfi5Y3r+ZhWPI4SqI160pA+HPGgbE9fXEsN+CC97OB4kMLst7ESi1y",
                    "nonce": "Cbu6iHNAcn3YUpni5uLDN44rjDIEITnb"
                }
            },
            "hdPathString": "m/44'/60'/0'/0",
            "encHdRootPriv": {
                "nonce": "yYRJZIRRjT2wx5I5Ap4UQyFyW+SXjg27",
                "encStr": "ZscPVLxEsWkDPF7Yf5C3zlSTbKlouzIK0jzx382/gPhQxMnuxCjBRBsg01xPYw3hOS+JkaoPw0r/W8KOlyRMzWaiK57XBF3UvsmYE2phfOj4sHRt9HR/A/C7G5bBl2+w7K7fO8/EL42PIz89bKVgtq/WXvXWvyeSBVvWqQsckA=="
            }
        },
        name: "Владимир"
    },
};*/

export {
    ACCOUNTS
}