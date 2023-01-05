const express = require('express');
const router = express.Router();
const user = require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = "thisisa$secret"

//Route 1: Adding a new user to the db using POST: /api/auth/createuser
router.post('/createuser', [

    // express validators
    body('email', 'Invalid Email').isEmail(),
    body('name', 'Please enter a valid name').isLength({ min: 3 }),
    body('password', 'Invalid pasowrd').isLength({ min: 5 })

], async (req, res) => {

    let success = false;
    // checking the results of the validators
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    try {

        // checking if their exists a user with the same email
        let User = await user.findOne({ email: req.body.email })

        if (User) {
            return res.status(400).json({ success, error: "Sorry for inconvenience but the email already exists" })
        }

        const salt = await bcrypt.genSalt(10);
        const secpass = await bcrypt.hash(req.body.password, salt);

        // creating a new user
        User = await user.create({
            name: req.body.name,
            password: secpass,
            email: req.body.email
        })

        const data = {
            user: {
                id: User.id
            }
        }
        success = true;
        const authtoken = jwt.sign(data, JWT_SECRET)
        res.json({ success, authtoken });

    } catch (err) {
        console.log(err);
        res.status(500).send(success, "Internal server error")
    }
})

// Route 2: login in a user using: POST "/api/auth/login"
router.post('/login', [

    body('email', 'Please enter valid credentials').isEmail(),
    body('password', 'Please enter valid credentials').exists(),

], async (req, res) => {

    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {

        const { email, password } = req.body;

        let User = await user.findOne({ email: email })

        if (!User) {
            return res.status(400).json({ success, error: "Please enter valid credentials" })
        }

        const passwordCompare = await bcrypt.compare(password, User.password);

        if (!passwordCompare) {
            return res.status(400).json({ success, error: "Please enter valid credentials" })
        }

        const data = {
            user: {
                id: User.id
            }
        }
        success = true;
        const authtoken = jwt.sign(data, JWT_SECRET)
        res.json({ success, authtoken });

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error")
    }
})

// Get logged in user using: POST "/api/auth/getuser"
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        let success = false;
        const userId = req.user.id;
        const User = await user.findById(userId).select("-password")
        res.send(sucess, User);
    } catch (error) {
        console.log(err);
        res.status(500).send(success, "Internal server error")
    }
})

module.exports = router