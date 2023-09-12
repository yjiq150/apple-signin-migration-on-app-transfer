const path = require('path')
const axios = require('axios')
const qs = require('qs')
const { generateClientSecret, getAppleApiAccessToken } = require('./apple-auth')

/**
 * Get a user information by 'transfer identifier' in terms of receiving team's account.
 * @param clientId
 * @param clientSecret
 * @param accessToken
 * @param appleTransferId
 * @returns {Promise<{sub, email, is_private_email}>}
 */
async function getUserInfoByTransferId(clientId, clientSecret, accessToken, appleTransferId) {
    const data = qs.stringify({
        transfer_sub: appleTransferId,
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
    const { sub, email, is_private_email } = response.data
    return {
        sub,
        email,
        is_private_email,
    }
}

// Refer to official document for more information
// - https://developer.apple.com/documentation/sign_in_with_apple/bringing_new_apps_and_users_into_your_team
async function main() {
    // TODO: Modify the following parameters to your own
    const receivingTeamId = 'R12341234P'
    const receivingTeamKeyId = 'S12341234L'
    const receivingTeamKeyFilePath = path.join(__dirname, 'Example_AuthKey_S12341234L.p8')
    const clientId = 'com.example.app'

    // Just one appleTransferId is used here for example. You usually should loop through all the users with Apple Sign-in.
    // Use 'transfer identifier' generated in 'before-app-transfer.js' for each user
    const appleTransferId = '000506.5951a85d72c445918250badf39181d0f.0331'

    const clientSecret = generateClientSecret(receivingTeamId, receivingTeamKeyId, receivingTeamKeyFilePath, clientId)

    const accessToken = await getAppleApiAccessToken(clientId, clientSecret)

    const { sub: appleId, email, is_private_email } = await getUserInfoByTransferId(clientId, clientSecret, accessToken, appleTransferId)

    // Update your user info in database with the new information.
    // When user enables private email for Apple Sign-in, the email is also different after transfer.
    console.log(`The new user information for ${appleTransferId} is ${appleId} / ${email} / ${is_private_email}`)
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})
