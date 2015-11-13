var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');
Schema = mongoose.Schema;
//mongoose.connect('mongodb://localhost/test');


var mongooseUri = process.env.MONGOLAB_URI

var mongooseUri = uriUtil.formatMongoose(mongooseUri);


mongoose.connect(mongooseUri);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

var Noticias = new Schema({
     nombre: String,
     url: String,
     descripcion: String,
     categoria: String,
     foto: String,
     fecha: String,
     etiquetas: String
});

module.exports = mongoose.model('noticias', Noticias);
