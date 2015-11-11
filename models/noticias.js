var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/blog');
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
