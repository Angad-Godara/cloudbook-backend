const mongoose = require('mongoose')
const passcode = require('./local')
var cors = require('cors')
app.use(cors())

const mongoURI = `mongodb+srv://lostinpresent:${passcode}@cluster0.a5ibf.mongodb.net/?retryWrites=true&w=majority`;

const connectToMongo = () => {
    mongoose.connect(mongoURI, () => {
        console.log("Connection successfull");
    }) /// THIS IS ASYNC THAT'S WHY IT TAKES SOME EXTRA TIME TO GET CONNECTED
}

module.exports = connectToMongo;