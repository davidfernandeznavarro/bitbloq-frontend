'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.web2boardJS
 * @description
 * # web2boardJS
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('web2boardJS', function ($log, alertsService, utils, $q, $translate, envData, $rootScope, web2board, $timeout, $location) {
        var exports = {
            compile: compile,
            upload: upload,
            compileAndUpload: compileAndUpload
        };

        var compileAndUploadDefer,
            completed,
            alertCompile,
            socket;

        /**
         * [compile description]
         * @param  {object} params {
         *                         board: board profile,
         *                         code: code
         *                         }
         * @return {promise}
         */
        function compile(params) {
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
            return sendToWeb2boardJS('compile', params);
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
            return sendToWeb2boardJS('upload', params);
        }

        function sendToWeb2boardJS(eventName, data) {
            var defer = $q.defer();
            connectToSocket().then(function () {
                socket.emit(eventName, JSON.stringify(data), function (response) {
                    $log.log('compile response', response);
                    if (response.status === 0) {
                        defer.resolve(response);
                    } else {
                        defer.reject(response);
                    }
                });
            });
            return defer.promise;
        }

        function connectToSocket() {
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
                        socket.close();
                        socket = null;
                    });
                    defer.resolve();
                });

                socket.on('error', function (error) {
                    $log.log('error on socket', error);
                    defer.reject();
                    socket.close();
                    socket = null;
                });
                socket.on('connect_timeout', function (error) {
                    $log.log('connect_timeout on socket', error);
                    defer.reject();
                    socket.close();
                    socket = null;
                });
            } else {
                defer.resolve();
            }
            return defer.promise;
        }

        function compilerAlerts(compilerPromise) {
            alertCompile = null;

            compilerPromise.then(function (response) {
                if (response.data.error) {
                    alertsService.add({
                        id: 'compile',
                        type: 'warning',
                        translatedText: utils.parseCompileError(response.data.error)
                    });
                } else {
                    alertsService.add({
                        text: 'alert-web2board-compile-verified',
                        id: 'compile',
                        type: 'ok',
                        time: 5000
                    });
                }
            }).catch(function (response) {
                alertsService.add({
                    id: 'compile',
                    type: 'error',
                    translatedText: response.data
                });
            })
                .finally(function () {
                    web2board.setInProcess(false);
                    completed = true;
                    alertsService.close(alertCompile);
                });

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

        function getReadableErrorMessage(error) {
            var message = '';
            if (error.error.indexOf('timeout') >= 0) {
                message = $translate.instant('modal-inform-error-textarea-placeholder') + ': ' + $translate.instant(JSON.stringify(error.error));
            } else {
                message = $translate.instant('modal-inform-error-textarea-placeholder') + ': ' + $translate.instant(JSON.stringify(error.error));
            }
            //stk500 timeout.

            return message;
        }

        return exports;
    });
