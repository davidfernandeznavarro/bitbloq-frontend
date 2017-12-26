'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.web2boardJS
 * @description
 * # web2boardJS
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('web2boardJS', function ($log, alertsService, utils, $q, $translate, envData, $rootScope, web2boardV1, $timeout, $location, $window) {
        var exports = {
            compile: compile,
            upload: upload,
            compileAndUpload: compileAndUpload,
            getVersion: getVersion
        };

        var compileAndUploadDefer,
            completed,
            alertCompile,
            socket,
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
            if (params.viewer) {
                alertsService.add({
                    text: 'alert-viewer-reconfigure',
                    id: 'upload',
                    type: 'loading'
                });
            } else {
                alertsService.add({
                    text: 'alert-web2board-uploading',
                    id: 'upload',
                    type: 'loading',
                    time: 'infinite'
                });
            }
            if (!params.board) {
                params.board = 'bt328';
            } else {
                params.board = params.board.mcu;
            }
            if (!params.viewer) {
                alertsService.add({
                    text: 'alert-web2board-compiling',
                    id: 'compile',
                    type: 'loading'
                });
            }
            return _sendToWeb2boardJS('upload', params);
        }

        function _sendToWeb2boardJS(eventName, data) {
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

        /**
         *
         * @param  {object} params {
         *                         board: board profile,
         *                         code: code
         *                         }
         * @return {promise} request promise
         */
        function compileAndUpload(params) {
            console.log('compileAndUpload', params);
        }


        function getVersion(remainigAttempts, defer) {
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


        function startWeb2board() {
            var defer = $q.defer();
            $log.log('starting Web2board...');
            var tempA = document.createElement('a');
            tempA.setAttribute('href', 'web2board://');
            document.body.appendChild(tempA);
            tempA.click();
            document.body.removeChild(tempA);

            $timeout(function () {
                defer.resolve();
            }, timeToWaitToOpenWeb2board)

            return defer.promise;
        }

        return exports;
    });
