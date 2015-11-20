var router = require('express').Router();
var Noticia = require('../models/noticias.js');
var Categorias = require('../models/categorias.js');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Account = require('../models/account.js');
var Comentarios = require('../models/comentarios.js');

// COMPRUEBO SI HAY ADMIN
function comprueboAdmin(req, res){
		Account.find({username:'admin'}, function(err,admin){
		      if ( admin.length < 1 ){
		          return res.render('create-admin');
		      }
		});
}

// LOGIN EN LA WEB
router.post('/loginForm', function(req, res, next) {
				passport.authenticate('local', function(err, user, info) {
							if (err) {
									console.log('Fallo de autenticación');
									res.redirect('back');
							}
							if (!user) {
									errores = new Array();
									errores.push('No hemos podido identificarlo con estos datos. Tal vez desee registrarse.');
									res.render('registro', {
											title: 'Registro',
											errores: errores
									});
							}
							req.logIn(user, function(err) {
									if (err) { return next(err); }
									return res.redirect('back');
							});
				})(req, res, next);
});

//PROCESO DATOS DE LA PANTALLA DE REGISTRO
router.post('/registro', function(req, res) {
			errores = new Array();
			if ( req.body.username == "" ){
					errores.push("Debe rellenar el campo username");
			}
			if ( req.body.password == "" ){
					errores.push("Debe rellenar el campo password");
			}
			if ( req.body.email == "" ){
					errores.push("Debe rellenar el campo email");
			}
			if( errores.length < 1 ){
					if ( req.body.username == "admin" ){
							administrador = "si";
					} else {
							administrador = "no";
					}
					Account.register(new Account({
							username : req.body.username,
							email : req.body.email,
							administrador: administrador }),
					req.body.password, function(err, account) {
							if (err) {
									errores.push("Ya hay un usuario con este nombre");
									Categorias.find(function(err, categorias){
												res.render('registro', {
														title: 'Registro',
														errores: errores,
														categorias: categorias
												});
									});
							}
							passport.authenticate('local')(req, res, function () {
									res.redirect('./');
							});
					});
			} else {
					Categorias.find(function(err, categorias){
								res.render('registro', {
										title: 'Registro',
										errores: errores,
										categorias: categorias
								});
					});
			}
});

// GRABO COMENTARIOS
router.post('/comentarios', function(req, res) {
			Account.find({username:'admin'}, function(err,admin){
						if ( admin.length < 1 ){
								return res.render('create-admin');
						} else {
								errores = new Array();
								// Grabamos el comentario
								var fecha = new Date();
								var dia = fecha.getDate();
								var mes = parseInt(fecha.getMonth()) + 1;
								var anho = fecha.getFullYear();
								var diaActual = dia + "-" + mes + "-" + anho;
								var comentario = new Comentarios({
											'mensaje': req.body.mensaje,
											'url_noticia': req.body.urlNoticia,
											'titular_noticia': req.body.titularNoticia,
											'autor': req.user.username,
											'fecha': diaActual
								});
								comentario.save(function(err, t){
										if(err){
											return res.json(500, {message: "Error guardando el comentario", error: err});
										}
										res.redirect('back');
								});
						}
			});
});

module.exports = router;
