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
            getPorts: getPorts,
            openSerialPort: openSerialPort,
            closeSerialPort: closeSerialPort,
            clearSerialPortData: clearSerialPortData,
            pauseSerialPort: pauseSerialPort,
            sendToSerialPort: sendToSerialPort,
            compilationInProcess: false,
            uploadInProcess: false,
            serialPortOpened: false,
            web2boardVersion: '',
            serial: {
                serialPortData: '',
                scopeRefreshFunction: null
            }
        };
        var _detectWeb2boardPromise,
            _web2boardV2ListeneresAdded = false;

        function _detectWeb2boardVersion() {
            if (!_detectWeb2boardPromise || _detectWeb2boardPromise.promise.$$state.status === 2) {
                _detectWeb2boardPromise = $q.defer();
                if (common.useChromeExtension()) {
                    exports.web2boardVersion = 'web2boardOnline';
                    _detectWeb2boardPromise.resolve(exports.web2boardVersion);
                } else {
                    web2boardJS.startWeb2board().then(function (response) {
                        $log.log('version response', response);
                        exports.web2boardVersion = 'web2boardJS';
                        _detectWeb2boardPromise.resolve(exports.web2boardVersion);
                    }, function (err) {
                        $log.log(err);
                        web2boardV1.getVersion().then(function (response) {
                            $log.log(response);
                            exports.web2boardVersion = 'web2boardV2';
                            _detectWeb2boardPromise.resolve(exports.web2boardVersion);
                        }, function () {
                            exports.web2boardVersion = '';
                            _detectWeb2boardPromise.reject('web2board not detected');
                        })
                    });
                }
            }
            return _detectWeb2boardPromise.promise;
        }

        /**
         * Compile
         * @param {*} params 
         */
        function compile(params) {
            var defer = $q.defer();
            exports.compilationInProcess = true;
            if (!params.board) {
                params.board = {
                    mcu: 'bt328'
                };
            }
            if (!params.viewer) {
                alertsService.add({
                    text: 'alert-web2board-compiling',
                    id: 'compile',
                    type: 'loading'
                });
            }
            if (params.compileWith) {
                _compileWith(params.compileWith, params, defer);
            } else {
                _detectWeb2boardVersion().then(function (version) {
                    _compileWith(version, params, defer);
                });
            }

            return defer.promise;
        }

        function _compileWith(w2bVersion, params, promise) {
            switch (w2bVersion) {
                case 'web2boardJS':
                    web2boardJS.compile(params).then(function (result) {
                        _finalizeCompiling(null, result, promise);
                    }, function (error) {
                        _finalizeCompiling(error, null, promise);
                    });
                    break;
                case 'web2boardV2':
                    if (!_web2boardV2ListeneresAdded) {
                        addWeb2boardV2Listeners();
                    }
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
                    $log.error('w2bVersion not defined');
                    promise.reject({
                        status: -1,
                        error: 'w2bVersion-not-defined-compiling'
                    });
            }
        }

        function _finalizeCompiling(error, result, promise) {
            exports.compilationInProcess = false;
            if (error) {
                alertsService.add({
                    id: 'compile',
                    type: 'warning',
                    translatedText: parseCompileError(error)
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

        /**
         * Upload
         * @param {*} params 
         */
        function upload(params) {
            var defer = $q.defer();

            alertsService.add({
                text: 'alert-web2board-uploading',
                id: 'upload',
                type: 'loading',
                time: 'infinite'
            });
            exports.uploadInProcess = true;
            if (params.board) {
                if (params.uploadWith) {
                    _uploadWith(params.uploadWith, params, defer);
                } else {
                    _detectWeb2boardVersion().then(function (version) {
                        _uploadWith(version, params, defer);
                    });
                }
            } else {
                defer.reject({
                    status: -1,
                    error: 'no-board'
                });
                alertsService.add({
                    text: 'alert-web2board-boardNotReady',
                    id: 'upload',
                    type: 'warning'
                });
            }
            return defer.promise;
        }

        function _uploadWith(w2bVersion, params, promise) {
            switch (w2bVersion) {
                case 'web2boardJS':
                    web2boardJS.upload(params).then(function (result) {
                        _finalizeUploading(null, result, promise);
                    }, function (error) {
                        _finalizeUploading(error, null, promise);
                    });
                    break;
                case 'web2boardV2':
                    if (!_web2boardV2ListeneresAdded) {
                        addWeb2boardV2Listeners();
                    }
                    //no response, the service manage the states and alerts
                    web2boardV1.externalUpload(params.board, params.code);
                    break;
                case 'web2boardOnline':
                    /*web2boardOnline.compile(params).then(function (result) {
                        _finalizeCompiling(null, result, promise);
                    }, function (error) {
                        _finalizeCompiling(error, null, promise);
                    });*/
                    break;
                default:
                    $log.error('w2bVersion not defined');
                    promise.reject({
                        status: -1,
                        error: 'w2bVersion-not-defined-uploading'
                    });
            }
        }

        function _finalizeUploading(error, result, promise) {
            exports.uploadInProcess = false;
            if (error) {
                var text, link, linkText;
                if (error.error.search('no Arduino') !== -1) {
                    text = 'alert-web2board-no-port-found';
                    link = function () {
                        utils.goToUsingLink('#/support/p/noBoard', '_blank');
                    };
                    linkText = $translate.instant('support-go-to');
                } else {
                    text = parseUploadingError(error);
                }
                alertsService.add({
                    text: text,
                    id: 'upload',
                    type: 'error',
                    link: link,
                    linkText: linkText
                });
                if (promise) {
                    promise.reject(error);
                }
            } else {
                alertsService.add({
                    text: 'alert-web2board-code-uploaded',
                    id: 'upload',
                    type: 'ok',
                    time: 5000
                });
                if (promise) {
                    promise.resolve(result);
                }
            }
        }

        /**
         * GetPorts
         * @param {*} params 
         */
        function getPorts(params) {
            var defer = $q.defer();

            if (params && params.getWith) {
                _getPortsWith(params.getWith, defer);
            } else {
                _detectWeb2boardVersion().then(function (version) {
                    _getPortsWith(version, defer);
                });
            }
            return defer.promise;
        }

        function _getPortsWith(w2bVersion, promise) {
            switch (w2bVersion) {
                case 'web2boardJS':
                    web2boardJS.getPorts().then(function (result) {
                        _finalizeGetPorts(null, result, promise);
                    }, function (error) {
                        _finalizeGetPorts(error, null, promise);
                    });
                    break;
                case 'web2boardV2':
                    if (!_web2boardV2ListeneresAdded) {
                        addWeb2boardV2Listeners();
                    }
                    //no response, the service manage the states and alerts
                    web2boardV1.serialMonitor({ mcu: 'bt328' });
                    break;
                case 'web2boardOnline':
                    /*web2boardOnline.compile(params).then(function (result) {
                        _finalizeCompiling(null, result, promise);
                    }, function (error) {
                        _finalizeCompiling(error, null, promise);
                    });*/
                    break;
                default:
                    $log.error('w2bVersion not defined');
                    promise.reject({
                        status: -1,
                        error: 'w2bVersion-not-defined-getports'
                    });
            }
        }

        function _finalizeGetPorts(error, result, promise) {
            if (error) {
                if (promise) {
                    promise.reject(error);
                }
            } else {
                for (var i = 0; i < result.data.length; i++) {
                    if (result.data[i].vendorId) {
                        result.data[i].vendorId = formatHexNumber(result.data[i].vendorId);
                    }

                    if (result.data[i].productId) {
                        result.data[i].productId = formatHexNumber(result.data[i].productId);
                    }
                }
                if (promise) {
                    promise.resolve(result);
                }
            }
        }

        /**
         * Open serial
         * @param {*} params 
         */
        function openSerialPort(params) {
            var defer = $q.defer();
            alertsService.add({
                text: 'alert-web2board-openSerialMonitor',
                id: 'serialmonitor',
                type: 'loading'
            });
            exports.serialPortOpened = true;

            if (params.openWith) {
                _openSerialPortWith(params.openWith, params, defer);
            } else {
                _detectWeb2boardVersion().then(function (version) {
                    _openSerialPortWith(version, params, defer);
                });
            }
            return defer.promise;
        }

        function _openSerialPortWith(w2bVersion, params, promise) {
            exports.serial.scopeRefreshFunction = params.scopeRefreshFunction;
            switch (w2bVersion) {
                case 'web2boardJS':
                    web2boardJS.openSerialPort({
                        port: params.port,
                        baudRate: params.baudRate,
                        closeSerialPortFunction: _finalizeClosingSerialPort,
                        serial: exports.serial,
                        forceReconnect: params.forceReconnect
                    }).then(function (result) {
                        _finalizeOpeneningSerialPort(null, result, promise);
                    }, function (error) {
                        _finalizeOpeneningSerialPort(error, null, promise);
                    });
                    break;
                case 'web2boardV2':
                    /*if (!_web2boardV2ListeneresAdded) {
                        addWeb2boardV2Listeners();
                    }
                    //no response, the service manage the states and alerts
                    web2boardV1.externalUpload(params.board, params.code);*/
                    break;
                case 'web2boardOnline':
                    /*web2boardOnline.compile(params).then(function (result) {
                        _finalizeCompiling(null, result, promise);
                    }, function (error) {
                        _finalizeCompiling(error, null, promise);
                    });*/
                    break;
                default:
                    $log.error('w2bVersion not defined');
                    promise.reject({
                        status: -1,
                        error: 'w2bVersion-not-defined-uploading'
                    });
            }
        }

        function _finalizeOpeneningSerialPort(error, result, promise) {
            if (error) {
                alertsService.add({
                    text: error.error,
                    id: 'serialmonitor',
                    type: 'error'
                });
                if (promise) {
                    promise.reject(error);
                }
                exports.serialPortOpened = false;
            } else {
                alertsService.closeByTag('serialmonitor');
                if (promise) {
                    promise.resolve(result);
                }
            }
        }



        /**
         * Close Serial
         * @param {*} params 
         */
        function closeSerialPort(params) {
            var defer = $q.defer();

            if (params && params.closeWith) {
                _closeSerialPortWith(params.closeWith, defer);
            } else {
                _detectWeb2boardVersion().then(function (version) {
                    _closeSerialPortWith(version, defer);
                });
            }
            exports.serialPortOpened = false;
            return defer.promise;
        }

        function _closeSerialPortWith(w2bVersion, promise) {
            switch (w2bVersion) {
                case 'web2boardJS':
                    web2boardJS.closeSerialPort().then(function (result) {
                        _finalizeClosingSerialPort(null, result, promise);
                    }, function (error) {
                        _finalizeClosingSerialPort(error, null, promise);
                    });
                    break;
                case 'web2boardV2':
                    /*if (!_web2boardV2ListeneresAdded) {
                        addWeb2boardV2Listeners();
                    }
                    //no response, the service manage the states and alerts
                    web2boardV1.externalUpload(params.board, params.code);*/
                    break;
                case 'web2boardOnline':
                    /*web2boardOnline.compile(params).then(function (result) {
                        _finalizeCompiling(null, result, promise);
                    }, function (error) {
                        _finalizeCompiling(error, null, promise);
                    });*/
                    break;
                default:
                    $log.error('w2bVersion not defined');
                    promise.reject({
                        status: -1,
                        error: 'w2bVersion-not-defined-uploading'
                    });
            }
        }

        function _finalizeClosingSerialPort(error, result, promise) {
            if (error) {
                if (promise) {
                    promise.reject(error);
                }
            } else {
                alertsService.closeByTag('serialmonitor');
                exports.serialPortOpened = false;
                if (promise) {
                    promise.resolve(result);
                }
            }
        }

        /**
         * Send to Serial Port
         * @param {*} params 
         */

        function sendToSerialPort(params) {
            var defer = $q.defer();

            if (params && params.sendToWith) {
                _sendToSerialPortWith(params.closeWith, defer);
            } else {
                _detectWeb2boardVersion().then(function (version) {
                    _sendToSerialPortWith(version, params, defer);
                });
            }
            return defer.promise;
        }

        function _sendToSerialPortWith(w2bVersion, params, promise) {
            switch (w2bVersion) {
                case 'web2boardJS':
                    web2boardJS.sendToSerialPort(params).then(function (result) {
                        _finalizeSendToSerialPort(null, result, promise);
                    }, function (error) {
                        _finalizeSendToSerialPort(error, null, promise);
                    });
                    break;
                case 'web2boardV2':
                    /*if (!_web2boardV2ListeneresAdded) {
                        addWeb2boardV2Listeners();
                    }
                    //no response, the service manage the states and alerts
                    web2boardV1.externalUpload(params.board, params.code);*/
                    break;
                case 'web2boardOnline':
                    /*web2boardOnline.compile(params).then(function (result) {
                        _finalizeCompiling(null, result, promise);
                    }, function (error) {
                        _finalizeCompiling(error, null, promise);
                    });*/
                    break;
                default:
                    $log.error('w2bVersion not defined');
                    promise.reject({
                        status: -1,
                        error: 'w2bVersion-not-defined-sendtoserialport'
                    });
            }
        }

        function _finalizeSendToSerialPort(error, result, promise) {
            if (error) {
                if (promise) {
                    promise.reject(error);
                }
            } else {
                if (promise) {
                    promise.resolve(result);
                }
            }
        }


        function clearSerialPortData() {
            exports.serial.serialPortData = '';
        }

        /**
         * Pause Serial Port
         * @param {*} params 
         */

        function pauseSerialPort(params) {
            var defer = $q.defer();

            if (params && params.sendToWith) {
                pauseSerialPortWith(params.closeWith, defer);
            } else {
                _detectWeb2boardVersion().then(function (version) {
                    pauseSerialPortWith(version, params, defer);
                });
            }
            return defer.promise;
        }

        function pauseSerialPortWith(w2bVersion, params, promise) {
            switch (w2bVersion) {
                case 'web2boardJS':
                    web2boardJS.pauseSerialPort(params).then(function (result) {
                        _finalizePauseSerialPort(null, result, promise);
                    }, function (error) {
                        _finalizePauseSerialPort(error, null, promise);
                    });
                    break;
                case 'web2boardV2':
                    /*if (!_web2boardV2ListeneresAdded) {
                        addWeb2boardV2Listeners();
                    }
                    //no response, the service manage the states and alerts
                    web2boardV1.externalUpload(params.board, params.code);*/
                    break;
                case 'web2boardOnline':
                    /*web2boardOnline.compile(params).then(function (result) {
                        _finalizeCompiling(null, result, promise);
                    }, function (error) {
                        _finalizeCompiling(error, null, promise);
                    });*/
                    break;
                default:
                    $log.error('w2bVersion not defined');
                    promise.reject({
                        status: -1,
                        error: 'w2bVersion-not-defined-pauseserialport'
                    });
            }
        }

        function _finalizePauseSerialPort(error, result, promise) {
            if (error) {
                if (promise) {
                    promise.reject(error);
                }
            } else {
                if (promise) {
                    promise.resolve(result);
                }
            }
        }

        /**
         * utils
         */
        function formatHexNumber(number) {
            if (number.indexOf('0x') > -1) {
                number = number.substring(2, number.length)
            }

            number = parseInt(number, 16);
            number = '0x' + number.toString(16);

            return number;
        }

        function parseCompileError(errors) {
            var translatedErrors = [],
                line = $translate.instant('line').toUpperCase(),
                column = $translate.instant('column').toUpperCase(),
                error = $translate.instant('error').toUpperCase(),
                translatedError;

            for (var i = 0; i < errors.length; i++) {
                translatedError = error + ': ' + errors[i].error + ' ' +
                    line + ': ' + errors[i].line + ' ';
                if (errors[i].column) {
                    translatedError += column + ': ' + errors[i].column;
                }
                translatedErrors.push(translatedError);
            }

            return translatedErrors.join('<br>');
        }

        function parseUploadingError(errors) {
            var message = '';
            if (errors.error.indexOf('timeout') >= 0) {
                message = $translate.instant('modal-inform-error-textarea-placeholder') + ': ' + $translate.instant(JSON.stringify(errors.error));
            } else {
                message = $translate.instant('modal-inform-error-textarea-placeholder') + ': ' + $translate.instant(JSON.stringify(errors.error));
            }
            //stk500 timeout.

            return message;
        }

        /**
         * 
         * Web2boardV2Listeners
         * 
         */

        var _web2boardV2Listeners;

        function addWeb2boardV2Listeners() {
            _web2boardV2Listeners = {};
            _web2boardV2Listeners.w2bDisconnectedEvent = $rootScope.$on('web2board:disconnected', function () {
                web2boardV1.setInProcess(false);
                removeWeb2boardV2Listeners();
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
            _web2boardV2ListeneresAdded = true;
        }

        function removeWeb2boardV2Listeners() {
            if (_web2boardV2Listeners && _web2boardV2ListeneresAdded) {
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
                _web2boardV2ListeneresAdded = false;
            }
        }

        return exports;
    });
