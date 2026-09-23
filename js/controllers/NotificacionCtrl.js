angular.module('Frosch')
    .controller('NotificacionCtrl',
    function ($scope, $state, config, $timeout, jugador, chico, audio) {

        $scope.jugador = jugador;
        var esVictoria = $state.current.name === 'jugar.chico.principal.ganaste';
        var celebracionAudio;
        if (esVictoria) {
            $scope.confetiVictoria = [];
            for (var i = 0; i < 28; i++)
                $scope.confetiVictoria.push({left: (i * 43) % 96 + 2, delay: (i * .27) % 3.8});
            celebracionAudio = new audio('victoria-fiesta.ogg', false);
            celebracionAudio.audio.volume = .32;
            celebracionAudio.play();
        }


        var timer = $timeout(function () {

            if (jugador.monona && $state.current.name != 'jugar.chico.principal.monona' && $state.current.name != 'jugar.chico.principal.ganaste')
                $state.go('jugar.chico.principal.monona');
            else if (jugador.gano && $state.current.name != 'jugar.chico.principal.ganaste')
                $state.go('jugar.chico.principal.ganaste');
            else if (chico.termino)
                $state.go('jugar.chico.principal.termino');
            else
                $state.go('jugar.chico.principal')
        }, esVictoria ? 4800 : 3000);

        $scope.$on("$destroy",
            function (event) {
                $timeout.cancel(timer);
                if (celebracionAudio)
                    celebracionAudio.stop();
            }
        );

    });
