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

// CARGO PANTALLA DE NOTICIAS
router.get('/', function(req, res){
		Account.find({username:'admin'}, function(err,admin){
					if ( admin.length < 1 ){
							return res.render('create-admin');
					} else {
							// Obtenemos todas la tareas
							Noticia.find(function(err, list){
										// Comprobamos si podemos trabajar con el formato json
										if(req.accepts('json')){
													//Si encontramos algún tipo de error, lo notificamos
													if(err){
																return res.json(500, {message: 'Error obteniendo las noticias'});
													} else {
																Categorias.find(function(err, categorias){
																			// Comprobamos si podemos trabajar con el formato json
																			if(req.accepts('json')){
																						//Si encontramos algún tipo de error, lo notificamos
																						if(err){
																							return res.json(500, {message: 'Error obteniendo las tareas'});
																						}
																						if ( categorias.length > 0 ){
																								menuCategorias = "visible";
																						} else {
																								menuCategorias = "invisible";
																						}
																						if ( req.user != undefined ){
																									// USUARIO LOGUEADO ( NORMAL O ADMIN )
																									var usuario = req.user.username;
																									var administrador = req.user.administrador;
																									if ( administrador == "si" ){
																											botonAdmin = "visible";
																									} else {
																											botonAdmin = "invisible";
																									}
																									return res.render('index', {
																											title: "Noticias",
																											usuario: usuario,
																											list: list,
																											categorias: categorias,
																											botonAdmin : botonAdmin,
																											botonIniciaSesion : "invisible",
																											botonRegistrarse : "invisible",
																											botonCerrarSesion : "visible",
																											menuCategorias: menuCategorias
																									});
																						} else {
																									// USUARIO NO LOGUEADO
																									return res.render('index', {
																											title: "Noticias",
																											usuario: usuario,
																											list: list,
																											categorias: categorias,
																											botonAdmin : "invisible",
																											botonIniciaSesion : "visible",
																											botonRegistrarse : "visible",
																											botonCerrarSesion : "invisible",
																											menuCategorias: menuCategorias
																									});
																						}
																			} else{
																							res.send("No acepta JSON");
																			}
																});
													}
										} else{
														res.send("No acepta JSON");
										}
							}).sort( { _id: -1 } );
					}
		});
});

// CARGO PANTALLA DE NOTICIAS POR CATEGORÍA
router.get('/noticias/:urlCategoria', function(req, res){
			Account.find({username:'admin'}, function(err,admin){
						if ( admin.length < 1 ){
								return res.render('create-admin');
						} else {
								var urlCategoria = req.params.urlCategoria;
								Categorias.find( { url: urlCategoria }, function(err, categoriaSeleccionada){
										if(err){
											return res.json(500, {message: 'Error obteniendo la categoria'});
										} else {
												nombreCategoria = categoriaSeleccionada[0]['nombre']
												// Obtenemos todas la tareas
												Noticia.find( { categoria: nombreCategoria }, function(err, list){
															// Comprobamos si podemos trabajar con el formato json
															if(req.accepts('json')){
																		//Si encontramos algún tipo de error, lo notificamos
																		if(err){
																					return res.json(500, {message: 'Error obteniendo las noticias'});
																		} else {
																					Categorias.find(function(err, categorias){
																								//Si encontramos algún tipo de error, lo notificamos
																								if(err){
																									return res.json(500, {message: 'Error obteniendo las tareas'});
																								}
																								if ( categorias.length > 0 ){
																										menuCategorias = "visible";
																								} else {
																										menuCategorias = "invisible";
																								}
																								if ( req.user != undefined ){
																											// USUARIO LOGUEADO ( NORMAL O ADMIN )
																											var usuario = req.user.username;
																											var administrador = req.user.administrador;
																											if ( administrador == "si" ){
																													botonAdmin = "visible";
																											} else {
																													botonAdmin = "invisible";
																											}
																											return res.render('categoria-noticias', {
																													title: "Noticias",
																													usuario: usuario,
																													list: list,
																													categorias: categorias,
																													botonAdmin : botonAdmin,
																													botonIniciaSesion : "invisible",
																													botonRegistrarse : "invisible",
																													botonCerrarSesion : "visible",
																													nombreCategoria: nombreCategoria,
																													menuCategorias: menuCategorias
																											});
																								} else {
																											// USUARIO NO LOGUEADO
																											return res.render('categoria-noticias', {
																													title: "Noticias",
																													usuario: usuario,
																													list: list,
																													categorias: categorias,
																													botonAdmin : "invisible",
																													botonIniciaSesion : "visible",
																													botonRegistrarse : "visible",
																													botonCerrarSesion : "invisible",
																													nombreCategoria: nombreCategoria,
																													menuCategorias: menuCategorias
																											});
																								}
																					});
																		}
															} else{
																			res.send("No acepta JSON");
															}
												});
										}
								})
						}
			});
});

