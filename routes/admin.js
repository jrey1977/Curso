var router = require('express').Router();
var Noticia = require('../models/noticias.js');
var Categorias = require('../models/categorias.js');
var passport = require('passport');
var Account = require('../models/account.js');
var Comentarios = require('../models/comentarios.js');
var fs = require('fs');  // ESTO LO NECESITO PARA ELIMINAR LAS FOTOS DE LAS NOTICIAS


////////// ---------  NOTICIAS -------------//////////////////////////////////

//FORMULARIO PARA CREAR NUEVA NOTICIA
router.get('/admin/nueva', function(req, res) {
	if ( req.user != undefined ){
			var administrador = req.user.administrador;
			if ( administrador == "si" ){
					Categorias.find(function(err, categorias){
								//Si encontramos algún tipo de error, lo notificamos
								if(err){
									return res.json(500, {message: 'Error obteniendo las tareas'});
								}
								// ESTO ES PARA SABER SI MOSTRAMOS EL MENÚ DESPLEGABLE DE CATEGORIAS
								if ( categorias.length > 0 ){
										selectCategorias = "visible";
								} else {
										selectCategorias = "invisible";
								}
								errores = new Array();
								return res.render('nueva', {
										title: "Nueva noticia",
										categorias: categorias,
										selectCategorias: selectCategorias,
										errores: errores
								});
					});
			} else {
				return res.render('login');
			}
	} else {
			return res.render('login');
	}

});

// OBTENGO DATOS DE UNA NOTICIA PARA EDITARLO
router.get('/admin/edit/:id', function(req, res) {
			if ( req.user != undefined ){
					var administrador = req.user.administrador;
					if ( administrador == "si" ){
							var id = req.params.id;
							Noticia.findOne({_id: id}, function(err, noticia){
									if(err) {
										return res.send('500: Internal Server Error', 500);
									}
									if(!noticia) {
										return res.end('No existe la notricia');
									}
									// Obtenemos todas la categorias
									Categorias.find(function(err, categorias){
												// Comprobamos si podemos trabajar con el formato json
												if(req.accepts('json')){
															//Si encontramos algún tipo de error, lo notificamos
															if(err){
																return res.json(500, {message: 'Error obteniendo las categorias'});
															}
															// Si no hay error montamos un json a partir de la lista de tareas
															return res.render('editar', {
																	title: "Editar noticia",
																	noticia: noticia,
																	categorias: categorias
															});
												 }else{
														res.send ('No acepta JSON');
												 }
									});
							});
					} else {
							return res.render('login');
					}
			} else {
					return res.render('login');
			}
});


// BORRO UNA NOTICIA
router.get('/admin/delete/:id', function(req, res) {
		if ( req.user != undefined ){
				var administrador = req.user.administrador;
				if ( administrador == "si" ){
							var id = req.params.id;
							Noticia.find( { _id: id }, function(err, noticiaSeleccionada){
									if(err){
											return res.json(500, {message: 'Error obteniendo la noticia'});
									} else {
											url_noticia = noticiaSeleccionada[0]['url'];
											imagen_noticia = noticiaSeleccionada[0]['foto'];
											Noticia.remove({ _id: id }, function (err) {
													if (err) return handleError(err);
													Comentarios.remove({url_noticia:url_noticia}, function(err, list){
																if(err) {
																		return res.send('500: Internal Server Error', 500);
																}
																if ( imagen_noticia != "" ){
																		fs.unlink('./public/images/noticias/'+imagen_noticia);
																		res.redirect('/admin');
																} else {
																		res.redirect('/admin');
																}
													});
											});
									}
							});
				} else {
						return res.render('login');
				}
		} else {
				return res.render('login');
		}
});



////////// ---------  CATEGORÍAS -------------//////////////////////////////////

router.get('/admin/categorias', function(req, res) {
	  if ( req.user != undefined ){
				var administrador = req.user.administrador;
				if ( administrador == "si" ){
						req.session.admin = 'si';
						// Obtenemos todas la categorias
						Categorias.find(function(err, categorias){
									// Comprobamos si podemos trabajar con el formato json
							if(req.accepts('json')){
									//Si encontramos algún tipo de error, lo notificamos
									if(err){
										return res.json(500, {message: 'Error obteniendo las categorias'});
									}
									// Si no hay error montamos un json a partir de la lista de tareas
									return res.render('categorias', {title: "Categorias",categorias: categorias});
							 }else{
									res.send ('No acepta JSON');
							 }
						});
				} else {
						return res.render('login');
				}
		} else {
				return res.render('login');
		}
});

//FORMULARIO PARA CREAR NUEVA CATEGORÍA
router.get('/admin/nueva-categoria', function(req, res) {
	if ( req.user != undefined ){
			var administrador = req.user.administrador;
			if ( administrador == "si" ){
				return res.render('nueva-categoria', {title: "Nueva categoria"});
			} else {
				return res.render('login');
			}
	} else {
			return res.render('login');
	}

});


// OBTENGO DATOS DE UNA NOTICIA PARA EDITARLO
router.get('/admin/editar-categoria/:idCategoria', function(req, res) {
			if ( req.user != undefined ){
					var administrador = req.user.administrador;
					if ( administrador == "si" ){
							var idCategoria = req.params.idCategoria;
							Categorias.findOne({_id: idCategoria}, function(err, categoria){
									if(err) {
										return res.send('500: Internal Server Error', 500);
									}
									if(!categoria) {
										return res.end('No existe la categoria');
									}
									return res.render('editar-categoria', {title: "Editar categoria",categoria: categoria});
							});
					} else {
							return res.render('login');
					}
			} else {
					return res.render('login');
			}
});

