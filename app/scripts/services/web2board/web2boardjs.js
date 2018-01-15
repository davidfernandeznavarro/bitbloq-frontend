'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.web2boardJS
 * @description
 * # web2boardJS
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('web2boardJS', function ($log, alertsService, utils, $q, $translate, envData, $rootScope, $timeout) {
        var exports = {
            compile: compile,
            upload: upload,
            getVersion: getVersion,
            getPorts: getPorts,
            openSerialPort: openSerialPort,
            closeSerialPort: closeSerialPort,
            sendToSerialPort: sendToSerialPort,
            pauseSerialPort: pauseSerialPort,
            startWeb2board: startWeb2board
        };

        var socket,
            _timeToWaitToOpenWeb2board = 3000,
            _timeToWaitToWeb2boardMessages = 7000,
            getVersionMaxTrys = 1,
            _web2boardLaunched = false,
            _closeSerialPortFunction,
            _serial,
            _ignoreSerialPortMessages = false;

        /**
         * [compile description]
         * @param  {object} params {
         *                         board: board mcu,
         *                         code: code
         *                         }
         * @return {promise}
         */
        function compile(params) {

            return _sendToWeb2boardJS({ eventName: 'compile', data: params, timeoutTime: 20000 });
        }

        function upload(params) {
            return _sendToWeb2boardJS({ eventName: 'upload', data: params, timeoutTime: 20000 });
        }

        function getPorts() {
            return _sendToWeb2boardJS({ eventName: 'getports', timeoutTime: 10000 });
        }

        function getVersion() {
            return _sendToWeb2boardJS({ eventName: 'version' });
        }

        function openSerialPort(params) {
            _ignoreSerialPortMessages = false;
            _closeSerialPortFunction = params.closeSerialPortFunction;
            _serial = params.serial;
            return _sendToWeb2boardJS({
                eventName: 'openserialport',
                data: {
                    baudRate: params.baudRate,
                    port: params.port,
                    forceReconnect: params.forceReconnect
                },
                timeoutTime: 10000
            });
        }

        function closeSerialPort(params) {
            return _sendToWeb2boardJS({ eventName: 'closeserialport', data: params });
        }

        function sendToSerialPort(params) {
            return _sendToWeb2boardJS({ eventName: 'sendtoserialport', data: params });
        }

        function pauseSerialPort(params) {
            var defer = $q.defer();
            _ignoreSerialPortMessages = params.pause;

            defer.resolve();

            return defer.promise;
        }

        function _sendToWeb2boardJS(params) {
            //eventName, data, avoidStartWeb2board, timeoutTime
            var defer = $q.defer();
            if (params.avoidStartWeb2board) {
                _sendToSocket(params.eventName, params.data, params.timeoutTime).then(function (res) {
                    defer.resolve(res);
                }, function (err) {
                    defer.reject(err);
                });
            } else {
                startWeb2board().then(function () {
                    _sendToSocket(params.eventName, params.data, params.timeoutTime).then(function (response) {
                        defer.resolve(response);
                    }, function (err) {
                        defer.reject(err);
                    });
                }, function (err) {
                    defer.reject(err)
                });
            }
            return defer.promise;
        }
        function _sendToSocket(eventName, data, timeoutTime) {
            var defer = $q.defer();
            var timeout = setTimeout(function () {
                _closeSocket();
                defer.reject({
                    status: -1,
                    error: 'timeout in contact with web2board'
                });

            }, timeoutTime || _timeToWaitToWeb2boardMessages);

            _connectToSocket().then(function () {
                socket.emit(eventName, data, function (response) {
                    response = response;
                    $log.log('web2boardjs response', response);
                    clearTimeout(timeout);
                    if (response.status === 0) {
                        defer.resolve(response);
                    } else {
                        defer.reject(response);
                    }
                });
            });
            return defer.promise;
        }

        function _closeSocket() {
            if (socket && (socket.connected || socket.io.reconnecting)) {
                socket.close();
            }

            socket = null;
            if (_closeSerialPortFunction) {
                _closeSerialPortFunction();
            }
        }

        function _connectToSocket() {
            var defer = $q.defer();
            if (!socket) {
                socket = io('http://localhost:9876');
                socket.on('connect', function (something) {
                    if (socket) {
                        socket.on('message', function (msg) {
                            // console.log('msg', msg);
                        });
                        socket.on('serialportdata', function (data) {
                            //console.log('serialport data' + data);
                            if (_serial && !_ignoreSerialPortMessages) {
                                _serial.serialPortData += data + '\n';
                                _serial.scopeRefreshFunction();
                            }
                        });
                        socket.on('serialportclosed', function () {
                            console.log('serialportclosed');
                            if (_closeSerialPortFunction) {
                                _closeSerialPortFunction();
                            }
                        });

                        socket.on('disconnect', function (reason) {
                            $log.log('disconnect on socket', reason);
                            defer.reject();
                            _closeSocket();
                        });
                        defer.resolve();
                    }
                });
                socket.on('error', function (error) {
                    $log.log('error on socket', error);
                    defer.reject();
                    _closeSocket();
                });
                socket.on('connect_timeout', function (error) {
                    $log.log('connect_timeout on socket', error);
                    defer.reject();
                    _closeSocket();
                });

            } else {
                defer.resolve();
            }
            return defer.promise;
        }

        function startWeb2board(remainigAttempts, defer) {
            defer = defer || $q.defer();
            if (!_web2boardLaunched) {
                if (!remainigAttempts && (remainigAttempts !== 0)) {
                    remainigAttempts = remainigAttempts || getVersionMaxTrys;
                }

                $log.log('starting Web2board...');
                var tempA = document.createElement('a');
                tempA.setAttribute('href', 'web2board://');
                document.body.appendChild(tempA);
                tempA.click();
                document.body.removeChild(tempA);

                $timeout(function () {
                    //check that is open
                    _sendToWeb2boardJS({
                        eventName: 'version',
                        avoidStartWeb2board: true
                    }).then(function (result) {
                        _web2boardLaunched = true;
                        defer.resolve(result);
                    }, function (error) {
                        if (remainigAttempts > 0) {
                            startWeb2board(remainigAttempts - 1, defer);
                        } else {
                            defer.reject(error);
                        }
                    });
                }, _timeToWaitToOpenWeb2board);
            } else {
                defer.resolve();
            }

            return defer.promise;
        }



        return exports;
    });