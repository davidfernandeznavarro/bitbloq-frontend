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
        /*Private vars*/
        //var serialHub = web2boardV2.api.SerialMonitorHub,
        var textArea = $element.find('#serialData'),
            autoScrollActivated = true;
        //its setted when the windows its open
        //$scope.board

        /*Private functions*/
        function scrollTextAreaToBottom() {
            $timeout(function () {
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
            }, 0);
        }

        /*Set up web2board api*/
        //when web2board tries to call a client function but it is not defined
        /*web2boardV2.api.onClientFunctionNotFound = function (hub, func) {
            console.error(hub, func);
        };*/

        /*serialHub.client.received = function (port, data) {
            if (port === $scope.port && !$scope.pause && angular.isString(data)) {
                $scope.serial.dataReceived += data;
                var dataLen = $scope.serial.dataReceived.length;
                if (dataLen > textAreaMaxLength) {
                    $scope.serial.dataReceived = $scope.serial.dataReceived.slice(dataLen - textAreaMaxLength);
                }
                scrollTextAreaToBottom();
            }
        };*/

        // function called when someone writes in serial (including ourselves)
        // serialHub.client.written = function (message) {
        //     $scope.serial.dataReceived += message;
        // };

        $scope.web2board = web2board;
        $scope.baudrateOptions = [300, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200];
        $scope.currentBaudRate = 9600;
        $scope.serialPortData = '';
        $scope.inputText = '';
        /*$scope.serial = {
            dataReceived: '',
            input: '',
            baudrate: 9600
        };*/
        $scope.portNames = [];
        $scope.ports = [];

        $scope.selectedPort = null;
        $scope.pause = false;
        $scope.pauseText = $translate.instant('serial-pause');

        /*Public functions*/
        $scope.send = function () {
            /*if (common.useChromeExtension() || $scope.forceChromeExtension) {
                chromeAppApi.sendSerialData($scope.serial.input);
            } else {
                serialHub.server.write($scope.port, $scope.serial.input);
            }
            $scope.serial.input = '';*/

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
            /*if (common.useChromeExtension() || $scope.forceChromeExtension) {
                chromeAppApi.changeBaudrate(baudrate);
            } else {
                serialHub.server.changeBaudrate($scope.port, baudrate);
            }*/
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
            // chromeAppApi.getSerialData($scope.selectedPort);
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


        /*Init functions*/
        textArea.on('scroll', scrollHandler);
        $scope.getPorts();


        /*if (common.useChromeExtension() || $scope.forceChromeExtension) {
            console.log($scope.board);
            $scope.showPorts = true;
            $scope.getPorts();
        } else {
            serialHub.server.subscribeToPort($scope.port);

            serialHub.server.startConnection($scope.port, $scope.serial.baudrate)
                .catch(function (error) {
                    if (error.error.indexOf('already in use') > -1) {
                        $scope.onBaudrateChanged($scope.serial.baudrate);
                    } else {
                        console.error(error);
                    }
                });

            $scope.setOnUploadFinished(function () {
                $scope.onBaudrateChanged($scope.serial.baudrate);
            });
        }

        var serialEvent = $rootScope.$on('serial', function (event, msg) {
            if (!$scope.pause && angular.isString(msg)) {
                $scope.serial.dataReceived += msg;
                var dataLen = $scope.serial.dataReceived.length;
                if (dataLen > textAreaMaxLength) {
                    $scope.serial.dataReceived = $scope.serial.dataReceived.slice(dataLen - textAreaMaxLength);
                }
                scrollTextAreaToBottom();
            }
        });
        $scope.$on('$destroy', function () {
            if (common.useChromeExtension() || $scope.forceChromeExtension) {
                chromeAppApi.stopSerialCommunication();
                web2board.setInProcess(false);
            } else {
                serialHub.server.unsubscribeFromPort($scope.port)
                    .then(function () {
                        return serialHub.server.closeUnusedConnections();
                    });
            }
            serialEvent();

        })
        ;*/
        $scope.$on('$destroy', function () {
            console.log('$destroy');
            textArea.off('scroll', scrollHandler);
            web2board.closeSerialPort();
        });
    });
