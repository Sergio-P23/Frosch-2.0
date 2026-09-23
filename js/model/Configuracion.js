/**
 * Created by ivan on 10/5/14.
 */
angular.module('Frosch')
    .factory('ConfiguracionService', function ($http, $translate) {

        var clase = function () {
            var me = this;
            this.equipos = false;
            this.maxPorEquipo = 1;
            this.puntos = 1000;
            this.numJugadores = 2;
            this.blanqueada = 0;
            this.tipoJuego = 'NORMAL';
            this.tipoMonona = 'SIN MOÑONA';
            this.descuentoBlanco = 'RULETA';
            this.tipoAnimacion = 'CLÁSICA';

            var httpPromise = $http.get('config/config.json');
            return httpPromise.then(function (httpResponse) {
                me.configuracion = httpResponse.data;
                return $translate.use(me.configuracion.idioma).then(function(){
                    return me;
                }); //el cambio de idioma es promise

            });
        };

        clase.prototype.setMaxPorEquipo = function (cantidad) {
            this.maxPorEquipo = cantidad * 1;
            this.equipos = this.maxPorEquipo > 1;
        };

        clase.prototype.setNumJugadores = function (numJugadores) {
            if (numJugadores !== Math.round(numJugadores))
                throw new Error("El número de jugadores debe ser exacto");

            if (numJugadores < 2 || numJugadores > 8)
                throw new Error("El número de jugadores debe estar entre 2 y 8");

            this.numJugadores = numJugadores;
        };

        return new clase();
    });
