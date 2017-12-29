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
            timeToWaitToOpenWeb2board = 3000,
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
            return _sendToWeb2boardJS('compile', params);
        }

        function upload(params) {
            return _sendToWeb2boardJS('upload', params);
        }

        function getPorts() {
            return _sendToWeb2boardJS('getports');
        }

        function getVersion() {
            return _sendToWeb2boardJS('version');
        }

        function openSerialPort(params) {
            _ignoreSerialPortMessages = false;
            _closeSerialPortFunction = params.closeSerialPortFunction;
            _serial = params.serial;
            return _sendToWeb2boardJS('openserialport', params);
        }

        function closeSerialPort(params) {
            return _sendToWeb2boardJS('closeserialport', params);
        }

        function sendToSerialPort(params) {
            return _sendToWeb2boardJS('sendtoserialport', params);
        }

        function pauseSerialPort(params) {
            var defer = $q.defer();
            _ignoreSerialPortMessages = params.pause;

            defer.resolve();

            return defer.promise;
        }

        function _sendToWeb2boardJS(eventName, data, avoidStartWeb2board) {
            var defer = $q.defer();
            if (avoidStartWeb2board) {
                _sendToSocket(eventName, data).then(function (res) {
                    defer.resolve(res);
                }, function (err) {
                    defer.reject(err);
                });
            } else {
                startWeb2board().then(function () {
                    _sendToSocket(eventName, data).then(function (response) {
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
        function _sendToSocket(eventName, data) {
            var defer = $q.defer();
            var timeout = setTimeout(function () {
                defer.reject({
                    status: -1,
                    error: 'timeout in contact with web2board'
                });
                _closeSocket();
            }, 5000);

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
            if (socket && socket.connected) {
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
                socket.on('connect', function () {
                    socket.on('message', function (msg) {
                        console.log('msg', msg);
                    });
                    socket.on('serialportdata', function (data) {
                        console.log('serialport data' + data);
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
                    _sendToWeb2boardJS('version', null, true).then(function (result) {
                        _web2boardLaunched = true;
                        defer.resolve(result);
                    }, function (error) {
                        if (remainigAttempts > 0) {
                            startWeb2board(remainigAttempts - 1, defer);
                        } else {
                            defer.reject(error);
                        }
                    });
                }, timeToWaitToOpenWeb2board);
            } else {
                defer.resolve();
            }

            return defer.promise;
        }



        return exports;
    });