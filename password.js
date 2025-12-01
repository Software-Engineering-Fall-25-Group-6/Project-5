const crypto = require("crypto");

/**
 * Return a salted and hashed password entry from a clear text password.
 * @param {string} clearTextPassword
 * @return {object} passwordEntry where passwordEntry is an object with two
 * string properties:
 *    salt - The salt used for the password.
 *    hash - The sha1 hash of the password and salt.
 */
function makePasswordEntry(clearTextPassword) {
    console.log("Creating password entry for:", clearTextPassword);

    let salt = crypto.randomBytes(8);
    salt = salt.toString("hex");

    const hash = crypto.createHash("sha1", "moka");

    hash.update(salt + clearTextPassword);
    
    return {
        salt: salt,
        hash: hash.digest("hex"),
    };
}
/**
 * Return true if the specified clear text password and salt generates the
 * specified hash.
 * @param {string} hash
 * @param {string} salt
 * @param {string} clearTextPassword
 * @return {boolean}
 */
function doesPasswordMatch(hash, salt, clearTextPassword) {
    const hashToCheck = crypto.createHash("sha1", "moka");

    hashToCheck.update(salt + clearTextPassword);

    let equalPass = hash === hashToCheck.digest("hex");

    return equalPass;
}

exports.makePasswordEntry = makePasswordEntry;
exports.doesPasswordMatch = doesPasswordMatch;
