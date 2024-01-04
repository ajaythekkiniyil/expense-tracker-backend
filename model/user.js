const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    monthlylimit:{
        type: Number,
        default: 0,
    }
})

const userModel = model('user', userSchema)
module.exports = userModel
