const bidModel = require('../models/bids')
const config = require('../config/config')


const getAuctionBids = async (request, response) => {

    try {

        const bids = await bidModel
        .find({ auctionID: request.params.auctionID })
        .sort({ value: 'desc' })
        .select({ '__v': 0 })

        return response.status(200).send({
            accepted: true,
            bids: bids,
            service: config.SERVICE
        })

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }

}

const getAllBids = async (request, response) => {

    try {

        const bids = await bidModel
        .find()
        .select({ '__v': 0 })

        return response.status(200).send({
            accepted: false,
            bids,
            service: config.SERVICE
        })

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error',
            service: config.SERVICE
        })
    }
}

module.exports = { getAuctionBids, getAllBids }