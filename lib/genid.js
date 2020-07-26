const bignum = require('bignum');
const crypto = require('crypto');

module.exports = exports = function() {

    /*
     * Default encoding alphabets
     * URL-friendly base-64 encoding is chosen.  Base-32 is best suited
     * for tiny-URL like applications, because I and 1 can't be confused
     * and the upper-case characters are more easily remembered by a human.
     *
     * Where "native", we use the bignum native encoding routine.
     */
    const defaultAlphabets = {
        10: "native",
        16: "native",
        32: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
        36: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        62: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
        64: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    };


    // Convert the bignum to a string with the given base
    function bignumToString(bignum, base, alphabet) {
        // Prefer native conversion
        if (alphabet === "native" && base != 6) {
            return bignum.toString(base);
        }

        // Old-sk00l conversion
        const result = [];

        while (bignum.gt(0)) {
            const ord = bignum.mod(base);
            result.push(alphabet.charAt(ord));
            // noinspection JSUnresolvedFunction
            bignum = bignum.div(base);
        }

        return result.reverse().join("");
    }


    return function(options, cb) {
        const len = options.len || 7;
        // if an alphabet was specified it takes priority
        // otherwise use the default alphabet for the given base
        const base = options.alphabet ? options.alphabet.length : (options.base || 64);
        const alphabet = options.alphabet || defaultAlphabets[base];

        if (!alphabet) {
            const err = new Error(
                "Only base " +
                Object.keys(defaultAlphabets).join(", ") +
                " supported if an alphabet is not provided."
            );
            cb(err, null);
            return;
        }

        // Generate a random byte string of the required length
        const bytes = Math.floor(len * Math.log(base) / Math.log(256));
        crypto.pseudoRandomBytes(bytes, function(err, buf) {

            // Propagate errors...
            if (err) {
                cb(err, null);
                return;
            }

            // Convert to the required base
            const num = bignum.fromBuffer(buf);
            let id = bignumToString(num, base, alphabet);

            // Prefix with the first char to reach the desired fixed length string
            id = Array(len - id.length + 1).join(alphabet[0]) + id;

            cb(null, id);
        });
    };
}();
