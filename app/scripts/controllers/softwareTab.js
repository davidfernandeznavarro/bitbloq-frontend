'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:SoftwareTabCtrl
 * @description
 * # SoftwareTabCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
	.controller('SoftwareTabCtrl', function ($rootScope, $scope, $timeout, $translate, $window, bloqsUtils, bloqs, bloqsApi,
		$log, $document, _, ngDialog, $location, userApi, alertsService, web2board, robotFirmwareApi, web2boardOnline, projectService,
		utils) {

		var $contextMenu = $('#bloqs-context-menu'),
			field = angular.element('#bloqs--field'),
			scrollBarContainer = angular.element('.make--scrollbar'),
			scrollBar = angular.element('.scrollbar--small'),
			bloqsTab = angular.element('.bloqs-tab'),
			currentProjectService = $scope.currentProjectService || projectService;

		var bloqsLoadTimes = 0,
			translateChangeStartEvent,
			bloqsTabsEvent;

		var consumerKeyWatcher,
			consumerSecretWatcher,
			tokenWatcher,
			tokenSecretWatcher;

		var resizeWatcher;

		$scope.bloqsApi = bloqsApi;
		$scope.currentProject = $scope.currentProject || projectService.project;
		$scope.experimentJSON = "// TODO JSON Object\n\n{name: \"json_object\", task: \"todo\"}";
		$scope.lastPosition = 0;
		$scope.checkBasicTab = 0;
		$scope.checkAdvanceTab = 0;
		// $scope.functionsCheckCounter = 0;
		$scope.selectedBloqsToolbox = '';
		$scope.twitterSettings = false;

		$scope.showTrashcan = false;
		$scope.$field = $('#bloqs--field').last();

		$scope.$trashcan = null;

		$scope.changeBloqsToolbox = function (tab) {
			$scope.selectedBloqsToolbox = tab;
			if (tab === 'components' && $scope.common.section === 'bloqsproject') {
				$scope.handleTour(6);
			}
		};

		$scope.duplicateBloqFromContextMenu = function (bloq) {
			var position = bloq.$bloq[0].getBoundingClientRect();
			copyBloq({
				structure: bloq.getBloqsStructure(),
				top: position.top,
				left: position.left
			});
		};

		$scope.enableBloqFromContextMenu = function (bloq) {
			bloq.enable();
			$scope.saveBloqStep();
			currentProjectService.startAutosave();
		};
		$scope.disableBloqFromContextMenu = function (bloq) {
			bloq.disable();
			$scope.saveBloqStep();
			currentProjectService.startAutosave();
		};

		$scope.goToCodeModal = function () {
			$scope.common.session.bloqTab = true;
			if (!$scope.common.user || !$scope.common.user.hasBeenWarnedAboutChangeBloqsToCode) {
				var modalCode = $rootScope.$new();
				_.extend(modalCode, {
					contentTemplate: '/views/modals/alert.html',
					text: 'code-modal_text_info',
					cancelButton: true,
					confirmText: 'code-modal_button_confirm',
					confirmAction: goToCode,
					cancelText: 'code-modal_button_reject',
					rejectAction: goToBloq
				});
				ngDialog.open({
					template: '/views/modals/modal.html',
					className: 'modal--container code-modal modal--alert',
					scope: modalCode
				});
			} else {
				if ($scope.currentProject._id) {
					$location.path('/codeproject/' + $scope.currentProject._id);
				} else {
					$scope.common.session.project = $scope.currentProject;
					$location.path('/codeproject/');
				}
			}
		};

		$scope.hideBloqsMenu = function ($event) {
			var current = $event.target.className;
			if (typeof current === 'object') { //svg
				current = $event.target.parentElement.parentElement.className;
			}
			if (!current.match('toolbox--bloqs--container') && !current.match('element-toolbox') && !current.match('submenu__item') && !current.match('tabs__header__item--vertical')) {
				$scope.selectedBloqsToolbox = '';
			}

		};

		$scope.init = function () {

			bloqs.removeAllBloqs();

			currentProjectService.bloqs.varsBloq = bloqs.buildBloqWithContent($scope.currentProject.software.vars, currentProjectService.componentsArray, bloqsApi.schemas, $scope.$field);
			currentProjectService.bloqs.setupBloq = bloqs.buildBloqWithContent($scope.currentProject.software.setup, currentProjectService.componentsArray, bloqsApi.schemas);
			currentProjectService.bloqs.loopBloq = bloqs.buildBloqWithContent($scope.currentProject.software.loop, currentProjectService.componentsArray, bloqsApi.schemas);

			$scope.$field.append(currentProjectService.bloqs.varsBloq.$bloq/*, currentProjectService.bloqs.setupBloq.$bloq, currentProjectService.bloqs.loopBloq.$bloq*/);
			currentProjectService.bloqs.varsBloq.enable(true);
			currentProjectService.bloqs.varsBloq.doConnectable();

			// currentProjectService.bloqs.setupBloq.enable(true);
			// currentProjectService.bloqs.setupBloq.doConnectable();

			// currentProjectService.bloqs.loopBloq.enable(false);
			// currentProjectService.bloqs.loopBloq.doConnectable();

			bloqs.updateDropdowns();
			bloqs.startBloqsUpdate(currentProjectService.componentsArray);

			$scope.$trashcan = $('#trashcan').last();

			console.log("Starting the bioblocks load");
			myBlockly();
			console.log("Starting the editor load");
			initBlockly();

		};

		$scope.initFreeBloqs = function () {
			var tempBloq, i, j,
				lastBottomConnector;

			bloqs.destroyFreeBloqs();
			if ($scope.currentProject.software.freeBloqs && ($scope.currentProject.software.freeBloqs.length > 0)) {
				for (i = 0; i < $scope.currentProject.software.freeBloqs.length; i++) {
					lastBottomConnector = null;
					for (j = 0; j < $scope.currentProject.software.freeBloqs[i].bloqGroup.length; j++) {
						// $log.debug( $scope.currentProject.software.freeBloqs[i].bloqGroup[j]);
						tempBloq = bloqs.buildBloqWithContent($scope.currentProject.software.freeBloqs[i].bloqGroup[j], currentProjectService.componentsArray, bloqsApi.schemas);

						if (lastBottomConnector) {
							bloqs.connectors[lastBottomConnector].connectedTo = tempBloq.connectors[0];
							bloqs.connectors[tempBloq.connectors[0]].connectedTo = lastBottomConnector;

						} else {
							tempBloq.$bloq[0].style.transform = 'translate(' + $scope.currentProject.software.freeBloqs[i].position.left + 'px,' + $scope.currentProject.software.freeBloqs[i].position.top + 'px)';
						}

						lastBottomConnector = tempBloq.connectors[1];

						$scope.$field.append(tempBloq.$bloq);
						tempBloq.disable();
						tempBloq.doConnectable();
					}

					bloqsUtils.redrawTree(tempBloq, bloqs.bloqs, bloqs.connectors);
				}
			}
			//bloqsUtils.drawTree(bloqs.bloqs, bloqs.connectors);
		};

		$scope.onFieldKeyDown = function (event) {
			if ((event.keyCode === 8) && $document[0].activeElement.attributes['data-bloq-id']) {
				event.preventDefault();
				var bloq = bloqs.bloqs[$document[0].activeElement.attributes['data-bloq-id'].value];
				if (bloq.bloqData.type !== 'group' && bloqs.bloqs[bloq.uuid].isConnectable()) {
					bloqs.removeBloq($document[0].activeElement.attributes['data-bloq-id'].value, true);
					$scope.$field.focus();
					$scope.saveBloqStep();
					currentProjectService.startAutosave();
				} else {
					$log.debug('we cant delete group bloqs');
				}
			}
		};

		$scope.onFieldKeyUp = function (event) {
			//$log.debug('event.keyCode', event.keyCode);
			var bloq;

			switch (event.keyCode) {
				case 46:
				case 8:
					if ($document[0].activeElement.attributes['data-bloq-id']) {
						event.preventDefault();
						bloq = bloqs.bloqs[$document[0].activeElement.attributes['data-bloq-id'].value];
						if (bloq.bloqData.type !== 'group' && bloqs.bloqs[bloq.uuid].isConnectable()) {
							bloqs.removeBloq($document[0].activeElement.attributes['data-bloq-id'].value, true);
							$scope.$field.focus();
							$scope.saveBloqStep();
							currentProjectService.startAutosave();
						} else {
							$log.debug('we cant delete group bloqs');
						}
					}
					break;
				case 67:
					//$log.debug('ctrl + c');
					if (event.ctrlKey && $document[0].activeElement.attributes['data-bloq-id']) {
						bloq = bloqs.bloqs[$document[0].activeElement.attributes['data-bloq-id'].value];
						var position = bloq.$bloq[0].getBoundingClientRect();
						if (bloq.bloqData.type !== 'group') {
							localStorage.bloqInClipboard = angular.toJson({
								structure: bloq.getBloqsStructure(),
								top: position.top,
								left: position.left
							});
						}
					}
					break;
				case 86:
					//$log.debug('ctrl + v');tagNameTEXTAREA
					if (event.ctrlKey &&
						localStorage.bloqInClipboard &&
						($scope.currentTab === 1) &&
						($document[0].activeElement.tagName !== 'INPUT') &&
						($document[0].activeElement.tagName !== 'TEXTAREA')) {
						copyBloq(JSON.parse(localStorage.bloqInClipboard));
					}
					break;
				case 89:
					$log.debug('ctrl + y');
					if (event.ctrlKey) {
						$scope.redo();
						$window.document.getElementById('bloqs--field').focus();
					}
					break;
				case 90:
					$log.debug('ctrl + z');
					if (event.ctrlKey) {
						$scope.undo();
						$window.document.getElementById('bloqs--field').focus();
					}
					break;
			}
		};

		$scope.performFactoryReset = function () {
			var base = $scope.currentProject.hardware.robot,
				version,
				mcu;

			if (base) { //Zowi
				version = $scope.common.properties.robotsFirmwareVersion[base];
				mcu = projectService.getBoardMetaData(projectService.getRobotMetaData(base).board).mcu;
			} else { //Makeblock
				base = $scope.currentProject.hardware.board;
				version = $scope.common.properties.boardsFirmwareVersion[base];
				mcu = projectService.getBoardMetaData(base).mcu;
			}

			robotFirmwareApi.getFirmware(base, version).then(function (result) {
				if ($scope.common.useChromeExtension()) {
					web2boardOnline.upload({
						hex: result.data,
						board: {
							mcu: mcu
						}
					});
				} else {
					web2board.uploadHex(mcu, result.data);
				}
			}, function () {
				alertsService.add({
					text: 'make_infoError_performResetError',
					id: 'performError',
					type: 'warning'
				});
			});
		};

		$scope.removeBloqFromContextMenu = function (bloq) {
			bloqs.removeBloq(bloq.uuid, true);
			//saveBloqStep from here to not listen remove event from children and store one step for children
			$scope.saveBloqStep();
			currentProjectService.startAutosave();
		};

		$scope.searchBloq = function () {
			var userComponents = _.pick(currentProjectService.componentsArray, function (value) {
				return value.length > 0;
			});
			if (userComponents.indexOf($scope.searchText)) {
				//Todo pintar en un contenedor nuevo
			}
		};
		$scope.clickTwitterConfig = function () {
			$scope.twitterSettings = !$scope.twitterSettings;
			if ($scope.twitterSettings) {
				startTwitterWatchers();
			} else {
				deleteTwitterWatchers();
			}
		};

		$scope.setSoftwareTab = function (tab) {
			$scope.softTab = tab;
			if (tab === 'code') {
				$scope.setCode(currentProjectService.getCode());
			} else if (tab === 'bloqs') {
				$rootScope.$emit('currenttab:bloqstab');
			}
			setTimeout(function() {
				$window.dispatchEvent(new Event('resize'));
				$rootScope.blocklyWorkspaceExperiment.render();
			}, 1);
		};

		$scope.shouldShowNoComponentsText = function () {
			var result = true;
			if ($scope.currentProject && $scope.currentProject.hardware) {
				if ($scope.currentProject.useBitbloqConnect ||
					($scope.currentProject.hardware.board === 'freakscar') ||
					($scope.currentProject.hardware.board === 'echidna-ArduinoUNO') ||
					($scope.currentProject.hardware.board === 'echidna-FreaduinoUNO') ||
					($scope.currentProject.hardware.board === 'echidna-bqZUM') ||
					($scope.currentProject.hardware.components.length > 0)
				) {
					result = false;
				}
			}
			return result;
		};

		$scope.showMBotComponents = function (bloqName) {
			var result = false;
			var stopWord = ['mBotMove-v2', 'mBotStop-v2', 'mBotMoveAdvanced-v2'];
			if ($scope.currentProject.hardware.board && $scope.currentProject.hardware.components) {
				var connectedComponents = $scope.currentProject.hardware.components;
				if (stopWord.indexOf(bloqName) === -1) {
					switch (bloqName) {
						case 'mBotSomethingNear':
							result = existComponent(['mkb_ultrasound'], connectedComponents);
							break;
						case 'mBotIfThereIsALotOfLight':
							result = existComponent(['mkb_lightsensor', 'mkb_integrated_lightsensor'], connectedComponents);
							break;
						case 'mBotIfFollowLines':
							result = existComponent(['mkb_linefollower'], connectedComponents);
							break;
						case 'mBotSetRGBLedSimple':
						case 'mBotRGBLedOff':
							result = existComponent(['mkb_integrated_RGB'], connectedComponents);
							break;
						case 'makeblockIfNoise':
							result = existComponent(['mkb_soundsensor'], connectedComponents);
							break;
						case 'mBotLedMatrix':
						case 'mBotClearLedMatrix':
						case 'mBotShowTimeOnLedMatrix':
						case 'mBotShowNumberOnLedMatrix':
						case 'mBotShowStringOnLedMatrix':
						case 'mBotSetLedMatrixBrightnessAdvanced':
						case 'mBotShowNumberOnLedMatrixAdvanced':
						case 'mBotShowStringOnLedMatrixAdvanced':
						case 'mBotShowTimeOnLedMatrixAdvanced':
						case 'mkbShowFaceOnLedMatrix':
						case 'mkbDrawLedMatrix':
						case 'mkbDrawLedMatrixAdvanced':
						case 'mkbDrawLineAdvanced':
						case 'mkbDrawRectangleAdvanced':
							result = existComponent(['mkb_ledmatrix'], connectedComponents);
							break;
						case 'ifButtonPushed':
							result = existComponent(['mkb_4buttonKeyPad'], connectedComponents);
							break;
						case 'remoteButtonPushedSwitch':
						case 'remoteButtonPushedCase':
						case 'remoteButtonPushedCaseDefault':
							result = existComponent(['mkb_remote'], connectedComponents, true);
							break;
						case 'displayNumber':
						case 'displayNumberInPosition':
						case 'clear7segment':
							result = existComponent(['mkb_display7seg'], connectedComponents);
							break;
						case 'makeblockIfMotion':
							result = existComponent(['mkb_motionSensor'], connectedComponents);
							break;
						case 'mkbfan':
							result = existComponent(['mkb_fan'], connectedComponents);
							break;
						case 'mkbSetExternalRGBLedSimple':
						case 'mkbSetExternalRGBLedOff':
							result = existComponent(['mkb_RGBLed'], connectedComponents);
							break;
						default:
							result = false;
					}
				} else {
					result = true;
				}
			} else {
				result = false;
			}

			return result;
		};

		$scope.showZumjuniorComponents = function(bloqName) {
			if (!$scope.currentProject.hardware.board ||
				!$scope.currentProject.hardware.components) {
				return false;
			}

			var connectedComponents = $scope.currentProject.hardware.components;

			switch (bloqName) {
				case 'zumjuniorServoStart':
				case 'zumjuniorServoStop':
					return existComponent(['zumjunior_servo'], connectedComponents);
				case 'zumjuniorDoubleLed':
					return existComponent(['zumjunior_double_led'], connectedComponents);
				case 'zumjuniorMiniservo':
					return existComponent(['zumjunior_miniservo'], connectedComponents);
				case 'zumjuniorButtonIf':
				case 'zumjuniorButtonWhile':
					return existComponent(['zumjunior_button'], connectedComponents);
				case 'zumjuniorSliderIf':
				case 'zumjuniorSliderWhile':
					return existComponent(['zumjunior_slider'], connectedComponents);
				case 'zumjuniorDisplayNumber':
				case 'zumjuniorDisplayNumbers':
				case 'zumjuniorClearDisplay':
					return existComponent(['zumjunior_7segment'], connectedComponents);
				case 'zumjuniorSensorsIf':
				case 'zumjuniorSensorsWhile':
				case 'zumjuniorColorIf':
				case 'zumjuniorColorWhile':
					return existComponent(['zumjunior_sensors'], connectedComponents);
				case 'zumjuniorTurnOnLed':
				case 'zumjuniorTurnOffLed':
					return existComponent(['zumjunior_integrated_led'], connectedComponents);
				case 'zumjuniorPlayBuzz':
					return existComponent(['zumjunior_integrated_buzz'], connectedComponents);

				default:
					return false;
			}
		};

		$scope.anyComponentBloq = function () {
			var result = false;
			if (currentProjectService.project && currentProjectService.project.hardware) {
				switch (currentProjectService.project.hardware.board) {
					case 'echidna-ArduinoUNO':
					case 'echidna-FreaduinoUNO':
					case 'echidna-bqZUM':
						result = true;
						break;
				}
			} else {
				result = false;
			}
			return result;
		};

		$scope.showComponents = function (item) {
			var result = false;
			var stopWord = ['analogWrite', 'viewer', 'digitalWrite', 'pinReadAdvanced', 'pinWriteAdvanced', 'turnOnOffAdvanced',
				'digitalReadAdvanced', 'analogReadAdvanced', 'pinLevels', 'convert'
			];
			if (stopWord.indexOf(item) === -1) {
				var i;
				if ($scope.currentProject.hardware.board && $scope.currentProject.hardware.components) {
					var connectedComponents = $scope.currentProject.hardware.components;
					if (item.indexOf('serial') > -1) {
						result = existComponent(['bt', 'sp', 'device', 'mkb_bluetooth'], connectedComponents);
					} else if (item.indexOf('phone') > -1) {
						result = $scope.currentProject.useBitbloqConnect;
					} else if (item.includes('oscillator')) {
						i = 0;
						while (!result && (i < connectedComponents.length)) {
							if ((connectedComponents[i].uuid === 'servo') && connectedComponents[i].oscillator && (connectedComponents[i].oscillator !== 'false')) {
								result = true;
							}
							i++;
						}
					} else if (item.includes('continuousServo')) {
						result = existComponent(['servocont'], connectedComponents);
					} else if (item.includes('servo')) {
						i = 0;
						while (!result && (i < connectedComponents.length)) {
							if ((connectedComponents[i].uuid === 'servo') && (connectedComponents[i].oscillator !== true)) {
								result = true;
							}
							i++;
						}
					} else {
						switch (item) {
							case 'hwVariable':
								result = (connectedComponents.length !== 0);
								break;
							case 'led':
								result = existComponent(['led'], connectedComponents);
								break;
							case 'servoAttach':
							case 'servoDetach':
								result = existComponent(['servo', 'servocont'], connectedComponents);
								break;
							case 'readSensor':
								result = existComponent([
									'banana', 'us', 'button', 'limitswitch', 'encoder',
									'sound', 'buttons', 'irs', 'irs2',
									'joystick', 'ldrs', 'pot', 'mkb_lightsensor', 'mkb_joystick',
									'mkb_integrated_lightsensor', 'mkb_integrated_analogPinButton',
									'mkb_soundsensor', 'mkb_remote', 'freakscar_integrated_remote',
									'freakscar_integrated_lightsensor', 'mkb_pot', 'mkb_4buttonKeyPad'
								], connectedComponents);
								break;
							case 'mBotBuzzer-v2':
							case 'mBotBuzzerAdvanced-v2':
								result = existComponent(['mkb_integrated_buzz'], connectedComponents);
								break;
							case 'mBotSetRGBLed':
							case 'mBotSetRGBLedAdvanced':
							case 'mBotSetRGBLedAdvancedFull':
								result = existComponent(['mkb_integrated_RGB'], connectedComponents);
								break;
							case 'makeblockIfNoise':
								result = existComponent(['mkb_soundsensor'], connectedComponents);
								break;
							case 'mBotLedMatrix':
								result = existComponent(['mkb_ledmatrix'], connectedComponents);
								break;
							case 'readJoystickXY':
								result = existComponent(['mkb_joystick'], connectedComponents) || existComponent(['joystick'], connectedComponents);
								break;
							case 'mBotSetLedMatrixBrightness':
							case 'mBotSetLedMatrixBrightnessAdvanced':
							case 'mBotShowNumberOnLedMatrixAdvanced':
							case 'mBotShowStringOnLedMatrixAdvanced':
							case 'mBotShowTimeOnLedMatrixAdvanced':
								result = existComponent(['mkb_ledmatrix'], connectedComponents);
								break;
							case 'ifButtonPushed':
								result = existComponent(['mkb_4buttonKeyPad'], connectedComponents);
								break;
							case 'remoteButtonPushed':
								result = existComponent(['mkb_remote'], connectedComponents);
								break;
							case 'displayNumber':
							case 'displayNumberInPosition':
							case 'clear7segment':
							case 'setDisplayBrightness':
							case 'setDisplayBrightnessAdvanced':
								result = existComponent(['mkb_remote'], connectedComponents);
								break;
							case 'freakscarBuzzer':
							case 'freakscarDistance':
							case 'freakscarLight':
								result = existComponent(['freakscar_integrated_lightsensor'], connectedComponents);
								break;
							case 'mkbGyroscope':
							case 'mkbIntegratedSoundSensor':
							case 'mkbAccelerometer':
								result = currentProjectService.project && currentProjectService.project.hardware && (currentProjectService.project.hardware.board === 'meauriga');
								break;
							case 'motorSetSpeed':
							case 'motorSetSpeedAdvanced':
								result = existComponent(['drivegearmotor'], connectedComponents);
								break;
							case 'robotSetMotorSpeed':
							case 'robotSetMotorSpeedAdvanced':
								if ($scope.currentProject && $scope.currentProject.hardware) {
									switch ($scope.currentProject.hardware.board) {
										case 'meauriga':
											//case 'mcore':
											//case 'meorion':
											result = true;
											break;

										default:
											result = false;
											break;
									}
								} else {
									result = false;
								}
								break;
							case 'mkbSetExternalRGBLedAdvanced':
							case 'mkbSetExternalRGBLedAdvancedFull':
								result = existComponent(['mkb_RGBLed'], connectedComponents);
								break;
							case 'mkbReadMagneticField':
								result = existComponent(['mkb_compass'], connectedComponents);
								break;

							case 'zumjuniorReadSlider':
								result = existComponent(['zumjunior_slider'], connectedComponents);
								break;
							case 'zumjuniorReadButton':
								result = existComponent(['zumjunior_button'], connectedComponents);
								break;
							case 'zumjuniorReadSensors':
							case 'zumjuniorReadColor':
								result = existComponent(['zumjunior_sensors'], connectedComponents);
								break;
							case 'zumjuniorTurnOnLedRGB':
								result = existComponent(['zumjunior_integrated_led'], connectedComponents);
								break;

							case 'echidnaBuzzer':
							case 'echidnaBuzzerWithoutPause':
							case 'echidnaReadSensor':
							case 'echidnaLeds':
							case 'echidnaRGB':
							case 'advancedEchidnaRGB':
							case 'echidnaReadJoystickXY':
							case 'echidnaReadAccelXY':
							case 'echidnaRGBFull':
							case 'echidnaRGBOff':
								if ($scope.currentProject && $scope.currentProject.hardware) {
									switch ($scope.currentProject.hardware.board) {
										case 'echidna-ArduinoUNO':
										case 'echidna-FreaduinoUNO':
										case 'echidna-bqZUM':
											result = true;
											break;
									}
								} else {
									result = false;
								}
								break;
							case 'lcdWritePositionAdvanced':
							case 'lcdTurnOnOffAdvanced':
							case 'lcdWriteAdvanced':
							case 'lcdWritePositionAdvanced-v1':
							case 'lcdTurnOnOff':
							case 'lcdWrite':
							case 'lcdWritePosition':
							case 'lcdClear':
								result = existComponent(['lcd', 'lcd_generic'], connectedComponents);
								break;
							case 'rgbLed':
							case 'rgbLedOff':
							case 'rgbLedSimple':
							case 'rgbLedAdvanced':
								result = existComponent(['RGBled', 'neoRGBled'], connectedComponents);
								break;
							case 'rgbLedFade':
								result = existComponent(['RGBled'], connectedComponents);
								break;
							default:
								i = 0;
								while (!result && (i < connectedComponents.length)) {
									if (connectedComponents[i].uuid.includes(item) ||
										item.toLowerCase().includes(connectedComponents[i].uuid)) {
										result = true;
									}
									i++;
								}
						}
					}
				}
			} else {
				result = true;
			}
			return result;
		};



		$scope.experimentChange = function() {
			// console.log("My workspace changed!");
			// console.log($rootScope.blocklyWorkspaceExperiment);
			// console.log($rootScope.blocklyWorkspaceExperiment.getAllBlocks());
			// console.log(Blockly.JavaScript.workspaceToCode($rootScope.blocklyWorkspaceExperiment));
			// console.log(Blockly.JSON.workspaceToCode($rootScope.blocklyWorkspaceExperiment));
			createExperimentJSON();
			$scope.arduinoCode = arduinoTranslation($scope.experimentJSON);
			var xml = Blockly.Xml.workspaceToDom($rootScope.blocklyWorkspaceExperiment);
			$scope.currentProject.experiment = Blockly.Xml.domToPrettyText(xml);
			currentProjectService.startAutosave();
		}

		function createExperimentJSON(){
				var totalBlocks = $rootScope.blocklyWorkspaceExperiment.getAllBlocks();/*  This function performs an array which is used to store all the blocks in the workspace */
				
				var maximumTimeOfOperation = 0;
				var totalOperationBlocks = 0;
				var childrenOperationArray={};/* Array to store only the operation blocks (the green blocks). */ 
				var h=0;/* variable to iterate all the blocks in the workspace */
				$scope.experimentJSON = '{\n    "refs": {\n';
				while(h<= totalBlocks.length){
					if (totalBlocks.hasOwnProperty(h)){/* Check if it exists the object contain in totalBlock[h] */
						if(totalBlocks[h].getInput("Experiment")){ /* If it's an experiment block go on  */
								var childrenArray = {}/* initialize of this object */
							childrenArray = totalBlocks[h].getDescendants(); /* Get all the children of the CURRENT experiment block */
							var childrenContainerExists = {}
							var s=0;
							var boolExists=0;
							
							/* This loop search in the all the children of experiment block and switch their kind call determinated functions */
							for(var k=0;k<childrenArray.length;k++){
								if (childrenArray.hasOwnProperty(k)){
									if(childrenArray[k].getFieldValue("containerName")){ /* If it's a container */
										
										for(var u=0;u<childrenArray.length;u++){
											
											if (childrenContainerExists.hasOwnProperty(u)){ /* Check if a block with the same name already was processed */
												if ( childrenContainerExists[u].getFieldValue("containerName") == childrenArray[k].getFieldValue("containerName")){
													boolExists=1;
													
												}
											}
										}
										if(boolExists==0){ /* If it's first time appear this container's name write their info in "refs:" of JSON code. */
											$scope.experimentJSON = $scope.experimentJSON + '        "' + childrenArray[k].getFieldValue("containerName") +'": {\n';
										$scope.experimentJSON = $scope.experimentJSON + '            "id": "' + childrenArray[k].getFieldValue("containerName") +'", \n';
										$scope.experimentJSON = $scope.experimentJSON + '            "volume": "' + childrenArray[k].getFieldValue("initial_volume") +'", \n';
										$scope.experimentJSON = $scope.experimentJSON + '            "store": ' + childrenArray[k].getFieldValue("STORE-DISCARD") +'\n        },\n';
										childrenContainerExists[s] = childrenArray[k] /* Include this name in the array to check if it already exists */
										s++;
									}
									boolExists=0; /* Reboot this variable for next loop */
								}
								
								if(childrenArray[k].getFieldValue("timeOfOperation")){ /* If it's an operation block go on. Because all the operation block has the "timeOfOperation" input  */
									
									if(0>childrenArray[k].getFieldValue("timeOfOperation")){
										alert("Warning, time of operation must be greater than 0"); /* Warning message to advise to the user, that negative values are not allow */
									}
									
									if(maximumTimeOfOperation<Number(childrenArray[k].getFieldValue("timeOfOperation"))){
										maximumTimeOfOperation=childrenArray[k].getFieldValue("timeOfOperation"); /* Store the maximum time of operation off the blocks  */
										
									}
									childrenOperationArray[totalOperationBlocks]=childrenArray[k]; /* Assign the current operation block in the array of operation block */
									totalOperationBlocks++;
								}
							}
						}                           
					}
				}
				h++;
			}
			/* After store all function blocks, we do a loop to export the information of each of them arranged by the time of operation. */
			$scope.experimentJSON = $scope.experimentJSON.substring(0,$scope.experimentJSON.length-2);
			$scope.experimentJSON = $scope.experimentJSON + '\n      },\n        "instructions": [\n';
			var operationBlocksToGraph=0;
			var i=0;
			while ( operationBlocksToGraph<totalOperationBlocks && i<=maximumTimeOfOperation){/* Condition to make sure we are writing all the operation blocks. */
				for(var k=0;k<totalOperationBlocks;k++){
					if (childrenOperationArray.hasOwnProperty(k)){
						if(i == childrenOperationArray[k].getFieldValue("timeOfOperation")){ /* Chech if the current block has the corresponding time of operation */
							
							$scope.experimentJSON += Blockly.JavaScript.blockToCode(childrenOperationArray[k]);  /* Codify this block and its direct descendence. */
							operationBlocksToGraph++;
							if( operationBlocksToGraph<totalOperationBlocks){
								$scope.experimentJSON = $scope.experimentJSON + '                },\n';
							}
						}
					}
				}
				i++; /* increment the current "timeOfOperaion" output */
				
			}
			
			$scope.experimentJSON = $scope.experimentJSON + '        }\n    ]\n}';
		}

		function initBlockly() {
			/*** Comented to allow loading the blocks of the bioblock editor 
			console.log("---");
			$scope.blocklyDiv = $("#blocklyDiv")[0];
			console.log($scope.blocklyDiv);
			$scope.blocklyWorkspace = Blockly.inject($scope.blocklyDiv,{toolbox: document.getElementById('blockly--toolbox')});
			console.log($scope.blocklyWorkspace);
			console.log("---");
			***/
			//$window.alert(BlockFactory.mainWorkspace);
			//js_init2();
			console.log("Starting the editor load");
			MyController.js_init();
			console.log("end of the editor load");
		}

		function myBlockly() {
			// Loads the BioBlock workspace into it's div.
			// var myowntoolbox = '<xml id="toolbox" style="display: none"><category name="Input / Output"><block type="source"></block><block type="destination"></block></category><category name="Number Inputs"><block type="numbers_time_of_op"><field name="VALUE">0</field></block><block type="numbers_speed"><field name="VALUE">0</field></block><block type="numbers_cycles">          <field name="VALUE">0</field>        </block>        <block type="numbers_wavelength">          <field name="VALUE">0</field>        </block>        <block type="numbers_sequence">          <field name="VALUE">0</field>        </block>        <block type="numbers_co2">          <field name="VALUE">0</field>        </block>        <block type="numbers_speed">          <field name="VALUE">0</field>        </block>      </category>      <category name="String Inputs">        <block type="strings_ladder">          <field name="TEXT"> --- </field>        </block>        <block type="strings_dest">          <field name="TEXT"> --- </field>        </block>        <block type="strings_scale">          <field name="TEXT"> --- </field>        </block>        <block type="strings_purification">          <field name="TEXT"> --- </field>        </block>        <block type="strings_mcc">          <field name="TEXT"> --- </field>        </block>      </category>      <category name="Dropdown Menus">        <block type="drop_action">          <field name="NAME">OPTIONNAME</field>        </block>        <block type="drop_measure">          <field name="NAME">OPTIONNAME</field>        </block>        <block type="drop_type">          <field name="NAME">OPTIONNAME</field>        </block>        <block type="drop_temp">          <field name="NAME">OPTIONNAME</field>          <field name="NUMBER">0</field>        </block>        <block type="drop_duration">          <field name="NUMBER">0</field>          <field name="NAME">OPTIONNAME</field>        </block>      </category>      <category name="Extra">        <block type="new_op">          <field name="NAME"> --- </field>        </block>        <block type="new_op2">          <field name="NAME"> --- </field>        </block>        <block type="extra_settings">          <field name="NAME">TRUE</field>        </block>        <block type="extra_mix_check">          <field name="NAME">TRUE</field>        </block>      </category>    </xml>   ';
			var bioptions = { 
				toolbox : toolbox, 
				collapse : true, 
				comments : true, 
				disable : true, 
				maxBlocks : Infinity, 
				trashcan : true, 
				horizontalLayout : false, 
				toolboxPosition : 'start', 
				css : true, 
				media : 'https://blockly-demo.appspot.com/static/media/', 
				rtl : false, 
				scrollbars : true, 
				sounds : true, 
				oneBasedIndex : true
			};
			console.log("-LOADING BLOCKLY-");
			$scope.blocklyDiv = $("#blocklyDiv")[0];
			$scope.blocklyDivExperiment = $("#blocklyDivExperiment")[0];
			console.log($scope.blocklyDiv);
			$rootScope.blocklyWorkspaceExperiment = Blockly.inject($scope.blocklyDivExperiment,{toolbox: document.getElementById('blockly--toolbox')},bioptions);
			$rootScope.blocklyWorkspaceExperiment.addChangeListener($scope.experimentChange);
			initBioblocksComponents();

			if ($scope.currentProject.experiment!=null){
				var xml = Blockly.Xml.textToDom($scope.currentProject.experiment);
				Blockly.Xml.domToWorkspace($rootScope.blocklyWorkspaceExperiment, xml);
			}
			console.log("-INIT COMPLETED ;)-");
		}

		function checkInputLength() {
			setScrollsDimension();
		}

		function clickDocumentHandler(evt) {
			$contextMenu.css({
				display: 'none'
			});

			if ($('#twitter-config-button:hover').length === 0 && $('#twitter-content:hover').length === 0) {
				$scope.twitterSettings = false;
				deleteTwitterWatchers();
			}
			$scope.hideBloqsMenu(evt);
			utils.apply($scope);
		}

		function contextMenuDocumentHandler(event) {

			var bloq = $(event.target).closest('.bloq');
			var bloqUuid = bloq.attr('data-bloq-id');

			if (bloqUuid && !bloq.hasClass('bloq--group') && bloqs.bloqs[bloqUuid].isConnectable()) {
				event.preventDefault();
				if (!$scope.$$phase) {
					$scope.$apply(function () {
						$scope.contextMenuBloq = bloqs.bloqs[bloqUuid];
					});
				}
				if ((angular.element($window).height() - event.pageY) > $contextMenu.height()) {
					$contextMenu.css({
						display: 'block',
						left: event.pageX + 'px',
						top: event.pageY + 'px'
					});
				} else {
					$contextMenu.css({
						display: 'block',
						left: event.pageX + 'px',
						top: (event.pageY - $contextMenu.height()) + 'px'
					});
				}

			} else {
				$contextMenu.css({
					display: 'none'
				});
			}
		}

		function copyBloq(bloq) {

			var newBloq = bloqs.buildBloqWithContent(bloq.structure, currentProjectService.componentsArray, bloqsApi.schemas);

			newBloq.doConnectable();
			newBloq.disable();

			newBloq.$bloq[0].style.transform = 'translate(' + (bloq.left - 50 + $scope.$field.scrollLeft()) + 'px,' + (bloq.top - 100 + $scope.$field.scrollTop()) + 'px)';
			$scope.$field.append(newBloq.$bloq);
			$scope.saveBloqStep();
			var i = 0;
			if (newBloq.varInputs) {
				for (i = 0; i < newBloq.varInputs.length; i++) {
					newBloq.varInputs[i].keyup();
				}
			}
			$scope.updateBloqs();
		}

		function existComponent(componentsToSearch, components, wirelessConnected) {
			var found,
				j,
				i = 0;

			while (!found && (i < componentsToSearch.length)) {
				j = 0;
				while (!found && (j < components.length)) {
					if (componentsToSearch[i] === components[j].uuid) {
						found = components[j];
					}
					j++;
				}
				i++;
			}
			if (found && !found.connected && !wirelessConnected) {
				found = false;
			}

			return found;
		}

		function goToCode() {
			ngDialog.closeAll();
			if ($scope.common.user) {
				$scope.common.user.hasBeenWarnedAboutChangeBloqsToCode = true;
				userApi.update({
					hasBeenWarnedAboutChangeBloqsToCode: true
				});
				if ($scope.currentProject._id) {
					$location.path('/codeproject/' + $scope.currentProject._id);
				} else {
					$location.path('/codeproject/');
				}
			} else {
				$scope.common.session.project = $scope.currentProject;
				$location.path('/codeproject/');
			}
		}

		function goToBloq() {
			ngDialog.closeAll();
			$scope.setSoftwareTab('bloqs');
		}

		function loadBloqs() {
			bloqsLoadTimes++;
			bloqsApi.itsLoaded().then(function () {
				var bloqsOptions = {
					fieldOffsetLeft: 70,
					fieldOffsetRight: 216,
					fieldOffsetTopSource: ['header', 'nav--make', 'actions--make', 'tabs--title'],
					bloqSchemas: bloqsApi.schemas,
					suggestionWindowParent: $scope.$field[0],
					dotsMatrixWindowParent: $scope.$field[0]
				};

				if (currentProjectService.exercise) {
					var availableBloqs = [];
					_.forEach(currentProjectService.exercise.selectedBloqs, function (value) {
						availableBloqs = availableBloqs.concat(value);
					});
					bloqsOptions.availableBloqs = availableBloqs;
				}

				bloqs.setOptions(bloqsOptions);

				$scope.groupBloqs = angular.element('.field--content');
				$scope.groupBloqs.on('scroll', scrollHorizontalField);
				$scope.horizontalScrollBarContainer = angular.element('#make--horizontal-scrollbar');
				$scope.horizontalScrollBarContainer.on('scroll', scrollHorizontalField);
				$scope.horizontalScrollBar = angular.element('#scrollbar--horizontal-small');
				$scope.common.isLoading = false;
				$scope.init();
				setScrollsDimension();
				$('input[type="text"]').on('keyup paste change', checkInputLength);
				bloqs.translateBloqs($translate.use());
				$scope.$on('refresh-bloqs', function () {
					$scope.init();
					bloqs.destroyFreeBloqs();
				});
				$rootScope.$on('update-bloqs', function () {
					$scope.init();
					$scope.initFreeBloqs();
				});
				translateChangeStartEvent = $rootScope.$on('$translateChangeStart', function (evt, key) {
					bloqs.translateBloqs(key.language);
				});
			},
				function () {
					$log.debug('fail');
					if (bloqsLoadTimes < 2) {
						loadBloqs();
					} else {
						alertsService.add({
							text: 'make_infoError_bloqsLoadError',
							id: 'loadBloqs',
							type: 'warning'
						});
					}
				});
		}

		function scrollField(e) {
			scrollBar.css('height', e.currentTarget.scrollHeight);
			scrollBarContainer.scrollTo(0, e.currentTarget.scrollTop);
			field.scrollTo(0, scrollBarContainer[0].scrollTop);
		}

		function scrollHorizontalField(e) {
			if ($scope.lastPosition > e.currentTarget.scrollLeft) {
				angular.element('.field--content').scrollLeft(e.currentTarget.scrollLeft);
			} else {
				angular.element('.field--content').scrollLeft(e.currentTarget.scrollLeft + 150);
			}
			$scope.lastPosition = e.currentTarget.scrollLeft;
		}

		function setScrollsDimension() {
			if (!$scope.common.isLoading) {
				setScrollHeight();
				setScrollWidth();
			} else {
				$timeout(function () {
					setScrollsDimension();
				}, 200);
			}
		}

		function setScrollHeight() {
			$timeout(function () {
				var realScrollbarHeight = bloqsTab.height() + 50;

				if ($scope.$field.height() < realScrollbarHeight) {
					$scope.showScroll = true;
					scrollBar.css('height', field[0].scrollHeight);
					utils.apply($scope);
				} else {
					$scope.showScroll = false;
					utils.apply($scope);
				}
			}, 50);
		}

		function setScrollWidth() {
			$timeout(function () {
				var groupBloqs = angular.element('.field--content');
				console.log(groupBloqs);
				var horizontalScrollBar = angular.element('#scrollbar--horizontal-small');
				var horizontalScrollWidth = Math.max.apply(null, groupBloqs.map(function () {
					return this.scrollWidth;
				}));
				if (horizontalScrollWidth > groupBloqs[0].clientWidth) {
					$scope.showHorizontalScroll = true;
					horizontalScrollBar.css('width', horizontalScrollWidth + 50);
				} else {
					$scope.showHorizontalScroll = false;
				}
			}, 50);
		}

		function onDeleteBloq() {
			startScrollsDimension(250);
			var twitterConfigBloqs = _.filter(bloqs.bloqs, function (item) {
				return item.bloqData.name === 'phoneConfigTwitter';
			});
			if (twitterConfigBloqs.length === 2) {
				$scope.hideTwitterWheel();
			}
		}

		function onDragEnd(object) {
			if (object.detail.bloq.bloqData.name === 'phoneConfigTwitter') {
				$scope.toolbox.level = 1;
				$timeout(function () {
					$scope.twitterSettings = true;
					startTwitterWatchers();
				}, 500);
			}
			startScrollsDimension(1000);
			var mouseItem = {
				top: object.detail.mouseEvent.y - 5,
				left: object.detail.mouseEvent.x - 5,
				width: 10,
				height: 10
			};
			if ($scope.$trashcan.length === 0) {
				$scope.$trashcan = $('#trashcan').last();
			}
			var trashcanItem = {
				top: $scope.$trashcan.offset().top,
				left: $scope.$trashcan.offset().left,
				width: $scope.$trashcan[0].clientWidth,
				height: $scope.$trashcan[0].clientHeight
			};
			var bloqToDelete = utils.itsOver(mouseItem, trashcanItem);
			$scope.showTrashcan = false;
			if (bloqToDelete) {
				bloqs.removeBloq(object.detail.bloq.uuid, false, true);
			}
			utils.apply($scope);
		}

		function onMoveBloq() {
			//console.log(bloq);
			$scope.showTrashcan = true;
			// $scope.selectedBloqsToolbox = '';
			utils.apply($scope);
		}

		function startTwitterWatchers() {
			consumerKeyWatcher = $scope.$watch('common.user.twitterApp.consumerKey', function (newValue, oldValue) {
				if (oldValue !== newValue) {
					currentProjectService.saveTwitterApp();
				}
			});

			consumerSecretWatcher = $scope.$watch('common.user.twitterApp.consumerSecret', function (newValue, oldValue) {
				if (oldValue !== newValue) {
					currentProjectService.saveTwitterApp();
				}
			});

			tokenWatcher = $scope.$watch('common.user.twitterApp.accessToken', function (newValue, oldValue) {
				if (oldValue !== newValue) {
					currentProjectService.saveTwitterApp();
				}
			});

			tokenSecretWatcher = $scope.$watch('common.user.twitterApp.accessTokenSecret', function (newValue, oldValue) {
				if (oldValue !== newValue) {
					currentProjectService.saveTwitterApp();
				}
			});
		}

		function deleteTwitterWatchers() {
			if (consumerKeyWatcher) {
				consumerKeyWatcher();
			}
			if (consumerSecretWatcher) {
				consumerSecretWatcher();
			}
			if (tokenWatcher) {
				tokenWatcher();
			}
			if (tokenSecretWatcher) {
				tokenSecretWatcher();
			}
		}

		function startScrollsDimension(timeout) {
			if (!resizeWatcher) {
				resizeWatcher = $timeout(function () {
					setScrollsDimension();
					resizeWatcher = null;
				}, timeout);
			}
		}

		/***********************************
		 ***********************************
		 *  Indeterminate checkbox functions
		 ***********************************
		 ***********************************/

		$scope.generalToolboxOptions = {
			// zowi: {
			//     id: 'allZowiBloqs',
			//     basicTab: 'zowi',
			//     advancedTab: 'advancedZowi',
			//     counter: 0,
			//     model: null,
			//     showCondition: function () {
			//         return $scope.currentProject.hardware && $scope.currentProject.hardware.robot === 'zowi';
			//     },
			//     icon: '#robot',
			//     literal: 'make-swtoolbox-zowi',
			//     dataElement: 'toolbox-zowi',
			//     properties: {
			//         basicBloqs: 'zowi',
			//         advancedBloqs: 'advancedZowi'
			//     }
			// },
			// evolution: {
			//     id: 'allEvolutionBloqs',
			//     basicTab: 'evolution',
			//     advancedTab: 'advancedEvolution',
			//     counter: 0,
			//     model: null,
			//     showCondition: function () {
			//         return $scope.currentProject.hardware && $scope.currentProject.hardware.robot === 'evolution';
			//     },
			//     icon: '#robot',
			//     literal: 'make-swtoolbox-evolution',
			//     dataElement: 'toolbox-evolution',
			//     properties: {
			//         basicBloqs: 'evolution',
			//         advancedBloqs: 'advancedEvolution'
			//     }
			// },
			// mbotV2: {
			//     id: 'allMBotBloqs',
			//     basicTab: 'mbotV2',
			//     advancedTab: 'advancedMbotV2',
			//     counter: 0,
			//     model: null,
			//     showCondition: function () {
			//         return $scope.currentProject.hardware && ($scope.currentProject.hardware.robot === 'mbot' || $scope.currentProject.hardware.showRobotImage === 'mbot');
			//     },
			//     icon: '#robot',
			//     literal: 'make-swtoolbox-mbot',
			//     dataElement: 'toolbox-mbot',
			//     showBasicBloqsCondition: function (name) {
			//         return $scope.showMBotComponents(name);
			//     },
			//     backgroundImage: true,
			//     properties: {
			//         basicBloqs: 'mbotV2',
			//         advancedBloqs: 'advancedMbotV2'
			//     }
			// },
			// zumjunior: {
			//     id: 'allZumjuniorBloqs',
			//     basicTab: 'zumjunior',
			//     advancedTab: 'zumjuniorAdvanced',
			//     counter: 0,
			//     model: null,
			//     showCondition: function () {
			//         return $scope.currentProject.hardware && ($scope.currentProject.hardware.board === 'zumjunior');
			//     },
			//     showBasicBloqsCondition: function(name) {
			//         return $scope.showZumjuniorComponents(name);
			//     },
			//     icon: '#robot',
			//     literal: 'make-swtoolbox-zumjunior',
			//     dataElement: 'toolbox-zumjunior',
			//     properties: {
			//         basicBloqs: 'zumjunior',
			//         advancedBloqs: 'zumjuniorAdvanced'
			//     }
			// },
			// rangerlandraider: {
			//     id: 'allRangerLandRaiderBloqs',
			//     basicTab: 'rangerlandraider',
			//     advancedTab: 'advancedRangerLandRaider',
			//     counter: 0,
			//     model: null,
			//     showCondition: function () {
			//         return $scope.currentProject.hardware && ($scope.currentProject.hardware.robot === 'rangerlandraider' || $scope.currentProject.hardware.showRobotImage === 'rangerlandraider');
			//     },
			//     icon: '#robot',
			//     literal: 'make-swtoolbox-rangerlandraider',
			//     dataElement: 'toolbox-rangerlandraider',
			//     showBasicBloqsCondition: function (name) {
			//         return $scope.showMBotComponents(name);
			//     },
			//     backgroundImage: true,
			//     properties: {
			//         basicBloqs: 'rangerlandraider',
			//         advancedBloqs: 'advancedRangerlandraider'
			//     }
			// },
			// rangerraptor: {
			//     id: 'allRangerRaptorBloqs',
			//     basicTab: 'rangerraptor',
			//     advancedTab: 'advancedRangerRaptor',
			//     counter: 0,
			//     model: null,
			//     showCondition: function () {
			//         return $scope.currentProject.hardware && ($scope.currentProject.hardware.robot === 'rangerraptor' || $scope.currentProject.hardware.showRobotImage === 'rangerraptor');
			//     },
			//     icon: '#robot',
			//     literal: 'make-swtoolbox-rangerraptor',
			//     dataElement: 'toolbox-rangerraptor',
			//     showBasicBloqsCondition: function (name) {
			//         return $scope.showMBotComponents(name);
			//     },
			//     backgroundImage: true,
			//     properties: {
			//         basicBloqs: 'rangerraptor',
			//         advancedBloqs: 'advancedRangerraptor'
			//     }
			// },
			// rangernervousbird: {
			//     id: 'allRangerNervousBirdBloqs',
			//     basicTab: 'rangernervousbird',
			//     advancedTab: 'advancedRangerNervousBird',
			//     counter: 0,
			//     model: null,
			//     showCondition: function () {
			//         return $scope.currentProject.hardware && ($scope.currentProject.hardware.robot === 'rangernervousbird' || $scope.currentProject.hardware.showRobotImage === 'rangernervousbird');
			//     },
			//     icon: '#robot',
			//     literal: 'make-swtoolbox-rangernervousbird',
			//     dataElement: 'toolbox-rangernervousbird',
			//     showBasicBloqsCondition: function (name) {
			//         return $scope.showMBotComponents(name);
			//     },
			//     backgroundImage: true,
			//     properties: {
			//         basicBloqs: 'rangernervousbird',
			//         advancedBloqs: 'advancedRangernervousbird'
			//     }
			// },
			// startertank: {
			//     id: 'allStarterTankBloqs',
			//     basicTab: 'startertank',
			//     advancedTab: 'advancedStarterTank',
			//     counter: 0,
			//     model: null,
			//     showCondition: function () {
			//         return $scope.currentProject.hardware && ($scope.currentProject.hardware.robot === 'startertank' || $scope.currentProject.hardware.showRobotImage === 'startertank');
			//     },
			//     icon: '#robot',
			//     literal: 'make-swtoolbox-startertank',
			//     dataElement: 'toolbox-startertank',
			//     showBasicBloqsCondition: function (name) {
			//         return $scope.showMBotComponents(name);
			//     },
			//     backgroundImage: true,
			//     properties: {
			//         basicBloqs: 'startertank',
			//         advancedBloqs: 'advancedStartertank'
			//     }
			// },
			// starterthreewheels: {
			//     id: 'allStarterThreeWheelsBloqs',
			//     basicTab: 'starterthreewheels',
			//     advancedTab: 'advancedstarterthreewheels',
			//     counter: 0,
			//     model: null,
			//     showCondition: function () {
			//         return $scope.currentProject.hardware && ($scope.currentProject.hardware.robot === 'starterthreewheels' || $scope.currentProject.hardware.showRobotImage === 'starterthreewheels');
			//     },
			//     icon: '#robot',
			//     literal: 'make-swtoolbox-starterthreewheels',
			//     dataElement: 'toolbox-starterthreewheels',
			//     showBasicBloqsCondition: function (name) {
			//         return $scope.showMBotComponents(name);
			//     },
			//     backgroundImage: true,
			//     properties: {
			//         basicBloqs: 'starterthreewheels',
			//         advancedBloqs: 'advancedStarterthreewheels'
			//     }
			// },
			// freakscar: {
			//     id: 'allFreakscarBloqs',
			//     basicTab: 'freakscar',
			//     advancedTab: 'advancedFreakscar',
			//     counter: 0,
			//     model: null,
			//     showCondition: function () {
			//         return $scope.currentProject.hardware && $scope.currentProject.hardware.board === 'freakscar';
			//     },
			//     icon: '#robot',
			//     literal: 'make-swtoolbox-freakscar',
			//     dataElement: 'toolbox-freakscar',
			//     properties: {
			//         basicBloqs: 'freakscar',
			//         advancedBloqs: 'advancedFreakscar'
			//     }
			// },
			// phone: {
			//     id: 'allPhoneBloqs',
			//     basicTab: 'phone',
			//     counter: 0,
			//     model: null,
			//     showCondition: function () {
			//         return $scope.currentProject.useBitbloqConnect;
			//     },
			//     icon: '#mobile',
			//     'literal': 'make-swtoolbox-bitbloqConnect',
			//     dataElement: 'toolbox-phone',
			//     properties: {
			//         basicBloqs: 'phone',
			//         advancedBloqs: 'advancedPhone'
			//     }
			// },
			// components: {
			//     id: 'allComponentsBloqs',
			//     basicTab: 'components',
			//     advancedTab: 'advancedComponents',
			//     counter: 0,
			//     model: null,
			//     icon: '#component',
			//     literal: 'components',
			//     dataElement: 'toolbox-components',
			//     showBasicBloqsCondition: function (name) {
			//         return $scope.showComponents(name);
			//     },
			//     showCondition: function () {
			//         if ($scope.currentProject.selectedBloqs && ($scope.common.userRole === 'student')) {
			//             return (($scope.currentProject.selectedBloqs.components.length > 0) || ($scope.currentProject.selectedBloqs.advancedComponents.length > 0));
			//         } else {
			//             return true;
			//         }
			//     },
			//     properties: {
			//         basicBloqs: 'components',
			//         advancedBloqs: 'advancedComponents'
			//     }
			// },
			functions: {
				id: 'allFunctionsBloqs',
				basicTab: 'functions',
				advancedTab: 'advancedFunctions',
				counter: 0,
				model: null,
				literal: 'make-swtoolbox-functions',
				dataElement: 'toolbox-functions',
				showCondition: function () {
					if ($scope.currentProject.selectedBloqs && ($scope.common.userRole === 'student')) {
						return ($scope.softTab !== 'experiment' && (($scope.currentProject.selectedBloqs.functions.length > 0) || ($scope.currentProject.selectedBloqs.advancedFunctions.length > 0)));
					} else {
						return $scope.softTab !== 'experiment';
					}
				},
				properties: {
					basicBloqs: 'functions',
					advancedBloqs: 'advancedFunctions'
				}
			},
			variables: {
				id: 'allVariablesBloqs',
				basicTab: 'variables',
				advancedTab: 'advancedVariables',
				counter: 0,
				model: null,
				literal: 'make-swtoolbox-variables',
				properties: {
					basicBloqs: 'variables',
					advancedBloqs: 'advancedVariables'
				},
				showCondition: function () {
					if ($scope.currentProject.selectedBloqs && ($scope.common.userRole === 'student')) {
						return ($scope.softTab !== 'experiment' && (($scope.currentProject.selectedBloqs.variables.length > 0) || ($scope.currentProject.selectedBloqs.advancedVariables.length > 0)));
					} else {
						return $scope.softTab !== 'experiment';
					}
				}
			},
			codes: {
				id: 'allCodeBloqs',
				basicTab: 'codes',
				counter: 0,
				model: null,
				literal: 'make-swtoolbox-code',
				properties: {
					basicBloqs: 'codes'
				},
				showCondition: function () {
					if ($scope.currentProject.selectedBloqs && ($scope.common.userRole === 'student')) {
						return ($scope.softTab !== 'experiment' && ($scope.currentProject.selectedBloqs.codes.length > 0));
					} else {
						return $scope.softTab !== 'experiment';
					}
				}
			},
			mathematics: {
				id: 'allMathematicsBloqs',
				basicTab: 'mathematics',
				advancedTab: 'advancedMathematics',
				counter: 0,
				model: null,
				literal: 'make-swtoolbox-mathematics',
				properties: {
					basicBloqs: 'mathematics',
					advancedBloqs: 'advancedMathematics'
				},
				showCondition: function () {
					if ($scope.currentProject.selectedBloqs && ($scope.common.userRole === 'student')) {
						return ($scope.softTab !== 'experiment' && (($scope.currentProject.selectedBloqs.mathematics.length > 0) || ($scope.currentProject.selectedBloqs.advancedMathematics.length > 0)));
					} else {
						return $scope.softTab !== 'experiment';
					}
				}
			},
			texts: {
				id: 'allTextBloqs',
				basicTab: 'texts',
				advancedTab: 'advancedTexts',
				counter: 0,
				model: null,
				literal: 'make-swtoolbox-text',
				properties: {
					basicBloqs: 'texts',
					advancedBloqs: 'advancedTexts'
				},
				showCondition: function () {
					if ($scope.currentProject.selectedBloqs && ($scope.common.userRole === 'student')) {
						return ($scope.softTab !== 'experiment' && (($scope.currentProject.selectedBloqs.texts.length > 0) || ($scope.currentProject.selectedBloqs.advancedTexts.length > 0)));
					} else {
						return $scope.softTab !== 'experiment';
					}
				}
			},
			controls: {
				id: 'allControlBloqs',
				basicTab: 'controls',
				advancedTab: 'advancedControls',
				counter: 0,
				model: null,
				literal: 'make-swtoolbox-control',
				properties: {
					basicBloqs: 'controls',
					advancedBloqs: 'advancedControls'
				},
				showCondition: function () {
					if ($scope.currentProject.selectedBloqs && ($scope.common.userRole === 'student')) {
						return ($scope.softTab !== 'experiment' && (($scope.currentProject.selectedBloqs.controls.length > 0) || ($scope.currentProject.selectedBloqs.advancedControls.length > 0)));
					} else {
						return $scope.softTab !== 'experiment';
					}
				}
			},
			logics: {
				id: 'allLogicBloqs',
				basicTab: 'logics',
				counter: 0,
				model: null,
				literal: 'make-swtoolbox-logic',
				properties: {
					basicBloqs: 'logics'
				},
				showCondition: function () {
					if ($scope.currentProject.selectedBloqs && ($scope.common.userRole === 'student')) {
						return ($scope.softTab !== 'experiment' && ($scope.currentProject.selectedBloqs.logics.length > 0));
					} else {
						return $scope.softTab !== 'experiment';
					}
				}
			},
			classes: {
				id: 'allClassesBloqs',
				basicTab: 'classes',
				advancedTab: 'advancedClasses',
				counter: 0,
				model: null,
				literal: 'make-swtoolbox-classes',
				properties: {
					basicBloqs: 'classes',
					advancedBloqs: 'advancedClasses'
				},
				showCondition: function () {
					if ($scope.currentProject.selectedBloqs && ($scope.common.userRole === 'student')) {
						return ($scope.softTab !== 'experiment' && (($scope.currentProject.selectedBloqs.classes.length > 0) || ($scope.currentProject.selectedBloqs.advancedClasses.length > 0)));
					} else {
						return $scope.softTab !== 'experiment';
					}
				}
			},
			standardBioblocks: {
				id: 'standardBioblocks',
				basicTab: 'standardBioblocks',
				advancedTab: 'advanceStandardBioblocks',
				counter: 0,
				model: null,
				literal: 'make-swtoolbox-standard',
				properties: {
					basicBloqs: 'standardBioblocks',
					advancedBloqs: 'advanceStandardBioblocks'
				},
				showCondition: function() {
					if ($scope.currentProject.selectedBloqs && ($scope.common.userRole === 'student')) {
						return (($scope.currentProject.selectedBloqs.standardBioblocks.length > 0) || ($scope.currentProject.selectedBloqs.advanceStandardBioblocks.length > 0));
					} else {
						return true;
					}
				}
			},
			customBioblocks: {
				id: 'customBioblocks',
				basicTab: 'customBioblocks',
				advancedTab: 'advanceCustomBioblocks',
				counter: 0,
				model: null,
				literal: 'make-swtoolbox-custom',
				properties: {
					basicBloqs: 'customBioblocks',
					advancedBloqs: 'advanceCustomBioblocks'
				},
				showCondition: function() {
					if ($scope.currentProject.selectedBloqs && ($scope.common.userRole === 'student')) {
						return (($scope.currentProject.selectedBloqs.customBioblocks.length > 0) || ($scope.currentProject.selectedBloqs.advanceCustomBioblocks.length > 0));
					} else {
						return true;
					}
				}
			},
		};

		$scope.addChecks = function (type, value, bloqName) {
			$scope.currentProject.selectedBloqs[type] = $scope.currentProject.selectedBloqs[type] || [];
			switch (bloqName) {
				case 'all':
					_.forEach($scope.common.properties.bloqsSortTree[type], function (item) {
						if ($scope.currentProject.selectedBloqs[type].indexOf(item.name) === -1) {
							$scope.currentProject.selectedBloqs[type].push(item.name);
						}
					});
					break;
				case 'any':
					$scope.currentProject.selectedBloqs[type].splice(0, $scope.currentProject.selectedBloqs[type].length);
					break;
				default:
					var indexBloq = $scope.currentProject.selectedBloqs[type].indexOf(bloqName);
					if (value) {
						if (indexBloq === -1) {
							$scope.currentProject.selectedBloqs[type].push(bloqName);
						}
					} else {
						if (indexBloq > -1) {
							$scope.currentProject.selectedBloqs[type].splice(indexBloq, 1);
						}
					}
			}
			var isAdvance = type.indexOf('advance') > -1;
			if ($scope.currentProject.selectedBloqs[type].length === $scope.common.properties.bloqsSortTree[type].length) {
				if (isAdvance) {
					$scope.checkAdvanceTab = 'full';
				} else {
					$scope.checkBasicTab = 'full';
				}
				if ($scope.checkAdvanceTab === 'full' && $scope.checkBasicTab === 'full') {
					$scope.checkFunction = 'full';
				}
			} else {
				if (isAdvance) {
					$scope.checkAdvanceTab = $scope.currentProject.selectedBloqs[type].length;
					$scope.checkFunction = $scope.checkAdvanceTab + $scope.checkBasicTab;
				} else {
					$scope.checkBasicTab = $scope.currentProject.selectedBloqs[type].length;
					$scope.checkFunction = $scope.checkBasicTab;
				}
			}
			currentProjectService.startAutosave();
			utils.apply($scope);
		};

		$scope.statusGeneralCheck = function (type, counter, force) {
			if ($scope.currentProject.selectedBloqs) {
				var newcheckBasicTab = $scope.currentProject.selectedBloqs[type] ? $scope.currentProject.selectedBloqs[type].length : 0,
					advancedType = 'advanced' + type.charAt(0).toUpperCase() + type.slice(1),
					newcheckAdvanceTab = $scope.currentProject.selectedBloqs[advancedType] ? $scope.currentProject.selectedBloqs[advancedType].length : 0;
				if (counter || counter === 0 || force) {
					if (newcheckBasicTab !== 0 && $scope.currentProject.selectedBloqs[type].length === $scope.common.properties.bloqsSortTree[type].length) {
						//basic tab is full
						if (!$scope.currentProject.selectedBloqs[advancedType] || (newcheckAdvanceTab !== 0 && $scope.currentProject.selectedBloqs[advancedType].length === $scope.common.properties.bloqsSortTree[advancedType].length)) {
							//advanced tab is full
							counter = counter === 'full' ? 'complete' : 'full';
						} else {
							counter = newcheckBasicTab + (typeof newcheckAdvanceTab === 'number' ? newcheckAdvanceTab : 0);
						}
					} else {
						counter = newcheckBasicTab + (typeof newcheckAdvanceTab === 'number' ? newcheckAdvanceTab : 0);
					}
				} else {
					if (newcheckBasicTab !== 0 && $scope.currentProject.selectedBloqs[type].length === $scope.common.properties.bloqsSortTree[type].length) {
						$scope.checkBasicTab = $scope.checkBasicTab === 'full' ? 'complete' : 'full';

					} else {
						$scope.checkBasicTab = newcheckBasicTab;
					}
					if (newcheckAdvanceTab !== 0 && $scope.currentProject.selectedBloqs[advancedType].length === $scope.common.properties.bloqsSortTree[advancedType].length) {
						$scope.checkAdvanceTab = $scope.checkAdvanceTab === 'full' ? 'complete' : 'full';
					} else {
						$scope.checkAdvanceTab = newcheckAdvanceTab;
					}
				}
			}
			return counter;
		};

		$scope.common.itsPropertyLoaded().then(function () {
			$scope.itsCurrentProjectLoaded().then(function () {
				_.keys($scope.currentProject.selectedBloqs).forEach(function (type) {
					if (type.indexOf('advanced') === -1) {
						if ($scope.generalToolboxOptions[type]) {
							$scope.generalToolboxOptions[type].counter = $scope.statusGeneralCheck(type, null, 'force');
						}
					}
				});
				utils.apply($scope);
			});
		});

		$scope.showAdvancedTab = function (selectedBloqsToolbox) {

			if ($scope.common.properties && $scope.common.properties.bloqsSortTree && $scope.generalToolboxOptions[selectedBloqsToolbox] &&
				($scope.common.properties.bloqsSortTree[$scope.generalToolboxOptions[selectedBloqsToolbox].properties.advancedBloqs])) {
				if ($scope.currentProject.selectedBloqs && ($scope.common.userRole === 'student')) {
					return ($scope.currentProject.selectedBloqs[$scope.generalToolboxOptions[selectedBloqsToolbox].properties.advancedBloqs].length > 0);
				} else {
					return true;
				}
			} else {
				return false;
			}
		};

		/***********************************
		 end indeterminate checkbox
		 ***********************************/

		loadBloqs();
		$document.on('contextmenu', contextMenuDocumentHandler);
		$document.on('click', clickDocumentHandler);

		$window.onresize = function () {
			startScrollsDimension(200);
		};

		bloqsTabsEvent = $rootScope.$on('currenttab:bloqstab', function () {
			startScrollsDimension(0);
		});

		$scope.$field.on('scroll', scrollField);
		scrollBarContainer.on('scroll', _.throttle(scrollField, 250));
		$window.addEventListener('bloqs:bloqremoved', onDeleteBloq);
		$window.addEventListener('bloqs:dragend', onDragEnd);
		$window.addEventListener('bloqs:startMove', onMoveBloq);

		$scope.$on('$destroy', function () {
			$document.off('contextmenu', contextMenuDocumentHandler);
			$document.off('click', clickDocumentHandler);
			$window.removeEventListener('bloqs:bloqremoved', onDeleteBloq);
			$window.removeEventListener('bloqs:dragend', onDragEnd);
			$window.removeEventListener('bloqs:startMove', onMoveBloq);
			bloqsTabsEvent();
			if (translateChangeStartEvent) {
				translateChangeStartEvent();
			}
		});
	});

	function arduinoTranslation (json){
    
        var experiment = JSON.parse(json);
    	var code_definition="";
		var code_setup="void setup(){\n";
		var code_loop="void loop(){\n";
		var code_auxFunctions="";
	    
	    if(!("instructions" in experiment)) {
	    	return;
	    }

		for (var i in experiment.instructions){
			console.log(experiment.instructions[i]);
			console.log(experiment.instructions[i].op);
			if(experiment.instructions[i].op==="spin"){
				code_definition = code_definition + "#include<Servo.h>//Library to control the ESC\n\nServo ESC; //Create an object of the class servo\n\nint sens = 75; // this value indicates the limit reading between dark and light,\n// it has to be tested as it may change acording on the\n// distance the thacometer is placed\nint nPalas = 1; // the number of blades of the propeller\nint ts = 500; // the time it takes each reading. Sampling time.\nint rpmRef = 0;// Reference for speed in RPM\nint rpmRead;\n\nfloat Kp = 10.0;\nfloat Ki = 0.2;\nfloat E = 0.0;\n";
				code_setup = code_setup + "  ESC.attach(9);//Attach the ESC to digital pin 9\n\n  //Activate the ESC\n  ESC.writeMicroseconds(1000); //1000 = 1ms\n  //Change the 1000 before to 2000 if\n  //your ESC activates with a pulse of 2ms\n\n  delay(5000); //Wait 5 seconds to start the ESC\n\n  Serial.begin(9600);//Start serial comunication\n  Serial.println(\"Ready\");\n}\n\n";
				code_loop = code_loop + "\n  rpmRead = readRPM();\n\n  if (Serial.available() >= 1)\n  {\n    rpmRef = Serial.parseInt(); //Leer un entero por serial\n  }\n  controlPI();\n  Serial.print(\"RPM read: \");\n  Serial.print(rpmRead);\n  Serial.print(\"RPM ref: \");\n  Serial.println(rpmRef);\n}\n";
				code_auxFunctions = code_auxFunctions + "\nvoid controlPI() {\n  int u = 0;\n  int e = rpmRef - rpmRead;\n\n  E += Ki * e;\n  u = Kp * e + 1000 + Ki * e;\n\n  if (u > 2000) {\n    u = 2000;\n    E -= Ki * e;\n  }\n  if (u < 1000) {\n    u = 1000;\n    E -= Ki * e;\n  }\n\n  ESC.writeMicroseconds(u); //Send control action\n}\n\nint readRPM() {\n  int counter = 0;\n  long start = millis();\n  int val;\n  int stat = LOW;\n  int stat2;\n  int rpm;\n\n  while (( millis() - start ) < ts) {\n    val = analogRead(0);\n    if (val < sens) {\n      stat = LOW;\n    }\n    else {\n      stat = HIGH;\n    }\n    if (stat2 != stat) { //counts when the state change, thats from (dark to light) or\n      //from (light to dark), remmember that IR light is invisible for us.\n      counter++;\n      stat2 = stat;\n    }\n  }\n\n  rpm = ((int)counter / nPalas) / 2.0 * 60000.0 / (ts);\n\n  return rpm;\n}";
			}
			
			else if (experiment.instructions[i].op==="gel_separate"){
				var duration = experiment.instructions[i].duration;
				code_definition = code_definition + "\nint pinPowerSource = 3;\nint minutes = "+duration+"; // time in minutes will last the electrophoresis\nboolean stateON = false; //This var will change to true when the electrophoresis start\nunsigned long start;\nunsigned long electrophoresis__MS; // Duration of the electrophoresis in miliseconds\n";
				code_setup = code_setup + "\n  pinMode(pinPowerSource, OUTPUT);\n  digitalWrite(pinPowerSource, LOW);\n  Serial.begin(9600);\n  electrophoresis__MS = minutes * 60 * 1000;\n  Serial.println(\"Introduce 1 to start electrophoresis.\");\n}\n";
				code_loop = code_loop + "  if ( (Serial.available() >= 1) && (stateON == false) )\n  {\n    if (Serial.parseInt() == 1)\n    {\n      stateON = true;\n      start = millis();\n      digitalWrite(pinPowerSource, HIGH);\n      Serial.print(\"Electrophoresis is started it will last \");\n      Serial.print(minutes);\n      Serial.println(\" minutes.\")\n    }\n  }\n  if (stateON == true) {\n    if ( (millis() - start) > electrophoresis__MS) {\n      stateON = false;\n      digitalWrite(pinPowerSource, LOW);\n      Serial.println(\"Electrophoresis is finished.\");\n      Serial.println(\"Introduce 1 to start electrophoresis.\");\n    }\n    if ( ((millis() - start) % (60 * 10000))==0 ) {\n      Serial.print( (int) minutes - (millis() - start)/(60*1000) );\n      Serial.println(\" minutes remaining\");\n    }\n  }\n}\n";
				//Electrophoresis has no aux functions
			}
			else code_definition = "// There is at least one undefined operation in your experiment.\n // Current operations available to be shown in arduino code: Centrifuge and Electrophoresis"
				
	    }
	    
		var final_code = code_definition + "\n" + code_setup + "\n" + code_loop + "\n" + code_auxFunctions;
		return final_code;
	    
	}

	function regularJSONTranslation_(block) {
		var currentExecutingBlock=block
		console.log(currentExecutingBlock);
		var JSONcode = "";
		var blockSource;

		//Loop to get the real number of container blocks connected to the centrifugation, because is the centrifugation that extract the info of each container block.
		var numberOfBlocks = 1;
		if(currentExecutingBlock.getInputTargetBlock('source') ){ //Get the block in the SOURCE input if exists
			blockSource = currentExecutingBlock.getInputTargetBlock('source') 
			var isList = blockSource.getInput('contListOption');//Check if it is a list
			/*FOR LIST CASE*/
			if(isList){
				var substring='contListOptionValueNum';  //Substring to complete with the number of the position of each block.
				var j = 0;
				for(var i = 0; i < blockSource.getFieldValue('contListOptionValue'); i++){
					j++;
					var string = substring+j;  //Creating the complete srting of the input where there is a container block.
					var currentBlock = blockSource.getInputTargetBlock(string)
					if(currentBlock!=null){
						JSONcode = JSONcode + '                "object":  "' + blockSource.getFieldValue("containerName") +'",\n'; 
					}	
				}
				JSONcode = currentExecutingBlock.optionsDisplay_(JSONcode, currentBlock);  //Call the function optionsDisplay_ which it exists in each function block, with their own parameters.
				
			/*CASE NOT LIST*/
			}else if ( numberOfBlocks == 1 && blockSource!=null){//If it exists child and it's just one.
				JSONcode = JSONcode + '                "object":  "' + blockSource.getFieldValue("containerName") +'",\n'; 
				JSONcode = currentExecutingBlock.optionsDisplay_(JSONcode,blockSource);  //Call the function optionsDisplay_ which it exists in each function block, with their own parameters.

			}
		}

		return JSONcode;	
	};

	function initBioblocksComponents() {

		Blockly.JavaScript['centrifugation'] = function(block) {
			var JSONcode = "";
			JSONcode = JSONcode + '             {\n                "op": "spin",\n'; 
			JSONcode = JSONcode + regularJSONTranslation_(this);
			return JSONcode;
		}

		Blockly.JavaScript['electrophoresis'] = function(block) {
			var JSONcode = "";
			JSONcode = JSONcode + '             {\n                "op": "gel_separate",\n';   
			JSONcode = JSONcode + regularJSONTranslation_(this);
			return JSONcode;
		}

		Blockly.JavaScript['flashFreeze'] = function(block) {
			var JSONcode = "";
			JSONcode = JSONcode + '             {\n                "op": "flash_freeze",\n';     
			JSONcode = JSONcode + regularJSONTranslation_(this);
			return JSONcode;
		}

		Blockly.JavaScript['flowCitometry'] = function(block) {
			var JSONcode = "";
			JSONcode = JSONcode + '             {\n                "op": "flow_analyze",\n';     
			JSONcode = JSONcode + regularJSONTranslation_(this);
			return JSONcode;
		}

		Blockly.JavaScript['incubate'] = function(block) {
			var JSONcode = "";	
			JSONcode = JSONcode + '             {\n                "op": "incubate",\n';     
			JSONcode = JSONcode + regularJSONTranslation_(this);
			return JSONcode;
		}

		Blockly.JavaScript['mix'] = function(block) {
			var JSONcode = "";
			JSONcode = JSONcode + '             {\n                "op": "mix",\n';    
			JSONcode = JSONcode + regularJSONTranslation_(this);
			return JSONcode;
		}
			
		Blockly.JavaScript['oligosynthesize'] = function(block) {
			var JSONcode = "";
			JSONcode = JSONcode + '             {\n                "op": "oligosynthesize",\n';     
			JSONcode = JSONcode + regularJSONTranslation_(this);
			return JSONcode;
		}
			
		Blockly.JavaScript['sangerSequencing'] = function(block) {
			var JSONcode = "";
			JSONcode = JSONcode + '             {\n                "op": "sanger_sequence",\n';
			JSONcode = JSONcode + regularJSONTranslation_(this);
			return JSONcode;
		}		

		Blockly.JavaScript['thermocycling'] = function(block) {
			var JSONcode = "";
			JSONcode = JSONcode + '             {\n                "op": "thermocycle",\n';
			JSONcode = JSONcode + regularJSONTranslation_(this);
			return JSONcode;
		}	

		Blockly.JavaScript['measurement'] = function(block) {
			var JSONcode = "";
			
			var type_measure = block.getFieldValue('parameters');
			switch (type_measure){//This function is to get the real name of the different kinds of measuring.
				case '1':
					type_measure="absorbance";
				break;
				case '2':
					type_measure="fluorescence";
				break;
				case '3':
					type_measure="luminiscence";
				break;
				case '4':
					type_measure="volume";
				break;
				case '5':
					type_measure="temperature";
				break;
				default:
				alert("Some error appeared translating language");
			}
			//Creating general code of PIPETTE function and its type
			JSONcode = JSONcode + '             {\n                "op": "' +type_measure +'",\n' ;
			JSONcode = JSONcode + regularJSONTranslation_(this);
			return JSONcode;
		}
		/*This function is called by de runJS function which really calls the Blockly.JavaScript.workspaceToCode() function.*/
		Blockly.JavaScript['cellSpreading'] = function(block) {
			var JSONcode = "";
			var blockSource;
			
			JSONcode =JSONcode+ '             {\n                "op": "spread",\n';     //initialize the code for incubate function
			
			//Loop to get the real number of container blocks connected to the centrifugation, because is the centrifugation that extract the info of each container block.
			var numberOfBlocks = 1;
			if(this.getInputTargetBlock('source') ){ //Get the block in the SOURCE input if exists
				blockSource = this.getInputTargetBlock('source');
				blockDestination = this.getInputTargetBlock('destination');
				var isList = blockSource.getInput('contListOption');//Check if it is a list
				if ( numberOfBlocks == 1 && blockSource!=null){  //If it exists child and it's just one.
					JSONcode = JSONcode + '                "from":  "' + blockSource.getFieldValue("containerName")+'", \n'; 
					if(this.getInputTargetBlock('destination')!=null){
						JSONcode = JSONcode + '                "to":  "' + blockDestination.getFieldValue("containerName") +'", \n';
					JSONcode = this.optionsDisplay_(JSONcode,blockDestination); //Call the function optionsDisplay_ which it exists in each function block, with their own parameters.
					}
				}
			}	
			return JSONcode;
		};
		/*This function is called by de runJS function which really calls the Blockly.JavaScript.workspaceToCode() function.*/
		Blockly.JavaScript['colonyPicking'] = function(block) {
			var JSONcode = "";
			var blockSource;
			
			JSONcode = JSONcode + '             {\n                "op": "autopick",\n';     //initialize the code for incubate function
			
			//Loop to get the real number of container blocks connected to the centrifugation, because is the centrifugation that extract the info of each container block.
			var numberOfBlocks = 1;
			if(this.getInputTargetBlock('source') ){ //Get the block in the SOURCE input if exists
				blockSource = this.getInputTargetBlock('source') ;
				blockDestination = this.getInputTargetBlock('destination');
				if ( numberOfBlocks == 1 && blockSource!=null){  //If it exists child and it's just one.
					JSONcode = JSONcode + '                "from":  "' + blockSource.getFieldValue("containerName")+'", \n'; 
					if(this.getInputTargetBlock('destination')){
						JSONcode = JSONcode + '                "to":  "' + blockDestination.getFieldValue("containerName")+'", \n';
					}	
					JSONcode = this.optionsDisplay_(JSONcode,blockSource); //Call the function optionsDisplay_ which it exists in each function block, with their own parameters.
				}
			}
			
			return JSONcode;
		};
		/*This function is called by de runJS function which really calls the Blockly.JavaScript.workspaceToCode() function.*/
		Blockly.JavaScript['pipette'] = function(block) {
			var JSONcode = "";
			var blockSource;
			
			var type_pipette = block.getFieldValue('pipetteTypeName');
			switch (type_pipette){//This function is to get the real name of the different kinds of pipetting.
				case '1':
					type_pipette="transfer";
				break;
				case '2':
					type_pipette="distribute";
				break;
				case '3':
					type_pipette="consolidate";
				break;
				case '4':
					type_pipette="continuous transfer";
				break;
				default:
				alert("Some error appeared translating language");
			}
			//Creating general code of PIPETTE function and its type
			JSONcode = JSONcode + '             {\n                "op": "pipette",\n                    "groups" : [{ "' +type_pipette +'" :{ \n                        "from": ';
			
			//SOURCE operations:****************************************************************************************************************************
			//Loop to get the real number of container blocks connected to the pipette, because is the pipette that extract the info of each container block.
			var numberOfBlocks = 1; 
			if(this.getInputTargetBlock('source') ){ //Get the block in the SOURCE input if exists
				blockSource = this.getInputTargetBlock('source') 
				var isList = blockSource.getInput('contListOption');//Check if it is a list
				if(isList){
						JSONcode = JSONcode + "[\n			"
					var substring='contListOptionValueNum'; //Substring to complete with the number of the position of each block.
				
					var j = 0;
					for(var i = 0; i < blockSource.getFieldValue('contListOptionValue'); i++){
						j++;
						var string = substring+j //Creating the complete srting of the input where there is a container block.
						var currentBlock = blockSource.getInputTargetBlock(string)
						if (currentBlock != null){
							JSONcode = JSONcode + "                           {";
							JSONcode = JSONcode + '"well": ' + ' " ' +currentBlock.getFieldValue("containerName")+'" \n'
							
							JSONcode = this.optionsDisplay_(JSONcode, currentBlock); //Call the function optionsDisplay_ which it exists in each function block, with their own parameters.
							JSONcode = JSONcode.substring(0,JSONcode.length-2); //Remove the last two characters to rewrite properly the end of the sentence
							JSONcode = JSONcode + '}\n';
						}
					}
					JSONcode = JSONcode.substring(0,JSONcode.length-2); //Remove the last two characters to rewrite properly the end of the sentence
					JSONcode = JSONcode + "\n                           ]\n			";
				}
			
			
				/*CASE only one block in source*/
				else if ( numberOfBlocks == 1 && blockSource!=null){//If it exists child and it's just one.
					if ( blockSource.getInput('volume') || blockSource.getInput('datareference') || blockSource.getInput('singlewelladdrinput') || blockSource.getInput('singleWell') || blockSource.getInput('multipleWellAddrInput') || blockSource.getInput('multiplewells') || blockSource.getInput('gelcomposition') || blockSource.getInput('valueagarose') || blockSource.getInput('optionsCTMode') || blockSource.getInput('optionsCTMode2') || blockSource.getInput('steps')  ){
						JSONcode = JSONcode + '{';
						JSONcode = JSONcode + '"well" : "' + blockSource.getFieldValue("containerName") +'" \n'; 
						JSONcode = this.optionsDisplay_(JSONcode,blockSource);  //Call the function optionsDisplay_ which it exists in each function block, with their own parameters.
						JSONcode = JSONcode.substring(0,JSONcode.length-2); //Remove the last two characters to rewrite properly the end of the sentence
						JSONcode = JSONcode + '}\n';
					}else{
						JSONcode = JSONcode + '"' + blockSource.getFieldValue("containerName") +'" \n';
					}
				}
			}
			
			//DESTINATION operations:****************************************************************************************************************************
			//Loop to get the real number of container blocks connected to the pipette, because is the pipette that extract the info of each container block.
			JSONcode = JSONcode+ '                        ,"to": ';
			var numberOfBlocks = 1; 
			if(this.getInputTargetBlock('destination') ){ //Get the block in the SOURCE input if exists
				blockDestination = this.getInputTargetBlock('destination') 
				var isList = blockDestination.getInput('contListOption');//Check if it is a list
				if(isList){
					JSONcode = JSONcode + "[\n			"
					var substring='contListOptionValueNum'; //Substring to complete with the number of the position of each block.
					var j = 0;
					for(var i = 0; i < blockDestination.getFieldValue('contListOptionValue'); i++){
						j++;
						var string = substring+j //Creating the complete srting of the input where there is a container block.
						var currentBlock = blockDestination.getInputTargetBlock(string)
						if (currentBlock != null){
							JSONcode = JSONcode + "                           {";
							JSONcode= JSONcode + '"well": ' + ' " ' +currentBlock.getFieldValue("containerName") +'" \n'
							
							JSONcode = this.optionsDisplay_(JSONcode, currentBlock); //Call the function optionsDisplay_ which it exists in each function block, with their own parameters.
							JSONcode = JSONcode.substring(0,JSONcode.length-2); //Remove the last two characters to rewrite properly the end of the sentence
							JSONcode = JSONcode + '},\n';
						}
					}
					JSONcode = JSONcode.substring(0,JSONcode.length-2); //Remove the last two characters to rewrite properly the end of the sentence
					JSONcode = JSONcode + "\n                ]\n			"	
				} 
				/*CASE only one block in destination*/
				else if ( numberOfBlocks == 1 && blockDestination!=null){//If it exists child and it's just one.
					if ( blockDestination.getInput('volume') || blockDestination.getInput('datareference') || blockDestination.getInput('singlewelladdrinput') || blockDestination.getInput('singleWell') || blockDestination.getInput('multipleWellAddrInput') || blockDestination.getInput('multiplewells') || blockDestination.getInput('gelcomposition') || blockDestination.getInput('valueagarose') || blockDestination.getInput('optionsCTMode') || blockDestination.getInput('optionsCTMode2') || blockDestination.getInput('steps')  ){
						//JSONcode = JSONcode + '{';
						JSONcode = JSONcode + '"' + blockDestination.getFieldValue("containerName")+'" \n'; 
						JSONcode = this.optionsDisplay_(JSONcode,blockDestination);   //Call the function optionsDisplay_ which it exists in each function block, with their own parameters.
						//JSONcode = JSONcode.substring(0,JSONcode.length-2); //Remove the last two characters to rewrite properly the end of the sentence
						//JSONcode = JSONcode + '},\n';
					}else{
						JSONcode = JSONcode + '"' + blockDestination.getFieldValue("containerName")+'" \n';
					}
				}
			}
			JSONcode = JSONcode.substring(0,JSONcode.length-2); //Remove the last two characters to rewrite properly the end of the sentence
					
			JSONcode = JSONcode + "            }}]\n			"
			
			return JSONcode;
		};

		Blockly.JavaScript['turbidostat'] = function(block) {
			var JSONcode = "";

			return JSONcode;
		};
		/*Although it is empty is necessary to create this functions to avoid errors*/
		Blockly.JavaScript['experiment'] = function(block) {
			var JSONcode = "";
			
			return JSONcode;
		};

		/*Although it is empty is necessary to create this functions to avoid errors*/
		Blockly.JavaScript['step'] = function(block) {
			var JSONcode = "";
			
			return JSONcode;
		};

		/*Although it is empty is necessary to create this functions to avoid errors*/
		Blockly.JavaScript['container'] = function(block) {
			var JSONcode = "";	
			
			return JSONcode;
		};

		/*Although it is empty is necessary to create this functions to avoid errors*/
		Blockly.JavaScript['containerList'] = function(block) {
			var JSONcode = "";	
			
			return JSONcode;
		};

		//CODE IMPORTED FROM THE

	}

