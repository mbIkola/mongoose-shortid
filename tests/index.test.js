const assert = require('assert');
const mongoose = require('mongoose');
const ShortId = require('../');

const mongoDbUrl = 'mongodb://localhost:27017/test';
mongoose.connect(mongoDbUrl);

const personSchema = mongoose.Schema({
    shortId:  { type: ShortId, index: true, unique: true},
    name: String
});

const Person = mongoose.model('person', personSchema);

describe('sanity', () => {
    it('works', async () => {

        let person = new Person({ name: 'it is a good day to die'});
        await person.save((err, saved) => {
            assert.ok(!!saved.shortId);
        });
    });
});
