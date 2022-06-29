const router = require('express').Router()
const bidController = require('../controllers/bids')


router.get('/auctions/:auctionID/bids', (request, response) => bidController.getAuctionBids(request, response))

router.get('/bids', (request, response) => bidController.getAllBids(request, response))

module.exports = router