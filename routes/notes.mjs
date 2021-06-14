// const util = require('util);
import { default as express } from 'express';
import { NotesStore as notes } from '../models/notes-store.mjs';
import { ensureAuthenticated } from './users.mjs';
import { twitterLogin } from './users.mjs';

export const router = express.Router();

// Add Note (create)
router.get('/add', ensureAuthenticated, (req, res, next) => {
    try {
        res.render('noteedit', {
            title: "Add a note",
            docreate: true,
            notekey: '',
            user: req.user,
            note: undefined,
            twitterLogin: twitterLogin
        });
    } catch (e) { next(e) };
});

// Save Note (create/update)
router.post('/save', ensureAuthenticated, async (req, res, next) => {
    try {
        let note;
        if (req.body.docreate === "create") {
            note = await notes.create(req.body.notekey, req.body.title, req.body.body);
        } else {
            note = await notes.update(req.body.notekey, req.body.title, req.body.body);
        }
        res.redirect('/notes/view?key=' + req.body.notekey);
    } catch (err) { next(err); }
});

// Read Note (read)
router.get('/view', async (req, res, next) => {
    try {
        let note = await notes.read(req.query.key);
        res.render('noteview', {
            title: note ? note.title : "",
            notekey: req.query.key,
            user: req.user ? req.user : undefined,
            note: note,
            twitterLogin: twitterLogin
        });
    } catch (err) { next(err); }
});

// Edit Note (update)
router.get('/edit', ensureAuthenticated, async (req, res, next) => {
    try {
        const note = await notes.read(req.query.key);
        res.render('noteedit', {
            title: note ? ("Edit " + note.title) : "Add a Note",
            docreate: false,
            notekey: req.query.key,
            user: req.user,
            note: note,
            twitterLogin: twitterLogin
        });
    } catch (err) { next(err); }
});

// Ask to Delete Note (destroy)
router.get('/destroy', ensureAuthenticated, async (req, res, next) => {
    try {
        const note = await notes.read(req.query.key);
        res.render('notedestroy', {
            title: note ? `Delete ${note.title}` : "",
            notekey: req.query.key,
            user: req.user,
            note: note,
            twitterLogin: twitterLogin
        });
    } catch (err) { next(err); }
});

// Really Delete Note (destroy)
router.post('/destroy/confirm', ensureAuthenticated, async (req, res, next) => {
    try {
        await notes.destroy(req.body.notekey);
        res.redirect('/');
    } catch (err) { next(err); }
})