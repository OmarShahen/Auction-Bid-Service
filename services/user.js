const config = require('../config/config')
const axios = require('axios')

/*const getUserData = async userID => {

    try {

        const { data } = await axios.get(`${config.USER_API_URL}/users/get-user`, { userID })
                
        return data.user

    } catch(error) {
        console.error(error.message)
    }
}*/

const authRequest = axios.create({ baseURL: `${config.USER_API_URL}/api/auth-service` })

module.exports = { authRequest }