var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Categorias = new Schema({
     nombre: String,
		 url: String
});

module.exports = mongoose.model('categorias', Categorias);
