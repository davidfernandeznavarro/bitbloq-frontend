'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.web2board
 * @description
 * # web2board
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .factory('web2boardV1', function ($rootScope, $websocket, $log, $q, ngDialog, _, $timeout, common, envData, web2boardV2,
        alertsService, $location, commonModals, projectService, $translate) {

        /** Variables */

        var web2board = this,
            ws, modalObj, alertUpdate,
            boardReadyPromise = null,
            versionPromise = $q.defer(),
            libVersionPromise = $q.defer(),
            isWeb2boardV2Flag = null,
            firstFunctionCalled = {
                name: '',
                args: [],
                alertServiceTag: ''
            },
            inProgress,
            TIME_FOR_WEB2BOARD_TO_START = 1500, //ms
            TIMES_TRY_TO_START_W2B = 7;

        web2board.config = {
            wsHost: '127.0.0.1',
            wsPort: 9876,
            serialPort: ''
        };

        function isEvtForNewVersionJson(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        }

        function rootWeb2boardToNewVersion() {
            ws.close(true);
            isWeb2boardV2Flag = true;
            web2boardV2.callFunction(firstFunctionCalled);
            web2boardV2.setInProcess(true);

            web2board.verify = web2boardV2.verify;
            web2board.upload = web2boardV2.upload;
            web2board.serialMonitor = web2boardV2.serialMonitor;
            web2board.plotter = web2boardV2.plotter;
            web2board.chartMonitor = web2boardV2.chartMonitor;
            web2board.version = web2boardV2.version;
            web2board.showSettings = web2boardV2.showSettings;
            web2board.uploadHex = web2boardV2.uploadHex;
        }

        function showWeb2BoardModal(options) {
            if (modalObj) {
                modalObj.close();
            }
            var parent = $rootScope,
                modalOptions = parent.$new(),
                viewAllLink = function () {
                    modalObj.close();
                    $location.path('/downloads');
                };
            _.extend(modalOptions, options);

            _.extend(modalOptions, {
                contentTemplate: '/views/modals/downloadWeb2board.html',
                modalButtons: true,
                modalText: 'modal-download-web2board-text',
                os: common.os,
                viewAllLink: viewAllLink
            });

            modalOptions.envData = envData;
            modalObj = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--download-web2board',
                scope: modalOptions,
                showClose: true
            });
            alertsService.closeByTag('web2board');
            alertsService.closeByTag(firstFunctionCalled.alertServiceTag);
        }

        function showWeb2BoardDownloadModal() {
            var modalOptions = {
                contentTemplate: '/views/modals/downloadWeb2board.html',
                modalTitle: 'modal-download-web2board-title',
                footerText: 'web2board-alreadyInstalled',
                footerLink: showWeb2BoardErrorModal
            };
            return showWeb2BoardModal(modalOptions);
        }

        function showWeb2BoardUploadModal() {
            if (alertUpdate) {
                alertsService.close(alertUpdate);
            }
            var modalOptions = {
                contentTemplate: '/views/modals/downloadWeb2board.html',
                modalTitle: 'modal-update-web2board-title',
                modalText: 'modal-download-web2board-text'
            };
            return showWeb2BoardModal(modalOptions);
        }

        function showWeb2BoardErrorModal() {
            modalObj.close();
            var parent = $rootScope,
                modalOptions = parent.$new();

            _.extend(modalOptions, {
                contentTemplate: '/views/modals/web2boardErrors.html',
                backAction: showWeb2BoardDownloadModal,
                sendCommentsModal: function () {
                    modalObj.close();
                    commonModals.sendCommentsModal();
                }
            });

            modalOptions.envData = envData;

            modalObj = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--web2board-errors',
                scope: modalOptions,
                showClose: true
            });
        }

        function showNecessaryToUpdate() {
            var startingAlert = alertsService.add({
                text: 'web2board_toast_startApp',
                id: 'web2board',
                type: 'loading'
            });
            web2board._openCommunication(function () {
                showWeb2BoardUploadModal();
                alertsService.close(startingAlert);
            });
        }

        function startWeb2board() {
            console.log('starting Web2board...');
            var tempA = document.createElement('a');
            tempA.setAttribute('href', 'web2board://');
            document.body.appendChild(tempA);
            tempA.click();
            document.body.removeChild(tempA);
        }

        /**
         * [connect ws connecting]
         * @param  {[object]} config [{port:myport,host:myhost}]
         * @return {[boolean]}        [Is connection OK?]
         */
        web2board._connect = function () {

            var dfd = $q.defer();

            if (!ws || ws.readyState !== 1) { // It's already connected

                ws = $websocket('ws://' + web2board.config.wsHost + ':' + web2board.config.wsPort);
                ws.onOpen(function (evt) {
                    if (ws.readyState === 1) {
                        $log.debug('web2board:connected');
                        dfd.resolve(evt);
                    } else {
                        dfd.reject(evt);
                    }
                });

                //Socket events handlers
                ws.onClose(function (evt) {
                    web2board._notify(evt);
                    // clear V2 flag if closed due to external reason not due to version changing
                    if (!isWeb2boardV2Flag) {
                        isWeb2boardV2Flag = null;
                    }
                });
                ws.onMessage(function (evt) {
                    if (isWeb2boardV2Flag === null) {
                        if (isEvtForNewVersionJson(evt.data)) {
                            rootWeb2boardToNewVersion();
                            return;
                        } else {
                            alertUpdate = alertsService.add({
                                text: 'alert-web2board-exitsNewVersion',
                                id: 'web2board',
                                type: 'warning',
                                time: 5000,
                                linkText: 'download',
                                link: showWeb2BoardUploadModal
                            });
                            isWeb2boardV2Flag = false;
                        }
                    }

                    web2board._notify(evt);
                });
                ws.onError(function (evt) {
                    dfd.reject(evt);
                });

            } else {
                $log.debug('web2board is already connected');
                dfd.resolve(true);
            }

            return dfd.promise;
        };

        web2board._send = function (message) {
            $log.debug('web2board:send::', message);
            return ws.send(message);
        };

        web2board._setBoard = function (boardMCU) {
            boardReadyPromise = $q.defer();
            var defaultBoard = boardMCU || 'uno';
            this._send('setBoard ' + defaultBoard);
            return boardReadyPromise.promise;
        };

        web2board._disconnect = function () {
            $log.error('web2board disconnected');
            return ws.close();
        };

        web2board._notify = function (evt) {

            $log.debug('web2board:response::', evt.type);

            /**
             * [
             * msgDecoded[0]:message
             * msgDecoded[1]:value
             * ]
             * @type {Array}
             */
            var msgDecoded = [],
                msgParsed;

            if (evt.type === 'message' && evt.data) {
                $log.debug(evt.data);
                msgDecoded = evt.data.split(/\s->\s/);

                if (msgDecoded.length > 1) {
                    msgParsed = msgDecoded[1];
                    $log.debug('MSG: ', msgParsed);
                }
                switch (msgDecoded[0]) {
                    case 'SETTING BOARD':
                        $rootScope.$emit('web2board:settingBoard');
                        break;
                    case 'SETTING PORT':
                        var ports = JSON.parse(msgParsed);
                        if (ports.length > 0) {
                            web2board.serialPort = ports[0];
                            $log.debug('upload', web2board.serialPort);
                        }
                        $rootScope.$emit('web2board:boardReady', msgParsed);
                        break;
                    case 'COMPILING':
                        $rootScope.$emit('web2board:compiling');
                        break;
                    case 'COMPILED':
                        $log.debug('compiled?:', evt.data.indexOf('KO'));
                        if (evt.data.indexOf('KO') !== -1) {
                            $rootScope.$emit('web2board:compile-error', msgParsed);
                        } else {
                            $rootScope.$emit('web2board:compile-verified', msgParsed);
                        }
                        break;
                    case 'UPLOADING':
                        $rootScope.$emit('web2board:uploading', web2board.serialPort);
                        break;
                    case 'UPLOADED':
                        if (evt.data.indexOf('KO') !== -1) {
                            $rootScope.$emit('web2board:upload-error', msgParsed);
                        } else {
                            $rootScope.$emit('web2board:code-uploaded', msgParsed);
                        }
                        break;
                    case 'NO PORT FOUND':
                        $rootScope.$emit('web2board:no-port-found');
                        break;
                    case 'VERSION':
                        $rootScope.$emit('web2board:version', msgParsed);
                        break;
                    case 'SERIALMONITOROPENED':
                        $rootScope.$emit('web2board:serial-monitor-opened', msgParsed);
                        break;
                    case 'SETTED VERSION':
                        $rootScope.$emit('web2board:bitbloqlibs-setted', msgParsed);
                        break;
                    default:
                        throw 'WTF?!? ' + evt.data;
                }

            } else if (evt.type === 'close') {
                $rootScope.$emit('web2board:disconnected');
            } else if (evt.type === 'error') {
                $rootScope.$emit('web2board:disconnected');
            }

            return true;
        };

        web2board._checkVersion = function () {
            web2board._send('version');
            return versionPromise.promise;
        };

        web2board._checkLibVersion = function () {
            var version = common.properties.bitbloqLibsVersion || '0.0.1';
            web2board._send('setBitbloqLibsVersion ' + version);
            return libVersionPromise.promise;
        };

        web2board._openCommunication = function (instructions, showUpdateModalFlag, tryCount) {
            tryCount = tryCount || 0;
            instructions = instructions || angular.noop();
            tryCount++;

            showUpdateModalFlag = showUpdateModalFlag === true && tryCount >= TIMES_TRY_TO_START_W2B;
            //It is not mandatory to have a board connected to verify the code
            web2board._connect()
                .then(function () {
                    web2board._checkLibVersion().then(function () {
                        instructions();
                    });
                })
                .catch(function () {
                    if (showUpdateModalFlag) {
                        inProgress = false;
                        showWeb2BoardDownloadModal();
                    } else {
                        if (tryCount === 1) {
                            // we only need to start web2board once and after save to prevent "leave without saving" warning dialog
                            projectService.getSavePromise().then(startWeb2board);
                        }
                        $timeout(function () {
                            web2board._openCommunication(instructions, true, tryCount);
                        }, TIME_FOR_WEB2BOARD_TO_START);
                    }
                });
        };

        /**
         * $on listeners
         */

        $rootScope.$on('web2board:boardReady', function (evt, data) {
            var dataParsed = [];
            if (data) {
                dataParsed = JSON.parse(data);
            }

            if (dataParsed.length > 0) {
                //Take the first board
                web2board.config.serialPort = dataParsed[0];
                boardReadyPromise.resolve(dataParsed[0]);
            } else {
                web2board.config.serialPort = '';
                boardReadyPromise.reject();
            }
        });

        $rootScope.$on('web2board:code-verified', function (evt, data) {
            $log.debug(evt.name);
            if (data && data.charAt(0) === '{') {
                $log.debug(JSON.parse(data));
            }
        });

        $rootScope.$on('web2board:code-uploaded', function (evt, data) {
            $log.debug(evt.name);
            if (data && data.charAt(0) === '{') {
                $log.debug(JSON.parse(data));
            }
        });

        $rootScope.$on('web2board:version', function (evt, data) {
            if (parseInt(data.replace(/\./g, ''), 10) < parseInt(common.properties.web2boardVersion.replace(/\./g, ''), 10)) {
                versionPromise.reject();
                var parent = $rootScope,
                    modalOptions = parent.$new();
                _.extend(modalOptions, {
                    contentTemplate: '/views/modals/downloadWeb2board.html',
                    modalTitle: 'modal-update-web2board-title',
                    modalText: 'modal-download-web2board-text'
                });
                modalOptions.envData = envData;
                ngDialog.closeAll();
                ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--download-web2board',
                    scope: modalOptions,
                    showClose: true
                });
                $rootScope.$emit('web2board:wrong-version');
            } else {
                versionPromise.resolve();
            }
        });

        $rootScope.$on('web2board:bitbloqlibs-setted', function (evt, data) {
            $log.debug(evt.name + data);
            libVersionPromise.resolve();
        });

        /** Public functions */

        web2board.verify = function (code, boardData) {
            if (isWeb2boardV2Flag === null) {
                firstFunctionCalled.name = 'verify';
                firstFunctionCalled.args = [code, boardData];
                firstFunctionCalled.alertServiceTag = 'compile';
            }
            //It is not mandatory to have a board connected to verify the code
            web2board._openCommunication(function () {
                return web2board._send('compile ' + code);
            });
        };

        web2board.upload = function (board, code) {
            if (isWeb2boardV2Flag === null) {
                firstFunctionCalled.name = 'upload';
                firstFunctionCalled.args = [board.mcu, code];
                firstFunctionCalled.alertServiceTag = 'upload';
            }
            if (!code || !board) {
                $rootScope.$emit('web2board:boardNotReady');
                return false;
            }
            //It is not mandatory to have a board connected to verify the code
            web2board._openCommunication(function () {
                return web2board._setBoard(board.mcu).then(function () {
                    web2board._send('upload ' + code);
                });
            });
        };

        web2board.serialMonitor = function (board) {
            if (isWeb2boardV2Flag === null) {
                firstFunctionCalled.name = 'serialMonitor';
                firstFunctionCalled.args = [board];
                firstFunctionCalled.alertServiceTag = 'serialmonitor';
            }
            web2board._openCommunication(function () {
                return web2board._setBoard(board.mcu).then(function () {
                    web2board._send('SerialMonitor ' + web2board.serialPort);
                });
            });
        };

        web2board.plotter = function (board) {
            if (isWeb2boardV2Flag === null) {
                firstFunctionCalled.name = 'plotter';
                firstFunctionCalled.args = [board];
                firstFunctionCalled.alertServiceTag = 'serialmonitor';
            }
            web2board._openCommunication(function () {
                return web2board._setBoard(board.mcu).then(function () {
                    web2board._send('SerialMonitor ' + web2board.serialPort);
                });
            });
        };

        web2board.chartMonitor = function (board) {
            if (isWeb2boardV2Flag === null) {
                firstFunctionCalled.name = 'chartMonitor';
                firstFunctionCalled.args = [board];
                firstFunctionCalled.alertServiceTag = 'chartMonitor';
            }
            showNecessaryToUpdate();
        };

        web2board.version = function () {
            if (isWeb2boardV2Flag === null) {
                firstFunctionCalled.name = 'verify';
                firstFunctionCalled.args = [];
            }
            web2board._openCommunication();
        };

        web2board.isWeb2boardV2 = function () {
            return isWeb2boardV2Flag;
        };

        web2board.isInProcess = function () {
            if (isWeb2boardV2Flag) {
                return web2boardV2.isInProcess();
            }
            return inProgress;
        };

        web2board.setInProcess = function (value) {
            inProgress = value;
        };

        web2board.showSettings = function () {
            if (isWeb2boardV2Flag === null) {
                firstFunctionCalled.name = 'showSettings';
                firstFunctionCalled.args = [];
                firstFunctionCalled.alertServiceTag = 'showSettings';
            }
            showNecessaryToUpdate();
        };

        web2board.uploadHex = function (hex, boardMcu) {
            if (isWeb2boardV2Flag === null) {
                firstFunctionCalled.name = 'uploadHex';
                firstFunctionCalled.args = [hex, boardMcu];
                firstFunctionCalled.alertServiceTag = '';
            }
            showNecessaryToUpdate();
        };

        web2board.showWeb2BoardUploadModal = showWeb2BoardUploadModal;

        web2board.getVersion = function () {
            var defer = $q.defer();
            if (web2board.isWeb2boardV2()) {
                verifyW2b2();
            } else {
                verifyW2b1();
            }
            return defer.promise;
        }

        var _verifyPromise;
        web2board.externalVerify = function (boardReference, code) {
            _verifyPromise = $q.defer();
            web2boardV2.promises.verifyPromise = _verifyPromise;
            if (_web2boardV2ListeneresAdded) {
                addWeb2boardV2Listeners();
            }
            if (web2board.isWeb2boardV2()) {
                verifyW2b2(boardReference, code);
            } else {
                verifyW2b1(boardReference, code);
            }
            return _verifyPromise.promise;
        }

        function verifyW2b2(boardReference, code) {
            //var boardReference = projectService.getBoardMetaData();
            //code = $scope.getPrettyCode()
            web2board.verify(code, boardReference);
        }

        function verifyW2b1(boardReference, code) {
            if (web2board.isInProcess()) {
                return false;
            }
            web2board.setInProcess(true);
            //var boardReference = projectService.getBoardMetaData();
            web2board.verify(code, boardReference);
        }

        var _uploadPromise;
        web2board.externalUpload = function (boardReference, code) {
            _uploadPromise = $q.defer();
            web2boardV2.promises.uploadPromise = _uploadPromise;
            if (_web2boardV2ListeneresAdded) {
                addWeb2boardV2Listeners();
            }
            if (web2board.isWeb2boardV2()) {
                uploadW2b2(boardReference, code);
            } else {
                uploadW2b1(boardReference, code);
            }
            return _uploadPromise.promise;
        }

        function uploadW2b1(boardReference, code) {
            $rootScope.$emit('uploading');
            if (web2board.isInProcess()) {
                return false;
            }
            if (boardReference) {
                web2board.setInProcess(true);

                alertsService.add({
                    text: 'alert-web2board-settingBoard',
                    id: 'upload',
                    type: 'loading'
                });

                web2board.upload(boardReference, code);
            } else {
                alertsService.add({
                    text: 'alert-web2board-boardNotReady',
                    id: 'upload',
                    type: 'warning'
                });
            }
        }

        function uploadW2b2(boardReference, code) {
            if (boardReference) {
                web2board.upload(boardReference.mcu, code);
            } else {
                alertsService.add({
                    text: 'alert-web2board-boardNotReady',
                    id: 'upload',
                    type: 'warning'
                });
            }
        }


        web2board.getVersion = function () {
            var defer = $q.defer(),
                timeout;
            var versionWs = $websocket('ws://' + web2board.config.wsHost + ':' + web2board.config.wsPort);

            versionWs.onOpen(function () {
                if (versionWs.readyState === 1) {
                    $log.debug('web2board:connected');
                    versionWs.send('version');
                    versionWs.send('setBitbloqLibsVersion ' + '0.0.1');
                }
            });

            versionWs.onMessage(function (evt) {
                if (isEvtForNewVersionJson(evt.data)) {
                    defer.resolve('web2boardV2');
                } else {
                    defer.resolve('web2boardV1');
                }
                $timeout.cancel(timeout);
                versionWs.close();
            });

            versionWs.onError(function (evt) {
                defer.reject(evt);
                versionWs.close();
                $timeout.cancel(timeout);
            });

            timeout = $timeout(function () {
                defer.reject({
                    status: -1,
                    error: 'timeout on web2boardV1/V2'
                });
                versionWs.close();
            }, TIME_FOR_WEB2BOARD_TO_START * 3);

            return defer.promise;
        }
        //TODO HERE
        web2board.getPortsCB = function (board) {
            var defer = $q.defer();
            if (isWeb2boardV2Flag === null) {
                firstFunctionCalled.name = 'getPorts';
                firstFunctionCalled.args = [board, defer];
                firstFunctionCalled.alertServiceTag = 'serialmonitor';
            }

            web2board._openCommunication(function () {
                web2board.getPorts(board, defer).then(function (data) {
                    console.log('data', data);
                    defer.resolve(data);
                });
            });
            return defer.promise;
        }

        /**
         * 
         * Web2boardV2Listeners
         * 
         */

        var _web2boardV2Listeners,
            _web2boardV2ListeneresAdded = false;

        function addWeb2boardV2Listeners() {
            _web2boardV2Listeners = {};
            _web2boardV2Listeners.w2bDisconnectedEvent = $rootScope.$on('web2board:disconnected', function () {
                if (_verifyPromise) {
                    _verifyPromise.reject('disconnect');
                }
                if (_uploadPromise) {
                    _uploadPromise.reject('disconnect');
                }
                web2board.setInProcess(false);
                removeWeb2boardV2Listeners();
            });

            _web2boardV2Listeners.w2bVersionEvent = $rootScope.$on('web2board:wrong-version', function () {
                web2board.setInProcess(false);
            });

            _web2boardV2Listeners.w2bNow2bEvent = $rootScope.$on('web2board:no-web2board', function () {
                alertsService.closeByTag('compile');
                alertsService.closeByTag('upload');
                web2board.setInProcess(false);
            });

            _web2boardV2Listeners.w2bCompileErrorEvent = $rootScope.$on('web2board:compile-error', function (event, error) {
                error = JSON.parse(error);
                if (_verifyPromise) {
                    _verifyPromise.reject(error.stdErr);
                }
                web2board.setInProcess(false);
            });

            _web2boardV2Listeners.w2bCompileVerifiedEvent = $rootScope.$on('web2board:compile-verified', function () {
                if (_verifyPromise) {
                    _verifyPromise.resolve();
                }
                web2board.setInProcess(false);
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
                web2board.setInProcess(false);
            });

            _web2boardV2Listeners.w2bUploadingEvent = $rootScope.$on('web2board:uploading', function (evt, port) {
                alertsService.add({
                    text: 'alert-web2board-uploading',
                    id: 'upload',
                    type: 'loading',
                    value: port
                });
                web2board.setInProcess(true);
            });

            _web2boardV2Listeners.w2bCodeUploadedEvent = $rootScope.$on('web2board:code-uploaded', function () {
                alertsService.add({
                    text: 'alert-web2board-code-uploaded',
                    id: 'upload',
                    type: 'ok',
                    time: 5000
                });
                web2board.setInProcess(false);
                if (_uploadPromise) {
                    _uploadPromise.resolve();
                }
            });

            _web2boardV2Listeners.w2bUploadErrorEvent = $rootScope.$on('web2board:upload-error', function (evt, data) {
                data = JSON.parse(data);
                var error = '';
                if (!data.error) {
                    error = data.stdErr;
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
                    error = 'no-port';
                } else {
                    alertsService.add({
                        text: 'alert-web2board-upload-error',
                        id: 'upload',
                        type: 'warning',
                        value: data.error
                    });
                    error = data.error;
                }
                web2board.setInProcess(false);
                if (_uploadPromise) {
                    _uploadPromise.reject();
                }
            });

            _web2boardV2Listeners.w2bNoPortFoundEvent = $rootScope.$on('web2board:no-port-found', function () {
                web2board.setInProcess(false);
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
                web2board.setInProcess(false);
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

        return web2board;
    });
