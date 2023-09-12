const path = require('path')
const axios = require('axios')
const qs = require('qs')
const { generateClientSecret, getAppleApiAccessToken } = require('./apple-auth')

/**
 * Get Apple Transfer ID for a user
 * @param clientId
 * @param clientSecret
 * @param accessToken
 * @param teamScopedIdForUser
 * @param receivingTeamId
 * @returns {Promise<string>}
 */
async function getAppleTransferId(clientId, clientSecret, accessToken, teamScopedIdForUser , receivingTeamId) {
    const data = qs.stringify({
        sub: teamScopedIdForUser,
        target: receivingTeamId,
        client_id: clientId,
        client_secret: clientSecret,
    })

    const config = {
        method: 'post',
        url: 'https://appleid.apple.com/auth/usermigrationinfo',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    }

    const response = await axios.request(config)
    return response.data.transfer_sub
}

// Refer to official document for more information
// - https://developer.apple.com/documentation/sign_in_with_apple/transferring_your_apps_and_users_to_another_team
async function main() {
    // TODO: Modify the following parameters to your own
    const sendingTeamId = 'S12341234P'
    const sendingTeamKeyId = 'T12341234L'
    const sendingTeamKeyFilePath = path.join(__dirname, 'Example_AuthKey_T12341234L.p8')
    const clientId = 'com.example.app'
    const receivingTeamId = 'R12341234P'

    // Just one appleId is used here for example. You usually should loop through all the users with Apple Sign-in.
    // Team scoped identifier for each user
    const appleId = '000506.5951a85d72c445918250badf39181d0f.0331'

    const clientSecret = generateClientSecret(sendingTeamId, sendingTeamKeyId, sendingTeamKeyFilePath, clientId)

    const accessToken = await getAppleApiAccessToken(clientId, clientSecret)

    const appleTransferId = await getAppleTransferId(clientId, clientSecret, accessToken, appleId, receivingTeamId)

    // Store this mappings in your user database before transfering app.
    console.log(`TransferID for ${appleId} is ${appleTransferId}`)
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})
