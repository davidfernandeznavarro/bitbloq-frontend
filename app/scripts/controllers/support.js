'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:SupportCtrl
 * @description
 * # SupportCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('SupportCtrl', function($translate, $scope, $location, $routeParams, common, _, userApi) {

        $scope.translate = $translate;

        var db = [{
            '_id': 'index',
            'permalink': 'index',
            'dontShowHomeButton': true,
            'title': '¡Bienvenido a la página de soporte de Bitbloq!',
            'data': '<p>Ayudanos a diagnosticar tu caso para que podamos ayudarte.</p><p>¿Usas la <strong>versión Online</strong> de Bitbloq, o la versión <a href="http://bitbloq.bq.com/#/offline" class="icon--url">Offline</a></p>',
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
            'dontShowHomeButton': true,
            'title': 'Contacta con nuestro servicio técnico',
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
                'response': 'Recibo el error "3020 RecieveData timeout 400ms"',
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
                'response': 'No',
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
                'response': 'No',
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
                'response': 'No',
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
                'response': 'web2board no compila',
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
            'data': '<p>¿<strong>Existe</strong> el fichero <i class="text-secondary">mimeapps.list</i> <strong>y contiene lineas de web2board</strong>?</p><p>El fichero <i class="text-secondary">mimeapps.list</i> ubicado en <span class="common--text-term-fx little">~/.local/share/applications/mimeapps.list</span> tiene que incluir estas líneas:</p><ol class="common--text-editor-fx"><li>[Default Applications]</li><li>#custom handler for bitbloqs web2board:</li><li>x-scheme-handler/web2board=web2board-handler.desktop</li></ol><p>Si no encuentra las líneas en el archivo, añadalas a mano.</p><p><strong>¿Se ha solucionado su consulta?</strong></p>',
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
            'data': '<p>Si lo tiene configurado para que pasen las llamas locales por el proxy, necesitará deshabilitarlo<ul><li class="icon--check">Presione en el teclado <span class="common--icon-keycap-fx">ctrl</span> + <span class="common--icon-keycap-fx">R</span> para abrir la ventana de ejecución de comandos</li><li class="icon--check">Escriba <span class="common--text-term-fx little">inetcpl.cpl</span> y de al botón de <span class="common--icon-keycap-fx">intro</span></li><li class="icon--check">Haga click en <i class="text-secondary">"Configuración de LAN"</i>, y seleccione <i class="text-secondary">"No usar el servidor proxy para direcciones locales"</i></li></ul></p><p><strong>¿Ha solucionado su consulta?</strong></p>',
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
            'data': 'Por ejemplo:<ul><li class="common--text-term-fx">expected \'(\' before \';\'\'</li><li class="common--text-term-fx">variable example not declared</li></ul></p><p>Si este es el caso, probablemente tenga errores de programación.<br>Le recomendamos que pregunte al respecto en el <a href="/forum" target="_blank">foro de Bitbloq</a>, incluyendo en el mensaje el programa donde recibe el error.</p>',
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
            'next': []
        }, {
            '_id': 'compileOther',
            'title': '¿Nunca termina de compilar?',
            'extData': 'compileStuckForm.html',
            'next': []
        }, {
            '_id': 'noBoard',
            'title': '',
            'next': []
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
        if (_.last(common.supportSteps) !== currentId) {
            common.supportSteps.push(currentId)
        }

        $scope.go = function(childId, isPermalink) {
            if (childId && isPermalink) {
                var child = getCard(childId, true)
                common.supportSteps.push(child._id)
                $location.path('/support/' + child._id)
            } else {
                if (childId && childId !== getCard('index', true)._id) {
                    common.supportSteps.push(childId)
                    $location.path('/support/' + childId)
                } else {
                    common.supportSteps = []
                    $location.path('/support')
                }
            }
        }

        // switches
        $scope.switchUserChromeAppMode = function() {
            common.user.chromeapp = !common.user.chromeapp
            userApi.update({chromeapp: common.user.chromeapp})
        }

    });
