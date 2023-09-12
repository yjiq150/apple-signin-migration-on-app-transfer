const fs = require('fs')
const jwt = require('jsonwebtoken')
const qs = require('qs')
const axios = require('axios')

/**
 * Generate client_secret for Apple API
 * @param {string} teamId
 * @param {string} keyId Key ID associated to Apple Sign-in can be found on https://developer.apple.com/account/resources/authkeys/list
 * @param {string} keyFilePath Absolute path to the '.p8' key file
 * @param {string} clientId App bundle ID without team ID prefix e.g., com.letmecompile.app
 * @returns {string} client_secret
 */
function generateClientSecret(teamId, keyId, keyFilePath, clientId) {
    const keyFile = fs.readFileSync(keyFilePath)

    return jwt.sign({}, keyFile, {
        algorithm: 'ES256',
        expiresIn: '30d',
        issuer: teamId,
        keyid: keyId,
        audience: 'https://appleid.apple.com',
        subject: clientId,
    })
}

/**
 * Get Apple API access token
 * @param {string} clientId App bundle ID without team ID prefix e.g., com.letmecompile.app
 * @param {string} clientSecret Value generated from generateClientSecret function
 * @returns {Promise<string>} accessToken for Apple API
 */
async function getAppleApiAccessToken(clientId, clientSecret) {
    const data = qs.stringify({
        'grant_type': 'client_credentials',
        'scope': 'user.migration',
        'client_id': clientId,
        'client_secret': clientSecret
    })

    const config = {
        method: 'post',
        url: 'https://appleid.apple.com/auth/token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data,
    }

    const response = await axios.request(config)
    return response.data.access_token
}

module.exports = {
    generateClientSecret,
    getAppleApiAccessToken,
}
