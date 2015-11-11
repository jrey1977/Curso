var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Comentarios = new Schema({
     mensaje: String,
		 url_noticia: String,
     titular_noticia: String,
     autor: String,
     fecha: String
});

module.exports = mongoose.model('comentarios', Comentarios);
