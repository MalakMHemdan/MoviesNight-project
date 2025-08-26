const express = require('express');
const router = express.Router();
const wishListController=require('../controllers/wishlist.controller');
const wishlist = require('../models/wishlist');
router.route('/')
         .get(wishListController.getWishList)
router.route('/:id')         
         .post(wishListController.addToWishList)
         .delete(wishListController.deleteFromWishList)
module.exports = router;