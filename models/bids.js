const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/auction-bids', { useNewUrlParser: true, useUnifiedTopology: true })

const Schema = mongoose.Schema

const bidSchema = new Schema({

    auctionID: {
        type: String,
        required: true
    },

    bidder: {
        ID: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: Array,  required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true }

    },

    value: {
        type: Number,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    }
    
})

module.exports = mongoose.model('Bid', bidSchema)