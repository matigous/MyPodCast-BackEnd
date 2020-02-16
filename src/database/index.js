const Sequelize = require('sequelize');
const dbConfig  = require('../config/database');

//models import
const User = require('../models/User');

// final models import

const connection = new Sequelize(dbConfig);


// inicialização dos models
User.init(connection);
//final inicialização dos models

//associate dos models
User.associate(connection.models)
//final associate dos models


module.exports = connection;

