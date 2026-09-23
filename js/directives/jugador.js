angular.module('Frosch')
    .factory('AvataresJugadores', function () {
        var avatares = [
            'BadBunnyJugador.webp', 'shakiraJugador.webp', 'MalumaJugador.webp', 'daddyYankeeJugador.webp',
            'diomedesDiazJugador.webp', 'pipeBuenoJugador.webp', 'VicenteFernandezJugador.webp', 'yeisonJimenezJugador.webp'
        ];

        return function (numero) {
            return 'assets/img/' + avatares[(numero - 1) % avatares.length];
        };
    })
    .directive('jugador', function (AvataresJugadores) {

        return {
            restrict: 'E',
            templateUrl: 'html/jugador.html',
            scope: {
                'jugador': '=',
                'maximo': '='
            },
            link: function (scope) {
                scope.avatarJugador = AvataresJugadores(scope.jugador.numero);
            }
        }
    });
