//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
function seteoTexto(texto){
    var texto = texto.replace(/A/g,"a");
    var texto = texto.replace(/B/g,"b");
    var texto = texto.replace(/C/g,"c");
    var texto = texto.replace(/D/g,"d");
    var texto = texto.replace(/E/g,"e");
    var texto = texto.replace(/F/g,"f");
    var texto = texto.replace(/G/g,"g");
    var texto = texto.replace(/H/g,"h");
    var texto = texto.replace(/I/g,"i");
    var texto = texto.replace(/J/g,"j");
    var texto = texto.replace(/K/g,"k");
    var texto = texto.replace(/L/g,"l");
    var texto = texto.replace(/M/g,"m");
    var texto = texto.replace(/N/g,"n");
    var texto = texto.replace(/Ñ/g,"n");
    var texto = texto.replace(/O/g,"o");
    var texto = texto.replace(/P/g,"p");
    var texto = texto.replace(/Q/g,"q");
    var texto = texto.replace(/R/g,"r");
    var texto = texto.replace(/S/g,"s");
    var texto = texto.replace(/T/g,"t");
    var texto = texto.replace(/U/g,"u");
    var texto = texto.replace(/V/g,"v");
    var texto = texto.replace(/W/g,"w");
    var texto = texto.replace(/X/g,"x");
    var texto = texto.replace(/Y/g,"y");
    var texto = texto.replace(/Z/g,"z");
    var texto = texto.replace(/Á/g,"a");
    var texto = texto.replace(/É/g,"e");
    var texto = texto.replace(/Í/g,"i");
    var texto = texto.replace(/Ó/g,"o");
    var texto = texto.replace(/Ú/g,"u");
    var texto = texto.replace(/á/g,"a");
    var texto = texto.replace(/é/g,"e");
    var texto = texto.replace(/í/g,"i");
    var texto = texto.replace(/ó/g,"o");
    var texto = texto.replace(/ú/g,"u");
    var texto = texto.replace(/ñ/g,"n");
    var texto = texto.replace(/ /g,"_");
    return texto;
}

$(function() {
      $('#side-menu').metisMenu();
      $(window).bind("load resize", function() {
            topOffset = 50;
            width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
            if (width < 768) {
                $('div.navbar-collapse').addClass('collapse');
                topOffset = 100; // 2-row-menu
            } else {
                $('div.navbar-collapse').removeClass('collapse');
            }

            height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
            height = height - topOffset;
            if (height < 1) height = 1;
            if (height > topOffset) {
                $("#page-wrapper").css("min-height", (height) + "px");
            }
      });

      $('#titNoticia').blur(function(){
          var texto = $(this).val();
          var textoSeteado = seteoTexto(texto);
          $('#urlNoticia').val(textoSeteado);
      });

      $('#titCategoria').blur(function(){
          var texto = $(this).val();
          var textoSeteado = seteoTexto(texto);
          $('#urlCategoria').val(textoSeteado);
      });

      var liActivo = $('#page-wrapper').attr('class');
      $('#side-menu li.'+liActivo+' a').addClass('active');

      // VALIDO PANTALLA GRABAR/EDITAR NOTICIA
      $('form#nueva #nuevaNoticia').click(function(e){
            e.preventDefault();
            var errores = new Array();
            if ( $('form#nueva input[name="nombre"]').val().length < 3 || $('form#nueva input[name="nombre"]').val() == ""  ){
                  errores.push('El titular debe tener 3 caracteres mínimo');
            }
            if ( $('form#nueva textarea').val().length < 20 || $('form#nueva textarea').val() == ""  ){
                errores.push('El campo descripción debe tener 20 caracteres mínimo');
            }
            if ( errores.length > 0 ){
                $('.errorMessage ul').empty();
                for ( i=0; i<errores.length; i++ ){
                    var errorIterado = $('<li>'+errores[i]+'</li>');
                    errorIterado.appendTo('.errorMessage ul');
                }
                $('.errorMessage').show();
            } else {
                $('#nueva').submit();
            }
      });

      // VALIDO PANTALLA GRABAR/EDITAR CATEGORIA
      $('form#categoria button#formCat').click(function(e){
            e.preventDefault();
            var errores = new Array();
            if ( $('form#categoria input[name="nombre"]').val().length < 3 || $('form#categoria input[name="nombre"]').val() == ""  ){
                errores.push('El campo nombre debe tener 3 caracteres mínimo');
            }
            if ( $('form#categoria input[name="url"]').val().length < 3 || $('form#categoria input[name="url"]').val() == ""  ){
                errores.push('El campo url debe tener 3 caracteres mínimo');
            }
            if ( errores.length > 0 ){
                $('.errorMessage ul').empty();
                for ( i=0; i<errores.length; i++ ){
                    var errorIterado = $('<li>'+errores[i]+'</li>');
                    errorIterado.appendTo('.errorMessage ul');
                }
                $('.errorMessage').show();
            } else {
                $('form#categoria').submit();
            }
      });

      // VALIDO PANTALLA EDITAR USUARIO
      $('form#editar-usuario button#formUsr').click(function(e){
            e.preventDefault();
            if ( $('form#editar-usuario input[name="username"]').val().length < 3 || $('form#editar-usuario input[name="username"]').val() == ""  ){
                alert('El campo username debe tener 3 caracteres mínimo');
            } else {
                $('form#editar-usuario').submit();
            }
      });

      // VALIDO PANTALLA EDITAR COMENTARIO
      $('form#editar-comentario button#comentUsr').click(function(e){
            e.preventDefault();
            if ( $('form#editar-comentario textarea').val() == ""  ){
                alert('El campo mensaje no puede estar vacío');
            } else {
                $('form#editar-comentario').submit();
            }
      });


      $('.botonBorrar').click(function(){
          return confirm('Estás seguro de borrar este item?');
      });

      $('#borrarFoto').click(function(e){
            e.preventDefault();
            $('input[name="fotoNueva"]').val('si');
            $('.imagenNoticia,#borrarFoto').hide();
            $('.oculto#subirFoto').css('visibility','visible');
      });

      $('#subirFoto').change(function(){
            if ( $(this).val() != "" ){
                 $('input[name="fotoNueva"]').val('si');
            } else {
                 $('input[name="fotoNueva"]').val('no');
            }
      });

});

$(window).load(function(){
      if( $('#page-wrapper').hasClass('noticias') ){
          $('#noticias').DataTable({
                  responsive: true,
                  language: {
                      url: 'javascripts/castellano.json'
                  }
          });
      }
      if( $('#page-wrapper').hasClass('categorias') ){
          $('#categorias').DataTable({
                  responsive: true,
                  language: {
                      url: '../javascripts/castellano.json'
                  }
          });
      }
      if( $('#page-wrapper').hasClass('usuarios') ){
          $('#usuarios').DataTable({
                  responsive: true,
                  language: {
                      url: '../javascripts/castellano.json'
                  }
          });
      }
      if( $('#page-wrapper').hasClass('comentarios') ){
          $('#comentarios').DataTable({
                  responsive: true,
                  language: {
                      url: '../javascripts/castellano.json'
                  }
          });
      }
});
