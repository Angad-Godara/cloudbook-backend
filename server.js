const connectToMongo = require('./db')
const express = require('express')
connectToMongo();

var cors = require('cors')

const app = express()
const port = 5000

app.use(express.json());
app.use(cors())


// Available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port, () => {
    console.log(`Cloudbook backend listening on port ${port}`)
})