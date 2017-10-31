'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:SupportCtrl
 * @description
 * # SupportCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('SupportCtrl', function($translate, $scope, $location, $routeParams, common, _, userApi, feedbackApi, alertsService, $http, $sce, web2boardOnline) {

        $scope.translate = $translate;

        var db = [{
            '_id': 'index',
            'permalink': 'index',
            'dontShowHomeButton': true,
            'title': '¡Bienvenido a la página de soporte de Bitbloq!',
            'data': '<p>Ayudanos a diagnosticar tu caso para que podamos ayudarte.</p><p>¿Usas la <strong>versión Online</strong> de Bitbloq, o la versión <a href="http://bitbloq.bq.com/#/offline" class="icon--url">Offline</a>?</p>',
            'next': [{
                '_id': 'online',
                'class': 'btn--secondary',
                'icon': 'icon--cloud icon--big',
                'response': 'Uso la versión Online'
            }, {
                '_id': 'offline',
                'class': 'btn--secondary',
                'icon': 'icon--desktop icon--big',
                'response': 'Uso la versión Offline'
            }]
        }, {
            '_id': 'end',
            'permalink': 'end',
            'dontShowHomeButton': true,
            'title': '¡Gracias por utilizar el sistema de soporte de Bitbloq!',
            'data': '<span class="support--icon--giga support--icon--ok"><i class="fa fa-check-circle" aria-hidden="true"></i></span>',
            'next': [{
                '_id': 'index',
                'class': 'btn--primary',
                'icon': 'icon--home icon--big',
                'response': 'Volver a el índice'
            }]
        }, {
            '_id': '404',
            'permalink': '404',
            'dontShowHomeButton': true,
            'title': 'No encuentro la página de soporte que buscas...',
            'data': 'Puede que exista un error; Inténtalo de nuevo<br><span class="support--icon--giga support--icon--no"><svg class="svg-icon"><use xlink:href="#warning"></use></svg><span>',
            'next': [{
                '_id': 'index',
                'class': 'btn--primary',
                'icon': 'icon--home icon--big',
                'response': 'Volver a el índice'
            }]
        }, {
            '_id': 'form',
            'permalink': 'form',
            'title': 'Contacta con nuestro soporte técnico',
            'extData': 'contactForm.html',
            'next': []
        }, {
            '_id': 'online',
            'title': 'Por favor, indicanos el motivo de tu consulta:',
            'next': [{
                '_id': 'dontLoad',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'La web no carga',
            }, {
                '_id': 'w2b',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'Tengo dificultades con web2board',
            }, {
                '_id': 'hardware',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'Tengo una incidencia con un componente de hardware',
            }, {
                '_id': 'noBoard',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'No me detecta la placa',
            }, {
                '_id': 'error3020',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'Recibo el error "3020 RecieveData timeout 400ms"'
            }]
        }, {
            '_id': 'offline',
            'title': '',
            'data': '',
            'next': []
        }, {
            '_id': 'dontLoad',
            'title': '¿Tienes problemas cargando la web de Bitbloq?',
            'extData': 'dontLoad.html',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si',
            }, {
                '_id': 'dontLoadSchool',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'No'
            }]
        }, {
            '_id': 'dontLoadSchool',
            'title': '¿Estás en un centro educativo o en alguna infraestructura que pueda estar bajo un proxy?',
            'extData': 'dontLoadSchool.html',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si',
            }, {
                '_id': 'tetering',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'No'
            }]
        }, {
            '_id': 'tetering',
            'title': 'Prueba con el tetering del móvil',
            'data': '<p>Activando la opción de tetering de su móvil, y compartiendo la conexión con su computadora, puede comprobar si carga Bitbloq desde una red diferente.</p><p>Si consigue cargar, tiene un problema en la configuración de su red y/o software ajeno a Bitbloq; contacte con los administradores de la red.</p><p><strong>¿Ha solucionado el problema?</strong></p>',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si',
            }, {
                '_id': 'form',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'No'
            }]
        }, {
            '_id': 'w2b',
            'title': 'Por favor, indicanos el motivo de tu consulta:',
            'next': [{
                '_id': 'doesntInstall',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'web2board no instala',
            }, {
                '_id': 'keepAsking2Install',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'Bitbloq no deja de pedirme que instale web2board',
            }, {
                '_id': 'w2bCrash',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'web2board se abre y cierra rápidamente, incluso mostrando error',
            }, {
                '_id': 'doesntCompile',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'web2board no compila'
            }]
        }, {
            '_id': 'doesntInstall',
            'title': 'No me instala web2board',
            'extData': 'doesntInstall.html',
            'next': [{
                '_id': 'w2bVirus',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'El sistema reconoce web2board como posible virus',
            }]
        }, {
            '_id': 'w2bVirus',
            'dontShowHomeButton': true,
            'title': 'El sistema reconoce web2board como posible virus',
            'extData': 'virusForm.html',
            'next': []
        }, {
            '_id': 'keepAsking2Install',
            'title': 'Bitbloq no deja de pedirme que instale web2board',
            'data': '<p>Espere un par de minutos y <strong>reintente el proceso.</strong> La primera vez que se lanza, o si se actualizan las librerías, puede que el proceso tarde, especialmente en sistemas antiguos.</p><p><strong>¿Ha solucionado su problema?</strong></p>',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si',
            }, {
                '_id': 'w2bUndetected',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'No',
            }]
        }, {
            '_id': 'w2bUndetected',
            'title': 'Bitbloq no detecta web2board',
            'data': '<p>Selecione su sistema operativo:</p>',
            'next': [{
                '_id': 'w2bUndetectedWindows',
                'class': 'btn--secondary',
                'icon': 'icon--windows icon--big',
                'response': 'Windows',
            }, {
                '_id': 'w2bUndetectedLinux',
                'class': 'btn--secondary',
                'icon': 'icon--linux icon--big',
                'response': 'Linux',
            }, {
                '_id': 'w2bUndetectedMac',
                'class': 'btn--secondary',
                'icon': 'icon--mac icon--big',
                'response': 'Mac',
            }]
        }, {
            '_id': 'w2bUndetectedWindows',
            'title': 'Bitbloq no detecta web2board bajo Windows',
            'extData': 'w2bUndetectedWindows.html',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si',
            }, {
                '_id': 'w2bUndetectedWindowsProxy',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'No',
            }]
        }, {
            '_id': 'w2bUndetectedLinux',
            'title': 'Bitbloq no detecta web2board bajo Linux',
            'data': '<p>¿<strong>Existe</strong> el fichero <i class="text--secondary">mimeapps.list</i> <strong>y contiene lineas de web2board</strong>?</p><p>El fichero <i class="text--secondary">mimeapps.list</i> ubicado en <span class="common--text-term-fx little">~/.local/share/applications/mimeapps.list</span> tiene que incluir estas líneas:</p><ol class="common--text-editor-fx"><li>[Default Applications]</li><li>#custom handler for bitbloqs web2board:</li><li>x-scheme-handler/web2board=web2board-handler.desktop</li></ol><p>Si no encuentra las líneas en el archivo, añadalas a mano.</p><p><strong>¿Se ha solucionado su consulta?</strong></p>',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si',
            }, {
                '_id': 'form',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'No',
            }]
        }, {
            '_id': 'w2bUndetectedMac',
            'title': 'Bitbloq no detecta web2board bajo Mac',
            'data': '<p>Para recibir soporte para <span class="icon--mac"> Mac</span>, utilice el formulario de contacto.</p>',
            'next': [{
                '_id': 'form',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'Formulario de contacto',
            }]
        }, {
            '_id': 'w2bUndetectedWindowsProxy',
            'title': '¿Utiliza un proxy?',
            'data': '<p><strong>Si utiiza un proxy</strong>, añadalo a la configuración de web2board:<ul><li class="icon--check">Abra o edite un proyecto</li><li class="icon--check">En el menú, haga click en <span class="common--icon-keycap-fx">ver</span>, <span class="common--icon-keycap-fx">Configuración web2board</span></li><li class="icon--check">Añada los datos de su proxy donde corresponda</li></ul></p><p><strong>¿Ha solucionado su consulta?</strong>',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si',
            }, {
                '_id': 'w2bUndetectedWindowsLocal2Proxy',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'No',
            }]
        }, {
            '_id': 'w2bUndetectedWindowsLocal2Proxy',
            'title': '¿Tiene configurado que pasen las llamadas locales por el proxy?',
            'data': '<p>Si lo tiene configurado para que pasen las llamas locales por el proxy, necesitará deshabilitarlo<ul><li class="icon--check">Presione en el teclado <span class="common--icon-keycap-fx">ctrl</span> + <span class="common--icon-keycap-fx">R</span> para abrir la ventana de ejecución de comandos</li><li class="icon--check">Escriba <span class="common--text-term-fx little">inetcpl.cpl</span> y de al botón de <span class="common--icon-keycap-fx">intro</span></li><li class="icon--check">Haga click en <i class="text--secondary">"Configuración de LAN"</i>, y seleccione <i class="text--secondary">"No usar el servidor proxy para direcciones locales"</i></li></ul></p><p><strong>¿Ha solucionado su consulta?</strong></p>',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si',
            }, {
                '_id': 'form',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'No',
            }]
        }, {
            '_id': 'w2bCrash',
            'title': 'web2board se abre y se cierra rápidamente, incluso mosntrando un error',
            'extData': 'w2bCrashForm.html',
            'next': []
        }, {
            '_id': 'doesntCompile',
            'title': 'web2board no compila',
            'data': '<p></p>',
            'next': [{
                '_id': 'codeError',
                'class': 'btn--secondary',
                'response': 'Puede haber erratas en el código',
            }, {
                '_id': 'compileStuck',
                'class': 'btn--secondary',
                'response': 'Nunca termina de compilar',
            }, {
                '_id': 'compileASCIIdecode',
                'class': 'btn--secondary',
                'response': 'Recibo un error sobre la codificación ASCII',
            }, {
                '_id': 'compileOther',
                'class': 'btn--secondary',
                'response': 'Tengo un error diferente a los expuestos',
            }]
        }, {
            '_id': 'codeError',
            'title': '¿El mensaje de error avisa de erratas en el código?',
            'data': 'Por ejemplo:<ul><li class="common--text-term-fx">expected \'(\' before \';\'\'</li><li class="common--text-term-fx">variable example not declared</li></ul></p><p>Si este es el caso, probablemente tenga errores de programación.<br>Le recomendamos que pregunte al respecto en el <a href="/forum" target="_blank" class="icon--url">foro de Bitbloq</a>, incluyendo en el mensaje el programa donde recibe el error.</p>',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Fin del proceso de soporte',
            }]
        }, {
            '_id': 'compileStuck',
            'title': '¿Nunca termina de compilar?',
            'extData': 'compileStuckForm.html',
            'next': []
        }, {
            '_id': 'compileASCIIdecode',
            'title': '¿Nunca termina de compilar?',
            'extData': 'compileASCIIdecode.html',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Fin del proceso de soporte',
            }]
        }, {
            '_id': 'compileOther',
            'title': '¿Tiene un problema diferente a los expuestos?',
            'data': '<p>Le recomendamos que pregunte al respecto en el <a href="/forum" target="_blank" class="icon--url">foro de Bitbloq</a>, incluyendo en el mensaje toda la información pertinente:<ul><li class="icon--check">Cual es el programa donde recibe el error</li><li class="icon--check">Añada el código fuente con el que está trabajando</li><li class="icon--check">Si recibe mensajes de error, inclúyalos</li></ul></p>',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Fin del proceso de soporte',
            }]
        }, {
            '_id': 'noBoard',
            'title': '¿Bitbloq no detecta la placa?',
            'data': '<p><strong>¿Está intentando programar Zowi?</strong></p><p>Asegurese que Zowi está <strong>encendido</strong> <i class="text--secondary">(primer botón)</i>, ya que de lo contrario Bitbloq no detectará la placa.</p><p><strong>¿Ha solucionado su consulta?</strong></p>',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si',
            }, {
                '_id': 'isChromebook',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'No',
            }]
        }, {
            '_id': 'isChromebook',
            'title': '¿Utiliza un Chromebook?',
            'data': '',
            'next': [{
                '_id': 'error3020',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si',
            }, {
                '_id': 'reinstallDrivers',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'No',
            }]
        }, {
          '_id': 'reinstallDrivers',
          'title': 'Revise los drivers y los permisos',
          'data': '<p>Si está utilizando <span class="icon--windows"> Windows</span>, pruebe a <strong>reinstalar los drivers.</strong></p><p>Si utiliza <span class="icon--linux"> Linux</span>, asegure que su usuario es parte del grupo <i class="text--secondary">dialout</i><ul><li class="icon--check">Utilice el comando <span class="common--text-term-fx little">groups <i class="text--secondary">usuario</i></span> para comprobar si su usuario está en el grupo <i class="text--secondary">dialout</i></li><li class="icon--check">Si no está en dicho grupo, utilice el comando <span class="common--text-term-fx little">sudo adduser <i class="text--secondary">usuario</i> dialout</span> para añadirlo</li></ul></p><p><strong>¿Ha solucionado su consulta?</strong></p>',
          'next': [{
              '_id': 'end',
              'class': 'btn--primary',
              'icon': 'icon--ok icon--big',
              'response': 'Si',
          }, {
              '_id': 'error3020',
              'class': 'btn--secondary',
              'icon': '',
              'response': 'No, y estoy usando la compilación online',
          }, {
              '_id': 'bootloader',
              'class': 'btn--primary btn--no',
              'icon': 'icon--no icon--big',
              'response': 'No',
          }]
        }, {
          '_id': 'error3020',
          'title': '¿Recibe el error "3020 RecieveData timeout 400ms"?',
          'data': '<p>Pruebe a <strong>reinicar el ordenador.</strong></p><p>Si <span class="icon--chrome"> Chrome</span> está muy saturado, el proceso de carga puede ralentizarse, causando que la placa deje de responder.</p><p><strong>¿Ha solucionado su consulta?</strong></p>',
          'next': [{
              '_id': 'end',
              'class': 'btn--primary',
              'icon': 'icon--ok icon--big',
              'response': 'Si',
          }, {
              '_id': 'bootloader',
              'class': 'btn--primary btn--no',
              'icon': 'icon--no icon--big',
              'response': 'No',
          }]
        }, {
          '_id': 'bootloader',
          'title': 'Comprueba que tu placa tiene bootloader',
          'data': '<p>¿Qué es un <strong>bootloader</strong>?</p><p>El <i class="text--secondary">bootloader</i> es un programa que se lanza cuando inicias la placa o la reseteas, cuya función es preparar la carga de los nuevos programas. Normalmente se necesita una herramienta especial para cargar los programas; el bootloader simplifica el proceso permitiendo cargarlos mediante el puerto USB.</p><p>¡Asegurese que el bootloader de su placa está instalado <strong>correctamente</strong>!</p><p><strong>¿Cómo compruebo si tengo instalado el Bootloader?:</strong><br>Presiona el botón de <span class="common--icon-keycap-fx">reset</span>, y si bootloader está instalado <strong>debería parpadear el led numero 13</strong></p><p><strong>¿Ha solucionado su consulta?</strong></p>',
          'next': [{
              '_id': 'bootloaderZumBT328',
              'class': 'btn--secondary',
              'icon': '',
              'response': '¿Cómo cargo el bootloader en la placa ZUM Core (BT-328)?'
          }, {
              '_id': 'end',
              'class': 'btn--primary',
              'icon': 'icon--ok icon--big',
              'response': 'Si'
          }, {
              '_id': '3020changeUsb',
              'class': 'btn--primary btn--no',
              'icon': 'icon--no icon--big',
              'response': 'No'
          }]
        }, {
          '_id': 'bootloaderZumBT328',
          'title': '¿Cómo cargo el bootloader en la placa ZUM Core (BT-328)?',
          'extData': 'bootloaderZumBT328.html',
          'next': [{
              '_id': 'end',
              'class': 'btn--primary',
              'icon': 'icon--ok icon--big',
              'response': 'Si'
          }, {
              '_id': '3020changeUsb',
              'class': 'btn--primary btn--no',
              'icon': 'icon--no icon--big',
              'response': 'No'
          }]
        }, {
          '_id': '3020changeUsb',
          'title': 'Cambie de puerto USB y pruebe con otro cable',
          'data': '<p>Aunque poco probable, tanto el puerto USB donde conecta la placa a su sistema como el propio cable de comunicación pueden deteriorarse.</p><p>Para <strong>descartar</strong> esta posibilidad, pruebe a cambiar de puerto y utilice un cable diferente.</p><p><strong>¿Ha solucionado su consulta?</strong></p>',
          'next': [{
              '_id': 'end',
              'class': 'btn--primary',
              'icon': 'icon--ok icon--big',
              'response': 'Si',
          }, {
              '_id': '3020pin01',
              'class': 'btn--primary btn--no',
              'icon': 'icon--no icon--big',
              'response': 'No',
          }]
        }, {
          '_id': '3020pin01',
          'title': '¿Tiene algún componente conectado en los pines 0 y 1?',
          'data': '<p>Los pines <i class="text--secondary">0</i> y <i class="text--secondary">1</i> se utilizan para digital i/o y para comunicación en serie <i class="text--secondary">(de la que depende el puerto USB y la conexión por Bluetooth)</i>, por lo que si están en uso se deshabilitará la comunicación con su sistema.</p><p>Para volver a habilitar el puerto USB, libere los pines.<p><strong>¿Ha solucionado su consulta?</strong></p>',
          'next': [{
              '_id': 'end',
              'class': 'btn--primary',
              'icon': 'icon--ok icon--big',
              'response': 'Si',
          }, {
              '_id': '3020aLotOfPower',
              'class': 'btn--primary btn--no',
              'icon': 'icon--no icon--big',
              'response': 'No',
          }]
        }, {
          '_id': '3020aLotOfPower',
          'title': '¿Tiene muchos componentes conectados o un componente con un consumo alto?',
          'data': '<p>Si conecta <strong>muchos componentes</strong> al mismo tiempo, o tiene componentes con un consumo elevado <i class="text--secondary">(como por ejemplo un servomotor)</i>, puede ocurrir que el ordenador no pueda suminsitrar suficiente por el puerto USB.<br><div class="support--icon--giga"><img src="images/support/zum-power.png" /></div><br>Pruebe <strong>apagando la placa</strong> <i class="text--secondary">(botón rojo en posición off)</i> o conectado una fuente de alimentación</p><p><strong>¿Ha solucionado su consulta?</strong></p>',
          'next': [{
              '_id': 'end',
              'class': 'btn--primary',
              'icon': 'icon--ok icon--big',
              'response': 'Si',
          }, {
              '_id': '3020btConnected',
              'class': 'btn--primary btn--no',
              'icon': 'icon--no icon--big',
              'response': 'No',
          }]
        }, {
          '_id': '3020btConnected',
          'title': '¿Tiene algún dispositivo conectado por Bluetooth?',
          'data': '<p>El puerto de comunicación de la placa es el mismo para la conexión por USB que para conexión por BT, por lo que <strong>no puede conectar al mismo tiempo una placa por ambos sistemas</strong></p><p><strong>¿Ha solucionado su consulta?</strong></p>',
          'next': [{
              '_id': 'end',
              'class': 'btn--primary',
              'icon': 'icon--ok icon--big',
              'response': 'Si',
          }, {
              '_id': '3020SO',
              'class': 'btn--primary btn--no',
              'icon': 'icon--no icon--big',
              'response': 'No',
          }]
        }, {
          '_id': '3020SO',
          'title': '¿Que sistema utiliza?',
          'data': '',
          'next': [{
              '_id': '3020Windows',
              'class': 'btn--secondary',
              'icon': 'icon--windows icon--big',
              'response': 'Windows',
          }, {
              '_id': '3020isModeChromeApp',
              'class': 'btn--secondary',
              'icon': 'icon--linux icon--big',
              'response': 'Linux',
          }, {
              '_id': '3020isModeChromeApp',
              'class': 'btn--secondary',
              'icon': 'icon--mac icon--big',
              'response': 'Mac',
          }, {
              '_id': 'form',
              'class': 'btn--secondary',
              'icon': 'icon--chrome icon--big',
              'response': 'Chromebook',
          }]
        }, {
          '_id': '3020isModeChromeApp',
          'title': '¿Tiene Bitbloq configurado en modo ChromeApp?',
          'extData': '3020isModeChromeApp.html',
          'next': [{
              '_id': 'form',
              'class': 'btn--primary',
              'icon': 'icon--ok icon--big',
              'response': 'Si tengo activado el modo Chromeapp',
          }, {
              '_id': '3020logPorts',
              'class': 'btn--primary btn--no',
              'icon': 'icon--no icon--big',
              'response': 'No tengo activado el modo Chromeapp',
          }]
        }, {
          '_id': '3020Windows',
          'title': '¿Ha probado a cambiar el puerto COM al que se conecta?',
          'data': '<p>Los puertos COM son un tipo de puerto cada vez menos frecuente, pero que en ocasiones aún se puede encontrar en ordenadores antiguos.<br>Es común encontrar estos puertos siendo aprovechados mediante un adaptador conversor a USB.</p><p>Es posible que la configuración del puerto pueda estar dando problemas al estar ya en uso, por lo que <strong>aconsejamos que pruebe a cambiar su numero de puerto COM</strong><ol><li class="icon--check">Presione las teclas <span class="common--icon-keycap-fx">Win</span> + <span class="common--icon-keycap-fx">X</span> para abrir el panel de administración de dispositivos</li>' +
                '<li class="icon--check">Ve a la sección <i class="text-secondary">"Puertos (COM y LPT)"</i></li><li class="icon--check">Busca el puerto, y en el menú contextual <i class="text-secondary">(botón derecho en el ratón)</i> seleciona "Propiedades"</li><li class="icon--check">Ve a la pestaña de configuración de puerto, y seleciona "Opciones avanzadas"</li><li class="icon--check">En el panel de configuración avanzada, busca la sección de número de puerto COM, y <strong>cambia el numero del puerto a uno que no esté en uso</strong>"</li></ol></p><p><strong>¿Ha solucionado su consulta?</strong></p>',
          'next': [{
              '_id': 'end',
              'class': 'btn--primary',
              'icon': 'icon--ok icon--big',
              'response': 'Si',
          }, {
              '_id': '3020isModeChromeApp',
              'class': 'btn--primary btn--no',
              'icon': 'icon--no icon--big',
              'response': 'No',
          }]
        }, {
          '_id': '3020logPorts',
          'title': '¿Muestra algún error respecto a los puertos en el fichero de log?',
          'extData': '3020logPorts.html',
          'next': [{
              '_id': 'form',
              'class': 'btn--primary',
              'icon': 'icon--ok icon--big',
              'response': 'He encontrado errores',
          }, {
              '_id': '3020ideArduino',
              'class': 'btn--primary btn--no',
              'icon': 'icon--no icon--big',
              'response': 'No hay errores',
          }]
        }, {
          '_id': '3020ideArduino',
          'title': '¿Ha probado a cargar la placa en otro entorno de desarollo?',
          'data': '<p>Por ejemplo, puedes descargar el IDE de Arduino de la <a href="https://www.arduino.cc/en/Main/Software" target="_blank" class="icon--url">web oficial</a></p><p><strong>¿Le detecta la placa el otro entorno de desarrollo?</strong></p>',
          'next': [{
              '_id': 'form',
              'class': 'btn--primary',
              'icon': 'icon--ok icon--big',
              'response': 'Si detecta la placa',
          }, {
              '_id': '3020DeadBoard',
              'class': 'btn--primary btn--no',
              'icon': 'icon--no icon--big',
              'response': 'No detecta la placa',
          }]
        }, {
          '_id': '3020DeadBoard',
          'title': 'Es probable que la placa esté defectuosa',
          'data': '<span class="support--icon--giga support--icon--rojo"><i class="fa fa-medkit" aria-hidden="true"></i></span><p>Una vez descartadas otras posibilidades, <i class="text-secondary">es probable que su placa esté defectuosa</i>.</p><p>Si no es la placa <a href="https://www.bq.com/es/mundo-maker" target="_blank" class="icon--url">BQ ZUM Core (BT-328)</a> <strong>contacte con su fabricante</strong></p>',
          'next': [{
              '_id': 'form',
              'class': 'btn--secondary',
              'icon': '',
              'response': 'Es la placa BQ ZUM Core (BT-328)',
          }]
        }, {
            '_id': 'xp',
            'title': 'Problemas comunes con Windows XP',
            'extData': 'xp.html',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Fin del proceso de soporte',
            }]
        }, {
            '_id': 'linux',
            'title': 'Problemas comunes con Linux no certificados',
            'extData': 'linux.html',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Fin del proceso de soporte',
            }]
        }, {
            '_id': 'hardware',
            'title': '¿Está la placa encendida y bien conectada?',
            'data': '<p>Descartemos los errores más frecuentes:</p><ul><li class="icon--check">Compruebe que la placa esté <strong>encendida</strong>.</li><li class="icon--check">Revise que la placa esté <strong>bien conectada</strong>.</li><li class="icon--check">¿Está el componente <strong>conectado correctamente</strong>?.</li></ol></p><p><strong>¿Ha solucionado su consulta?</strong></p>',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si',
            }, {
                '_id': 'hardQuemado',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'No',
            }]
        }, {
            '_id': 'hardQuemado',
            'title': '¿Está el componente y el cable en buen estado?',
            'data': '<p>Puede que el <i class="text--secondary">componente</i>, el <i class="text--secondary">cable</i> de conexión, el <i class="text--secondary">pin</i> al que se conecta, y el <i class="text--secondary">conector</i> del propio cable <strong>no estén dañados</strong></p><ul><li class="icon--check">Compruebe que el componente no tiene ninguna parte deteriorada o ennegrecida <i class="text--secondary">(quemada)</i>.</li><li class="icon--check">Compruebe que el cable <strong>no está pelado</strong> ni tiene algún segmento ennegrecido <i class="text--secondary">(quemado)</i>.</li><li class="icon--check">Compruebe que el pin al que se conecta no está doblado, suelto <i class="text--secondary">(notará que la pieza "baila")</i>, y que el punto de soldadura a la placa no está deteriorado.</li>' +
                '<li class="icon--check">Compruebe que el conector del cable <i class="text--secondary">("enchufe")</i> no está deteriorado, y está firmemente unido al cable.</li></ol></p><p><strong>¿Ha solucionado su consulta?</strong></p>',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si',
            }, {
                '_id': 'hardUSB',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'No',
            }]
        }, {
            '_id': 'hardUSB',
            'title': '¿Está conectada la placa por USB?',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si',
            }, {
                '_id': 'hardLista',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'No',
            }]
        }, {
            '_id': 'hardLista',
            'title': 'Selecione el componente con el que tiene dificultades',
            'extData': 'hardLista.html',
            'next': []
        }, {
            '_id': 'hardLEDs',
            'permalink': 'hardLEDs',
            'title': 'Correcta configuración del componente LED',
            'data': '<p>En la siguiente imagen puede observar cómo se realiza la correcta conexión de los cables, tanto a la placa como al componente.</p><p>Es <strong>necesario</strong> que conecte el componente <strong>exactamente igual que en la imagen</strong> para que podamos lanzar un test automático.</p><p class="support--centered"><img class="support--gif-video" src="" alt="hardLEDsCables" /><ul><li class="icon--exclamation support--centered"><i class="text--secondary">Asegurese de que todo está conectado tal y como le indicamos.</i></li></ul></p><p><strong>¿Ha conectado bien el componente?</strong></p>',
            'next': [{
                '_id': 'hardLEDsTestIni',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si, el componente está conectado como en la imagen',
            }]
        }, {
            '_id': 'hardLEDsTestIni',
            'permalink': 'hardLEDs',
            'title': 'Test automático del componente LED',
            'extData': 'hardLEDsTestIni.html',
            'next': []
        }, {
            '_id': 'hardLEDsTestEnd',
            'title': 'Hagamos un test al componente',
            'data': 'hardLEDsTest',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'El LED parpadea',
            }, {
                '_id': 'form',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'El LED no parpadea',
            }]
        }, {
            '_id': 'hardServos',
            'permalink': 'hardServos',
            'title': '¿Utiliza un servomotor normal o un miniservo?',
            'data': '',
            'next': [{
                '_id': 'hardServosNormal',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'Uso un servomotor normal',
            }, {
                '_id': 'hardServosMini',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'Uso un miniservo',
            }]
        }, {
            '_id': 'hardServosNormal',
            'title': '¿Qué fallo observa en su servomotor?',
            'data': '',
            'next': [{
                '_id': 'hardServosAleatorio',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'No se mueve',
            }, {
                '_id': 'hardServosAleatorio',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'Se mueve aleatoriamente',
            },{
                '_id': 'hardServosNoPara',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'No para de moverse',
            }]
        }, {
            '_id': 'hardServosMini',
            'title': '¿Qué fallo observa en su miniservo?',
            'data': '',
            'next': [{
                '_id': 'hardServosAleatorio',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'No se mueve',
            }, {
                '_id': 'hardServosAleatorio',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'Se mueve aleatoriamente',
            }]
        }, {
            '_id': 'hardServosAleatorio',
            'title': 'El servomotor se mueve aleatoriamente o no se mueve',
            'data': '<p>¿Ha probado a <strong>enchufar un portapilas</strong>?</p><p>En ocasiones el puerto USB no es capaz de suminsitrar la energía suficiente para que la configuración de la placa pueda activar los servomotores.<br>Usando un <strong>portapilas</strong> podrá descartar dicha posibilidad.</p><p><strong>¿Ha solucionado su consulta?</strong></p>',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si',
            }, {
                '_id': 'form',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'No',
            }]
        }, {
            '_id': 'hardServosNoPara',
            'title': 'El servomotor no para nunca',
            'data': '<p>Es probable que el servomotor necesite ser <stromg>calibrado</strong>:</p><p><ul><li class="icon--check">Observe el lado por donde está situada la salida de los cables.</li><li class="icon--check">Encontrará una endidura circular, en la que mediante un destornillador podrá calibrar el servomotor.</li></ul><p class="support--centered"><img class="support--gif-video" src="images/support/hardServoCalibrate.gif" /></p><ul><li class="icon--check">Como puede observar la imagen, colocando el servomotor con el zocalo frente a usted y los cables hacia la derecha, deberá ajustar el calibrado girando el destornillador en dirección antihoraria</li><li class="icon--check">Recalibre el servomotor hasta que logre la configuración deseada</li></ul></p><p><strong>¿Ha solucionado su consulta?</strong></p>',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si',
            }, {
                '_id': 'form',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'No',
            }]
        }, {
            '_id': 'hardLCDs',
            'permalink': 'hardLCDs',
            'title': 'Selecione el componente con el que tiene dificultades',
            'data': 'lcds',
            'next': []
        }, {
            '_id': 'hardUS',
            'permalink': 'hardUS',
            'title': 'Selecione el componente con el que tiene dificultades',
            'data': 'Ultrasonidos',
            'next': []
        }, {
            '_id': 'hardBT',
            'permalink': 'hardBT',
            'title': 'Pines 0-1, y configuración de los conmutadores',
            'data': '<p>¿Tiene algún <strong>componente conectado en los pines 0 y 1</strong>?</p><ul><li><p>Los pines <i class="text--secondary">0</i> y <i class="text--secondary">1</i> se utilizan para digital i/o y para comunicación en serie <i class="text--secondary">(de la que depende la conexión por Bluetooth y el puerto USB y )</i>, por lo que si están en uso se deshabilitará la comunicación con su sistema.</p><p>Para volver a habilitar la conexión por Bluetooth, libere los pines.</p></li></ul>' +
                '<p>¿Cómo cambio la <strong>configuración de los conmutadores</strong>?</p><div class="support--flex"><div><img src="/images/support/zum-bt-comm.png" class="support--rotate90" /></div><div><p><ul><li class="icon--check"><strong>Conmutador 1</strong>:<br> Marcado con una <i class="text--secondary">P de “Power”</i>, apaga y enciende el módulo Bluetooth.</li><li class="icon--check"><strong>Conmutador 2 y 3</strong>:<br> Marcados como <i class="text--secondary">AT</i>. Cuando están conectados, crean una derivación entre el puerto serie del USB y el puerto serie del módulo Bluetooth, permitiendo el acceso directo a la configuración del Bluetooth desde el USB.</li></ul></p></div></div>' +
                '<p>Accediendo a la configuración del módulo Bluetooth mediante el <strong>AT Command Mode</strong>, podrá cambiar de nombre el identificador de dispositivo, entro otras opciones.</p>',
            'next': [{
                '_id': 'hardBTATCommand',
                'class': 'btn--secondary',
                'icon': '',
                'response': 'AT Command Mode',
            }]
        }, {
            '_id': 'hardBTATCommand',
            'title': 'AT Command Mode',
            'data': '<p><strong>Consideraciones previas</strong><br>Antes de acceder a los <i class="text--secondary">comandos AT</i> del módulo Bluetooth hay que asegurarse de que el ATMega tiene configurado el pin TX como entrada.<br>En caso de estar configurado como salida puede estar poniendo algún valor en la UART, por lo que el USB y Bluetooth pueden no comunicarse.<br>Existen dos soluciones:<ul><li class="icon--check">Cargar un programa al ATmega que ponga los pines 0 y 1 como entradas.</li><li class="icon--check">Poner un cable que conecte el RESET con GND, para forzar que el ATmega esté en estado de reset.</li></ul></p>' +
                '<p><strong>Comandos AT del módulo Bluetooth</strong><br>Para acceder a los <i class="text--secondary">comandos AT</i> del módulo Bluetooth sigue los siguientes pasos:<ul><li class="icon--check">Pon todos los conmutadores en <i class="text--secondary">ON</i> y conecta la placa al ordenador mediante el cable USB.</li><li class="icon--check">Dentro de la IDE de Arduino, abre un Monitor Serial a una velocidad de comunicación de <i class="text--secondary">19200 baudios</i> y en el modo <i class="text--secondary">Ambos NL & CR</i> (nueva línea y retorno de carro).</li>' +
                '<li class="icon--check">Comprueba la comunicación con el módulo Bluetooth enviando por la línea de comandos, el texto <i class="text--secondary">AT</i>. El módulo Bluetooth debería responder con un <i class="text--secondary">OK</i>.</li><li class="icon--check">Si quieres cambiar el nombre de tu módulo Bluetooth, el que muestra a otros dispositivos, envía comando <i class="text--secondary">AT+NAME####</i> donde #### es el nombre que quieras.</li><li class="icon--check">Si quieres modificar la tasa de baudios, envía el comando <i class="text--secondary">AT+BAUD#</i> donde # es un número de referencia a una cantidad de baudios. Por ejemplo: BAUD5 = 19200 , BAUD4 = 9600…</li><li class="icon--check">Tienes disponible la lista completa de comandos AT en el siguiente enlace: BLK-MD-BC04-B_AT COMMANDS</p>' +
                '<p><strong>NOTA IMPORTANTE</strong>: Cambiando la velocidad de comunicación del módulo Bluetooth de 19200 baudios se deshabilitará la posibilidad de programación vía Bluetooth. Sin embargo, la comunicación serie a través del Bluetooth seguirá estando disponible con la nueva velocidad.</p>' +
                '<p><strong>¿Ha solucionado su consulta?</strong></p>',
            'next': [{
                '_id': 'end',
                'class': 'btn--primary',
                'icon': 'icon--ok icon--big',
                'response': 'Si',
            }, {
                '_id': 'form',
                'class': 'btn--primary btn--no',
                'icon': 'icon--no icon--big',
                'response': 'No',
            }]
        }];

        var getCard = function(id, isPermalink) {
            return db.filter(function(card) {
                return id === ((isPermalink) ? card.permalink : card._id)
            }).pop()
        }

        var currentId = ($routeParams.id !== undefined) ? $routeParams.id : getCard('index', true)._id
        $scope.card = getCard(currentId)
        if ($scope.card === undefined || $scope.card.title === '') {
            $scope.card = getCard('404', true)
            currentId = $scope.card._id
        }
        // if f5 -> at least it will save current state
        if (_.last(common.supportSteps) !== $scope.card.title && $scope.card.permalink !== 'index') {
            common.supportSteps.push($scope.card.title)
        }

        $scope.go = function(childId, isPermalink) {
          if (childId) {
            var child = (isPermalink) ? getCard(childId, true) : getCard(childId, false)
            if (child && !isPermalink) {
                common.supportSteps.push(child.title)
                $location.path('/support/' + child._id)
            } else {
                var childIndex = getCard('index', true)
                if (childId === childIndex._id) {
                  common.supportSteps = []
                  $location.path('/support')
                } else {
                  common.supportSteps.push(child.title)
                  $location.path('/support/' + childId)
                }
            }
          } else {
            console.warn('Se está intentando acceder a un botón sin childId', childId, isPermalink);
          }
        }

        // switches
        common.itsUserLoaded()
          .then(function() {
            $scope.user = common.user
            $scope.switchUserChromeAppMode = function() {
                userApi.update({chromeapp: common.user.chromeapp})
            }
        })

        // lists
        $scope.components = [{
          'uuid': 'led',
          'category': 'leds',
          'name': 'LED',
          'permalink': 'hardLEDs',
          'svg': ''
        }, {
          'uuid': 'servo',
          'category': 'servos',
          'name': 'Servomotor',
          'permalink': 'hardServos',
          'svg': ''
        }, {
          'uuid': 'lcd',
          'category': 'lcds',
          'name': 'LCD',
          'permalink': 'hardLCDs',
          'svg': ''
        }, {
          'uuid': 'us',
          'category': 'us',
          'name': 'Ultrasonidos',
          'permalink': 'hardUS',
          'svg': ''
        }, {
          'uuid': 'bt',
          'category': 'bt',
          'name': 'Bluetooth',
          'permalink': 'hardBT',
          'svg': ''
        }, {
          'uuid': 'other',
          'category': 'otro',
          'name': 'Otro',
          'permalink': 'form',
          'svg': ''
        }]

        $scope.getSVG = function(item){
          if(item.svg === ''){
            $http.get('images/components/'+ item.uuid + '.svg')
              .then(function(res){
                  item.svg = res.data
              });
          }
        }

        $scope.renderSVG = function(item) {
          return $sce.trustAsHtml(item.svg) // all of this for the svg animations to fly! :)
        }

        // hw test
        var hexLed = ':100000000C945C000C946E000C946E000C946E00CA\r\n' +
                    ':100010000C946E000C946E000C946E000C946E00A8' +
                    ':100020000C946E000C946E000C946E000C946E0098' +
                    ':100030000C946E000C946E000C946E000C946E0088' +
                    ':100040000C9415010C946E000C946E000C946E00D0' +
                    ':100050000C946E000C946E000C946E000C946E0068' +
                    ':100060000C946E000C946E00000000002400270029' +
                    ':100070002A0000000000250028002B0004040404CE' +
                    ':100080000404040402020202020203030303030342' +
                    ':10009000010204081020408001020408102001021F' +
                    ':1000A00004081020000000080002010000030407FB' +
                    ':1000B000000000000000000011241FBECFEFD8E0B8' +
                    ':1000C000DEBFCDBF21E0A0E0B1E001C01D92A930AC' +
                    ':1000D000B207E1F70E945F010C94CE010C9400007E' +
                    ':1000E000E1EBF0E02491EDE9F0E09491E9E8F0E053' +
                    ':1000F000E491EE2309F43BC0222339F1233091F03F' +
                    ':1001000038F42130A9F0223001F524B52F7D12C03A' +
                    ':10011000273091F02830A1F02430B9F420918000EC' +
                    ':100120002F7D03C0209180002F77209380000DC089' +
                    ':1001300024B52F7724BD09C02091B0002F7703C0CC' +
                    ':100140002091B0002F7D2093B000F0E0EE0FFF1F54' +
                    ':10015000EE58FF4FA591B4912FB7F894EC9181110F' +
                    ':1001600003C090959E2301C09E2B9C932FBF0895A2' +
                    ':100170003FB7F8948091050190910601A091070185' +
                    ':10018000B091080126B5A89B05C02F3F19F0019634' +
                    ':10019000A11DB11D3FBFBA2FA92F982F8827820F0D' +
                    ':1001A000911DA11DB11DBC01CD0142E0660F771F5D' +
                    ':1001B000881F991F4A95D1F708958F929F92AF9209' +
                    ':1001C000BF92CF92DF92EF92FF920E94B8004B0154' +
                    ':1001D0005C0180EDC82E87E0D82EE12CF12C0E9426' +
                    ':1001E000B800DC01CB0188199909AA09BB09883E2E' +
                    ':1001F0009340A105B10558F021E0C21AD108E108E9' +
                    ':10020000F10888EE880E83E0981EA11CB11CC11471' +
                    ':10021000D104E104F10419F7FF90EF90DF90CF9043' +
                    ':10022000BF90AF909F908F9008951F920F920FB63E' +
                    ':100230000F9211242F933F938F939F93AF93BF936C' +
                    ':100240008091010190910201A0910301B0910401FC' +
                    ':100250003091000123E0230F2D3720F40196A11DDA' +
                    ':10026000B11D05C026E8230F0296A11DB11D2093E4' +
                    ':1002700000018093010190930201A0930301B093C8' +
                    ':1002800004018091050190910601A0910701B091B0' +
                    ':1002900008010196A11DB11D8093050190930601EF' +
                    ':1002A000A0930701B0930801BF91AF919F918F91E7' +
                    ':1002B0003F912F910F900FBE0F901F90189578943B' +
                    ':1002C00084B5826084BD84B5816084BD85B582605B' +
                    ':1002D00085BD85B5816085BD80916E00816080930C' +
                    ':1002E0006E00109281008091810082608093810075' +
                    ':1002F0008091810081608093810080918000816085' +
                    ':10030000809380008091B10084608093B1008091DF' +
                    ':10031000B00081608093B00080917A008460809307' +
                    ':100320007A0080917A00826080937A0080917A00CE' +
                    ':10033000816080937A0080917A00806880937A004F' +
                    ':100340001092C100EDE9F0E02491E9E8F0E0849139' +
                    ':10035000882399F090E0880F991FFC01E859FF4F1E' +
                    ':10036000A591B491FC01EE58FF4F859194918FB700' +
                    ':10037000F894EC91E22BEC938FBFC0E0D0E081E0E9' +
                    ':100380000E9470000E94DD0080E00E9470000E94C8' +
                    ':10039000DD002097A1F30E940000F1CFF894FFCF79' +
                    ':00000001FF\r\n'

        $scope.hwTestStart = function(component,board) {
          switch (component) {
            case 'led':
              if (board === 'bqzum') {
                web2boardOnline.upload({
                  board: {
                    mcu: 'bt328'
                  },
                  hex: hexLed
                }).then(function(res) {
                  console.log('OK => ', res);
                }).catch(function(err) {
                  console.log('FAIL => ', err);
                })
              } else {
                web2boardOnline.upload({
                  board: {
                    mcu: 'uno'
                  },
                  hex: hexLed
                }).then(function(res) {
                  console.log('OK => ', res);
                }).catch(function(err) {
                  console.log('FAIL => ', err);
                })
              }
              break;
          }
        }

        // form
        $scope.response = {
          'message': '',
          // 'code': '',
          'error': '',
          'system': '',
          'antivirus': '',
          'linklog': '',
          'w2blog': ''
         }
        // sometimes the user go back and forth...
        // lets clean the steps!
        $scope.getSteps = function() {
          common.supportSteps = _.uniqBy(common.supportSteps.reverse()).reverse()
          return common.supportSteps.join('</li><li>')
        }
        $scope.send = function() {
          var str = ''
          // message
          // /r/n -> <br />
          if ($scope.response.message.length > 0) {
            str += '<div><pre>'
            str += unHTMLfy($scope.response.message)
            str += '</pre></div>'
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
            str += '<br><hr><strong>Error:</strong><br>'
            str += '<div style="border: 1px dashed #B8282A; padding: 5px; margin: 5px;"><pre>'
            str += unHTMLfy($scope.response.error)
            str += '</pre></div>'
          }
          // system
          if ($scope.response.system.length > 0) {
            str += '<p><strong>Sistema Operativo: </strong><pre>'
            str += unHTMLfy($scope.response.system)
            str += '</pre></p>'
          }
          // antivirus
          if ($scope.response.antivirus.length > 0) {
            str += '<p><strong>Antivirus: </strong><pre>'
            str += unHTMLfy($scope.response.antivirus)
            str += '</pre></p>'
          }
          // linklog
          if ($scope.response.linklog.length > 0) {
            str += '<br><hr><strong>web2boardLink.log:</strong><br>'
            str += '<div style="border: 1px dashed #B8282A; padding: 5px; margin: 5px;"><pre>'
            str += unHTMLfy($scope.response.linklog)
            str += '</pre></div>'
          }
          // w2blog
          if ($scope.response.w2blog.length > 0) {
            str += '<br><hr><strong>web2board/info.log:</strong><br>'
            str += '<div style="border: 1px dashed #B8282A; padding: 5px; margin: 5px;"><pre>'
            str += unHTMLfy($scope.response.w2blog)
            str += '</pre></div>'
          }
          // adding steps list
          str += '<br><hr><strong>Camino:</strong><br><ol><li>'
          str += $scope.getSteps()
          str += '</li></ol>'

          var res = {
            'creator': common.user,
            'message': str,
            'userAgent':  window.navigator.userAgent
          }

          feedbackApi.send(res)
            .success(function () {
                alertsService.add({
                    text: 'modal-comments-done',
                    id: 'modal-comments',
                    type: 'ok',
                    time: 5000
                });
            }).error(function () {
                alertsService.add({
                    text: 'modal-comments-error',
                    id: 'modal-comments',
                    type: 'warning'
                });
            });
        }

        var unHTMLfy = function(str) {
          return str.replace(/(?:&)/g, '&amp;')
          .replace(/(?:<)/g, '&lt;')
          .replace(/(?:>)/g, '&gt;')
          .replace(/\u00a0/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/(?:\r\n|\r|\n)/g, '<br />')
        }

    });
