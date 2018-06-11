'use strict';
const Sequelize = require('sequelize');
const config = require("../../config/config");

const sequelize = new Sequelize(config.database, config.username, config.password, config.option);

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });