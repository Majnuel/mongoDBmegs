const mongoose = require('mongoose')

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('MongoDB connected')
});

const msgSchema = new mongoose.Schema({
    user: { type: String, required: true, max:100 },
    timestamp: { type: String, required: true, max:100 },
    msg: { type: String, required: true, max:1000 }
})

module.exports = mongoose.model('mensajes', msgSchema, )

