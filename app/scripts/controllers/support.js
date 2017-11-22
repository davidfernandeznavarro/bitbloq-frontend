'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:SupportCtrl
 * @description
 * # SupportCtrl
 * Controller of the bitbloqApp
 */
angular
    .module('bitbloqApp')
    .controller('SupportCtrl', function(
        $translate,
        $scope,
        $location,
        $routeParams,
        $http,
        $sce,
        $rootScope,
        $window,
        common,
        _,
        userApi,
        feedbackApi,
        alertsService,
        web2boardOnline,
        programHex,
        chromeAppApi,
        hardwareService,
        utils,
        ngDialog
    ) {
        $scope.translate = $translate;

        var db = [
            {
                _id: 'index',
                permalink: 'index',
                dontShowHomeButton: true,
                title: 'support-index-title',
                data: 'support-index-data',
                next: [
                    {
                        _id: 'online',
                        class: 'btn--secondary',
                        icon: 'icon--cloud icon--big',
                        response: 'support-index-next-online'
                    },
                    {
                        _id: 'offline',
                        class: 'btn--secondary',
                        icon: 'icon--desktop icon--big',
                        response: 'support-index-next-offline'
                    }
                ]
            },
            {
                _id: 'end',
                permalink: 'end',
                dontShowHomeButton: true,
                title:'support-end-title',
                data: 'support-end-data',
                next: [
                    {
                        _id: 'index',
                        class: 'btn--primary',
                        icon: 'icon--home icon--big',
                        response: 'support-common-next-index'
                    }
                ]
            },
            {
                _id: '404',
                permalink: '404',
                dontShowHomeButton: true,
                title: '',
                data: 'support-404-data',
                next: [
                    {
                        _id: 'index',
                        class: 'btn--primary',
                        icon: 'icon--home icon--big',
                        response: 'support-common-next-index'
                    }
                ]
            },
            {
                _id: 'form',
                permalink: 'form',
                title: 'support-form-title',
                extData: 'contactForm.html',
                next: []
            },
            {
                _id: 'online',
                title: 'support-common-options-title',
                next: [
                    {
                        _id: 'dontLoad',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-index-next-dontLoad'
                    },
                    {
                        _id: 'w2b',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-index-next-w2b'
                    },
                    {
                        _id: 'hardware',
                        class: 'btn--secondary',
                        icon: '',
                        response:
                            'support-common-next-hardComponent'
                    },
                    {
                        _id: 'noBoard',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-common-next-noBoard'
                    },
                    {
                        _id: 'error3020',
                        class: 'btn--secondary',
                        icon: '',
                        response:
                            'support-index-next-3020'
                    }
                ]
            },
            {
                _id: 'offline',
                title: 'support-offline-title',
                data: 'support-offline-data',
                next: [
                    {
                        _id: 'offlineInstall',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-offline-next-offlineInstall'
                    }
                ]
            },
            {
                _id: 'offlineInstall',
                title:
                    'support-offlineInstall-title',
                data: 'support-offlineInstall-data',
                next: [
                    {
                        _id: 'offlineInstallWindows',
                        class: 'btn--secondary',
                        icon: 'icon--windows icon--big',
                        response: 'support-common-next-windows'
                    },
                    {
                        _id: 'offlineInstallLinux',
                        class: 'btn--secondary',
                        icon: 'icon--linux icon--big',
                        response: 'support-common-next-linux'
                    },
                    {
                        _id: 'offlineInstallMac',
                        class: 'btn--secondary',
                        icon: 'icon--mac icon--big',
                        response: 'support-common-next-mac'
                    },
                    {
                        _id: 'offlineOpciones',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-offlineInstall-next-offlineOptions'
                    }
                ]
            },
            {
                _id: 'offlineInstallWindows',
                title: 'support-offlineInstallWindows-title',
                data: 'support-offlineInstallWindows-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'offlineOpciones',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'offlineInstallLinux',
                title: 'support-offlineInstallLinux-title',
                data: 'support-offlineInstallLinux-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'offlineOpciones',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'offlineInstallMac',
                title: 'support-offlineInstallMac-title',
                data: 'support-offlineInstallMac-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'offlineOpciones',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'offlineOpciones',
                title: 'support-common-options-title',
                data: '',
                next: [
                    {
                        _id: 'offlineNoPlaca',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-common-next-noBoard'
                    },
                    {
                        _id: 'hardware',
                        class: 'btn--secondary',
                        icon: '',
                        response:
                            'support-common-next-hardComponent'
                    }
                ]
            },
            {
                _id: 'offlineNoPlaca',
                title: 'support-offlineNoPlaca-title',
                data: '',
                next: [
                    {
                        _id: 'offlineDriversWindows',
                        class: 'btn--secondary',
                        icon: 'icon--windows icon--big',
                        response: 'support-common-next-windows'
                    },
                    {
                        _id: 'offlineBootloader',
                        class: 'btn--secondary',
                        icon: 'icon--linux icon--big',
                        response: 'support-common-next-linux'
                    },
                    {
                        _id: 'offlineDriversMac',
                        class: 'btn--secondary',
                        icon: 'icon--mac icon--big',
                        response: 'support-common-next-mac'
                    }
                ]
            },
            {
                _id: 'offlineDriversMac',
                title: 'support-common-drivers-title',
                data: 'support-offlineDriversMac-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'offlineBootloader',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'offlineDriversWindows',
                title: 'support-common-drivers-title',
                data: 'support-offlineDriversWindows-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'offlineBootloader',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'offlineBootloader',
                title: 'support-common-bootloader-title',
                data: 'support-offlineBootloader-data',
                next: [
                    {
                        _id: 'offlineBootloaderZumBT328',
                        class: 'btn--secondary',
                        icon: '',
                        response:
                            'support-offlineBootloader-offlineBootloaderZumBT328'
                    },
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'offlineChangeUsb',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'offlineBootloaderZumBT328',
                title:
                    'support-offlineBootloaderZumBT328-title',
                extData: 'bootloaderZumBT328.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'offlineChangeUsb',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'offlineChangeUsb',
                title: 'support-offlineChangeUsb-title',
                data: 'support-offlineChangeUsb-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'offlinePin01',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'offlinePin01',
                title: 'support-offlinePin01-title',
                data: 'support-offlinePin01-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'offlineALotOfPower',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'offlineALotOfPower',
                title:
                    'support-offlineALotOfPower-title',
                data: 'support-offlineALotOfPower-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'dontLoad',
                title: 'support-dontload-title',
                extData: 'dontLoad.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'dontLoadSchool',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'dontLoadSchool',
                title:
                    'support-dontLoadSchool-title',
                extData: 'dontLoadSchool.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'tetering',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'tetering',
                title: 'support-tetering-title',
                data: 'support-tetering-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'w2b',
                title: 'support-common-options-title',
                next: [
                    {
                        _id: 'doesntInstall',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-common-options-next-doesntInstall'
                    },
                    {
                        _id: 'keepAsking2Install',
                        class: 'btn--secondary',
                        icon: '',
                        response:
                            'support-common-options-next-keepAsking2Install'
                    },
                    {
                        _id: 'w2bCrash',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-common-options-next-w2bCrash'
                    },
                    {
                        _id: 'doesntCompile',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-common-options-next-doesntCompile'
                    }
                ]
            },
            {
                _id: 'doesntInstall',
                title: 'support-doesntInstall-title',
                extData: 'doesntInstall.html',
                next: [
                    {
                        _id: 'w2bVirus',
                        class: 'btn--secondary',
                        icon: '',
                        response:
                            'support-doesntInstall-next-w2bVirus'
                    }
                ]
            },
            {
                _id: 'w2bVirus',
                title: 'support-w2bVirus-title',
                extData: 'virusForm.html',
                next: []
            },
            {
                _id: 'keepAsking2Install',
                title: 'support-keepAsking2Install-tittle',
                data: 'support-keepAsking2Install-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'w2bUndetected',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'w2bUndetected',
                title: 'support-w2bUndetected-title',
                data: 'support-w2bUndetected-data',
                next: [
                    {
                        _id: 'w2bUndetectedWindows',
                        class: 'btn--secondary',
                        icon: 'icon--windows icon--big',
                        response: 'support-common-next-windows'
                    },
                    {
                        _id: 'w2bUndetectedLinux',
                        class: 'btn--secondary',
                        icon: 'icon--linux icon--big',
                        response: 'support-common-next-linux'
                    },
                    {
                        _id: 'form',
                        class: 'btn--secondary',
                        icon: 'icon--mac icon--big',
                        response: 'support-common-next-mac'
                    }
                ]
            },
            {
                _id: 'w2bUndetectedWindows',
                title: 'support-w2bUndetectedWindows-title',
                extData: 'w2bUndetectedWindows.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'w2bUndetectedWindowsProxy',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'w2bUndetectedLinux',
                title: 'support-w2bUndetectedLinux-title',
                data: 'support-w2bUndetectedLinux-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'w2bUndetectedWindowsProxy',
                title: 'support-w2bUndetectedWindowsProxy-title',
                data: 'support-w2bUndetectedWindowsProxy-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'w2bUndetectedWindowsLocal2Proxy',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'w2bUndetectedWindowsLocal2Proxy',
                title:
                    'support-w2bUndetectedWindowsLocal2Proxy-title',
                data: 'support-w2bUndetectedWindowsLocal2Proxy-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'w2bCrash',
                title:
                    'support-w2bCrash-title',
                extData: 'w2bCrashForm.html',
                next: []
            },
            {
                _id: 'doesntCompile',
                title: 'support-doesntCompile-title',
                data: '<p></p>',
                next: [
                    {
                        _id: 'codeError',
                        class: 'btn--secondary',
                        response: 'support-doesntCompile-next-codeError'
                    },
                    {
                        _id: 'compileStuck',
                        class: 'btn--secondary',
                        response: 'support-doesntCompile-next-compileStuck'
                    },
                    {
                        _id: 'compileASCIIdecode',
                        class: 'btn--secondary',
                        response: 'support-doesntCompile-next-compileASCIIdecode'
                    },
                    {
                        _id: 'compileOther',
                        class: 'btn--secondary',
                        response: 'support-doesntCompile-next-compileOther'
                    }
                ]
            },
            {
                _id: 'codeError',
                title: 'support-codeError-titile',
                data: 'support-codeError-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-end'
                    }
                ]
            },
            {
                _id: 'compileStuck',
                title: 'support-compileStuck-title',
                extData: 'compileStuckForm.html',
                next: []
            },
            {
                _id: 'compileASCIIdecode',
                title: 'support-compileASCIIdecode-title',
                extData: 'compileASCIIdecode.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-end'
                    }
                ]
            },
            {
                _id: 'compileOther',
                title: 'support-compileOther-title',
                data: 'support-compileOther-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-end'
                    }
                ]
            },
            {
                _id: 'noBoard',
                title: 'support-noBoard-title',
                data: 'support-noBoard-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'isChromebook',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'isChromebook',
                title: 'support-isChromebook-title',
                data: '',
                next: [
                    {
                        _id: 'error3020',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'reinstallDrivers',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'reinstallDrivers',
                title: 'support-common-drivers-title',
                data: 'support-reinstallDrivers-data',
                next: [
                    {
                        _id: 'reinstallDriversWindows',
                        class: 'btn--primary',
                        icon: 'icon--windows icon--big',
                        response: 'support-common-next-windows'
                    },
                    {
                        _id: 'reinstallDriversLinux',
                        class: 'btn--primary',
                        icon: 'icon--linux icon--big',
                        response: 'support-common-next-linux'
                    },
                    {
                        _id: 'reinstallDriversMac',
                        class: 'btn--primary',
                        icon: 'icon--mac icon--big',
                        response: 'support-common-next-mac'
                    },
                    {
                        _id: 'error3020',
                        class: 'btn--secondary',
                        icon: 'icon--chrome icon--big',
                        response:
                            'support-reinstallDrivers-next-error3020'
                    }
                ]
            },
            {
                _id: 'reinstallDriversMac',
                title: 'support-common-drivers-title',
                data: 'support-reinstallDriversMac-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'error3020',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-common-next-error3020'
                    },
                    {
                        _id: 'bootloader',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'reinstallDriversWindows',
                title: 'support-common-drivers-title',
                data: 'support-reinstallDriversWindows-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'error3020',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-common-next-error3020'
                    },
                    {
                        _id: 'bootloader',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'reinstallDriversLinux',
                title: 'support-common-drivers-title',
                data: 'support-reinstallDriversLinux-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'error3020',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-common-next-error3020'
                    },
                    {
                        _id: 'bootloader',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'error3020',
                title: 'support-error3020-title',
                data: 'support-error3020-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'bootloader',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'bootloader',
                title: 'support-common-bootloader-title',
                data: 'support-bootloader-data',
                next: [
                    {
                        _id: 'bootloaderZumBT328',
                        class: 'btn--secondary',
                        icon: '',
                        response:
                            'support-common-next-bootloaderZumBT328'
                    },
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: '3020changeUsb',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'bootloaderZumBT328',
                title:
                    'support-common-next-bootloaderZumBT328',
                extData: 'bootloaderZumBT328.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: '3020changeUsb',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: '3020changeUsb',
                title: 'support-3020changeUsb-title',
                data: 'support-3020changeUsb-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: '3020pin01',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: '3020pin01',
                title: 'support-3020pin01-title',
                data: 'support-3020pin01-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: '3020aLotOfPower',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: '3020aLotOfPower',
                title:
                    'support-3020aLotOfPower-title',
                data: 'support-3020aLotOfPower-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: '3020btConnected',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: '3020btConnected',
                title: 'support-3020btConnected-title',
                data: 'support-3020btConnected-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: '3020SO',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: '3020SO',
                title: 'support-3020SO-title',
                data: '',
                next: [
                    {
                        _id: '3020Windows',
                        class: 'btn--secondary',
                        icon: 'icon--windows icon--big',
                        response: 'support-common-next-windows'
                    },
                    {
                        _id: '3020isModeChromeApp',
                        class: 'btn--secondary',
                        icon: 'icon--linux icon--big',
                        response: 'support-common-next-linux'
                    },
                    {
                        _id: '3020isModeChromeApp',
                        class: 'btn--secondary',
                        icon: 'icon--mac icon--big',
                        response: 'support-common-next-mac'
                    },
                    {
                        _id: 'form',
                        class: 'btn--secondary',
                        icon: 'icon--chrome icon--big',
                        response: 'support-common-next-chromebook'
                    }
                ]
            },
            {
                _id: '3020isModeChromeApp',
                title: 'support-3020isModeChromeApp-title',
                extData: '3020isModeChromeApp.html',
                next: [
                    {
                        _id: 'form',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-3020isModeChromeApp-next-form'
                    },
                    {
                        _id: '3020logPorts',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-3020isModeChromeApp-next-3020logPorts'
                    }
                ]
            },
            {
                _id: '3020Windows',
                title: 'support-3020Windows-title',
                data: 'support-3020Windows-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: '3020isModeChromeApp',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: '3020logPorts',
                title:
                    'support-3020logPorts-title',
                extData: '3020logPorts.html',
                next: [
                    {
                        _id: 'form',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-3020logPorts-next-form'
                    },
                    {
                        _id: '3020ideArduino',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-3020logPorts-next-3020ideArdunino'
                    }
                ]
            },
            {
                _id: '3020ideArduino',
                title: 'support-3020ideArduino-title',
                data: 'support-3020ideArduino-data',
                next: [
                    {
                        _id: 'form',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si detecta la placa'
                    },
                    {
                        _id: '3020DeadBoard',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-3020ideArduino-next-3020DeadBoard'
                    }
                ]
            },
            {
                _id: '3020DeadBoard',
                title: 'support-3020DeadBoard-title',
                data: 'support-3020DeadBoard-data',
                next: [
                    {
                        _id: 'bqZumForm',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-3020DeadBoard-next-bqZumForm'
                    }
                ]
            },
            {
                _id: 'bqZumForm',
                permalink: 'bqZumForm',
                title: 'support-bqZumForm-title',
                data: 'support-bqZumForm-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-end'
                    }]
            },
            {
                _id: 'xp',
                permalink: 'xp',
                title: 'support-xp-title',
                extData: 'xp.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-end'
                    }
                ]
            },
            {
                _id: 'linux',
                permalink: 'linux',
                title: 'support-linux-title',
                extData: 'linux.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-end'
                    }
                ]
            },
            {
                _id: 'hardware',
                title: 'support-hardware-title',
                data: 'support-hardware-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'hardQuemado',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'hardQuemado',
                title: 'support-hardQuemado-title',
                data: 'support-hardQuemado-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'hardUSB',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'hardUSB',
                title: 'support-hardUSB-title',
                data: 'support-hardUSB-data',
                next: [
                    {
                        _id: 'hardLista',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-hardUSB-next-hardLista'
                    }
                ]
            },
            {
                _id: 'hardLista',
                title: 'support-hardLista-title',
                extData: 'hardLista.html',
                next: []
            },
            {
                _id: 'hardLEDs',
                permalink: 'hardLEDs',
                title: 'support-hardLEDs-title',
                extData: 'hardLEDs.html',
                next: [
                    {
                        _id: 'hardLEDsTestIni',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response:
                            'support-hardLEDs-next-hardLEDsTestIni'
                    }
                ]
            },
            {
                _id: 'hardLEDsTestIni',
                permalink: 'hardLEDs',
                title: 'support-hardLEDsTestIni-title',
                extData: 'hardLEDsTestIni.html',
                next: []
            },
            {
                _id: 'hardLEDsTestEnd',
                permalink: 'hardLEDsTestEnd',
                title: 'support-hardLEDsTestEnd-title',
                data: 'support-hardLEDsTestEnd-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-hardLEDsTestEnd-next-end'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-hardLEDsTestEnd-next-form'
                    }
                ]
            },
            {
                _id: 'hardServos',
                permalink: 'hardServos',
                title: 'support-hardServos-title',
                data: '',
                next: [
                    {
                        _id: 'hardServosNormal',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-hardServos-next-hardServosNormal'
                    },
                    {
                        _id: 'hardServosAleatorio',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-hardServos-next-hardServosAleatorio'
                    }
                ]
            },
            {
                _id: 'hardServosNormal',
                title: 'support-hardServosNormal-title',
                data: '',
                next: [
                    {
                        _id: 'hardServosAleatorio',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-hardServosNormal-next-hardServosAleatorio0'
                    },
                    {
                        _id: 'hardServosAleatorio',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-hardServosNormal-next-hardServosAleatorio1'
                    },
                    {
                        _id: 'hardServosNoPara',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-hardServosNormal-next-hardServosNoPara'
                    }
                ]
            },
            {
                _id: 'hardServosAleatorio',
                title: 'support-hardServosAleatorio-title',
                data: 'support-hardServosAleatorio-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'hardServosNoPara',
                title: 'support-hardServosNoPara-title',
                data: 'support-hardServosNoPara-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'hardLCDs',
                permalink: 'hardLCDs',
                title: 'support-hardLCDs-title',
                extData: 'hardLCDs.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'hardLCDsPalanca',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'hardLCDsPalanca',
                title: 'support-hardLCDsPalanca-title',
                data: 'support-hardLCDsPalanca-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'hardLCDsASCII',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'hardLCDsASCII',
                title: 'support-hardLCDsASCII-title',
                data: 'support-hardLCDsASCII-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'hardLCDsTestIni',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'hardLCDsTestIni',
                title: 'support-hardLCDsTestIni-title',
                extData: 'hardLCDsTestIni.html',
                next: []
            },
            {
                _id: 'hardLCDsTestEnd',
                permalink: 'hardLCDsTestEnd',
                title: 'support-hardLCDsTestEnd-title',
                data: 'support-hardLCDsTestEnd-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-hardLCDsTestEnd-next-end'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-hardLCDsTestEnd-next-form'
                    }
                ]
            },
            {
                _id: 'hardUS',
                permalink: 'hardUS',
                title: 'support-hardUS-title',
                extData: 'hardUS.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'hardUSTestIni',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'hardUSTestIni',
                title: 'support-hardUSTestIni-title',
                extData: 'hardUSTestIni.html',
                next: []
            },
            {
                _id: 'hardUSTestEnd',
                permalink: 'hardUSTestEnd',
                title: 'support-hardUSTestEnd-title',
                extData: 'hardUSTestEnd.html',
                next: []
            },
            {
                _id: 'hardBT',
                permalink: 'hardBT',
                title: 'support-hardBT-title',
                data: 'support-hardBT-data',
                next: [
                    {
                        _id: 'hardBTATCommand',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'support-hardBT-next-hardBTATCommand'
                    }
                ]
            },
            {
                _id: 'hardBTATCommand',
                title: 'support-hardBT-next-hardBTATCommand',
                data: 'support-hardBTATCommand-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-yes'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-common-next-no'
                    }
                ]
            },
            {
                _id: 'hard2forum',
                permalink: 'hard2forum',
                title: 'support-hard2forum-title',
                data: 'support-hard2forum-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-common-next-end'
                    }
                ]
            },
            {
                _id: 'hardBuzz',
                permalink: 'hardBuzz',
                title: 'support-hardBuzz-title',
                extData: 'hardBuzz.html',
                next: [
                    {
                        _id: 'hardBuzzTestIni',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response:
                            'support-hardBuzz-next-hardBuzzTestIni'
                    }
                ]
            },
            {
                _id: 'hardBuzzTestIni',
                title: 'support-hardBuzzTestIni-title',
                extData: 'hardBuzzTestIni.html',
                next: []
            },
            {
                _id: 'hardBuzzTestEnd',
                permalink: 'hardBuzzTestEnd',
                title: 'support-hardBuzzTestEnd-title',
                data: 'support-hardBuzzTestEnd-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-hardBuzzTestEnd-next-end'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-hardBuzzTestEnd-next-form'
                    }
                ]
            },
            {
                _id: 'hardButton',
                permalink: 'hardButton',
                title: 'support-hardButton-title',
                extData: 'hardButton.html',
                next: [
                    {
                        _id: 'hardButtonTestIni',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response:
                            'support-hardButton-next-hardButtonTestIni'
                    }
                ]
            },
            {
                _id: 'hardButtonTestIni',
                title: 'support-hardButtonTestIni-title',
                extData: 'hardButtonTestIni.html',
                next: []
            },
            {
                _id: 'hardButtonTestEnd',
                permalink: 'hardButtonTestEnd',
                title: 'support-hardButtonTestEnd-title',
                data:
                    'support-hardButtonTestEnd-data',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'support-hardButtonTestEnd-next-end'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'support-hardButtonTestEnd-next-form'
                    }
                ]
            }
        ];

        var getCard = function(id, isPermalink) {
            return db
                .filter(function(card) {
                    return id === (isPermalink ? card.permalink : card._id);
                })
                .pop();
        };

        var currentId =
            $routeParams.id !== undefined
                ? $routeParams.id
                : getCard('index', true)._id;
        $scope.card = getCard(currentId);
        if ($scope.card === undefined || $scope.card.title === '') {
            $scope.card = getCard('404', true);
            currentId = $scope.card._id;
        }
        // if f5 -> at least it will save current state
        if (
            _.last(common.supportSteps) !== $scope.card.title &&
            $scope.card.permalink !== 'index'
        ) {
            common.supportSteps.push($scope.card.title);
        }

        $scope.go = function(childId, isPermalink) {
            if (childId) {
                var child = isPermalink
                    ? getCard(childId, true)
                    : getCard(childId, false);
                if (child && !isPermalink) {
                    common.supportSteps.push(child.title);
                    $location.path('/support/' + child._id);
                } else {
                    var childIndex = getCard('index', true);
                    if (childId === childIndex._id) {
                        common.supportSteps = [];
                        $location.path('/support');
                    } else {
                        common.supportSteps.push(child.title);
                        $location.path('/support/' + childId);
                    }
                }
            } else {
                console.warn(
                    'Se está intentando acceder a un botón sin childId',
                    childId,
                    isPermalink
                );
            }
        };

        $scope.goBack = function() {
            $window.history.back();
        };

        // switches
        common.itsUserLoaded().then(function() {
            $scope.user = common.user;
            $scope.switchUserChromeAppMode = function() {
                userApi.update({
                    chromeapp: common.user.chromeapp
                });
            };
        });

        // lists
        $scope.components = [
            {
                uuid: 'lcd',
                name: 'LCD',
                permalink: 'hardLCDs',
                svg: ''
            },
            {
                uuid: 'led',
                name: 'LED',
                permalink: 'hardLEDs',
                svg: ''
            },
            {
                uuid: 'button',
                name: 'Pulsador',
                permalink: 'hardButton',
                svg: ''
            },
            {
                uuid: 'servo',
                name: 'Servomotor',
                permalink: 'hardServos',
                svg: ''
            },
            {
                uuid: 'us',
                name: 'Ultrasonidos',
                permalink: 'hardUS',
                svg: ''
            },
            {
                uuid: 'buzz',
                name: 'Zumbador',
                permalink: 'hardBuzz',
                svg: ''
            },
            {
                uuid: 'other',
                name: 'Otro',
                permalink: 'form',
                svg: ''
            }
        ];

        $scope.getSVG = function(item) {
            if (item.svg === '') {
                $http
                    .get(
                        'images/components/' +
                            utils.getTimestampPrefix() +
                            item.uuid +
                            '.svg'
                    )
                    .then(function(res) {
                        //we want to delete all height and width atributes form the original svg files
                        item.svg = _.replace(
                            res.data,
                            /\b(width|height)="+[a-zA-Z1-9]+" ?\b/gi,
                            ''
                        );
                    });
            }
        };

        $scope.renderSVG = function(item) {
            return $sce.trustAsHtml(item.svg); // all of this for the svg animations to fly! :)
        };

        // imgModal

        $scope.imgModal = function(img) {
            console.log('dentro');
            var parent = $rootScope,
                modalOptions = parent.$new();

            _.extend(modalOptions, {
                contentHTML: '<div><img src="' + img + '" /></div>'
            });

            ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container',
                scope: modalOptions
            });
        };

        // hw test
        $scope.hwTestTries = 0;
        $scope.hwTestStart = function(component, board) {
            switch (component) {
                case 'led':
                    if (board === 'bqzum') {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'bt328'
                                },
                                hex: programHex.supportLED.bt328
                            })
                            .then(function() {
                                $scope.go('hardLEDsTestEnd', true);
                            })
                            .catch(function() {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('form', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    } else {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'uno'
                                },
                                hex: programHex.supportLED.uno
                            })
                            .then(function() {
                                $scope.go('hardLEDsTestEnd', true);
                            })
                            .catch(function() {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('hard2forum', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    }
                    break;
                case 'buzz':
                    if (board === 'bqzum') {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'bt328'
                                },
                                hex: programHex.supportBuzz.bt328
                            })
                            .then(function() {
                                $scope.go('hardBuzzTestEnd', true);
                            })
                            .catch(function() {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('form', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    } else {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'uno'
                                },
                                hex: programHex.supportBuzz.uno
                            })
                            .then(function() {
                                $scope.go('hardBuzzTestEnd', true);
                            })
                            .catch(function() {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('hard2forum', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    }
                    break;
                case 'lcd':
                    if (board === 'bqzum') {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'bt328'
                                },
                                hex: programHex.supportLCD.bt328
                            })
                            .then(function() {
                                $scope.go('hardLCDsTestEnd', true);
                            })
                            .catch(function() {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('form', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    } else {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'uno'
                                },
                                hex: programHex.supportLCD.uno
                            })
                            .then(function() {
                                $scope.go('hardLCDsTestEnd', true);
                            })
                            .catch(function() {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('hard2forum', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    }
                    break;
                case 'us':
                    if (board === 'bqzum') {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'bt328'
                                },
                                hex: programHex.supportUS.bt328
                            })
                            .then(function() {
                                $scope.go('hardUSTestEnd', true);
                            })
                            .catch(function() {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('form', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    } else {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'uno'
                                },
                                hex: programHex.supportUS.uno
                            })
                            .then(function() {
                                $scope.go('hardUSTestEnd', true);
                            })
                            .catch(function() {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('hard2forum', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    }
                    break;
                case 'button':
                    if (board === 'bqzum') {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'bt328'
                                },
                                hex: programHex.supportButton.bt328
                            })
                            .then(function() {
                                $scope.go('hardButtonTestEnd', true);
                            })
                            .catch(function() {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('form', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    } else {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'uno'
                                },
                                hex: programHex.supportButton.uno
                            })
                            .then(function() {
                                $scope.go('hardButtonTestEnd', true);
                            })
                            .catch(function() {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('hard2forum', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    }
                    break;
            }
        };

        $scope.boards = [];
        $scope.getBoards = function() {
            //then lets load the ports
            chromeAppApi
                .getPorts()
                .then(function(response) {
                    $scope.ports = filterPortsByOS(response.ports);
                    hardwareService.itsHardwareLoaded().then(function() {
                        utils.getPortsPrettyNames(
                            $scope.ports,
                            hardwareService.hardware.boards
                        );
                        $scope.portNames = [];

                        for (var i = 0; i < $scope.ports.length; i++) {
                            $scope.portNames.push($scope.ports[i].portName);
                        }

                        $scope.boards = $scope.portNames;
                    });
                })
                .catch(function(error) {
                    console.log('error SerialMonitorCtrl', error);
                });
        };

        // dc function to free the serial port
        $scope.dc = function() {
            chromeAppApi.stopSerialCommunication();
            if (serialEvent) {
                serialEvent();
            }
        };

        function filterPortsByOS(ports) {
            var result = [];
            if (common.os === 'Mac') {
                for (var i = 0; i < ports.length; i++) {
                    if (ports[i].comName.indexOf('/dev/cu') !== -1) {
                        result.push(ports[i]);
                    }
                }
            } else {
                result = ports;
            }
            return result;
        }
        $scope.selected = false;
        $scope.selectBoardUS = function(item) {
            $scope.selected = true;
            var port = _.find($scope.ports, {
                portName: item
            });
            $scope.selectedPort = port;
            chromeAppApi.getSerialData($scope.selectedPort);
            serialEvent = $rootScope.$on('serial', function(event, msg) {
                // maybe we recieve more than one metric on the same package
                var piece = msg.split(/\s+/)[0].slice(0, -3);

                if (piece.length === 1) {
                    piece = '00' + piece;
                } else if (piece.length === 2) {
                    piece = '0' + piece;
                } else if (piece.length > 3) {
                    piece = '---';
                }

                $scope.serialMsg = $sce.trustAsHtml(
                    '<span>' +
                        (piece + 'cm').split(/(?!^)/).join('</span><span>') +
                        '</span>'
                );
                utils.apply($scope);
            });
        };

        $scope.serialMsg =
            '<span>-</span><span>-</span><span>-</span><span>c</span><span>m</span>'; // default
        var serialEvent = null;

        // form + '|' + piece[1]
        $scope.response = {
            message: '',
            // 'code': '',
            error: '',
            system: '',
            antivirus: '',
            linklog: '',
            w2blog: ''
        };
        // sometimes the user go back and forth...
        // lets clean the steps!
        $scope.getSteps = function() {
            // only if we donesn't want duplicates
            // common.supportSteps = _.uniqBy(
            //     common.supportSteps.reverse()
            // ).reverse();
            return common.supportSteps.join('</li><li>');
        };
        $scope.send = function() {
            var str = '';
            // message
            // /r/n -> <br />
            if ($scope.response.message.length > 0) {
                str += '<div><pre>';
                str += unHTMLfy($scope.response.message);
                str += '</pre></div>';
            }
            // code
            // if ($scope.response.code.length > 0) {
            //   str += '<br><hr><strong>Código:</strong><br>'
            //   str += '<div style="border: 1px dashed #1B6D33; padding: 5px; margin: 5px;"><pre>'
            //   str += unHTMLfy($scope.response.code)
            //   str += '</pre></div>'
            // }
            // error
            if ($scope.response.error.length > 0) {
                str += '<br><hr><strong>Error:</strong><br>';
                str +=
                    '<div style="border: 1px dashed #B8282A; padding: 5px; margin: 5px;"><pre>';
                str += unHTMLfy($scope.response.error);
                str += '</pre></div>';
            }
            // system
            if ($scope.response.system.length > 0) {
                str += '<p><strong>Sistema Operativo: </strong><pre>';
                str += unHTMLfy($scope.response.system);
                str += '</pre></p>';
            }
            // antivirus
            if ($scope.response.antivirus.length > 0) {
                str += '<p><strong>Antivirus: </strong><pre>';
                str += unHTMLfy($scope.response.antivirus);
                str += '</pre></p>';
            }
            // linklog
            if ($scope.response.linklog.length > 0) {
                str += '<br><hr><strong>web2boardLink.log:</strong><br>';
                str +=
                    '<div style="border: 1px dashed #B8282A; padding: 5px; margin: 5px;"><pre>';
                str += unHTMLfy($scope.response.linklog);
                str += '</pre></div>';
            }
            // w2blog
            if ($scope.response.w2blog.length > 0) {
                str += '<br><hr><strong>web2board/info.log:</strong><br>';
                str +=
                    '<div style="border: 1px dashed #B8282A; padding: 5px; margin: 5px;"><pre>';
                str += unHTMLfy($scope.response.w2blog);
                str += '</pre></div>';
            }
            // adding steps list
            str += '<br><hr><strong>Camino:</strong><br><ol><li>';
            str += $scope.getSteps();
            str += '</li></ol>';

            var res = {
                creator: common.user,
                message: str,
                userAgent: window.navigator.userAgent
            };

            feedbackApi
                .send(res)
                .success(function() {
                    alertsService.add({
                        text: 'modal-comments-done',
                        id: 'modal-comments',
                        type: 'ok',
                        time: 5000
                    });
                })
                .error(function() {
                    alertsService.add({
                        text: 'modal-comments-error',
                        id: 'modal-comments',
                        type: 'warning'
                    });
                });
        };

        var unHTMLfy = function(str) {
            return str
                .replace(/(?:&)/g, '&amp;')
                .replace(/(?:<)/g, '&lt;')
                .replace(/(?:>)/g, '&gt;')
                .replace(/\u00a0/g, ' ')
                .replace(/&nbsp;/g, ' ')
                .replace(/(?:\r\n|\r|\n)/g, '<br />');
        };

        $window.onbeforeunload = $scope.dc();
        $scope.$on('$destroy', function() {
            $scope.dc();
        });
    });