// CARGO NOTICIA
router.get('/noticia/:url', function(req, res) {
			Account.find({username:'admin'}, function(err,admin){
						if ( admin.length < 1 ){
								return res.render('create-admin');
						} else {
								if ( req.user != undefined ){
										// USUARIO LOGUEADO
										var administrador = req.user.administrador;
										if ( administrador == "si" ){
												// USUARIO ADMIN LOGUEADO
												botonAdmin = "visible";
										} else {
												// USUARIO NORMAL LOGUEADO
												botonAdmin = "invisible";
										}
										botonIniciaSesion = "invisible";
										botonRegistrarse = "invisible";
										botonCerrarSesion = "visible";
								} else {
										// USUARIO NO LOGUEADO
										var usuario = req.user;
										botonAdmin = "invisible";
										botonIniciaSesion = "visible";
										botonRegistrarse = "visible";
										botonCerrarSesion = "invisible";
								}
								var url = req.params.url;
								// Obtenemos todas las noticias con este tag
								Noticia.find({url:url}, function(err, laNoticia){
											if (req.accepts('json')){
													if(err){
															return res.json(500, {message: 'Error obteniendo la noticia'});
													}
													if(!laNoticia){
															return res.json({message: "No se ha podido obtener noticia"});
													}
													var titular = laNoticia[0].nombre;
													var urlNoticia = laNoticia[0].url;
													var idNoticia = laNoticia[0].id;
													Categorias.find(function(err, categorias){
																if(err){
																	return res.json(500, {message: 'Error obteniendo las tareas'});
																}
																if ( categorias.length > 0 ){
																		menuCategorias = "visible";
																} else {
																		menuCategorias = "invisible";
																}
																Comentarios.find({url_noticia:urlNoticia}, function(err, comentariosNoticia){
																		if ( comentariosNoticia.length > 0 ){
																				// Si no hay error montamos un json a partir de la lista de tareas
																				return res.render('noticia', {
																						title: "Noticia",
																						laNoticia: laNoticia,
																						titular:titular,
																						urlNoticia:urlNoticia,
																						usuario: usuario,
																						categorias: categorias,
																						botonAdmin : botonAdmin,
																						botonIniciaSesion : botonIniciaSesion,
																						botonRegistrarse : botonRegistrarse,
																						botonCerrarSesion : botonCerrarSesion,
																						comentariosNoticia: comentariosNoticia
																				})
																		} else {
																				comentariosNoticia = new Array();
																				// Si no hay error montamos un json a partir de la lista de tareas
																				return res.render('noticia', {
																						title: "Noticia",
																						laNoticia: laNoticia,
																						titular:titular,
																						urlNoticia:urlNoticia,
																						usuario: usuario,
																						categorias: categorias,
																						botonAdmin : botonAdmin,
																						botonIniciaSesion : botonIniciaSesion,
																						botonRegistrarse : botonRegistrarse,
																						botonCerrarSesion : botonCerrarSesion,
																						comentariosNoticia: comentariosNoticia
																				})
																		}
																})
													})
											}else{
														res.send("No acepta JSON");
											}
								})
						}
			});
});

// CERRAR SESIÓN
router.get('/logout', function(req, res) {
		Account.find({username:'admin'}, function(err,admin){
					if ( admin.length < 1 ){
							return res.render('create-admin');
					} else {
							req.session.destroy(function(err) {
							})
							res.redirect('back');
					}
		});
});

