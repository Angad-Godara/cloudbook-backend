const express = require('express');
const notes = require('../models/Notes');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

// Route 1: Get all the notes of a user using: GET "/api/auth/fetchallnotes" . Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const note = await notes.find({ user: req.user.id });
        res.json(note)
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error")
    }
})

// Route 2: Adding a new note using: POST "/api/notes/addnote" . Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be of atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {

    try {
        const { title, description, tag } = req.body

        // If there are errors, return Bad request and errors
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // creatong a new note
        const note = new notes({
            title, description, tag, user: req.user.id
        })

        const savedNote = await note.save();
        res.json(savedNote)

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error")
    }
})

// Route 3: Updating an existing note using: PUT "/api/notes/updatenote". Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {

    try {
        const { title, description, tag } = req.body

        // Create a newNote object so that we can update everything using it

        const newNote = {}
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // Find the note to be updated and update it
        let note = await notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        // checking whether the note which the user want to update belongs to the same user or not
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed")
        }

        // here we updated it
        note = await notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json(note);

        // {new: true krne se agr koi naya contact aayega toh yeh usko bhi add kr dega}

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error")
    }
})

// Route 4: Deleting an existing note using: DELETE "/api/notes/deletenote". Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {
        // Find the note to be deleted
        let note = await notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        // checking whether the note which the user want to delete belongs to the same user or not
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed")
        }

        // and then we will delete it
        note = await notes.findByIdAndDelete(req.params.id)

        res.json({ "Success": `Note has been deleted`, note: note });

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error")
    }
})

module.exports = router;