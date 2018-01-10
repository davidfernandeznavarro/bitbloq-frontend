/*jshint camelcase: false */
'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('SerialMonitorCtrl', function ($scope, _, web2boardV2, $translate, $timeout, $element, chromeAppApi, common,
        $rootScope, web2board, hardwareService, utils) {

        var textArea = $element.find('#serialData'),
            autoScrollActivated = true;

        function scrollTextAreaToBottom() {
            $timeout(function () {
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
            }, 0);
        }

        $scope.web2board = web2board;
        $scope.baudrateOptions = [300, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200];
        $scope.currentBaudRate = 9600;
        $scope.serialPortData = '';
        $scope.inputText = '';

        $scope.portNames = [];
        $scope.ports = [];

        $scope.selectedPort = null;
        $scope.pause = false;
        $scope.pauseText = $translate.instant('serial-pause');


        $scope.send = function () {

            web2board.sendToSerialPort({
                data: $scope.inputText
            });
            $scope.inputText = '';
        };

        $scope.onKeyPressedInInput = function (event) {
            if (event.which === 13) {
                $scope.send();
            }
        };

        $scope.onBaudrateChanged = function (baudRate) {
            $scope.currentBaudRate = baudRate;
            $scope.setPort($scope.selectedPort.portName, true);
        };

        $scope.onPause = function () {
            $scope.pause = !$scope.pause;
            if ($scope.pause) {
                web2board.pauseSerialPort({
                    pause: true
                }).then(function () {
                    web2board.serial.serialPortData += '\n\n' + $translate.instant('plotter-pause') + '\n\n';
                    scrollTextAreaToBottom();
                    $scope.pauseText = $translate.instant('serial-play');
                }, function () {
                    $scope.pause = false;
                    $scope.pauseText = $translate.instant('serial-pause');
                });
            } else {
                web2board.pauseSerialPort({
                    pause: false
                }).then(function () {
                    scrollTextAreaToBottom();
                    $scope.pauseText = $translate.instant('serial-pause');
                }, function () {
                    $scope.pause = true;
                    $scope.pauseText = $translate.instant('serial-play');
                });
            }
        };

        $scope.getPorts = function () {
            web2board.getPorts().then(function (response) {
                var ports = response.data;
                console.log('ports SerialMonitorCtrl', ports);
                $scope.ports = ports;

                hardwareService.itsHardwareLoaded().then(function () {
                    utils.getPortsPrettyNames($scope.ports, hardwareService.hardware.boards);
                    $scope.portNames = [];

                    for (var i = 0; i < $scope.ports.length; i++) {
                        $scope.portNames.push($scope.ports[i].portName);
                    }

                    var portWithUserSelectedBoard = utils.getPortByBoard($scope.ports, hardwareService.boardsMap[$scope.currentProject.hardware.board]);
                    if (portWithUserSelectedBoard) {
                        $scope.setPort(portWithUserSelectedBoard.portName);
                    } else if ($scope.portNames.length > 0) {
                        $scope.setPort($scope.portNames[0]);
                    }
                });
            });
        };

        $scope.setPort = function (portName, forceReconnect) {
            var port = _.find($scope.ports, {
                portName: portName
            });

            $scope.selectedPort = port;
            web2board.clearSerialPortData();
            web2board.openSerialPort({
                port: $scope.selectedPort.comName,
                baudRate: $scope.currentBaudRate,
                scopeRefreshFunction: refreshScope,
                forceReconnect: forceReconnect
            }).then(function (response) {
                console.log('ok openSerialPort', response);
            }, function (error) {
                console.log('error openSerialPort', error);
            });
        };
        function refreshScope() {
            if (autoScrollActivated) {
                scrollTextAreaToBottom();
            }
            utils.apply($scope);
        }

        function scrollHandler() {
            if ((textArea[0].scrollTop) < (textArea[0].scrollHeight - textArea.height() - 40)) {
                autoScrollActivated = false;
            } else {
                autoScrollActivated = true;
            }
        }

        textArea.on('scroll', scrollHandler);
        $scope.getPorts();


        $scope.$on('$destroy', function () {
            console.log('$destroy');
            textArea.off('scroll', scrollHandler);
            web2board.closeSerialPort();
        });
    });