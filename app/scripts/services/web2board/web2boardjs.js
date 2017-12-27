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
            getPorts: getPorts
        };

        var socket,
            timeToWaitToOpenWeb2board = 3000,
            getVersionMaxTrys = 1;

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
            socket.close();
            socket = null;
        }

        function _connectToSocket() {
            var defer = $q.defer();
            if (!socket) {
                socket = io('http://localhost:9876');
                socket.on('connect', function () {
                    socket.on('message', function (msg) {
                        console.log(msg);
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

        function getVersionOld(remainigAttempts, defer) {
            defer = defer || $q.defer();
            if (!remainigAttempts && (remainigAttempts !== 0)) {
                remainigAttempts = remainigAttempts || getVersionMaxTrys;
            }

            startWeb2board().then(function () {
                _sendToWeb2boardJS('version').then(function (result) {
                    defer.resolve(result);
                }, function (error) {
                    if (remainigAttempts > 0) {
                        getVersion(remainigAttempts - 1, defer);
                    } else {
                        defer.reject(error);
                    }
                });
            });
            return defer.promise;
        }

        function getVersion() {
            return _sendToWeb2boardJS('version');
        }

        function startWeb2board(remainigAttempts, defer) {
            defer = defer || $q.defer();

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
                _sendToWeb2boardJS('version', true).then(function (result) {
                    defer.resolve(result);
                }, function (error) {
                    if (remainigAttempts > 0) {
                        startWeb2board(remainigAttempts - 1, defer);
                    } else {
                        defer.reject(error);
                    }
                });
            }, timeToWaitToOpenWeb2board)

            return defer.promise;
        }

        function getPorts() {
            return _sendToWeb2boardJS('getports');
        }

        return exports;
    });