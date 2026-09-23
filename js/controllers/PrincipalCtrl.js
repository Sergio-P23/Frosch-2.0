angular.module('Frosch')
    .controller('PrincipalCtrl',
    function ($scope, $state, chico, config, hotkeys, audio, $timeout, AvataresJugadores) {

        if ($scope.configurarAudio) //en pruebas arranca aca de una entonces no esta el audio activo
            $scope.configurarAudio.stop();

        var lanzamientoAudio = new audio("lanzamiento.ogg", false);
        var cambioJugadorAudio = new audio("c_jugador.ogg", true);
        var giroAudio = new audio("ruleta-giro.ogg", false);
        var premioAudio = new audio("ruleta-premio.ogg", false);
        giroAudio.audio.volume = 0.6;
        premioAudio.audio.volume = 0.7;

        var keymap = config.configuracion.keymap;
        $scope.jugadores = chico.getJugadores();
        $scope.config = config;
        $scope.chico = chico;
        $scope.confeti = [];
        for (var confeti = 0; confeti < 32; confeti++) {
            $scope.confeti.push({ left: (confeti * 37) % 96 + 2, delay: (confeti * 0.43) % 6 });
        }

        $scope.jugadores[0].activar();

        var revelarTimer;
        var limpiarTimer;
        var finTimer;
        var giroTimer;
        var anuncioTimer;
        var valoresRuleta = [20, 25, 40, 50, 100, 150, 200, 500];

        function anunciarTurno() {
            $timeout.cancel(anuncioTimer);
            if (chico.termino) return;
            $scope.turnoAnunciado = chico.jugadorActual;
            $scope.avatarTurno = AvataresJugadores(chico.jugadorActual.numero);
            $scope.mostrarAnuncioTurno = true;
            anuncioTimer = $timeout(function () { $scope.mostrarAnuncioTurno = false; }, 1900);
        }

        anunciarTurno();


        function rotar(objetivo) {
            $timeout.cancel(revelarTimer);
            $timeout.cancel(limpiarTimer);
            $scope.objetivoActivo = objetivo.id;
            $scope.ruletaGirando = objetivo.variante === 'ruleta';
            $scope.ruletaRevelando = false;
            $scope.mostrarAnuncioTurno = false;
            $timeout.cancel(anuncioTimer);
            $scope.puntajeActualizado = false;
            $scope.ultimoPuntaje = null;
            if ($scope.ruletaGirando) {
                $scope.ruletaAngulo = 0;
                giroTimer = $timeout(function () {
                    $scope.ruletaAngulo = 1800 + (8 - $scope.ruletaIndice) * 45;
                }, 60);
            }
            revelarTimer = $timeout(function () {
                if ($scope.ruletaGirando)
                    $scope.ruletaRevelando = true;
                if ($scope.ruletaGirando)
                    premioAudio.play();
                $scope.puntajeActualizado = true;
                $scope.ultimoPuntaje = objetivo;
            }, $scope.ruletaGirando ? 1900 : 0);
            limpiarTimer = $timeout(function () {
                $scope.puntajeActualizado = false;
                $scope.objetivoActivo = null;
                $scope.ultimoPuntaje = null;
                $scope.ruletaGirando = false;
                $scope.ruletaRevelando = false;
            }, $scope.ruletaGirando ? 3700 : 1500);
            if ($scope.ruletaGirando)
                giroAudio.play();
            else
                lanzamientoAudio.play();
        }

        $scope.$on('$destroy', function () {
            $timeout.cancel(revelarTimer);
            $timeout.cancel(limpiarTimer);
            $timeout.cancel(finTimer);
            $timeout.cancel(giroTimer);
            $timeout.cancel(anuncioTimer);
            giroAudio.stop();
            premioAudio.stop();
        });

        $scope.sumarPuntos = function (orificio) {
            if (!chico.jugadorActual.terminoTurno && !$scope.ruletaGirando) {
                var objetivo = config.configuracion.tablero[orificio - 1];
                if (!objetivo)
                    return;
                if (objetivo.variante === 'ruleta') {
                    $scope.ruletaIndice = Math.floor(Math.random() * valoresRuleta.length);
                    $scope.ruletaResultado = valoresRuleta[$scope.ruletaIndice];
                    objetivo = angular.extend({}, objetivo, { puntos: $scope.ruletaResultado });
                }
                rotar(objetivo);

                chico.jugadorActual.sumarPuntos(objetivo.puntos, objetivo.id);
                // Los hotkeys se ejecutan fuera del ciclo normal de Angular en algunas versiones de NW.js.
                // Programar un digest garantiza que las tarjetas reflejen cada tiro inmediatamente.
                $scope.$applyAsync();

                if (chico.jugadorActual.monona || chico.jugadorActual.gano) {
                    var siguienteEstado = chico.jugadorActual.monona ? 'jugar.chico.principal.monona' : 'jugar.chico.principal.ganaste';
                    if (objetivo.variante === 'ruleta')
                        finTimer = $timeout(function () { $state.go(siguienteEstado); }, 3800);
                    else
                        $state.go(siguienteEstado);
                }


                chico.verificarTurno();
            }
        };

        $scope.cambiarTurno = function (turno) {

            if ($state.current.name != 'jugar.chico.principal')
                return; //por ahora no se cambia de turno en notificaciones

            try {
                chico.cambiarTurno(turno);
                $timeout(function () {
                    if(!chico.termino) {
                        cambioJugadorAudio.play();
                        anunciarTurno();
                    }
                }, chico.jugadorAnterior && chico.jugadorAnterior.blanqueado ? 3100 : 0);

                if (chico.jugadorAnterior && chico.jugadorAnterior.blanqueado) {
                    $state.go('jugar.chico.principal.blanqueado');
                }

            }
            catch (e) {
                console.error(e);
            }
        };


        // Hotkeys para los orificios
        var sumarPuntosCk = function sumarPuntosCk(orificio) {
            return function () {
                return $scope.sumarPuntos(orificio);
            }
        };

        var hotkeysBound = hotkeys.bindTo($scope);
        angular.forEach(config.configuracion.tablero, function (orificio, indice) {
            var numOrificio = indice + 1;
            hotkeysBound.add({
                combo: keymap['orificio' + numOrificio],
                callback: sumarPuntosCk(numOrificio)
            })
        });

        var cambiarTurnoCk = function cambiarTurnoCk(turno) {
            return function () {
                $scope.cambiarTurno(turno);
            }
        };

        // Hotkey para siguiente jugador con botón SIGUIENTE (right)
        var teclaSiguiente = keymap.siguiente || 'right';
        var teclaAtras = keymap.atras || 'left';

        hotkeysBound.add({
            combo: teclaSiguiente,
            callback: function () {
                $scope.cambiarTurno(true);
            }
        });

        // Hotkeys para cambios de turno individuales
        for (var i = 1; i <= 8; i++) {
            hotkeysBound.add({
                combo: keymap['jugador' + i],
                callback: cambiarTurnoCk(i)
            })
        }

        // Salir/cancelar juego con 3 veces atras (left left left)
        hotkeysBound
            .add({
                combo: teclaAtras + ' ' + teclaAtras + ' ' + teclaAtras,
                callback: function () {
                    $state.go('inicio');
                }
            });

    });
