/*jshint camelcase: false */
'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:ViewerCtrl
 * @description
 * # ViewerCtrl
 * Viewer controller
 */
angular.module('bitbloqApp')
    .controller('ViewerCtrl', function ($element, web2boardV2, web2board, $timeout, $scope, common, $translate, chromeAppApi, utils, hardwareService, $rootScope, _) {

        $scope.sensorsList = {};

        $scope.disableSensorPause = false;

        $scope.sensors = {
            'hts221': {
                name: common.translate('hts221'),
                value: '--',
                range: ''
            },
            'ldrs': {
                name: common.translate('ldrs'),
                value: '--',
                range: '0-1023'
            },
            'us': {
                name: common.translate('us'),
                value: '--',
                range: common.translate('cm')
            },
            'sound': {
                name: common.translate('sound'),
                value: '--',
                range: '0/1'
            },
            'encoder': {
                name: common.translate('encoder'),
                value: '--',
                range: ''

            },
            'pot': {
                name: common.translate('pot'),
                value: '--',
                range: '0-1023'

            },
            'irs': {
                name: common.translate('irs'),
                value: '--',
                range: '0/1'
            },
            'button': {
                name: common.translate('button'),
                value: '--',
                range: '0/1'
            }
        };

        var receivedDataCount = -1;

        $scope.selectedTab = 'realtime';


        $scope.baudrateOptions = [300, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200];
        $scope.currentBaudRate = 9600;

        $scope.portNames = [];
        $scope.ports = [];

        $scope.selectedPort = null;
        $scope.pause = false;
        $scope.pauseText = $translate.instant('serial-pause');

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
                tickFormat: function (t) {
                    return Math.round(t < 0 ? 0 : t);
                },
                showLegend: false,
                useInteractiveGuideline: true
            }
        };

        $scope.chartOptionsTemperatureHumidityUs = {
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
                    return Math.floor(d.y * 1000) / 1000;
                },
                tickFormat: function (t) {
                    return Math.floor(t * 1000) / 1000;
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
            $scope.pauseText = $scope.pause ? $translate.instant('plotter-play') : $translate.instant('plotter-pause');
            _.forEach($scope.sensorsList, function (value, key) {
                if (value === 'hts221') {
                    $scope.pauseSensors[key + '-temperature'] = false;
                    $scope.pauseTextSensor[key + '-temperature'] = $translate.instant('serial-pause');
                    $scope.pauseSensors[key + '-humidity'] = false;
                    $scope.pauseTextSensor[key + '-humidity'] = $translate.instant('serial-pause');
                } else {
                    $scope.pauseSensors[key] = false;
                    $scope.pauseTextSensor[key] = $translate.instant('serial-pause');

                }

            });
        };

        $scope.onPauseSensor = function (sensorName) {
            if (sensorName.indexOf('humidity') > -1) {
                $scope.pauseSensors[sensorName] = !$scope.pauseSensors[sensorName];
                $scope.pauseTextSensor[sensorName] = $scope.pauseSensors[sensorName] ? $translate.instant('plotter-play') : $translate.instant('plotter-pause');
                $scope.pauseSensors[sensorName.split('-')[0] + '-temperature'] = !$scope.pauseSensors[sensorName.split('-')[0] + '-temperature'];
                $scope.pauseTextSensor[sensorName.split('-')[0] + '-temperature'] = $scope.pauseSensors[sensorName.split('-')[0] + '-temperature'] ? $translate.instant('plotter-play') : $translate.instant('plotter-pause');
            } else {
                $scope.pauseSensors[sensorName] = !$scope.pauseSensors[sensorName];
                $scope.pauseTextSensor[sensorName] = $scope.pauseSensors[sensorName] ? $translate.instant('plotter-play') : $translate.instant('plotter-pause');
            }
        };

        $scope.onClear = function () {
            initGraphData($scope.sensorsList);
        };

        $scope.onClearSensor = function (sensorName) {

            if (sensorName.indexOf('humidity') > -1) {
                $scope.data[sensorName] = [{
                    type: $scope.sensorsList[sensorName],
                    values: [],
                    color: '#82ad3a'
                }];
                receivedDataCount[sensorName] = 0;
                $scope.sensorsData[sensorName] = {
                    'acron': $scope.sensorsList[sensorName],
                    'type': common.translate($scope.sensorsList[sensorName.split('-')[0]]),
                    'value': '--',
                    'range': ''
                };
                $scope.pauseSensors[sensorName] = false;
                $scope.pauseTextSensor[sensorName] = $translate.instant('serial-pause');

                $scope.data[sensorName.split('-')[0] + '-temperature'] = [{
                    type: $scope.sensorsList[sensorName],
                    values: [],
                    color: '#82ad3a'
                }];
                receivedDataCount[sensorName.split('-')[0] + '-temperature'] = 0;
                $scope.sensorsData[sensorName.split('-')[0] + '-temperature'] = {
                    'acron': $scope.sensorsList[sensorName.split('_')[0] + '_temperature'],
                    'type': common.translate($scope.sensorsList[sensorName.split('-')[0] + '-temperature']),
                    'value': '--',
                    'range': ''
                };
                $scope.pauseSensors[sensorName.split('-')[0] + '-temperature'] = false;
                $scope.pauseTextSensor[sensorName.split('-')[0] + '-temperature'] = $translate.instant('serial-pause');
            } else {
                $scope.data[sensorName] = [{
                    type: $scope.sensorsList[sensorName],
                    values: [],
                    color: '#82ad3a'
                }];
                receivedDataCount[sensorName] = 0;
                $scope.sensorsData[sensorName] = {
                    'acron': $scope.sensorsList[sensorName],
                    'type': common.translate($scope.sensorsList[sensorName]),
                    'value': '--',
                    'range': $scope.sensors[$scope.sensorsList[sensorName]].range
                };
                $scope.pauseSensors[sensorName] = false;
                $scope.pauseTextSensor[sensorName] = $translate.instant('serial-pause');
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
            utils.apply($scope);
        }


        $scope.data = {};
        $scope.pauseSensors = {};
        $scope.pauseTextSensor = {};
        $scope.sensorsData = {};
        receivedDataCount = {};

        function initGraphData(sensorsList) {
            _.forEach(sensorsList, function (value, key) {

                if (value === 'hts221') {
                    $scope.sensorsData[key] = {
                        'acron': value,
                        'type': common.translate(value),
                        'temperature': {
                            'value': '--'
                        },
                        'humidity': {
                            'value': '--'
                        }
                    };

                    $scope.data[key + '-temperature'] = [{
                        type: value,
                        values: [],
                        color: '#82ad3a'
                    }];
                    receivedDataCount[key + '-temperature'] = 0;

                    $scope.data[key + '-humidity'] = [{
                        type: value,
                        values: [],
                        color: '#82ad3a'
                    }];
                    receivedDataCount[key + '-humidity'] = 0;
                    $scope.pauseSensors[key + '-temperature'] = false;
                    $scope.pauseTextSensor[key + '-temperature'] = $translate.instant('serial-pause');
                    $scope.pauseSensors[key + '-humidity'] = false;
                    $scope.pauseTextSensor[key + '-humidity'] = $translate.instant('serial-pause');
                } else {
                    $scope.data[key] = [{
                        type: value,
                        values: [{
                            x: 0,
                            y: 0
                        }],
                        color: '#82ad3a'
                    }];
                    receivedDataCount[key] = 0;
                    $scope.sensorsData[key] = {
                        'acron': value,
                        'type': common.translate(value),
                        'value': '--',
                        'range': $scope.sensors[value].range
                    };

                    $scope.pauseSensors[key] = false;
                    $scope.pauseTextSensor[key] = $translate.instant('serial-pause');

                }

            });
        }

        function initData() {
            _.forEach($scope.componentsJSON, function (value, key) {
                if (typeof value === 'object') {
                    _.forEach(value.names, function (name) {
                        $scope.sensorsList[name] = key;
                    });
                }
            });

            initGraphData($scope.sensorsList);

            $scope.getPorts();
        }

        function _processSerialMonitorData(data) {
            var newDataArray = data.split('\n');
            //clear sets the value as '', so is added on each text
            if (newDataArray[newDataArray.length - 1] === '') {
                newDataArray.pop();
            }
            web2board.clearSerialPortData();
            for (var i = 0; i < newDataArray.length; i++) {
                if (newDataArray[i].match(/\[[A-Z]+[0-9]*(_([a-z])+)?:.*\]:[.\-0-9]+[\n\r\t\s]*/)) {
                    var sensor = newDataArray[i].split(':');
                    var sensorName = sensor[1].substring(0, sensor[1].length - 1);
                    var sensorType = (sensor[0].split('['))[1];
                    var sensorValue = sensor[2].replace(/\s+/, '');

                    var number = parseFloat(sensorValue);
                    if ((sensorType.toLowerCase()).indexOf('hts221') > -1) {
                        var property = sensorType.split('_');
                        $scope.sensorsData[sensorName][property[1]].value = sensorValue;
                        if ((sensorType.toLowerCase()).indexOf('temperature') > -1) {
                            sensorName = sensorName + '-temperature';
                        } else if ((sensorType.toLowerCase()).indexOf('humidity') > -1) {
                            sensorName = sensorName + '-humidity';
                        }
                    } else {
                        $scope.sensors[sensorType.toLowerCase()].value = sensorValue;
                        $scope.sensorsData[sensorName].value = number;
                    }
                    if (!$scope.pauseSensors[sensorName] && !$scope.pause && !isNaN(number)) {
                        if (receivedDataCount[sensorName] === -1) {
                            receivedDataCount[sensorName]++;
                        } else {
                            $scope.data[sensorName][0].values.push({
                                x: receivedDataCount[sensorName]++,
                                y: number
                            });
                        }
                    }
                } else {
                    console.log('bad format message');
                }
            }
        }

        $scope.$watch(function () {
            return web2board.serial.serialPortData
        }, function (newVal, oldVal) {
            if (newVal !== oldVal && oldVal !== '') {
                _processSerialMonitorData(newVal);
            }
        });

        initData();

        $scope.$on('$destroy', function () {
            initGraphData($scope.sensorsList);
            web2board.closeSerialPort();
        });

    });
