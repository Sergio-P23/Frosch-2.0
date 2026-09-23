/**
 * Created by ivan on 10/5/14
 * Archivo principal de la aplicación
 */

angular.module('Frosch', ['ui.router', 'translate', 'cfp.hotkeys', 'com.2fdevs.videogular'])
  .config(
    function ($stateProvider, $urlRouterProvider, hotkeysProvider, $compileProvider) {

      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|chrome-extension|file|blob:chrome-extension:):/);
      $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|chrome-extension|file|blob:chrome-extension:):/);
      //Definicion de los estados
      $stateProvider.state('inicio', {
        url: "/inicio",
        controller: 'InicioCtrl',
        templateUrl: "html/inicio.html",
        resolve: {
          config: function (ConfiguracionService) {
            return ConfiguracionService; // se usa para obtener el idioma del sonido en el filter
          }
        }
      })
        .state('jugar', {
          url: '/jugar',
          template: '<ui-view/>',
          controller: 'JugarCtrl',
          resolve: {
            tanda: function (TandaCls, ConfiguracionService) {
              return new TandaCls(ConfiguracionService);
            },
            config: function (tanda) {
              return tanda.configuracion;
            }
          }
        })
        .state('jugar.reglas', {
          url: "/reglas",
          controller: 'ReglasCtrl',
          templateUrl: "html/reglas.html"
        })
        .state('jugar.nuevoChico', {
          url: "/nuevo",
          controller: function ($scope, $state, tanda) {
            tanda.nuevoChico();
            $state.go('jugar.chico.principal');
            if ($scope.configurarAudio)
              $scope.configurarAudio.play();
          },
          template: ""
        })
        .state('jugar.chico', {
          url: "/chico",
          template: '<ui-view/>',
          resolve: {
            chico: function (tanda, config) {
              return tanda.chicoActual;
            }
          }
        })
        .state('jugar.chico.principal', {
          url: "/frosch",
          controller: 'PrincipalCtrl',
          templateUrl: "html/principal.html"
        })
        .state('jugar.chico.principal.rana', {
          url: "/rana",
          controller: 'NotificacionCtrl',
          templateUrl: "html/rana.html",
          resolve: {
            jugador: function (chico) {
              return chico.jugadorActual;
            }
          }
        })
        .state('jugar.chico.principal.ranita', {
          url: "/ranita",
          controller: 'NotificacionCtrl',
          templateUrl: "html/ranita.html",
          resolve: {
            jugador: function (chico) {
              return chico.jugadorActual;
            }
          }
        })
        .state('jugar.chico.principal.monona', {
          url: "/monona",
          controller: 'NotificacionCtrl',
          templateUrl: "html/monona.html",
          resolve: {
            jugador: function (chico) {
              return chico.jugadorActual;
            }
          }
        })
        .state('jugar.chico.principal.ganaste', {
          url: "/ganaste",
          controller: 'NotificacionCtrl',
          templateUrl: "html/ganaste.html",
          resolve: {
            jugador: function (chico) {
              return chico.jugadorActual;
            }
          }
        })
        .state('jugar.chico.principal.blanqueado', {
          url: "/blanqueado",
          controller: 'NotificacionCtrl',
          templateUrl: "html/blanqueado.html",
          resolve: {
            jugador: function (chico) {
              return chico.jugadorAnterior;
            }
          }
        })
        .state('jugar.chico.principal.maxBlanqueadas', {
          url: "/maxBlanqueadas",
          controller: 'NotificacionCtrl',
          templateUrl: "html/maxBlanqueadas.html",
          resolve: {
            jugador: function (chico) {
              return chico.jugadorAnterior;
            }
          }
        })
        .state('jugar.chico.principal.termino', {
          url: "/fin",
          controller: 'FinChicoCtrl',
          templateUrl: "html/finChico.html"
        })
      ;


      hotkeysProvider.includeCheatSheet = false;
    }).run(function ($rootScope, hotkeys, audio) {

  /**
   * Debugging Tools
   *
   * Allows you to execute debug functions from the view
   */
  $rootScope.log = function (variable) {
    console.log(variable);
  };
  $rootScope.alert = function (text) {
    alert(text);
  };

  function salirApp() {
    console.log('Saliendo de la aplicacion (salirApp)...');

    // 1. NW.js
    try {
      if (typeof nw !== 'undefined' && nw.App && nw.App.quit) {
        nw.App.quit();
        return;
      }
    } catch (e) {}

    try {
      if (typeof require !== 'undefined') {
        var gui = require('nw.gui');
        gui.App.quit();
        return;
      }
    } catch (e) {}

    // 2. Capacitor Android
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App && window.Capacitor.Plugins.App.exitApp) {
        window.Capacitor.Plugins.App.exitApp();
        return;
      }
    } catch (e) {}

    // 3. Cordova / PhoneGap Android
    try {
      if (navigator.app && navigator.app.exitApp) {
        navigator.app.exitApp();
        return;
      }
    } catch (e) {}

    // 4. Android WebView interface
    try {
      if (window.Android && window.Android.exitApp) {
        window.Android.exitApp();
        return;
      }
    } catch (e) {}

    // 5. Navegador
    try {
      window.close();
    } catch (e) {}

    // 6. Notificacion en pruebas de navegador si el tab no se puede cerrar por seguridad
    alert('Saliendo del juego (Exit)...');
  }

  // Listener global directo para garantizar la captura de 3 pulsaciones rapidas de LEFT
  var leftPressCount = 0;
  var leftPressTimer = null;

  window.addEventListener('keydown', function (e) {
    var key = e.key || '';
    var code = e.keyCode || e.which;
    if (key === 'ArrowLeft' || code === 37 || key === 'left') {
      leftPressCount++;
      clearTimeout(leftPressTimer);

      if (leftPressCount >= 3) {
        leftPressCount = 0;
        salirApp();
      } else {
        leftPressTimer = setTimeout(function () {
          leftPressCount = 0;
        }, 1000);
      }
    } else {
      leftPressCount = 0;
    }
  }, true);

  hotkeys.bindTo($rootScope)
    .add({
      combo: 'left left left',
      callback: salirApp
    })
    .add({
      combo: 'backspace',
      callback: function (event) {
        event.preventDefault();
      }
    })

});
