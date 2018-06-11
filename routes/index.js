const express = require('express');
const router = express.Router();
const models = require('../models');

/* GET home page. */
router.get('/', async function (req, res, next) {
  var cities = await models.city.findAll();
  res.render('index', {
    title: 'Home',
    navigateIcon: '<i class="fa fa-home fa-fw"></i>',
    cities: cities
  });
});

module.exports = router;
