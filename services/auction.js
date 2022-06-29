const config = require('../config/config')
const axios = require('axios')

/*const getAuctionData = async (auctionID) => {

    try {

        const { data } = await axios.get(`${config.AUCTION_API_URL}/auctions/${auctionID}`)

        return data.auction

    } catch(error) {
        console.error(error.message)
    }
}*/

const auctionRequest = axios.create({ baseURL: `${config.AUCTION_API_URL}/api/auction-service` })

module.exports = { auctionRequest }