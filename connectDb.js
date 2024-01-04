const mongoose = require('mongoose')
const expenseModel = require('./model/expense')

const connectDb = async() =>{
    await mongoose.connect('mongodb://127.0.0.1:27017/expenseTracker')
    .then(() => {
        console.log('Connected to database');
    })
    .catch((error) => {
        console.error('Error connecting to database:', error);
    });
}

module.exports = connectDb