// CARGO PANTALLA DE ADMINISTRADOR
router.get('/login', function(req, res) {
		Account.find({username:'admin'}, function(err,admin){
					if ( admin.length < 1 ){
							return res.render('create-admin');
					} else {
							if ( req.user != undefined ){
									var administrador = req.user.administrador;
									if ( administrador == "si" ){
											req.session.admin = 'si';
											// Obtenemos todas la tareas
											Noticia.find(function(err, list){
														// Comprobamos si podemos trabajar con el formato json
												if(req.accepts('json')){
														//Si encontramos algún tipo de error, lo notificamos
														if(err){
															return res.json(500, {message: 'Error obteniendo las tareas'});
														}
														// Si no hay error montamos un json a partir de la lista de tareas
														return res.render('admin', {title: "Admin",list: list});
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
					}
		});
});

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

// CARGO PANTALLA DE ADMINISTRADOR
router.get('/admin', function(req, res) {
		Account.find({username:'admin'}, function(err,admin){
					if ( admin.length < 1 ){
							return res.render('create-admin');
					} else {
							if ( req.user != undefined ){
									var administrador = req.user.administrador;
									if ( administrador == "si" ){
											req.session.admin = 'si';
											// Obtenemos todas la tareas
											Noticia.find(function(err, list){
														// Comprobamos si podemos trabajar con el formato json
												if(req.accepts('json')){
														//Si encontramos algún tipo de error, lo notificamos
														if(err){
															return res.json(500, {message: 'Error obteniendo las tareas'});
														}
														// Si no hay error montamos un json a partir de la lista de tareas
														return res.render('admin', {title: "Admin",list: list});
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
					}
		});
});

// CARGO PANTALLA DE RESULTADO DE BÚSQUEDA POR TAG
router.get('/tag/:tag', function(req, res) {
			Account.find({username:'admin'}, function(err,admin){
						if ( admin.length < 1 ){
								return res.render('create-admin');
						} else {
								if ( req.user != undefined ){
										// USUARIO LOGUEADO
										var administrador = req.user.administrador;
										if ( administrador == "si" ){
												// USUARIO ADMIN LOGUEADO
												botonAdmin = "visible";
										} else {
												// USUARIO NORMAL LOGUEADO
												botonAdmin = "invisible";
										}
										botonIniciaSesion = "invisible";
										botonRegistrarse = "invisible";
										botonCerrarSesion = "visible";
								} else {
										// USUARIO NO LOGUEADO
										var usuario = req.user;
										botonAdmin = "invisible";
										botonIniciaSesion = "visible";
										botonRegistrarse = "visible";
										botonCerrarSesion = "invisible";
								}
								var tag = req.params.tag;
								// Obtenemos todas las noticias con este tag
								Noticia.find({etiquetas: new RegExp(tag)}, function(err, noticias){
											if (req.accepts('json')){
														if(err){
																return res.json(500, {message: 'Error obteniendo la noticia'});
														}
														if(!noticias){
																return res.json({message: "No se ha podido obtener noticia"});
														}
														Categorias.find(function(err, categorias){
																	if(err){
																		return res.json(500, {message: 'Error obteniendo las categorias'});
																	}
																	if ( categorias.length > 0 ){
																			menuCategorias = "visible";
																	} else {
																			menuCategorias = "invisible";
																	}
																	// Si no hay error montamos un json a partir de la lista de tareas
																	return res.render('buscar', {
																			title: "Buscar",
																			usuario: usuario,
																			noticias: noticias,
																			categorias: categorias,
																			botonAdmin : botonAdmin,
																			botonIniciaSesion : botonIniciaSesion,
																			botonRegistrarse : botonRegistrarse,
																			botonCerrarSesion : botonCerrarSesion,
																			tag: tag
																	});
														})
											}else{
														res.send("No acepta JSON");
											}
								})
						}
			});
});

// CARGO PANTALLA DE REGISTRO
router.get('/registro', function(req, res) {
		Account.find({username:'admin'}, function(err,admin){
					if ( admin.length < 1 ){
							return res.render('create-admin');
					} else {
							errores = new Array();
							Categorias.find(function(err, categorias){
										res.render('registro', {
												title: 'Registro',
												errores: errores,
												categorias: categorias
										});
							});
					}
		});
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

// CARGO PANTALLA DE ACERCA DEL BLOG
router.get('/blog', function(req, res){
					Account.find({username:'admin'}, function(err,admin){
								if ( admin.length < 1 ){
										return res.render('create-admin');
								} else {
										// Comprobamos si podemos trabajar con el formato json
										if(req.accepts('json')){
													//Si encontramos algún tipo de error, lo notificamos
													Categorias.find(function(err, categorias){
																	//Si encontramos algún tipo de error, lo notificamos
																	if(err){
																		return res.json(500, {message: 'Error obteniendo las tareas'});
																	}
																	if ( categorias.length > 0 ){
																			menuCategorias = "visible";
																	} else {
																			menuCategorias = "invisible";
																	}
																	if ( req.user != undefined ){
																				// USUARIO LOGUEADO ( NORMAL O ADMIN )
																				var usuario = req.user.username;
																				var administrador = req.user.administrador;
																				if ( administrador == "si" ){
																						botonAdmin = "visible";
																				} else {
																						botonAdmin = "invisible";
																				}
																				return res.render('blog', {
																						usuario: usuario,
																						categorias: categorias,
																						botonAdmin : botonAdmin,
																						botonIniciaSesion : "invisible",
																						botonRegistrarse : "invisible",
																						botonCerrarSesion : "visible",
																						menuCategorias: menuCategorias
																				});
																	} else {
																				// USUARIO NO LOGUEADO
																				return res.render('blog', {
																						usuario: usuario,
																						categorias: categorias,
																						botonAdmin : "invisible",
																						botonIniciaSesion : "visible",
																						botonRegistrarse : "visible",
																						botonCerrarSesion : "invisible",
																						menuCategorias: menuCategorias
																				});
																	}
													});
										} else{
														res.send("No acepta JSON");
										}
								}
					});
});

module.exports = router;
