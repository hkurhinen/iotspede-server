'use strict';
var Document = require('camo').Document;

class Entry extends Document {
    constructor() {
        super();
        this.name = String;
        this.score = Number;
    }
}

module.exports = Entry;