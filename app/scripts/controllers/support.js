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
                title: '¡Bienvenido a la página de soporte de Bitbloq!',
                data:
                    '<p class="support--center">Ayudanos a diagnosticar tu caso para que podamos ayudarte.</p><p class="support--center"><strong>¿Usas la versión Online de Bitbloq, o la versión <a href="http://bitbloq.bq.com/#/offline" class="icon--url">Offline</a>?</strong></p>',
                next: [
                    {
                        _id: 'online',
                        class: 'btn--secondary',
                        icon: 'icon--cloud icon--big',
                        response: 'Uso la versión Online'
                    },
                    {
                        _id: 'offline',
                        class: 'btn--secondary',
                        icon: 'icon--desktop icon--big',
                        response: 'Uso la versión Offline'
                    }
                ]
            },
            {
                _id: 'end',
                permalink: 'end',
                dontShowHomeButton: true,
                title:
                    '¡Gracias por utilizar el sistema de soporte de Bitbloq!',
                data:
                    '<span class="support--icon--giga support--icon--ok"><i class="fa fa-check-circle" aria-hidden="true"></i></span>',
                next: [
                    {
                        _id: 'index',
                        class: 'btn--primary',
                        icon: 'icon--home icon--big',
                        response: 'Volver a el índice'
                    }
                ]
            },
            {
                _id: '404',
                permalink: '404',
                dontShowHomeButton: true,
                title: 'No encuentro la página de soporte que buscas...',
                data:
                    'Puede que exista un error; Inténtalo de nuevo<br><span class="support--icon--giga support--icon--no"><svg class="svg-icon"><use xlink:href="#warning"></use></svg><span>',
                next: [
                    {
                        _id: 'index',
                        class: 'btn--primary',
                        icon: 'icon--home icon--big',
                        response: 'Volver a el índice'
                    }
                ]
            },
            {
                _id: 'form',
                permalink: 'form',
                title: 'Contacta con nuestro soporte técnico',
                extData: 'contactForm.html',
                next: []
            },
            {
                _id: 'online',
                title: 'Por favor, indicanos el motivo de tu consulta:',
                next: [
                    {
                        _id: 'dontLoad',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'La web no carga'
                    },
                    {
                        _id: 'w2b',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'Tengo dificultades con web2board'
                    },
                    {
                        _id: 'hardware',
                        class: 'btn--secondary',
                        icon: '',
                        response:
                            'Tengo una incidencia con un componente de hardware'
                    },
                    {
                        _id: 'noBoard',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'No me detecta la placa'
                    },
                    {
                        _id: 'error3020',
                        class: 'btn--secondary',
                        icon: '',
                        response:
                            'Recibo el error "3020 RecieveData timeout 400ms"'
                    }
                ]
            },
            {
                _id: 'offline',
                title: '¿Qué es Bitbloq Offline?',
                data:
                    '<p>Nuestra versión offline tiene dos ventajas principales:<ul><li class="icon--check"><strong>No es necesario tener conexión a internet</strong></li><li class="icon--check"><strong>No requiere ser instalada</strong> en el sentido clásico, al ser una aplicación portable <i class="text--secondary">(puede ser ejecutada desde cualquier carpeta)</i></li></ul></p><p>Estas ventajas conllevan la necesidad de ser una <strong>versión reducida respecto a la versión online</strong>, lo cual significa que habrá ciertas opciones a las que no tendrá acceso:<ul><li class="icon--no">Todas las funciones enfocadas a compartir proyectos, como explora o el modo centro, requieren internet, y por lo tanto no son accesibles.</li><li class="icon--no">Algunas de las novedades más recientes no estarán incluidas en la versión offline.</li></ul></p>',
                next: [
                    {
                        _id: 'offlineInstall',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Continuar con el soporte'
                    }
                ]
            },
            {
                _id: 'offlineInstall',
                title:
                    'Compruebe que Bitbloq offline está instalado correctamente',
                data:
                    '<p>Asegurese de que ha añadido Bitbloq offline en una carpeta donde su usuario tiene permisos<br>Le recomendamos utilizar la manera mas sencilla: <strong>Guarde la aplicación en la carpeta de documentos por defecto de su sistema operativo</strong>.</p><p><strong>¿Qué sistema operativo utiliza?</strong></p>',
                next: [
                    {
                        _id: 'offlineInstallWindows',
                        class: 'btn--secondary',
                        icon: 'icon--windows icon--big',
                        response: 'Windows'
                    },
                    {
                        _id: 'offlineInstallLinux',
                        class: 'btn--secondary',
                        icon: 'icon--linux icon--big',
                        response: 'Linux'
                    },
                    {
                        _id: 'offlineInstallMac',
                        class: 'btn--secondary',
                        icon: 'icon--mac icon--big',
                        response: 'Mac'
                    },
                    {
                        _id: 'offlineOpciones',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Bitbloq Offline está bien instalado'
                    }
                ]
            },
            {
                _id: 'offlineInstallWindows',
                title: '¿Cómo instalo la  versión offline en Windows?',
                data:
                    '<p><ul><li class="icon--check">Descarga la última versión de <a href="https://github.com/bq/bitbloq-offline/releases/download/latest/windows.zip" target="_blank" class="icon--url">Bitbloq offline para <span class="icon--windows">Windows</span></a></li><li class="icon--check">Crea una nueva carpeta en <i class="text--secondary">"Mis Documentos"</i>, y llámala Bitbloq Offline.</li><li class="icon--check">Mueve el archivo recien descargado a la nueva carpeta.</li><li class="icon--check">Haz click con el botón derecho del ratón en el archivo, y selecciona <strong>Extraer todo</strong>.</li></ul></p><p class="support--center"><strong>¿Ha solucionado su problema?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'offlineOpciones',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'offlineInstallLinux',
                title: '¿Cómo instalo la  versión offline en Linux?',
                data:
                    '<p><ul><li class="icon--check">Descarga la última versión de Bitbloq offline para <a href="https://github.com/bq/bitbloq-offline/releases/download/latest/linux.zip" target="_blank" class="icon--url"><span class="icon--linux">Linux 64</span></a> o <a href="https://github.com/bq/bitbloq-offline/releases/download/latest/linux32.zip" target="_blank" class="icon--url"><span class="icon--linux">Linux 32</span></a></li><li class="icon--check">Crea una nueva carpeta en la carpeta <i class="text--secondary">"Documentos"</i> de tu usuario, y llámala Bitbloq Offline.</li><li class="icon--check">Mueve el archivo recien descargado a la nueva carpeta.</li><li class="icon--check">Haz click con el botón derecho del ratón en el archivo, y selecciona <strong>Extraer aquí</strong>.<br>Si necesita un descompresor, le recomendamos: <span class="common--text-term-fx little">sudo apt-get install unzip</span></li></ul></p>' +
                    '<p>Es necesario que se asegure de que su usuario es parte del grupo <i class="text--secondary">dialout</i><ul><li class="icon--check">Utilice el comando <span class="common--text-term-fx little">groups <i class="text--secondary">usuario</i></span> para comprobar si su usuario está en el grupo <i class="text--secondary">dialout</i></li><li class="icon--check">Si no está en dicho grupo, utilice el comando <span class="common--text-term-fx little">sudo adduser <i class="text--secondary">usuario</i> dialout</span> para añadirlo</li></ul></p>' +
                    '<p>¿Su distribución es <strong class="icon--linux"> MAX9</strong>?:</p><ul><li class="icon--check">Puede instalar Bitbloq offline mediante <span class="common--text-term-fx little">sudo apt-get install bitbloq-offline</span></li></ul></p><p class="support--center"><strong>¿Ha solucionado su problema?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'offlineOpciones',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'offlineInstallMac',
                title: '¿Cómo instalo la  versión offline en Mac?',
                data:
                    '<p><ul><li class="icon--check">Descarga la última versión de <a href="https://github.com/bq/bitbloq-offline/releases/download/latest/mac.zip" target="_blank" class="icon--url">Bitbloq offline para <span class="icon--mac">Mac</span></a></li><li class="icon--check">Crea una nueva carpeta en <i class="text--secondary">"Documentos"</i>, y llámala Bitbloq Offline.</li><li class="icon--check">Mueve el archivo recien descargado a la nueva carpeta, y <strong>ábrelo</strong></li></ul></p><p class="support--center"><strong>¿Ha solucionado su problema?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'offlineOpciones',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'offlineOpciones',
                title: 'Por favor, indicanos el motivo de tu consulta:',
                data: '',
                next: [
                    {
                        _id: 'offlineNoPlaca',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'No me detecta la placa'
                    },
                    {
                        _id: 'hardware',
                        class: 'btn--secondary',
                        icon: '',
                        response:
                            'Tengo una incidencia con un componente de hardware'
                    }
                ]
            },
            {
                _id: 'offlineNoPlaca',
                title: 'Selecciona tu sistema operativo:',
                data: '',
                next: [
                    {
                        _id: 'offlineDriversWindows',
                        class: 'btn--secondary',
                        icon: 'icon--windows icon--big',
                        response: 'Windows'
                    },
                    {
                        _id: 'offlineBootloader',
                        class: 'btn--secondary',
                        icon: 'icon--linux icon--big',
                        response: 'Linux'
                    },
                    {
                        _id: 'offlineDriversMac',
                        class: 'btn--secondary',
                        icon: 'icon--mac icon--big',
                        response: 'Mac'
                    }
                ]
            },
            {
                _id: 'offlineDriversMac',
                title: 'Revise los drivers',
                data:
                    '<p><ul><li class="icon--check">Drivers para <a href="https://storage.googleapis.com/bitbloq/drivers/zowi/mac/Mac_OSX_VCP_Driver.zip" target="_blank"><strong>Zowi</strong></a>.</li><li class="icon--check">Drivers para la placa <a href="https://storage.googleapis.com/bitbloq/drivers/zum/mac/FTDIUSBSerialDriver_v2_4_2.dmg" target="_blank"><strong>BQ ZUM Core (BT-328)</strong></a>.</li></ul></p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'offlineBootloader',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'offlineDriversWindows',
                title: 'Revise los drivers',
                data:
                    '<p><ul><li class="icon--check">Drivers para <a href="https://storage.googleapis.com/bitbloq/drivers/zowi/windows/CP210x_Windows_Drivers.zip" target="_blank"><strong>Zowi</strong></a>.</li><li class="icon--check">Drivers para la placa <a href="https://storage.googleapis.com/bitbloq/drivers/zum/windows/CDM21228_Setup.zip" target="_blank"><strong>BQ ZUM Core (BT-328)</strong></a>.</li><li class="icon--check">Drivers para la placa <a href="https://storage.googleapis.com/bitbloq/drivers/arduino/drivers.zip" target="_blank"><strong>Arduino UNO</strong></a> <i class="">(y basados en ella)</li></ul></p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'offlineBootloader',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'offlineBootloader',
                title: 'Comprueba que tu placa tiene bootloader',
                data:
                    '<p>¿Qué es un <strong>bootloader</strong>?</p><p>El <i class="text--secondary">bootloader</i> es un programa que se lanza cuando inicias la placa o la reseteas, cuya función es preparar la carga de los nuevos programas. Normalmente se necesita una herramienta especial para cargar los programas; el bootloader simplifica el proceso permitiendo cargarlos mediante el puerto USB.</p><p>¡Asegurese que el bootloader de su placa está instalado <strong>correctamente</strong>!</p><p><strong>¿Cómo compruebo si tengo instalado el Bootloader?:</strong><br>Presiona el botón de <span class="common--icon-keycap-fx">reset</span>, y si bootloader está instalado <strong>debería parpadear el led numero 13</strong></p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'offlineBootloaderZumBT328',
                        class: 'btn--secondary',
                        icon: '',
                        response:
                            '¿Cómo cargo el bootloader en la placa ZUM Core (BT-328)?'
                    },
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'offlineChangeUsb',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'offlineBootloaderZumBT328',
                title:
                    '¿Cómo cargo el bootloader en la placa ZUM Core (BT-328)?',
                extData: 'bootloaderZumBT328.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'offlineChangeUsb',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'offlineChangeUsb',
                title: 'Cambie de puerto USB y pruebe con otro cable',
                data:
                    '<p>Aunque poco probable, tanto el puerto USB donde conecta la placa a su sistema como el propio cable de comunicación pueden deteriorarse.</p><p>Para <strong>descartar</strong> esta posibilidad, pruebe a cambiar de puerto y utilice un cable diferente.</p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'offlinePin01',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'offlinePin01',
                title: '¿Tiene algún componente conectado en los pines 0 y 1?',
                data:
                    '<p>Los pines <i class="text--secondary">0</i> y <i class="text--secondary">1</i> se utilizan para digital i/o y para comunicación en serie <i class="text--secondary">(de la que depende el puerto USB y la conexión por Bluetooth)</i>, por lo que si están en uso se deshabilitará la comunicación con su sistema.</p><p>Para volver a habilitar el puerto USB, libere los pines.<p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'offlineALotOfPower',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'offlineALotOfPower',
                title:
                    '¿Tiene muchos componentes conectados o un componente con un consumo alto?',
                data:
                    '<p>Si conecta <strong>muchos componentes</strong> al mismo tiempo, o tiene componentes con un consumo elevado <i class="text--secondary">(como por ejemplo un servomotor)</i>, puede ocurrir que el ordenador no pueda suminsitrar suficiente por el puerto USB.<br><div class="support--icon--giga"><img src="images/support/zum-power.png" /></div><br>Pruebe <strong>apagando la placa</strong> <i class="text--secondary">(botón rojo en posición off)</i> o conectado una fuente de alimentación</p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'dontLoad',
                title: '¿Tienes problemas cargando la web de Bitbloq?',
                extData: 'dontLoad.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'dontLoadSchool',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'dontLoadSchool',
                title:
                    '¿Estás en un centro educativo o en alguna infraestructura que pueda estar bajo un proxy?',
                extData: 'dontLoadSchool.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'tetering',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'tetering',
                title: 'Prueba con el tetering del móvil',
                data:
                    '<p>Activando la opción de tetering de su móvil, y compartiendo la conexión con su computadora, puede comprobar si carga Bitbloq desde una red diferente.</p><p>Si consigue cargar, tiene un problema en la configuración de su red y/o software ajeno a Bitbloq; contacte con los administradores de la red.</p><p class="support--center"><strong>¿Ha solucionado el problema?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'w2b',
                title: 'Por favor, indicanos el motivo de tu consulta:',
                next: [
                    {
                        _id: 'doesntInstall',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'web2board no instala'
                    },
                    {
                        _id: 'keepAsking2Install',
                        class: 'btn--secondary',
                        icon: '',
                        response:
                            'Bitbloq no deja de pedirme que instale web2board'
                    },
                    {
                        _id: 'w2bCrash',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'web2board se abre y cierra rápidamente'
                    },
                    {
                        _id: 'doesntCompile',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'web2board no compila'
                    }
                ]
            },
            {
                _id: 'doesntInstall',
                title: 'No me instala web2board',
                extData: 'doesntInstall.html',
                next: [
                    {
                        _id: 'w2bVirus',
                        class: 'btn--secondary',
                        icon: '',
                        response:
                            'El sistema reconoce web2board como posible virus'
                    }
                ]
            },
            {
                _id: 'w2bVirus',
                title: 'El sistema reconoce web2board como posible virus',
                extData: 'virusForm.html',
                next: []
            },
            {
                _id: 'keepAsking2Install',
                title: 'Bitbloq no deja de pedirme que instale web2board',
                data:
                    '<p>Espere un par de minutos y <strong>reintente el proceso.</strong> La primera vez que se lanza, o si se actualizan las librerías, puede que el proceso tarde, especialmente en sistemas antiguos.</p><p class="support--center"><strong>¿Ha solucionado su problema?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'w2bUndetected',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'w2bUndetected',
                title: 'Bitbloq no detecta web2board',
                data:
                    '<p class="support--center"><strong>Selecione su sistema operativo:</strong></p>',
                next: [
                    {
                        _id: 'w2bUndetectedWindows',
                        class: 'btn--secondary',
                        icon: 'icon--windows icon--big',
                        response: 'Windows'
                    },
                    {
                        _id: 'w2bUndetectedLinux',
                        class: 'btn--secondary',
                        icon: 'icon--linux icon--big',
                        response: 'Linux'
                    },
                    {
                        _id: 'form',
                        class: 'btn--secondary',
                        icon: 'icon--mac icon--big',
                        response: 'Mac'
                    }
                ]
            },
            {
                _id: 'w2bUndetectedWindows',
                title: 'Bitbloq no detecta web2board bajo Windows',
                extData: 'w2bUndetectedWindows.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'w2bUndetectedWindowsProxy',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'w2bUndetectedLinux',
                title: 'Bitbloq no detecta web2board bajo Linux',
                data:
                    '<p>¿<strong>Existe</strong> el fichero <i class="text--secondary">mimeapps.list</i> <strong>y contiene lineas de web2board</strong>?</p><p>El fichero <i class="text--secondary">mimeapps.list</i> ubicado en <span class="common--text-term-fx little">~/.local/share/applications/mimeapps.list</span> tiene que incluir estas líneas:</p><ol class="common--text-editor-fx"><li>[Default Applications]</li><li>#custom handler for bitbloqs web2board:</li><li>x-scheme-handler/web2board=web2board-handler.desktop</li></ol><p>Si no encuentra las líneas en el archivo, añadalas a mano.</p><p class="support--center"><strong>¿Se ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'w2bUndetectedWindowsProxy',
                title: '¿Utiliza un proxy?',
                data:
                    '<p><strong>Si utiiza un proxy</strong>, añadalo a la configuración de web2board:<ul><li class="icon--check">Abra o edite un proyecto</li><li class="icon--check">En el menú, haga click en <span class="common--icon-keycap-fx">ver</span>, <span class="common--icon-keycap-fx">Configuración web2board</span></li><li class="icon--check">Añada los datos de su proxy donde corresponda</li></ul></p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'w2bUndetectedWindowsLocal2Proxy',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'w2bUndetectedWindowsLocal2Proxy',
                title:
                    '¿Tiene configurado que pasen las llamadas locales por el proxy?',
                data:
                    '<p>Si lo tiene configurado para que pasen las llamas locales por el proxy, necesitará deshabilitarlo<ul><li class="icon--check">Presione en el teclado <span class="common--icon-keycap-fx">ctrl</span> + <span class="common--icon-keycap-fx">R</span> para abrir la ventana de ejecución de comandos</li><li class="icon--check">Escriba <span class="common--text-term-fx little">inetcpl.cpl</span> y de al botón de <span class="common--icon-keycap-fx">intro</span></li><li class="icon--check">Haga click en <i class="text--secondary">"Configuración de LAN"</i>, y seleccione <i class="text--secondary">"No usar el servidor proxy para direcciones locales"</i></li></ul></p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'w2bCrash',
                title:
                    'web2board se abre y se cierra rápidamente, incluso mosntrando un error',
                extData: 'w2bCrashForm.html',
                next: []
            },
            {
                _id: 'doesntCompile',
                title: 'web2board no compila',
                data: '<p></p>',
                next: [
                    {
                        _id: 'codeError',
                        class: 'btn--secondary',
                        response: 'Puede haber erratas en el código'
                    },
                    {
                        _id: 'compileStuck',
                        class: 'btn--secondary',
                        response: 'Nunca termina de compilar'
                    },
                    {
                        _id: 'compileASCIIdecode',
                        class: 'btn--secondary',
                        response: 'Recibo un error sobre la codificación ASCII'
                    },
                    {
                        _id: 'compileOther',
                        class: 'btn--secondary',
                        response: 'Tengo un error diferente a los expuestos'
                    }
                ]
            },
            {
                _id: 'codeError',
                title: '¿El mensaje de error avisa de erratas en el código?',
                data:
                    'Por ejemplo:<ul><li class="common--text-term-fx">expected \'(\' before \';\'\'</li><li class="common--text-term-fx">variable example not declared</li></ul></p><p>Si este es el caso, probablemente tenga errores de programación.<br>Le recomendamos que pregunte al respecto en el <a href="/forum" target="_blank" class="icon--url">foro de Bitbloq</a>, incluyendo en el mensaje el programa donde recibe el error.</p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Fin del proceso de soporte'
                    }
                ]
            },
            {
                _id: 'compileStuck',
                title: '¿Nunca termina de compilar?',
                extData: 'compileStuckForm.html',
                next: []
            },
            {
                _id: 'compileASCIIdecode',
                title: '¿Nunca termina de compilar?',
                extData: 'compileASCIIdecode.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Fin del proceso de soporte'
                    }
                ]
            },
            {
                _id: 'compileOther',
                title: '¿Tiene un problema diferente a los expuestos?',
                data:
                    '<p>Le recomendamos que pregunte al respecto en el <a href="/forum" target="_blank" class="icon--url">foro de Bitbloq</a>, incluyendo en el mensaje toda la información pertinente:<ul><li class="icon--check">Cual es el programa donde recibe el error</li><li class="icon--check">Añada el código fuente con el que está trabajando</li><li class="icon--check">Si recibe mensajes de error, inclúyalos</li></ul></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Fin del proceso de soporte'
                    }
                ]
            },
            {
                _id: 'noBoard',
                title: '¿Bitbloq no detecta la placa?',
                data:
                    '<p><strong>¿Está intentando programar Zowi?</strong></p><p>Asegurese que Zowi está <strong>encendido</strong> <i class="text--secondary">(primer botón)</i>, ya que de lo contrario Bitbloq no detectará la placa.</p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'isChromebook',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'isChromebook',
                title: '¿Utiliza un Chromebook?',
                data: '',
                next: [
                    {
                        _id: 'error3020',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'reinstallDrivers',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'reinstallDrivers',
                title: 'Revise los drivers y los permisos',
                data:
                    '<p class="support--centered"><strong>Seleccione el sistema operativo correspondiente</strong></p>',
                next: [
                    {
                        _id: 'reinstallDriversWindows',
                        class: 'btn--primary',
                        icon: 'icon--windows icon--big',
                        response: 'Windows'
                    },
                    {
                        _id: 'reinstallDriversLinux',
                        class: 'btn--primary',
                        icon: 'icon--linux icon--big',
                        response: 'Linux'
                    },
                    {
                        _id: 'reinstallDriversMac',
                        class: 'btn--primary',
                        icon: 'icon--mac icon--big',
                        response: 'Mac'
                    },
                    {
                        _id: 'error3020',
                        class: 'btn--secondary',
                        icon: 'icon--chrome icon--big',
                        response:
                            'Utilizo Chromebook o el modo de compilación online'
                    }
                ]
            },
            {
                _id: 'reinstallDriversMac',
                title: 'Revise los drivers',
                data:
                    '<p><ul><li class="icon--check">Drivers para <a href="https://storage.googleapis.com/bitbloq/drivers/zowi/mac/Mac_OSX_VCP_Driver.zip" target="_blank"><strong>Zowi</strong></a>.</li><li class="icon--check">Drivers para la placa <a href="https://storage.googleapis.com/bitbloq/drivers/zum/mac/FTDIUSBSerialDriver_v2_4_2.dmg" target="_blank"><strong>BQ ZUM Core (BT-328)</strong></a>.</li></ul></p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'error3020',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'No, y estoy usando la compilación online'
                    },
                    {
                        _id: 'bootloader',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'reinstallDriversWindows',
                title: 'Revise los drivers',
                data:
                    '<p><ul><li class="icon--check">Drivers para <a href="https://storage.googleapis.com/bitbloq/drivers/zowi/windows/CP210x_Windows_Drivers.zip" target="_blank"><strong>Zowi</strong></a>.</li><li class="icon--check">Drivers para la placa <a href="https://storage.googleapis.com/bitbloq/drivers/zum/windows/CDM21228_Setup.zip" target="_blank"><strong>BQ ZUM Core (BT-328)</strong></a>.</li><li class="icon--check">Drivers para la placa <a href="https://storage.googleapis.com/bitbloq/drivers/arduino/drivers.zip" target="_blank"><strong>Arduino UNO</strong></a> <i class="">(y basados en ella)</li></ul></p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'error3020',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'No, y estoy usando la compilación online'
                    },
                    {
                        _id: 'bootloader',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'reinstallDriversLinux',
                title: 'Revise los permisos',
                data:
                    '<p>Para las distribuciones de <span class="icon--linux"> Linux</span> no es necesario que instale ningún tipo de drivers, pero es necesario que se asegure de que su usuario es parte del grupo <i class="text--secondary">dialout</i><ul><li class="icon--check">Utilice el comando <span class="common--text-term-fx little">groups <i class="text--secondary">usuario</i></span> para comprobar si su usuario está en el grupo <i class="text--secondary">dialout</i></li><li class="icon--check">Si no está en dicho grupo, utilice el comando <span class="common--text-term-fx little">sudo adduser <i class="text--secondary">usuario</i> dialout</span> para añadirlo</li></ul></p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'error3020',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'No, y estoy usando la compilación online'
                    },
                    {
                        _id: 'bootloader',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'error3020',
                title: '¿Recibe el error "3020 RecieveData timeout 400ms"?',
                data:
                    '<p>Pruebe a <strong>reinicar el ordenador.</strong></p><p>Si <span class="icon--chrome"> Chrome</span> está muy saturado, el proceso de carga puede ralentizarse, causando que la placa deje de responder.</p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'bootloader',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'bootloader',
                title: 'Comprueba que tu placa tiene bootloader',
                data:
                    '<p>¿Qué es un <strong>bootloader</strong>?</p><p>El <i class="text--secondary">bootloader</i> es un programa que se lanza cuando inicias la placa o la reseteas, cuya función es preparar la carga de los nuevos programas. Normalmente se necesita una herramienta especial para cargar los programas; el bootloader simplifica el proceso permitiendo cargarlos mediante el puerto USB.</p><p>¡Asegurese que el bootloader de su placa está instalado <strong>correctamente</strong>!</p><p><strong>¿Cómo compruebo si tengo instalado el Bootloader?:</strong><br>Presiona el botón de <span class="common--icon-keycap-fx">reset</span>, y si bootloader está instalado <strong>debería parpadear el led numero 13</strong></p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'bootloaderZumBT328',
                        class: 'btn--secondary',
                        icon: '',
                        response:
                            '¿Cómo cargo el bootloader en la placa ZUM Core (BT-328)?'
                    },
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: '3020changeUsb',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'bootloaderZumBT328',
                title:
                    '¿Cómo cargo el bootloader en la placa ZUM Core (BT-328)?',
                extData: 'bootloaderZumBT328.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: '3020changeUsb',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: '3020changeUsb',
                title: 'Cambie de puerto USB y pruebe con otro cable',
                data:
                    '<p>Aunque poco probable, tanto el puerto USB donde conecta la placa a su sistema como el propio cable de comunicación pueden deteriorarse.</p><p>Para <strong>descartar</strong> esta posibilidad, pruebe a cambiar de puerto y utilice un cable diferente.</p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: '3020pin01',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: '3020pin01',
                title: '¿Tiene algún componente conectado en los pines 0 y 1?',
                data:
                    '<p>Los pines <i class="text--secondary">0</i> y <i class="text--secondary">1</i> se utilizan para digital i/o y para comunicación en serie <i class="text--secondary">(de la que depende el puerto USB y la conexión por Bluetooth)</i>, por lo que si están en uso se deshabilitará la comunicación con su sistema.</p><p>Para volver a habilitar el puerto USB, libere los pines.<p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: '3020aLotOfPower',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: '3020aLotOfPower',
                title:
                    '¿Tiene muchos componentes conectados o un componente con un consumo alto?',
                data:
                    '<p>Si conecta <strong>muchos componentes</strong> al mismo tiempo, o tiene componentes con un consumo elevado <i class="text--secondary">(como por ejemplo un servomotor)</i>, puede ocurrir que el ordenador no pueda suminsitrar suficiente por el puerto USB.<br><div class="support--icon--giga"><img src="images/support/zum-power.png" /></div><br>Pruebe <strong>apagando la placa</strong> <i class="text--secondary">(botón rojo en posición off)</i> o conectado una fuente de alimentación</p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: '3020btConnected',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: '3020btConnected',
                title: '¿Tiene algún dispositivo conectado por Bluetooth?',
                data:
                    '<p>El puerto de comunicación de la placa es el mismo para la conexión por USB que para conexión por BT, por lo que <strong>no puede conectar al mismo tiempo una placa por ambos sistemas</strong></p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: '3020SO',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: '3020SO',
                title: '¿Que sistema utiliza?',
                data: '',
                next: [
                    {
                        _id: '3020Windows',
                        class: 'btn--secondary',
                        icon: 'icon--windows icon--big',
                        response: 'Windows'
                    },
                    {
                        _id: '3020isModeChromeApp',
                        class: 'btn--secondary',
                        icon: 'icon--linux icon--big',
                        response: 'Linux'
                    },
                    {
                        _id: '3020isModeChromeApp',
                        class: 'btn--secondary',
                        icon: 'icon--mac icon--big',
                        response: 'Mac'
                    },
                    {
                        _id: 'form',
                        class: 'btn--secondary',
                        icon: 'icon--chrome icon--big',
                        response: 'Chromebook'
                    }
                ]
            },
            {
                _id: '3020isModeChromeApp',
                title: '¿Tiene Bitbloq configurado en modo ChromeApp?',
                extData: '3020isModeChromeApp.html',
                next: [
                    {
                        _id: 'form',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si tengo activado el modo Chromeapp'
                    },
                    {
                        _id: '3020logPorts',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No tengo activado el modo Chromeapp'
                    }
                ]
            },
            {
                _id: '3020Windows',
                title: '¿Ha probado a cambiar el puerto COM al que se conecta?',
                data:
                    '<p>Los puertos COM son un tipo de puerto cada vez menos frecuente, pero que en ocasiones aún se puede encontrar en ordenadores antiguos.<br>Es común encontrar estos puertos siendo aprovechados mediante un adaptador conversor a USB.</p><p>Es posible que la configuración del puerto pueda estar dando problemas al estar ya en uso, por lo que <strong>aconsejamos que pruebe a cambiar su numero de puerto COM</strong><ol><li class="icon--check">Presione las teclas <span class="common--icon-keycap-fx">Win</span> + <span class="common--icon-keycap-fx">X</span> para abrir el panel de administración de dispositivos</li>' +
                    '<li class="icon--check">Ve a la sección <i class="text-secondary">"Puertos (COM y LPT)"</i></li><li class="icon--check">Busca el puerto, y en el menú contextual <i class="text-secondary">(botón derecho en el ratón)</i> seleciona "Propiedades"</li><li class="icon--check">Ve a la pestaña de configuración de puerto, y seleciona "Opciones avanzadas"</li><li class="icon--check">En el panel de configuración avanzada, busca la sección de número de puerto COM, y <strong>cambia el numero del puerto a uno que no esté en uso</strong>"</li></ol></p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: '3020isModeChromeApp',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: '3020logPorts',
                title:
                    '¿Muestra algún error respecto a los puertos en el fichero de log?',
                extData: '3020logPorts.html',
                next: [
                    {
                        _id: 'form',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'He encontrado errores'
                    },
                    {
                        _id: '3020ideArduino',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No hay errores'
                    }
                ]
            },
            {
                _id: '3020ideArduino',
                title:
                    '¿Ha probado a cargar la placa en otro entorno de desarollo?',
                data:
                    '<p class="support--center">Por ejemplo, puedes descargar el IDE de Arduino de la <a href="https://www.arduino.cc/en/Main/Software" target="_blank" class="icon--url">web oficial</a></p><p class="support--center"><strong>¿Le detecta la placa el otro entorno de desarrollo?</strong></p>',
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
                        response: 'No detecta la placa'
                    }
                ]
            },
            {
                _id: '3020DeadBoard',
                title: 'Es probable que la placa esté defectuosa',
                data:
                    '<span class="support--icon--giga support--icon--rojo"><i class="fa fa-medkit" aria-hidden="true"></i></span><p class="support--center">Una vez descartadas otras posibilidades, <i class="text-secondary">es probable que su placa esté defectuosa</i>.</p><p class="support--center">Si no es la placa <a href="https://www.bq.com/es/mundo-maker" target="_blank" class="icon--url">BQ ZUM Core (BT-328)</a> <strong>contacte con su fabricante</strong></p>',
                next: [
                    {
                        _id: 'form',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'Es la placa BQ ZUM Core (BT-328)'
                    }
                ]
            },
            {
                _id: 'xp',
                permalink: 'xp',
                title: 'Problemas comunes con Windows XP',
                extData: 'xp.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Fin del proceso de soporte'
                    }
                ]
            },
            {
                _id: 'linux',
                permalink: 'linux',
                title: 'Problemas comunes con Linux no certificados',
                extData: 'linux.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Fin del proceso de soporte'
                    }
                ]
            },
            {
                _id: 'hardware',
                title: '¿Está la placa encendida y bien conectada?',
                data:
                    '<p>Descartemos los errores más frecuentes:</p><ul><li class="icon--check">Compruebe que la placa esté <strong>encendida</strong>.</li><li class="icon--check">Revise que la placa esté <strong>bien conectada</strong>.</li><li class="icon--check">¿Está el componente <strong>conectado correctamente</strong>?.</li></ol></p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'hardQuemado',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'hardQuemado',
                title: '¿Está el componente y el cable en buen estado?',
                data:
                    '<p>Puede que el <i class="text--secondary">componente</i>, el <i class="text--secondary">cable</i> de conexión, el <i class="text--secondary">pin</i> al que se conecta, y el <i class="text--secondary">conector</i> del propio cable <strong>no estén dañados</strong></p><ul><li class="icon--check">Compruebe que el componente no tiene ninguna parte deteriorada o ennegrecida <i class="text--secondary">(quemada)</i>.</li><li class="icon--check">Compruebe que el cable <strong>no está pelado</strong> ni tiene algún segmento ennegrecido <i class="text--secondary">(quemado)</i>.</li><li class="icon--check">Compruebe que el pin al que se conecta no está doblado, suelto <i class="text--secondary">(notará que la pieza "baila")</i>, y que el punto de soldadura a la placa no está deteriorado.</li>' +
                    '<li class="icon--check">Compruebe que el conector del cable <i class="text--secondary">("enchufe")</i> no está deteriorado, y está firmemente unido al cable.</li></ol></p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'hardUSB',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'hardUSB',
                title: '¿Está conectada la placa por USB?',
                data:
                    '<p>Es <strong>imprescindible</strong> que conecte la placa mediante el <strong>puerto USB</strong> para poder realizar las comprobaciones necesarias para continuar el proceso de soporte</p>',
                next: [
                    {
                        _id: 'hardLista',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'La placa está conectada mediante USB'
                    }
                ]
            },
            {
                _id: 'hardLista',
                title: 'Selecione el componente con el que tiene dificultades',
                extData: 'hardLista.html',
                next: []
            },
            {
                _id: 'hardLEDs',
                permalink: 'hardLEDs',
                title: 'Correcta configuración del componente LED',
                extData: 'hardLEDs.html',
                next: [
                    {
                        _id: 'hardLEDsTestIni',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response:
                            'Si, el componente está conectado como en la imagen'
                    }
                ]
            },
            {
                _id: 'hardLEDsTestIni',
                permalink: 'hardLEDs',
                title: 'Test automático del componente LED',
                extData: 'hardLEDsTestIni.html',
                next: []
            },
            {
                _id: 'hardLEDsTestEnd',
                permalink: 'hardLEDsTestEnd',
                title: 'Comprueba visualmente si el LED parpadea',
                data:
                    'Tras cargar nuestro programa de test en su placa, <strong>su componente LED debería estar parpadeando</strong>; y, por lo tanto, <strong>funcionando correctamente</strong>.',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'El LED parpadea'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'El LED no parpadea'
                    }
                ]
            },
            {
                _id: 'hardServos',
                permalink: 'hardServos',
                title: '¿Utiliza un servomotor normal o un miniservo?',
                data: '',
                next: [
                    {
                        _id: 'hardServosNormal',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'Uso un servomotor normal'
                    },
                    {
                        _id: 'hardServosMini',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'Uso un miniservo'
                    }
                ]
            },
            {
                _id: 'hardServosNormal',
                title: '¿Qué fallo observa en su servomotor?',
                data: '',
                next: [
                    {
                        _id: 'hardServosAleatorio',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'No se mueve'
                    },
                    {
                        _id: 'hardServosAleatorio',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'Se mueve aleatoriamente'
                    },
                    {
                        _id: 'hardServosNoPara',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'No para de moverse'
                    }
                ]
            },
            {
                _id: 'hardServosMini',
                title: '¿Qué fallo observa en su miniservo?',
                data: '',
                next: [
                    {
                        _id: 'hardServosAleatorio',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'No se mueve'
                    },
                    {
                        _id: 'hardServosAleatorio',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'Se mueve aleatoriamente'
                    }
                ]
            },
            {
                _id: 'hardServosAleatorio',
                title: 'El servomotor se mueve aleatoriamente o no se mueve',
                data:
                    '<p>¿Ha probado a <strong>enchufar un portapilas</strong>?</p><p>En ocasiones el puerto USB no es capaz de suminsitrar la energía suficiente para que la configuración de la placa pueda activar los servomotores.<br>Usando un <strong>portapilas</strong> podrá descartar dicha posibilidad.</p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'hardServosNoPara',
                title: 'El servomotor no para nunca',
                data:
                    '<p>Es probable que el servomotor necesite ser <stromg>calibrado</strong>:</p><p><ul><li class="icon--check">Observe el lado por donde está situada la salida de los cables.</li><li class="icon--check">Encontrará una endidura circular, en la que mediante un destornillador podrá calibrar el servomotor.</li></ul><p class="support--centered"><img class="support--gif-video" src="images/support/hardServoCalibrate.gif" /></p><ul><li class="icon--check">Como puede observar la imagen, colocando el servomotor con el zocalo frente a usted y los cables hacia la derecha, deberá ajustar el calibrado girando el destornillador en dirección antihoraria</li><li class="icon--check">Recalibre el servomotor hasta que logre la configuración deseada</li></ul></p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'hardLCDs',
                permalink: 'hardLCDs',
                title: '¿Ha conectado bien el componente?',
                extData: 'hardLCDs.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'hardLCDsPalanca',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'hardLCDsPalanca',
                title: '¿Ha seleccionado el modo I/O correcto?',
                data:
                    '<p>En la parte posterior de su componente LCD, se encuentra una palanca que permite seleccionar entre el <strong>modo de comunicación I2C</strong> y SPI</p><p>Solo damos soporte al modo I2C.</p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'hardLCDsASCII',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'hardLCDsASCII',
                title: '¿Está utilizando simbolos "raros"?',
                data:
                    '<p>Su panel LCD solo es compatible con los <a href="images/support/ascii.pdf" target="_blank" class="icon--url">símbolos del código ASCII Reducido</a></p><p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'hardLCDsTestIni',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'hardLCDsTestIni',
                title: 'Test automático del componente LCDs',
                extData: 'hardLCDsTestIni.html',
                next: []
            },
            {
                _id: 'hardLCDsTestEnd',
                permalink: 'hardLCDsTestEnd',
                title: 'Comprueba si el LCD muestra un texto',
                data:
                    'Tras cargar nuestro programa de test en su placa, <strong>su componente LCD debería estar mostrando un texto</strong>; y, por lo tanto, <strong>funcionando correctamente</strong>.',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'El LCD muestra un texto'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'El LCD no muestra un texto'
                    }
                ]
            },
            {
                _id: 'hardUS',
                permalink: 'hardUS',
                title: '¿Ha conectado correctamente el componente?',
                extData: 'hardUS.html',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'hardUSTestIni',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'hardUSTestIni',
                title: 'Test automático del componente Sensor de Ultrasonidos',
                extData: 'hardUSTestIni.html',
                next: []
            },
            {
                _id: 'hardUSTestEnd',
                permalink: 'hardUSTestEnd',
                title: 'Comprueba si el Sensor de Ultrasonidos funciona',
                extData: 'hardUSTestEnd.html',
                next: []
            },
            {
                _id: 'hardBT',
                permalink: 'hardBT',
                title: 'Pines 0-1, y configuración de los conmutadores',
                data:
                    '<p>¿Tiene algún <strong>componente conectado en los pines 0 y 1</strong>?</p><ul><li><p>Los pines <i class="text--secondary">0</i> y <i class="text--secondary">1</i> se utilizan para digital i/o y para comunicación en serie <i class="text--secondary">(de la que depende la conexión por Bluetooth y el puerto USB y )</i>, por lo que si están en uso se deshabilitará la comunicación con su sistema.</p><p>Para volver a habilitar la conexión por Bluetooth, libere los pines.</p></li></ul>' +
                    '<p>¿Cómo cambio la <strong>configuración de los conmutadores</strong>?</p><div class="support--flex"><div><img src="/images/support/zum-bt-comm.png" class="support--rotate90" /></div><div><p><ul><li class="icon--check"><strong>Conmutador 1</strong>:<br> Marcado con una <i class="text--secondary">P de “Power”</i>, apaga y enciende el módulo Bluetooth.</li><li class="icon--check"><strong>Conmutador 2 y 3</strong>:<br> Marcados como <i class="text--secondary">AT</i>. Cuando están conectados, crean una derivación entre el puerto serie del USB y el puerto serie del módulo Bluetooth, permitiendo el acceso directo a la configuración del Bluetooth desde el USB.</li></ul></p></div></div>' +
                    '<p>Accediendo a la configuración del módulo Bluetooth mediante el <strong>AT Command Mode</strong>, podrá cambiar de nombre el identificador de dispositivo, entro otras opciones.</p>',
                next: [
                    {
                        _id: 'hardBTATCommand',
                        class: 'btn--secondary',
                        icon: '',
                        response: 'AT Command Mode'
                    }
                ]
            },
            {
                _id: 'hardBTATCommand',
                title: 'AT Command Mode',
                data:
                    '<p><strong>Consideraciones previas</strong><br>Antes de acceder a los <i class="text--secondary">comandos AT</i> del módulo Bluetooth hay que asegurarse de que el ATMega tiene configurado el pin TX como entrada.<br>En caso de estar configurado como salida puede estar poniendo algún valor en la UART, por lo que el USB y Bluetooth pueden no comunicarse.<br>Existen dos soluciones:<ul><li class="icon--check">Cargar un programa al ATmega que ponga los pines 0 y 1 como entradas.</li><li class="icon--check">Poner un cable que conecte el RESET con GND, para forzar que el ATmega esté en estado de reset.</li></ul></p>' +
                    '<p><strong>Comandos AT del módulo Bluetooth</strong><br>Para acceder a los <i class="text--secondary">comandos AT</i> del módulo Bluetooth sigue los siguientes pasos:<ul><li class="icon--check">Pon todos los conmutadores en <i class="text--secondary">ON</i> y conecta la placa al ordenador mediante el cable USB.</li><li class="icon--check">Dentro de la IDE de Arduino, abre un Monitor Serial a una velocidad de comunicación de <i class="text--secondary">19200 baudios</i> y en el modo <i class="text--secondary">Ambos NL & CR</i> (nueva línea y retorno de carro).</li>' +
                    '<li class="icon--check">Comprueba la comunicación con el módulo Bluetooth enviando por la línea de comandos, el texto <i class="text--secondary">AT</i>. El módulo Bluetooth debería responder con un <i class="text--secondary">OK</i>.</li><li class="icon--check">Si quieres cambiar el nombre de tu módulo Bluetooth, el que muestra a otros dispositivos, envía comando <i class="text--secondary">AT+NAME####</i> donde #### es el nombre que quieras.</li><li class="icon--check">Si quieres modificar la tasa de baudios, envía el comando <i class="text--secondary">AT+BAUD#</i> donde # es un número de referencia a una cantidad de baudios. Por ejemplo: BAUD5 = 19200 , BAUD4 = 9600…</li><li class="icon--check">Tienes disponible la <a href="/images/support/BLK-MD-BC04-B_AT-COMMANDS.pdf" target="_blank">lista completa de comandos AT</a>.</p>' +
                    '<p><strong>NOTA IMPORTANTE</strong>: Cambiando la velocidad de comunicación del módulo Bluetooth de 19200 baudios se deshabilitará la posibilidad de programación vía Bluetooth. Sin embargo, la comunicación serie a través del Bluetooth seguirá estando disponible con la nueva velocidad.</p>' +
                    '<p class="support--center"><strong>¿Ha solucionado su consulta?</strong></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Si'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'No'
                    }
                ]
            },
            {
                _id: 'hard2forum',
                permalink: 'hard2forum',
                title: 'El test no funciona con su configuración',
                data:
                    '<p>Le recomendamos que pregunte al respecto en el <a href="/forum" target="_blank" class="icon--url">foro de Bitbloq</a>, incluyendo en el mensaje toda la información pertinente:<ul><li class="icon--check">¿Cual es la placa con la que tiene el problema?.</li><li class="icon--check">¿Cual es el componente con el que tiene el problema?.</li><li class="icon--check">Añada el código fuente con el que está trabajando, si corresponde.</li><li class="icon--check">Si recibe mensajes de error, inclúyalos.</li></ul></p>',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'Fin del proceso de soporte'
                    }
                ]
            },
            {
                _id: 'hardBuzz',
                permalink: 'hardBuzz',
                title: 'Correcta configuración del componente Zumbador',
                extData: 'hardBuzz.html',
                next: [
                    {
                        _id: 'hardBuzzTestIni',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response:
                            'Si, el componente está conectado como en la imagen'
                    }
                ]
            },
            {
                _id: 'hardBuzzTestIni',
                title: 'Test automático del componente Zumbador',
                extData: 'hardBuzzTestIni.html',
                next: []
            },
            {
                _id: 'hardBuzzTestEnd',
                permalink: 'hardBuzzTestEnd',
                title: 'Comprueba si el Zumbador suena',
                data:
                    'Tras cargar nuestro programa de test en su placa, <strong>su componente Zumbador debería estar sonando</strong>; y, por lo tanto, <strong>funcionando correctamente</strong>.',
                next: [
                    {
                        _id: 'end',
                        class: 'btn--primary',
                        icon: 'icon--ok icon--big',
                        response: 'El Zumbador suena'
                    },
                    {
                        _id: 'form',
                        class: 'btn--primary btn--no',
                        icon: 'icon--no icon--big',
                        response: 'El Zumbador no suena'
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
                    .get('images/components/' + item.uuid + '.svg')
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
                contentHTML: '<div><img src="'+ img + '" /></div>'
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
            common.supportSteps = _.uniqBy(
                common.supportSteps.reverse()
            ).reverse();
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
