'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.web2board
 * @description
 * # web2board
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('web2board', function ($log, alertsService, web2boardV1, web2boardV2, web2boardJS, web2boardOnline, utils, $q, common) {
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
                    id: 'web2board',
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
                promise.reject(error);
            } else {
                alertsService.add({
                    text: 'alert-web2board-compile-verified',
                    id: 'compile',
                    type: 'ok',
                    time: 5000
                });
                promise.resolve(result);
            }
        }

        function upload() {

        }

        function compileAndUpload() {

        }

        return exports;
    });
