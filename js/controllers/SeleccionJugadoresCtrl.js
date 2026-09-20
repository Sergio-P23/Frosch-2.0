angular.module('Frosch')
    .controller('SeleccionJugadoresCtrl',
    function ($scope, $rootScope, $state, config, hotkeys) {


        $scope.iniciar = function () {
            if ($scope.creditosExactos()) {
                config.setNumJugadores($scope.numJugadores());
                $rootScope.restarCreditos($scope.numJugadores() * config.creditosPorJugador());
                $state.go('jugar.chico.principal');
            }
        };

        hotkeys.bindTo($scope)
            .add({
                combo: config.configuracion.keymap.enter,
                callback: $scope.iniciar
            });

        if (!config.puntos)
            $state.go('jugar.chico.seleccionPuntos');

        $scope.config = config;

        $scope.numJugadores = function () {
            return Math.min($scope.creditos / config.creditosPorJugador(), 6);
        };

        $scope.creditosJugador = function (numJugador) {
            return $scope.numJugadores() - (numJugador - 1);
        };

        $scope.creditosExactos = function () {
            return $scope.creditos && Math.round($scope.numJugadores()) === $scope.numJugadores() && $scope.numJugadores() > 1;
        };

        $scope.creditosFaltantes = function () {
            if ($scope.numJugadores() == 6)
                return false;

            return config.creditosPorJugador() - ($scope.creditos % config.creditosPorJugador());
        };

        $scope.siguienteJugador = function () {
            return Math.floor($scope.numJugadores() + 1);
        };


        $scope.sonido = function(){
            var creditos = 'credito'+config.creditosPorJugador();
            if(config.equipos)
                creditos += '_equipo';

            return creditos + '.ogg';
        };

        var keymap = config.configuracion.keymap;
        var teclaAtras = keymap.atras || 'left';
        var teclaSiguiente = keymap.siguiente || 'right';

        var ultimoAtras = 0;
        var toquesAtras = 0;

        function manejarAtras() {
            var ahora = Date.now();
            if (ahora - ultimoAtras < 600) {
                toquesAtras++;
            } else {
                toquesAtras = 1;
            }
            ultimoAtras = ahora;

            if (toquesAtras === 2) {
                $state.go('jugar.chico.seleccionPuntos');
                return;
            } else if (toquesAtras >= 3) {
                toquesAtras = 0;
                $state.go('inicio');
                return;
            }

            if ($rootScope.creditos > 0) {
                $rootScope.creditosExcedente++;
                $rootScope.creditos--;
                $rootScope.guardarCreditos();
            }
        }

        // Navegación con teclado
        hotkeys.bindTo($scope)
            .add({
                combo: teclaAtras + ' ' + teclaAtras,
                callback: function () {
                    $state.go('jugar.chico.seleccionPuntos');
                }
            })
            .add({
                combo: teclaAtras + ' ' + teclaAtras + ' ' + teclaAtras,
                callback: function () {
                    $state.go('inicio');
                }
            })
            .add({
                combo: teclaAtras,
                callback: manejarAtras
            })
            .add({
                combo: teclaSiguiente,
                callback: function(){
                    if($rootScope.creditosExcedente > 0) {
                        $rootScope.creditosExcedente--;
                        $rootScope.creditos++;
                        $rootScope.guardarCreditos();
                    }
                }
            });


    });