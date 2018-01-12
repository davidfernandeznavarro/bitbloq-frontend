'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:AlertsCtrl
 * @description
 * # AlertsCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('AlertsCtrl', function ($scope, alertsService, $sce, $translate) {
        $scope.alerts = alertsService.getInstance();
        $scope.generateSvgUrl = function (id) {
            var svg;
            switch (id) {
                case 'ok':
                    svg = 'tickCircle';
                    break;
                case 'error':
                    svg = 'warning';
                    break;
                case 'loading':
                    svg = 'loader';
                    break;
                default:
                    svg = id;
            }
            return 'images/sprite.svg#' + svg;
        };

        $scope.sanitizeMe = function (text) {
            return $sce.trustAsHtml($translate.instant(text));
        };
    });