// BORRO UNA CATEGORIA
router.get('/admin/delete-categoria/:idCategoria', function(req, res) {
		if ( req.user != undefined ){
				var administrador = req.user.administrador;
				if ( administrador == "si" ){
						var idCategoria = req.params.idCategoria;
						Categorias.remove({ _id: idCategoria }, function (err) {
								if (err) return handleError(err);
								res.redirect('/admin/categorias');
						});
				} else {
						return res.render('login');
				}
		} else {
				return res.render('login');
		}
});




////////// ---------  USUARIOS -------------//////////////////////////////////

// CARGO PANTALLA DE USUARIOS
router.get('/admin/usuarios', function(req, res) {
	  if ( req.user != undefined ){
				var administrador = req.user.administrador;
				if ( administrador == "si" ){
						req.session.admin = 'si';
						// Obtenemos todas la tareas
						Account.find(function(err, usuarios){
									// Comprobamos si podemos trabajar con el formato json
							if(req.accepts('json')){
										//Si encontramos algún tipo de error, lo notificamos
										if(err){
											return res.json(500, {message: 'Error obteniendo las tareas'});
										}
										// Si no hay error montamos un json a partir de la lista de tareas
										return res.render('usuarios', {title: "Usuarios",usuarios: usuarios});
							 }else{
										res.send ('No acepta JSON');
							 }
						});
				} else {
						return res.render('login');
				}
		} else {
				return res.render('login');
		}
});

//FORMULARIO PARA CREAR NUEVO USUARIO
router.get('/admin/crearUsuario', function(req, res) {
		if ( req.user != undefined ){
					var administrador = req.user.administrador;
					if ( administrador == "si" ){
						errores = new Array();
						return res.render('nuevo-usuario', {title: "Nuevo usuario",errores: errores});
					} else {
						return res.render('login');
					}
		} else {
					return res.render('login');
		}

});

// OBTENGO DATOS DE UN USUARIO PARA EDITARLO
router.get('/admin/editarUsuario/:id', function(req, res) {
			if ( req.user != undefined ){
					var administrador = req.user.administrador;
					if ( administrador == "si" ){
							var id = req.params.id;
							Account.findOne({_id: id}, function(err, usuario){
									if(err) {
										return res.send('500: Internal Server Error', 500);
									}
									if(!usuario) {
										return res.end('No existe el usuario');
									}
									return res.render('editar-usuario', {title: "Editar usuario",usuario: usuario});
							});
					} else {
							return res.render('login');
					}
			} else {
					return res.render('login');
			}
});


// BORRO UN USUARIO
router.get('/admin/borrarUsuario/:id', function(req, res) {
		if ( req.user != undefined ){
				var administrador = req.user.administrador;
				if ( administrador == "si" ){
						var id = req.params.id;
						Account.remove({ _id: id }, function (err) {
								if (err) return handleError(err);
								Account.find(function(err, list){
									if(err) {
										return res.send('500: Internal Server Error', 500);
									}
									res.redirect('/admin/usuarios');
								});
						});
				} else {
						return res.render('login');
				}
		} else {
				return res.render('login');
		}
});



////////// ---------  COMENTARIOS -------------//////////////////////////////////

// CARGO PANTALLA DE COMENTARIOS
router.get('/admin/comentarios', function(req, res) {
	  if ( req.user != undefined ){
				var administrador = req.user.administrador;
				if ( administrador == "si" ){
						req.session.admin = 'si';
						// Obtenemos todas la tareas
						Comentarios.find(function(err, comentarios){
									// Comprobamos si podemos trabajar con el formato json
							if(req.accepts('json')){
										//Si encontramos algún tipo de error, lo notificamos
										if(err){
											return res.json(500, {message: 'Error obteniendo las tareas'});
										}
										// Si no hay error montamos un json a partir de la lista de tareas
										return res.render('comentarios', {title: "Comentarios",comentarios: comentarios});
							 }else{
										res.send ('No acepta JSON');
							 }
						});
				} else {
						return res.render('login');
				}
		} else {
				return res.render('login');
		}
});

// OBTENGO DATOS DE UN COMENTARIO PARA EDITARLO
router.get('/admin/editarComentario/:id', function(req, res) {
			if ( req.user != undefined ){
					var administrador = req.user.administrador;
					if ( administrador == "si" ){
							var id = req.params.id;
							Comentarios.findOne({_id: id}, function(err, comentario){
									if(err) {
											return res.send('500: Internal Server Error', 500);
									}
									if(!comentario) {
											return res.end('No existe el usuario');
									}
									return res.render('editar-comentario', {title: "Editar comentario",comentario: comentario});
							});
					} else {
							return res.render('login');
					}
			} else {
					return res.render('login');
			}
});


// BORRO UN COMENTARIO
router.get('/admin/borrarComentario/:id', function(req, res) {
		if ( req.user != undefined ){
				var administrador = req.user.administrador;
				if ( administrador == "si" ){
						var id = req.params.id;
						Comentarios.remove({ _id: id }, function (err) {
								res.redirect('/admin/comentarios');
						});
				} else {
						return res.render('login');
				}
		} else {
				return res.render('login');
		}
});


// SALIR DEL ÁREA ADMINISTRATIVA
router.get('/admin/salir', function(req, res) {
		req.session.destroy(function(err) {
		})
		res.redirect('/');
});


module.exports = router;
