'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:SupportCtrl
 * @description
 * # SupportCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('SupportCtrl', function($translate, $scope, $location, $routeParams, common, _, userApi, feedbackApi, alertsService) {

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
            'data': '<span class="support--icon--giga support--icon--ok"><i class="fa fa-check-circle" aria-hidden="true"></i><span>',
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
            'data': '<p>Para recibir soporte para <span class="icon--mac"> Mac</span>, utilice el formulario de contacto</p>',
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
          '_id': 'error3020',
          'title': '¿Recibo el error "3020 RecieveData timeout 400ms"?',
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
          'data': '<span class="support--icon--giga support--icon--rojo"><i class="fa fa-medkit" aria-hidden="true"></i><span><p>Una vez descartadas otras posibilidades, <i class="text-secondary">es probable que su placa esté defectuosa</i>.</p><p>Si no es la placa <a href="https://www.bq.com/es/mundo-maker" target="_blank" class="icon--url">BQ ZUM Core (BT-328)</a> <strong>contacte con su fabricante</strong></p>',
          'next': [{
              '_id': 'form',
              'class': 'btn--secondary',
              'icon': '',
              'response': 'Es la placa BQ ZUM Core (BT-328)',
          }]
        }, {
            '_id': 'xp',
            'permalink': 'xp',
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
            'permalink': 'linux',
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
            'title': '',
            'next': []
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

        // form
        $scope.response = {
          'message': '',
          // 'code': '',
          'error': '',
          'system': '',
          'antivirus': '',
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
