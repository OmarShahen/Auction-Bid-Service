const { auctionRequest } = require('../services/auction')
const { authRequest } = require('../services/user')
const bidModel = require('../models/bids')
const config = require('../config/config')
const mongoose = require('mongoose')

module.exports = io => {

    io.on('connection', socket => {

        try {

            socket.emit('connection-check',{
                accepted: true,
                message: 'connected to bid-server successfully'
            })

            socket.on('join-auction', async data => {

                try {

                    if(!data.auctionID) {
                        return socket.emit('join-auction-error', {
                            accepted: false,
                            message: 'auction id is required',
                            service: config.SERVICE
                        })
                    }

                    let response 

                    try {

                        response = await auctionRequest.get(`/${data.auctionID}`)

                    } catch(error) {

                        if(error.response.status == 404) {
                            return socket.emit('join-auction-error', {
                                accepted: false,
                                message: 'invalid auction ID',
                                service: config.SERVICE
                            })
                        } else {
                            return socket.emit('join-auction-error', {
                                accepted: false,
                                message: 'invalid auction id',
                                service: config.SERVICE
                            })
                        }
                    }

                

                const auction = response.data

                if(!auction) {
                    return socket.emit('join-auction-error', {
                        accepted: false,
                        message: 'invalid auction id',
                        service: config.SERVICE
                    })
                } 

                if(auction.isSold) {
                    return socket.emit('join-auction-error', {
                        accepted: false,
                        message: 'auction is already sold',
                        service: config.SERVICE
                    })
                }

                const auctionDate = new Date(auction.auctionStartTime)
                const nowDate = new Date()

                if(nowDate.getTime() < auctionDate.getTime()) {
                    return socket.emit('join-auction-error', {
                        accepted: false,
                        message: 'auction did not start yet',
                        service: config.SERVICE
                    })
                }

                socket.join(`${data.auctionID}`)

                return socket.emit('join-auction-success', {
                    accepted: true,
                    message: `joined auction successfully`,
                    service: config.SERVICE
                })

                } catch(error) {
                    console.error(error)
                    return socket.emit('join-auction-error', {
                        accepted: false,
                        message: 'internal server error',
                        service: config.SERVICE
                    })
                }

            
            })

            socket.on('bid', async data => {

                try {

                
                    if(!data.auctionID || !mongoose.Types.ObjectId.isValid(data.auctionID)) {
                        return socket.emit('bid-error', {
                            accepted: false,
                            message: 'auction id is required',
                            service: config.SERVICE
                        })
                    }
    
                    if(!data.value) {
                        return socket.emit('bid-error', {
                            accepted: false,
                            message: 'bidding value is required',
                            service: config.SERVICE
                        })
                    }

                    if(!Number.isInteger(data.value)) {
                        return socket.emit('bid-error', {
                            accepted: false,
                            message: 'bidding value is not a valid number',
                            service: config.SERVICE
                        })
                    }
    
                    if(!data.bidderID || !mongoose.Types.ObjectId.isValid(data.bidderID)) {
                        return socket.emit('bid-error', {
                            accepted: false,
                            message: 'bidder id is required',
                            service: config.SERVICE
                        })
                    }
                
                    let userResponse
                    let user

                    try {

                        userResponse = await authRequest.get(`/users/${data.bidderID}`)
                        user = userResponse.data.user

                    } catch(error) {

                        if(error.response.status == 404) {
                            return socket.emit('bid-error', {
                                accepted: false,
                                message: 'invalid bidder ID',
                                service: config.SERVICE
                            })
                        } else {
                            return socket.emit('bid-error', {
                                accepted: false,
                                message: 'invalid bidder id',
                                service: config.SERVICE
                            })
                        }
                    }
                    
                    let auctionResponse
                    let auction

                    try {

                        auctionResponse = await auctionRequest.get(`/auctions/${data.auctionID}/raw`)
                        auction = auctionResponse.data.auctionListing

                    } catch(error) {

                        if(error.response.status == 404) {
                            return socket.emit('bid-error', {
                                accepted: false,
                                message: 'invalid auction ID',
                                service: config.SERVICE
                            })
                        } else {
                            return socket.emit('bid-error', {
                                accepted: false,
                                message: 'invalid auction id',
                                service: config.SERVICE
                            })
                        }
                    }
                    
                if(data.value < auction.startingPrice) {
                    return socket.emit('bid-error', {
                        accepted: false,
                        message: `bidding value is lessthan the starting price ${auction.startingPrice}` ,
                        service: config.SERVICE
                    })
                }

                if(data.value < auction.currentPrice) {
                    return socket.emit('bid-error', {
                        accepted: false,
                        message: `bidding value is lessthan the current price ${auction.currentPrice}` ,
                        service: config.SERVICE
                    })
                }   

                const bids = await bidModel
                .find({ auctionID: auction._id })
                .sort({ value: -1 })
                .limit(1)

                if(bids.length != 0) {

                    const minBidValue = bids[0].value + auction.minimumRaise

                    if(minBidValue > data.value) {
                        return socket.emit('bid-error', {
                            accepted: false,
                            message: `bidding value must be greater than or equal to ${minBidValue}`,
                            service: config.SERVICE
                        })
                    }
                }

                const newBidData = {
                    auctionID: data.auctionID,
                    bidder: {
                        ID: user._id,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        firstName: user.firstName,
                        lastName: user.lastName
                    },
                    value: data.value
                }

                try {

                    const updateCurrentPrice = await auctionRequest
                    .put(`/auctions/${data.auctionID}/current-price`, { bidValue: data.value })

                } catch(error) {
                    console.error(error)
                }

                newBid = new bidModel(newBidData)
                const saveBid = await newBid.save()

                socket.to(`${data.auctionID}`).emit('bid-success', {
                    accepted: true,
                    message: `${data.bidderID} made a bid with ${data.value}`,
                    bid: saveBid,
                })

                return socket.emit('bidder-success', {
                    accepted: true,
                    message: 'your bid value is submitted successfully',
                    bid: saveBid
                })

                } catch(error) {
                    console.error(error)
                    return socket.emit('bid-error', {
                        accepted:  false,
                        message: 'internal server error',
                        service: config.SERVICE
                    })
                }


            })

        } catch(error) {
            console.error(error)
            return socket.emit('error', {
                accepted: false,
                message: 'internal server error'
            })
        }
        
    })
}