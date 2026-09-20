angular.module('Frosch')
    .controller('BotonesCtrl', function ($scope, $timeout, hotkeys) {
        'use strict';

        var keymap = $scope.keymap || {};
        var teclaSiguiente = keymap.siguiente || 'right';
        var teclaAtras = keymap.atras || 'left';
        var teclaEnter = keymap.enter || 'enter';

        function avanzar() {
            $scope.seleccionado++;
            if ($scope.seleccionado > $scope.max) {
                $scope.seleccionado = 1;
            }
        }

        var ultimoAtras = 0;

        function retroceder() {
            var ahora = Date.now();
            if (ahora - ultimoAtras < 600) {
                ultimoAtras = 0;
                volver();
                return;
            }
            ultimoAtras = ahora;

            $scope.seleccionado--;
            if ($scope.seleccionado < 1) {
                $scope.seleccionado = $scope.max;
            }
        }

        function volver() {
            if ($scope.callback && typeof $scope.callback.volver === 'function') {
                $scope.callback.volver();
            }
        }

        hotkeys.bindTo($scope)
            .add({
                combo: teclaSiguiente,
                callback: avanzar
            })
            .add({
                combo: teclaAtras,
                callback: retroceder
            })
            .add({
                combo: teclaAtras + ' ' + teclaAtras,
                callback: volver
            })
            .add({
                combo: teclaEnter,
                callback: function () {
                    if ($scope.seleccionado && $scope.callback && typeof $scope.callback.configurar === 'function') {
                        $scope.callback.configurar($scope.seleccionado);
                    }
                }
            });

        $scope.seleccionado = 1;
    });
