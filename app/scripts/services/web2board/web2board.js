'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.web2board
 * @description
 * # web2board
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('web2board', function ($log, alertsService, web2boardV1, web2boardV2, web2boardJS, web2boardOnline, utils, $q,
        common, $rootScope, $translate) {
        var exports = {
            compile: compile,
            upload: upload,
            compileAndUpload: compileAndUpload,
            compilationInProcess: false
        };
        var _detectWeb2boardPromise;

        function _detectWeb2boardVersion() {
            if (!_detectWeb2boardPromise || _detectWeb2boardPromise.promise.$$state.status === 2) {
                _detectWeb2boardPromise = $q.defer();
                if (common.useChromeExtension()) {
                    _detectWeb2boardPromise.resolve('web2boardOnline');
                } else {
                    web2boardJS.getVersion().then(function (response) {
                        $log.log('version response', response);
                        _detectWeb2boardPromise.resolve('web2boardJS');
                    }, function (err) {
                        $log.log(err);
                        web2boardV1.getVersion().then(function (response) {
                            $log.log(response);
                            _detectWeb2boardPromise.resolve('web2boardV2');
                        }, function () {
                            _detectWeb2boardPromise.reject('web2board not detected');
                        })
                    });
                }
            }
            return _detectWeb2boardPromise.promise;
        }

        function _compileWith(version, params, promise) {
            switch (version) {
                case 'web2boardJS':
                    web2boardJS.compile(params).then(function (result) {
                        _finalizeCompiling(null, result, promise);
                    }, function (error) {
                        _finalizeCompiling(error, null, promise);
                    });
                    break;
                case 'web2boardV2':
                    //no response, the service manage the states and alerts
                    web2boardV1.externalVerify(params.board, params.code);
                    break;
                case 'web2boardOnline':
                    web2boardOnline.compile(params).then(function (result) {
                        _finalizeCompiling(null, result, promise);
                    }, function (error) {
                        _finalizeCompiling(error, null, promise);
                    });
                    break;
                default:
                    $log.error('web2board version not defined');
            }
        }

        function compile(params) {
            var defer = $q.defer();
            exports.compilationInProcess = true;
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
            if (params.method) {
                _compileWith(params.method, params, defer);
            } else {
                _detectWeb2boardVersion().then(function (version) {
                    _compileWith(version, params, defer);
                });
            }

            return defer.promise;
        }
        function _finalizeCompiling(error, result, promise) {
            exports.compilationInProcess = false;
            if (error) {
                alertsService.add({
                    id: 'compile',
                    type: 'warning',
                    translatedText: utils.parseCompileError(error)
                });
                if (promise) {
                    promise.reject(error);
                }

            } else {
                alertsService.add({
                    text: 'alert-web2board-compile-verified',
                    id: 'compile',
                    type: 'ok',
                    time: 5000
                });
                if (promise) {
                    promise.resolve(result);
                }
            }
        }

        function upload() {

        }

        function compileAndUpload() {

        }

        var _web2boardV2Listeners;

        function addWeb2boardV2Listeners() {
            _web2boardV2Listeners = {};
            _web2boardV2Listeners.w2bDisconnectedEvent = $rootScope.$on('web2board:disconnected', function () {
                web2boardV1.setInProcess(false);
            });

            _web2boardV2Listeners.w2bVersionEvent = $rootScope.$on('web2board:wrong-version', function () {
                web2boardV1.setInProcess(false);
            });

            _web2boardV2Listeners.w2bNow2bEvent = $rootScope.$on('web2board:no-web2board', function () {
                alertsService.closeByTag('compile');
                alertsService.closeByTag('upload');
                web2boardV1.setInProcess(false);
            });

            _web2boardV2Listeners.w2bCompileErrorEvent = $rootScope.$on('web2board:compile-error', function (event, error) {
                error = JSON.parse(error);
                _finalizeCompiling(error.stdErr)
                web2boardV1.setInProcess(false);
            });

            _web2boardV2Listeners.w2bCompileVerifiedEvent = $rootScope.$on('web2board:compile-verified', function () {
                _finalizeCompiling()
                web2boardV1.setInProcess(false);
            });

            _web2boardV2Listeners.w2bBoardReadyEvent = $rootScope.$on('web2board:boardReady', function (evt, data) {
                data = JSON.parse(data);
                if (data.length > 0) {
                    if (!alertsService.isVisible('uid', 'serialMonitorAlert')) {
                        //cambiar uid por un id propio, serialMonitorAlert es el nombre que tenía la variable, mirar en el refactor del puerto serie
                        alertsService.add({
                            text: 'alert-web2board-boardReady',
                            id: 'upload',
                            type: 'ok',
                            time: 5000,
                            value: data[0]
                        });
                    }
                } else {
                    alertsService.add({
                        text: 'alert-web2board-boardNotReady',
                        id: 'upload',
                        type: 'warning'
                    });
                }
            });

            _web2boardV2Listeners.w2bBoardNotReadyEvent = $rootScope.$on('web2board:boardNotReady', function () {
                alertsService.add({
                    text: 'alert-web2board-boardNotReady',
                    id: 'upload',
                    type: 'warning'
                });
                web2boardV1.setInProcess(false);
            });

            _web2boardV2Listeners.w2bUploadingEvent = $rootScope.$on('web2board:uploading', function (evt, port) {
                alertsService.add({
                    text: 'alert-web2board-uploading',
                    id: 'upload',
                    type: 'loading',
                    value: port
                });
                web2boardV1.setInProcess(true);
            });

            _web2boardV2Listeners.w2bCodeUploadedEvent = $rootScope.$on('web2board:code-uploaded', function () {
                alertsService.add({
                    text: 'alert-web2board-code-uploaded',
                    id: 'upload',
                    type: 'ok',
                    time: 5000
                });
                web2boardV1.setInProcess(false);
            });

            _web2boardV2Listeners.w2bUploadErrorEvent = $rootScope.$on('web2board:upload-error', function (evt, data) {
                data = JSON.parse(data);
                if (!data.error) {
                    alertsService.add({
                        text: 'alert-web2board-upload-error',
                        id: 'upload',
                        type: 'warning',
                        value: data.stdErr
                    });
                } else if (data.error === 'no port') {
                    alertsService.add({
                        text: 'alert-web2board-upload-error',
                        id: 'upload',
                        type: 'warning'
                    });
                } else {
                    alertsService.add({
                        text: 'alert-web2board-upload-error',
                        id: 'upload',
                        type: 'warning',
                        value: data.error
                    });
                }
                web2boardV1.setInProcess(false);
            });

            _web2boardV2Listeners.w2bNoPortFoundEvent = $rootScope.$on('web2board:no-port-found', function () {
                web2boardV1.setInProcess(false);
                alertsService.closeByTag('serialmonitor');
                alertsService.add({
                    text: 'alert-web2board-no-port-found',
                    id: 'upload',
                    type: 'warning',
                    link: function () {
                        var tempA = document.createElement('a');
                        tempA.setAttribute('href', '#/support/p/noBoard');
                        tempA.setAttribute('target', '_blank');
                        document.body.appendChild(tempA);
                        tempA.click();
                        document.body.removeChild(tempA);
                    },
                    linkText: $translate.instant('support-go-to')
                });
            });

            _web2boardV2Listeners.w2bSerialOpenedEvent = $rootScope.$on('web2board:serial-monitor-opened', function () {
                alertsService.closeByTag('serialmonitor');
                web2boardV1.setInProcess(false);
            });
        }

        function removeWeb2boardV2Listeners() {
            if (_web2boardV2Listeners) {
                _web2boardV2Listeners.w2bDisconnectedEvent();
                _web2boardV2Listeners.w2bVersionEvent();
                _web2boardV2Listeners.w2bNow2bEvent();
                _web2boardV2Listeners.w2bCompileErrorEvent();
                _web2boardV2Listeners.w2bCompileVerifiedEvent();
                _web2boardV2Listeners.w2bBoardReadyEvent();
                _web2boardV2Listeners.w2bBoardNotReadyEvent();
                _web2boardV2Listeners.w2bUploadingEvent();
                _web2boardV2Listeners.w2bCodeUploadedEvent();
                _web2boardV2Listeners.w2bUploadErrorEvent();
                _web2boardV2Listeners.w2bNoPortFoundEvent();
                _web2boardV2Listeners.w2bSerialOpenedEvent();
            }
        }

        return exports;
    });
