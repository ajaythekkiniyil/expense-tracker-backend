const { Schema, model } = require('mongoose')

const expenseSchema = new Schema({
    date: {
        type: Date,
    },
    amount: {
        type: Number,
    },
    category: {
        type: String,
    }
})

const expenseModel = model('expense', expenseSchema)
module.exports = expenseModel