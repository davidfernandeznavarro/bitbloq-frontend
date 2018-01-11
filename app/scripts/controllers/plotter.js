/*jshint camelcase: false */
'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:PlotterCtrl
 * @description
 * # PlotterCtrl
 * Plotter controller
 */
angular.module('bitbloqApp')
    .controller('PlotterCtrl', function ($element, web2board, $timeout, $scope, $translate, common, utils, hardwareService, $rootScope, _) {


        var receivedDataCount = -1;


        $scope.baudrateOptions = [300, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200];
        $scope.currentBaudRate = 9600;
        $scope.portNames = [];
        $scope.ports = [];

        $scope.selectedPort = null;
        $scope.pause = false;
        $scope.pauseText = $translate.instant('serial-pause');

        $scope.data = [{
            values: [],
            color: '#82ad3a'
        }];

        $scope.chartOptions = {
            chart: {
                type: 'lineChart',
                height: null,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 55
                },
                duration: 0,
                x: function (d) {
                    return d.x;
                },
                y: function (d) {
                    return d.y;
                },
                showLegend: false,
                useInteractiveGuideline: true
            }
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
                    $scope.pauseText = $translate.instant('serial-play');
                }, function () {
                    $scope.pause = false;
                    $scope.pauseText = $translate.instant('serial-pause');
                });
            } else {
                web2board.pauseSerialPort({
                    pause: false
                }).then(function () {
                    $scope.pauseText = $translate.instant('serial-pause');
                }, function () {
                    $scope.pause = true;
                    $scope.pauseText = $translate.instant('serial-play');
                });
            }
        };

        $scope.onClear = function () {
            receivedDataCount = 0;
            $scope.data[0].values = [];
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

        function _processSerialMonitorData(data) {
            console.log(data);
            var newDataArray = data.split('\n');
            //clear sets the value as '', so is added on each text
            if (newDataArray[newDataArray.length - 1] === '') {
                newDataArray.pop();
            }
            web2board.clearSerialPortData();
            for (var i = 0; i < newDataArray.length; i++) {
                if ((newDataArray[i] !== '') &&
                    !isNaN(newDataArray[i])) {
                    $scope.data[0].values.push({
                        x: receivedDataCount++,
                        y: newDataArray[i]
                    });
                }
            }
        }

        function refreshScope() {
            utils.apply($scope);
        }

        $scope.$watch(function () {
            return web2board.serial.serialPortData
        }, function (newVal, oldVal) {
            if (newVal !== oldVal && oldVal !== '') {
                _processSerialMonitorData(newVal);
            }
        });

        $scope.getPorts();


        $scope.$on('$destroy', function () {
            web2board.closeSerialPort();
        });

    });
