var router = require('express').Router();
var Noticia = require('../models/noticias.js');
var Categorias = require('../models/categorias.js');
var passport = require('passport');
var Account = require('../models/account.js');
var Comentarios = require('../models/comentarios.js');
var multer  = require('multer'); // MÓDULO PARA SUBIR FOTOS CON LA NOTICIA
var storage = multer.diskStorage({  // ESTO ES PARA AÑADIR LA EXTENSIÓN DE LA IMAGEN CUANDO SUBO LA FOTO
	  destination: function (req, file, cb) {
	    cb(null, './public/images/noticias/')
	  },
	  filename: function (req, file, cb) {
					var extension = file.mimetype;
					if ( extension == "image/jpeg"){
							ext = '.jpg';
					}
					if ( extension == "image/png"){
							ext = '.png';
					}
			    cb(null, Date.now() + ext) //Appending .jpg
	  }
})
var upload = multer({ storage: storage });
var fs = require('fs');  // ESTO LO NECESITO PARA ELIMINAR LAS FOTOS DE LAS NOTICIAS


////////// ---------  NOTICIAS -------------//////////////////////////////////

//FORMULARIO PARA CREAR NUEVA NOTICIA
router.get('/nueva', function(req, res) {
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

// PUBLICO UNA NOTICIA
router.post('/nueva', upload.single('imagen'), function(req, res){
		var url = req.body['url'];
		if ( req.file ){
				var foto = req.file.filename;
		} else {
				var foto = "";
		}
		Noticia.find({url:url}).count(function(e,count){
				if ( count > 0 ){
							errores = new Array();
							errores.push('Ya hay un post con este nombre');
							Categorias.find(function(err, categorias){
										//Si encontramos algún tipo de error, lo notificamos
										if(err){
											return res.json(500, {message: 'Error obteniendo las categorias'});
										}
										if ( categorias.length > 0 ){
												selectCategorias = "visible";
										} else {
												selectCategorias = "invisible";
										}
										return res.render('nueva', {
												title: "Nueva noticia",
												categorias: categorias,
												selectCategorias: selectCategorias,
												errores: errores
										});
							});
				} else {
							// Creamos la NOTICIA a partir de los parámetros de la petición
							var fecha = new Date();
							var dia = fecha.getDate();
							var mes = fecha.getMonth();
							var anho = fecha.getFullYear();
							var diaActual = dia + "-" + mes + "-" + anho;
							var noticia = new Noticia({
										// En req.body tenemos todos los parámetros almacenados
										// en nuestra petición POST
										'nombre': req.body['nombre'],
										'url': url,
										'descripcion': req.body['descripcion'],
										'categoria': req.body['categoria'],
										'foto': foto,
										'fecha': diaActual,
										'etiquetas': req.body['etiquetas']
							});
							noticia.save(function(err, t){
									if(err){
										return res.json(500, {message: "Error guardando la noticia", error: err});
									}
									res.redirect('/admin');
							});
				}
		});
});

// OBTENGO DATOS DE UNA NOTICIA PARA EDITARLO
router.get('/edit/:id', function(req, res) {
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

//EDITO UNA NOTICIA
router.post('/edit/:id', upload.single('imagenNueva'), function(req, res) {
		var id = req.params.id;
		var nombre = req.body.nombre;
		var url = req.body.url;
		var descripcion = req.body.descripcion;
		var categoria = req.body.categoria;
		var etiquetas = req.body.etiquetas;

		if ( req.file ){
				var foto = req.file.filename;
		} else {
				var foto = "";
		}
		// ESTO SIRVE PARA SABER SI SE HAN HECHO CAMBIOS EN EL CAMPO FOTO
		var fotoNueva = req.body.fotoNueva;
		var imagen = req.body.imagen;
		// HA HABIDO CAMBIOS EN EL CAMPO FOTO
		if ( fotoNueva == "si" ){
					// PRIMERO SE BORRA LA FOTO VIEJA, SI ES QUE HABÍA
					var fotoVieja = req.body.fotoVieja;
					if ( fotoVieja != "" ){
							fs.unlink('./public/images/noticias/'+fotoVieja)
					}
					// ESTO ES QUE HAY UNA IMAGEN NUEVA
					if ( imagen != "" ){
							// ACTUALIZO LA NOTICIA
							Noticia.findByIdAndUpdate(
									id,
									{
									$set: {
												nombre: nombre,
												url: url,
												descripcion: descripcion,
												categoria: categoria,
												foto: foto,
												etiquetas: etiquetas
										}
									},
									function (err, noticia) {
												if(err){
														return res.json(500, {message: "Error editando la noticia", error: err});
												}
												res.redirect('/admin');
									}
							);
					} else {
					// ESTO ES QUE NO HAY UNA IMAGEN NUEVA
							imagen = "";
							// ACTUALIZO LA NOTICIA
							Noticia.findByIdAndUpdate(
									id,
									{
									$set: {
												nombre: nombre,
												url: url,
												descripcion: descripcion,
												categoria: categoria,
												foto: imagen,
												etiquetas: etiquetas
										}
									},
									function (err, noticia) {
												if(err){
														return res.json(500, {message: "Error editando la noticia", error: err});
												}
												res.redirect('/admin');
									}
							);
					}
		} else {
				// NO HA HABIDO CAMBIOS EN EL CAMPO FOTO
				Noticia.findByIdAndUpdate(
						id,
						{
						$set: {
									nombre: nombre,
									url: url,
									descripcion: descripcion,
									categoria: categoria,
							    etiquetas: etiquetas
							}
						},
						function (err, noticia) {
									if(err){
											return res.json(500, {message: "Error editando la noticia", error: err});
									}
									res.redirect('/admin');
						}
				);
		}
});

// BORRO UNA NOTICIA
router.get('/delete/:id', function(req, res) {
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

router.get('/categorias', function(req, res) {
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
router.get('/nueva-categoria', function(req, res) {
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

// PUBLICO UNA CATEGORIA
router.post('/nueva-categoria', function(req, res){
		var categoria = new Categorias({
			// En req.body tenemos todos los parámetros almacenados
			// en nuestra petición POST
			'nombre': req.body['nombre'],
			'url': req.body['url']
		});
		// Salvamos la CATEGORIA que acabamos de crear y comprobamos
		// los errores.
		categoria.save(function(err, t){
			if(req.accepts('json')){
				if(err){
					return res.json(500, {message: "Error guardando la categoria", error: err});
				}
				res.redirect('/admin/categorias');
			}else{
			     res.send("No acepta JSON");
			}
		});
});

// OBTENGO DATOS DE UNA NOTICIA PARA EDITARLO
router.get('/editar-categoria/:idCategoria', function(req, res) {
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

//EDITO UNA CATEGORIA
router.post('/editar-categoria/:idCategoria', function(req, res) {
		var idCategoria = req.params.idCategoria;
		Categorias.findByIdAndUpdate(
				idCategoria,
				{
				$set: {
							nombre: req.body['nombre'],
							url: req.body['url']
					}
				},
				function (err, noticia) {
							if(err){
									return res.json(500, {message: "Error editando la noticia", error: err});
							}
							res.redirect('/admin/categorias');
				}
		);
});

// BORRO UNA CATEGORIA
router.get('/delete-categoria/:idCategoria', function(req, res) {
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
router.get('/usuarios', function(req, res) {
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
router.get('/crearUsuario', function(req, res) {
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

// GUARDO UN NUEVO USUARIO
router.post('/crearUsuario', function(req, res) {
			errores = new Array();
			if ( req.body.username == "" ){
				errores.push("Debe rellenar el campo Nombre");
			}
			if ( req.body.password == "" ){
				errores.push("Debe rellenar el campo Passsword");
			}
	    if( errores.length == 0 ){  //No errors were found.  Passed Validation!
	        Account.register(new Account({
							username : req.body.username,
							administrador: req.body.administrador }),
					req.body.password, function(err, account) {
							if (err) {
									console.log (err);
									res.redirect('./usuarios');
							}
							res.redirect('./usuarios');
					});
	    } else {   //Display errors to user
	        res.render('nuevo-usuario', {
	            title: 'Nuevo usuario',
	            errores: errores
	        });
	    }

});

// OBTENGO DATOS DE UN USUARIO PARA EDITARLO
router.get('/editarUsuario/:id', function(req, res) {
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

//EDITO UN USUARIO
router.post('/editarUsuario/:id', function(req, res) {
		var id = req.params.id;
		Account.findByIdAndUpdate(
				id,
				{
				$set: {
							username: req.body['username'],
							administrador: req.body['administrador']
					}
				},
				function (err, noticia) {
							if(err){
									return res.json(500, {message: "Error editando el usuario", error: err});
							}
							res.redirect('/admin/usuarios');
				}
		);

});

// BORRO UN USUARIO
router.get('/borrarUsuario/:id', function(req, res) {
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
router.get('/comentarios', function(req, res) {
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
router.get('/editarComentario/:id', function(req, res) {
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

//EDITO UN COMENTARIO
router.post('/editarComentario/:id', function(req, res) {
		var id = req.params.id;
		Comentarios.findByIdAndUpdate(
				id,
				{
				$set: {
							mensaje: req.body['mensaje']
					}
				},
				function (err, noticia) {
							if(err){
									return res.json(500, {message: "Error editando el comentario", error: err});
							}
							res.redirect('/admin/comentarios');
				}
		);

});

// BORRO UN COMENTARIO
router.get('/borrarComentario/:id', function(req, res) {
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
router.get('/salir', function(req, res) {
		req.session.destroy(function(err) {
		})
		res.redirect('/');
});


module.exports = router;
