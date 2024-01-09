const express = require('express')
const app = express()
const connectDb = require('./connectDb')
const expenseModel = require('./model/expense')
const userModel = require('./model/user')
const bcrypt = require('bcrypt')
const cors = require('cors')

// db connection
connectDb()

// cors
app.use(cors())

// body-parser
app.use(express.json())

// welcome route
app.get('/', (req, res) => res.send('welcome to expense tracker'))

// add new expense
app.post('/add-expense', (req, res) => {
    const { date, amount, category, id } = req.body

    // creating new expense and save to database
    const newExpense = new expenseModel({
        date: date,
        amount: amount,
        category: category,
        userId: id
    })  

    newExpense.save()
        .then(resp => {
            res.status(200).json({ msg: 'new expense added', resp })
        })
        .catch(err => {
            res.status(500).json(`error during add new expense: ${err}`)
        })

})

// get all expenses
app.get('/get-all-expenses/:userId', async (req, res) => {
    const { userId } = req.params

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()
    const startDate = new Date(currentYear, currentMonth, 1)
    const endDate = new Date(currentYear, currentMonth + 1, 1)

    const limit = await userModel.find({_id: userId}, {_id: 0, monthlylimit: 1})
    const monthlylimit = limit[0].monthlylimit

    const totalMonthExpense = await expenseModel.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate }, userId: userId } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ])

    expenseModel.find({userId: userId})
        .then(resp => {
            res.status(200).json({ totalMonthExpense: totalMonthExpense[0]?.total, listOfExpenses: resp, monthlylimit })
        })
        .catch(err => {
            res.status(500).json(`error during get all expense: ${err}`)
        })
})

// delete expense
app.delete('/delete-expense/:id', (req, res) => {
    const { id } = req.params

    expenseModel.deleteOne({ _id: id })
        .then(resp => {
            res.status(200).json('expense deleted successfully')
        })
        .catch(err => {
            res.status(500).json(`error during delete expense: ${err}`)
        })
})

// signup
app.post('/signup', (req, res) => {
    const { email, password } = req.body

    // hashing password and storing new user information to database
    bcrypt.hash(password, 10)
        .then(hashedPassword => {
            const newUser = new userModel(
                {
                    email: email,
                    password: hashedPassword
                }
            )
            return newUser.save(newUser)
        })
        .then(resp => {
            res.status(201).json('new user created')
        })
        .catch(err => {
            res.status(500).json(`error during signup: ${err}`)
        })
})

// login
app.post('/login', async (req, res) => {
    const { email, password } = req.body

    const user = await userModel.findOne({ email: email })

    if (!user) return res.status(404).json('no user found with this email')

    bcrypt.compare(password, user.password)
        .then(passwordMatch => {
            if (passwordMatch) res.status(200).json({msg:'successfully loggedin', userId: user._id})
            else res.status(401).json('incorrect email or password')
        })
        .catch(err => {
            res.status(500).json(`error during login: ${err}`)
        })
})

// set monthly limit
app.put('/monthly-limt', (req, res) => {
    const { limit, userId } = req.body

    userModel.findOneAndUpdate({ _id: userId }, { monthlylimit: limit })
        .then(resp => {
            res.status(200).json('successfully updated monthly expense')
        })
        .catch(err => {
            res.status(500).json(`error during updating monthly expense: ${err}`)
        })
})

app.listen(3000, () => console.log('server started'))