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
        common, $rootScope, $translate, chromeAppApi) {
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
        var _detectWeb2boardPromise;


        //DEVELOP- REMOVE
        _detectWeb2boardPromise = $q.defer();
        exports.web2boardVersion = 'web2boardV2';
        _detectWeb2boardPromise.resolve(exports.web2boardVersion);

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

            alertsService.add({
                text: 'alert-web2board-compiling',
                id: 'compile',
                type: 'loading'
            });

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
                    web2boardV1.externalVerify(params.board, params.code).then(function (result) {
                        _finalizeCompiling(null, result, promise);
                    }, function (error) {
                        _finalizeCompiling(error, null, promise);
                    });
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
                    //no response, the service manage the states and alerts
                    web2boardV1.externalUpload(params.board, params.code).then(function (result) {
                        _finalizeUploading(null, result, promise);
                    }, function (error) {
                        _finalizeUploading({ error: error.title }, null, promise);
                    });
                    break;
                case 'web2boardOnline':
                    web2boardOnline.compileAndUpload(params).then(function (result) {
                        _finalizeUploading(null, result, promise);
                    }, function (error) {
                        _finalizeUploading(error, null, promise);
                    });
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
                if (error.error.search && (error.error.search('no Arduino') !== -1) || (error.error.search('BOARD_NOT_READY') !== -1)) {
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
                    web2boardV2.getPorts().then(function (ports) {
                        var portsWithFormat = [];
                        for (var i = 0; i < ports.length; i++) {
                            portsWithFormat.push({
                                comName: ports[i]
                            });
                        }
                        _finalizeGetPorts(null, { data: portsWithFormat }, promise);
                    }, function (error) {
                        _finalizeGetPorts(error, null, promise);
                    });
                    break;
                case 'web2boardOnline':
                    chromeAppApi.getPorts().then(function (result) {
                        _finalizeGetPorts(null, { data: result.ports }, promise);
                    }, function (error) {
                        _finalizeGetPorts(error, null, promise);
                    });
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
                    web2boardV2.openSerialPort({
                        port: params.port,
                        baudRate: params.baudRate,
                        serial: exports.serial,
                        forceReconnect: params.forceReconnect
                    }).then(function (result) {
                        _finalizeOpeneningSerialPort(null, result, promise);
                    }, function (error) {
                        _finalizeOpeneningSerialPort(error, null, promise);
                    });
                    break;
                case 'web2boardOnline':
                    chromeAppApi.openSerialPort({
                        port: params.port,
                        baudRate: params.baudRate,
                        serial: exports.serial
                    }).then(function (result) {
                        _finalizeOpeneningSerialPort(null, result, promise);
                    }, function (error) {
                        _finalizeOpeneningSerialPort(error, null, promise);
                    });
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
                    web2boardV2.closeSerialPort().then(function (result) {
                        _finalizeClosingSerialPort(null, result, promise);
                    }, function (error) {
                        _finalizeClosingSerialPort(error, null, promise);
                    });
                    break;
                case 'web2boardOnline':
                    chromeAppApi.stopSerialCommunication();
                    _finalizeClosingSerialPort(null, null, promise);
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
                    web2boardV2.sendToSerialPort(params).then(function (result) {
                        _finalizeSendToSerialPort(null, result, promise);
                    }, function (error) {
                        _finalizeSendToSerialPort(error, null, promise);
                    });
                    break;
                case 'web2boardOnline':
                    chromeAppApi.sendSerialData(params.data);
                    _finalizeSendToSerialPort(null, null, promise);
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
                    web2boardV2.pauseSerialPort(params).then(function (result) {
                        _finalizePauseSerialPort(null, result, promise);
                    }, function (error) {
                        _finalizePauseSerialPort(error, null, promise);
                    });
                    break;
                case 'web2boardOnline':
                    chromeAppApi.pauseSerialPort(params);
                    _finalizePauseSerialPort(null, null, promise);
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
            if (errors.message) {
                message = $translate.instant('modal-inform-error-textarea-placeholder') + ': ' + $translate.instant(JSON.stringify(errors.message));
            } else {
                message = $translate.instant('modal-inform-error-textarea-placeholder') + ': ' + $translate.instant(JSON.stringify(errors.error));
            }
            return message;
        }

        return exports;
    });
