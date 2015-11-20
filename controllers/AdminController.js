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



////////// ---------  USUARIOS -------------//////////////////////////////////


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



////////// ---------  COMENTARIOS -------------//////////////////////////////////


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


module.exports = router;
