angular.module('Frosch')
    .controller('ReglasCtrl', function ($scope, $state, tanda, config, hotkeys) {
        var keymap = config.configuracion.keymap;
        var teclaSiguiente = keymap.siguiente || 'right';
        var teclaAtras = keymap.atras || 'left';
        var ultimoAtras = 0;

        $scope.seleccionado = 0;
        $scope.config = config;
        $scope.opciones = [
            { etiqueta: 'TIPO DE JUEGO', propiedad: 'tipoJuego', valores: ['NORMAL', 'POR EQUIPOS'] },
            { etiqueta: 'NÚMERO DE JUGADORES', propiedad: 'numJugadores', valores: [2, 3, 4, 5, 6, 7, 8] },
            { etiqueta: 'PUNTAJE DEL CHICO', propiedad: 'puntos', valores: [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000] },
            { etiqueta: 'TIPO DE MOÑONA', propiedad: 'tipoMonona', valores: ['SIN MOÑONA'] },
            { etiqueta: 'DESCUENTO DE BLANCO', propiedad: 'descuentoBlanco', valores: ['RULETA', '-10 PUNTOS', '-20 PUNTOS', '-50 PUNTOS'] },
            { etiqueta: 'TIPO DE ANIMACIÓN', propiedad: 'tipoAnimacion', valores: ['CLÁSICA'] }
        ];

        $scope.valor = function (opcion) {
            return config[opcion.propiedad];
        };

        function aplicarConfiguracion() {
            config.setMaxPorEquipo(config.tipoJuego === 'POR EQUIPOS' ? 2 : 1);
            config.setNumJugadores(config.numJugadores);
            // Estas reglas quedan visibles y preparadas para su lógica futura.
            config.configuracion.monona = false;
            // Las penalizaciones recuperan la regla de seis blancos del juego.
            // RULETA conserva el comportamiento actual sin descuento fijo.
            config.blanqueada = config.descuentoBlanco === 'RULETA' ? 0 : parseInt(config.descuentoBlanco, 10);
        }

        $scope.cambiarValor = function () {
            if ($scope.seleccionado === $scope.opciones.length) {
                aplicarConfiguracion();
                tanda.nuevoChico();
                $state.go('jugar.chico.principal');
                return;
            }

            var opcion = $scope.opciones[$scope.seleccionado];
            var indice = opcion.valores.indexOf(config[opcion.propiedad]);
            config[opcion.propiedad] = opcion.valores[(indice + 1) % opcion.valores.length];
        };

        $scope.siguiente = function () {
            $scope.seleccionado = ($scope.seleccionado + 1) % ($scope.opciones.length + 1);
        };

        $scope.atras = function () {
            var ahora = Date.now();
            if (ahora - ultimoAtras < 600) {
                $state.go('inicio');
                return;
            }
            ultimoAtras = ahora;
            $scope.seleccionado = ($scope.seleccionado + $scope.opciones.length) % ($scope.opciones.length + 1);
        };

        hotkeys.bindTo($scope)
            .add({ combo: teclaSiguiente, callback: $scope.siguiente })
            .add({ combo: teclaAtras, callback: $scope.atras })
            .add({ combo: keymap.enter || 'enter', callback: $scope.cambiarValor });
    });
