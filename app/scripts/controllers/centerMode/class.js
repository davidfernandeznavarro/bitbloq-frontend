(function() {
    'use strict';
    /**
     * @ngdoc function
     * @name bitbloqApp.controller:ClassCtrl
     * @description
     * # ClassCtrl
     * Controller of the bitbloqApp
     */
    angular
        .module('bitbloqApp')
        .controller('ClassCtrl', function(
            $log,
            $scope,
            $rootScope,
            _,
            ngDialog,
            alertsService,
            centerModeApi,
            exerciseApi,
            centerModeService,
            $routeParams,
            $location,
            commonModals,
            $window,
            exerciseService,
            $q
        ) {
            $scope.moment = moment;
            $scope.exercises = [];
            $scope.group = {};
            $scope.sortArray = []; //'explore-sortby-recent', 'email', 'name', 'surname'
            $scope.classesStatusArray = [];
            $scope.secondaryBreadcrumb = false;
            $scope.students = [];
            $scope.studentsJSON = [];
            $scope.orderInstance = 'name';
            $scope.urlSubType = $routeParams.child;
            $scope.showMoreActionsInClass = false;
            $scope.pageno = 1;
            $scope.classesArray = [];
            $scope.showFilters = false;
            $scope.exercisesCount = 0;
            $scope.itemsPerPage = 10;
            $scope.menuActive = {};
            $scope.search = {};
            $scope.filterExercisesParams = {};
            $scope.pagination = {
                exercises: {
                    current: 1
                },
                tasks: {
                    current: 1
                }
            };
            $scope.groupArray = {};
            $scope.exerciseService = exerciseService;
            $scope.centerModeService = centerModeService;
            $scope.colorPickerFlag = {};

            var currentModal;

            $scope.changeExerciseMenu = function(index) {
                var previousState;
                if ($scope.menuActive[index]) {
                    previousState = $scope.menuActive[index];
                } else {
                    previousState = false;
                }
                $scope.menuActive = {};
                $scope.menuActive[index] = !previousState;
            };

            $scope.changeStatusClass = function() {
                centerModeApi.updateGroup($scope.group).catch(function() {
                    alertsService.add({
                        text: 'updateGroup_alert_Error',
                        id: 'deleteGroup',
                        type: 'ko'
                    });
                });
            };

            $scope.changeGroupColor = function() {
                centerModeApi.updateGroup($scope.group).then(function() {
                    $scope.colorPickerFlag.open = false;
                });
            };

            $scope.closeGroup = function() {
                var parent = $rootScope,
                    modalOptions = parent.$new();
                _.extend(modalOptions, {
                    title: 'closeClass_modal_title',
                    confirmButton: 'archiveGroup_modal_acceptButton',
                    confirmAction: _closeGroupAction,
                    rejectButton: 'modal-button-cancel',
                    textContent: 'closeClass_modal_info',
                    contentTemplate: '/views/modals/information.html',
                    modalButtons: true
                });

                currentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            };

            $scope.editExerciseGroup = function(exercise) {
                centerModeApi
                    .getGroupsByExercise(exercise._id)
                    .then(function(response) {
                        exerciseService
                            .assignGroup(
                                exercise,
                                $scope.common.user._id,
                                response.data,
                                null,
                                true
                            )
                            .then(function() {
                                _getExercisesGroup(
                                    $routeParams.id,
                                    $routeParams.page
                                );
                            });
                    });
            };

            $scope.deleteGroup = function() {
                var confirmAction = function() {
                        centerModeApi
                            .deleteGroup($scope.group._id)
                            .then(function() {
                                alertsService.add({
                                    text: 'centerMode_alert_deleteClass',
                                    id: 'deleteGroup',
                                    type: 'ok',
                                    time: 5000
                                });
                                $location.path('classes');
                            })
                            .catch(function() {
                                alertsService.add({
                                    text: 'centerMode_alert_deleteClass-Error',
                                    id: 'deleteGroup',
                                    type: 'ko'
                                });
                            });
                        currentModal.close();
                    },
                    parent = $rootScope,
                    modalOptions = parent.$new();
                _.extend(modalOptions, {
                    title: 'deleteClass_modal_title',
                    confirmButton: 'button_delete',
                    confirmAction: confirmAction,
                    rejectButton: 'modal-button-cancel',
                    contentTemplate:
                        '/views/modals/centerMode/deleteGroup.html',
                    finishAction: $scope.closeGroup,
                    modalButtons: true
                });

                currentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className:
                        'modal--container modal--input modal--delete-group',
                    scope: modalOptions
                });
            };

            $scope.deleteTask = function(task) {
                var confirmAction = function() {
                        exerciseApi
                            .deleteTask(task._id)
                            .then(function() {
                                _.remove($scope.tasks, task);
                                alertsService.add({
                                    text: 'centerMode_alert_deleteTask',
                                    id: 'deleteTask',
                                    type: 'ok',
                                    time: 5000
                                });
                            })
                            .catch(function() {
                                alertsService.add({
                                    text: 'centerMode_alert_deleteTask-error',
                                    id: 'deleteTask',
                                    type: 'ko'
                                });
                            });
                        currentModal.close();
                    },
                    parent = $rootScope,
                    modalOptions = parent.$new(),
                    student =
                        $scope.student && $scope.student.firstName
                            ? $scope.student.firstName + $scope.student.lastName
                            : $scope.student.username;
                _.extend(modalOptions, {
                    title:
                        $scope.common.translate('deleteTask_modal_title') +
                        ': ' +
                        task.name,
                    confirmButton: 'button_delete',
                    value: $scope.student.username,
                    confirmAction: confirmAction,
                    rejectButton: 'modal-button-cancel',
                    contentTemplate: '/views/modals/information.html',
                    textContent: $scope.common.translate(
                        'deleteTask_modal_information',
                        {
                            value: student
                        }
                    ),
                    secondaryContent: 'deleteTask_modal_information-explain',
                    modalButtons: true
                });

                currentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            };

            $scope.deleteExerciseInGroup = function(exerciseId) {
                var parent = $rootScope,
                    modalOptions = parent.$new();

                _.extend(modalOptions, {
                    title: 'unassignClass_modal_title',
                    confirmButton: 'unassignGroup_modal_acceptButton',
                    confirmAction: _deleteTasks,
                    rejectButton: 'modal-button-cancel',
                    textContent: $scope.common.translate(
                        'unassignClass_modal_info',
                        {
                            value: $scope.group.name
                        }
                    ),
                    contentTemplate: '/views/modals/information.html',
                    modalButtons: true
                });

                var confirmDeleteModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });

                function _deleteTasks() {
                    centerModeApi
                        .unassignExerciseInGroup(exerciseId, $scope.group._id)
                        .then(function() {
                            confirmDeleteModal.close();
                            _getExercisesGroup(
                                $routeParams.id,
                                $routeParams.page
                            );
                        });
                }
            };

            $scope.deleteStudent = function(student) {
                var confirmAction = function() {
                        centerModeApi
                            .deleteStudent(student._id, $scope.group._id)
                            .then(function() {
                                alertsService.add({
                                    text: 'centerMode_alert_deleteStudent',
                                    id: 'deleteStudent',
                                    type: 'ok',
                                    time: 5000
                                });
                                $location.path('class/' + $scope.group._id);
                            })
                            .catch(function() {
                                alertsService.add({
                                    text:
                                        'centerMode_alert_deleteStudent-error',
                                    id: 'deleteTStudent',
                                    type: 'error'
                                });
                            });
                        studentModal.close();
                    },
                    parent = $rootScope,
                    modalOptions = parent.$new(),
                    studentName =
                        $scope.student && $scope.student.firstName
                            ? $scope.student.firstName + $scope.student.lastName
                            : $scope.student.username;

                _.extend(modalOptions, {
                    title: 'deleteStudent_modal_title',
                    confirmButton: 'button_delete ',
                    rejectButton: 'cancel',
                    confirmAction: confirmAction,
                    contentTemplate: '/views/modals/information.html',
                    textContent: $scope.common.translate(
                        'deleteStudentClass_modal_information',
                        {
                            value: studentName
                        }
                    ),
                    modalButtons: true
                });

                var studentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            };

            $scope.getExercisesPaginated = function(pageno) {
                _getExercisesGroup($routeParams.id, pageno);
            };

            $scope.getTasksPaginated = function(pageno) {
                _getTasks($routeParams.id, $routeParams.studentId, pageno);
            };

            $scope.sortInstances = function(type) {
                $log.debug('sortInstances', type);
                switch (type) {
                    case 'explore-sortby-recent':
                        $scope.orderInstance = 'createdAt';
                        $scope.reverseOrder = true;
                        break;
                    case 'email':
                        $scope.orderInstance = 'email';
                        $scope.reverseOrder = false;
                        break;
                    case 'name':
                        $scope.orderInstance = 'firstName';
                        $scope.reverseOrder = false;
                        break;
                    case 'surname':
                        $scope.orderInstance = 'lastName';
                        $scope.reverseOrder = false;
                        break;
                    case 'centerMode_column_groups':
                        $scope.orderInstance = 'groups';
                        $scope.reverseOrder = false;
                        break;
                    case 'centerMode_column_students':
                        $scope.orderInstance = 'students';
                        $scope.reverseOrder = false;
                        break;
                }
            };

            $scope.saveUrl = function(newUrl) {
                $scope.common.lastUrl = $location.url();
                $location.url(newUrl);
            };

            function _moreOptionsDropdownGlobalClickHandler(e) {
                console.log(e);
                if (e.target.className.indexOf('btn--showMoreActions') === -1) {
                    $scope.showMoreActionsInClass = false;
                }
                document.body.removeEventListener(
                    'click',
                    _moreOptionsDropdownGlobalClickHandler,
                    true
                );
            }

            $scope.setMoreOptionsInClass = function() {
                $scope.showMoreActionsInClass = !$scope.showMoreActionsInClass;
                if ($scope.showMoreActionsInClass) {
                    document.body.addEventListener(
                        'click',
                        _moreOptionsDropdownGlobalClickHandler,
                        true
                    );
                }
            };

            $scope.searchExercises = function() {
                $location.search($scope.filterExercisesParams);
                getTeacherExercisesPaginated(
                    $scope.pageno,
                    $scope.filterExercisesParams
                );
                _getExercisesCount($scope.filterExercisesParams);
            };

            $scope.setTab = function(tab) {
                if (!tab) {
                    tab =
                        sessionStorage[
                            'classViewSelectedTab_' + $routeParams.id
                        ] || 'exercises';
                }
                $scope.selectedTab = tab;

                sessionStorage['classViewSelectedTab_' + $routeParams.id] = tab;
            };

            $scope.getCsvHeaders = function() {
                var translations = $scope.common.translate([
                        'surname',
                        'name',
                        'centerMode_column_averageMark',
                        'email',
                        'user-name'
                    ]),
                    headers = [];

                _.forEach(translations, function(element) {
                    headers.push(element);
                });

                return headers;
            };

            $scope.changeNameModal = function() {
                var renameModal,
                    defered = $q.defer(),
                    currentClassName = $scope.group.name,
                    modalOptions = $rootScope.$new();

                function confirmAction(newName) {
                    console.log('DENTRO');
                    if ($scope.group.name !== newName) {
                        console.log('>> Cambiando nombre a ' + newName);
                        $scope.group.name = newName;
                        centerModeApi.updateGroup($scope.group)
                    }
                    renameModal.close();
                    // defered.resolve();
                }

                _.extend(modalOptions, {
                    title: 'change-name',
                    modalButtons: true,
                    confirmButton: 'save',
                    rejectButton: 'cancel',
                    modalInput: true,
                    confirmAction: confirmAction,
                    contentTemplate: '/views/modals/input.html',
                    mainText: 'classChangeName',
                    input: {
                        id: 'classChangeName',
                        name: 'classChangeName',
                        placeholder: currentClassName,
                        value: currentClassName
                    },
                    condition: function() {
                        return !!modalOptions.input.value;
                    }
                });

                renameModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--rename',
                    scope: modalOptions
                });
                return defered.promise;
            };

            $scope.showGroupId = function() {
                var bigTextModal,
                    groupId = $scope.group.accessId,
                    modalOptions = $rootScope.$new();

                _.extend(modalOptions, {
                    title: 'centerMode_modal_classIdPlaceholder',
                    modalButtons: false,
                    bigText: groupId,
                    translate: false,
                    contentTemplate: '/views/modals/bigText.html',
                });

                bigTextModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--bigText',
                    scope: modalOptions
                });
            };

            /**************************
             ***  PRIVATE FUNCTIONS ***
             **************************/

            function _checkUrl() {
                var page;
                if ($routeParams.page) {
                    page = $routeParams.page;
                }
                if ($scope.urlSubType && $scope.urlSubType === 'student') {
                    $scope.pagination.tasks.current = $routeParams.page
                        ? $routeParams.page
                        : 1;
                    _getTasks($routeParams.id, $routeParams.studentId, page);
                } else {
                    $scope.pagination.exercises.current = $routeParams.page
                        ? $routeParams.page
                        : 1;
                    _getGroup($routeParams.id);
                    _getStudentsGroup($routeParams.id);
                    _getExercisesGroup($routeParams.id, page);
                }
            }

            function getTeacherExercisesPaginated(pageno, search) {
                centerModeApi
                    .getExercises($scope.common.user._id, {
                        page: pageno,
                        pageSize: $scope.itemsPerPage,
                        searchParams: search ? search : {}
                    })
                    .then(function(response) {
                        $scope.exercises = response.data;
                        $location.search('page', pageno);
                    });
            }

            function _closeGroupAction() {
                $scope.classStateCheck = false;
                $scope.group.status = 'closed';
                $scope.group.color = '#c0c3c9';
                centerModeApi
                    .updateGroup($scope.group)
                    .then(function() {
                        alertsService.add({
                            text: 'centerMode_alert_closeGroup',
                            id: 'closeGroup',
                            type: 'ok',
                            time: 5000
                        });
                    })
                    .catch(function() {
                        alertsService.add({
                            text: 'centerMode_alert_closeGroup-Error',
                            id: 'closeGroup',
                            type: 'ko'
                        });
                    });
                currentModal.close();
            }

            function _getExercisesCount(searchText) {
                var searchParams = searchText
                    ? searchText
                    : $routeParams.name
                      ? {
                            name: $routeParams.name
                        }
                      : '';
                centerModeApi
                    .getExercisesCount($scope.common.user._id, searchParams)
                    .then(function(response) {
                        $scope.exercisesCount = response.data.count;
                    });
            }

            function _getGroup(groupId) {
                centerModeApi.getGroup(groupId).then(function(response) {
                    $scope.secondaryBreadcrumb = true;
                    $scope.group = response.data;
                    $scope.classStateCheck = $scope.group.status === 'open';
                });
            }

            function _getStudentsGroup(groupId) {
                centerModeApi
                    .getStudentsGroup(groupId)
                    .then(function(response) {
                        $scope.students = response.data;
                        _.forEach($scope.students, function(student) {
                            $scope.studentsJSON.push(
                                _.pick(
                                    student,
                                    'lastName',
                                    'firstName',
                                    'averageMark',
                                    'email',
                                    'username'
                                )
                            );
                        });
                    });
            }

            function _getExercisesGroup(groupId, page) {
                var pageno = page ? page : 1;
                var pageParams = {
                    page: pageno
                };
                centerModeApi
                    .getExercisesGroup(groupId, pageParams)
                    .then(function(response) {
                        $scope.exercises = response.data.exercises;
                        $scope.exercisesCount = response.data.count;
                        $location.search('page', pageno);
                    });
            }

            function _getTasks(groupId, studentId, pageno) {
                var page = pageno ? pageno : 1,
                    pageParams = {
                        page: page
                    };
                exerciseApi
                    .getTasks(groupId, studentId, pageParams)
                    .then(function(response) {
                        $scope.exercises = response.data;
                        if ($scope.urlSubType === 'student') {
                            $scope.exercises.tasks.forEach(function(task) {
                                if (
                                    task.status === 'pending' &&
                                    exerciseService.getDatetime(
                                        task.endDate,
                                        true
                                    )
                                ) {
                                    task.status = 'notDelivered';
                                }
                            });
                            $scope.tertiaryBreadcrumb = true;
                            $scope.tasks = response.data.tasks;
                            $scope.tasksCount = response.data.count;
                            $scope.group = response.data.group;
                            $scope.student = response.data.student;
                            $location.search('page', page);
                        }
                    });
            }

            function _init() {
                $scope.common.itsUserLoaded().then(
                    function() {
                        $scope.common.itsRoleLoaded().then(function() {
                            switch ($scope.common.userRole) {
                                case 'headmaster':
                                case 'teacher':
                                    _checkUrl();
                                    break;
                                default:
                                    $location.path('/projects');
                            }
                        });
                    },
                    function() {
                        $scope.common.setUser();
                        alertsService.add({
                            text: 'view-need-tobe-logged',
                            id: 'view-need-tobe-logged',
                            type: 'error'
                        });
                        $scope.common.goToLogin();
                    }
                );
            }

            $scope.$on('$destroy', function() {
                document.body.removeEventListener(
                    'click',
                    _moreOptionsDropdownGlobalClickHandler,
                    true
                );
            });

            /************************
             **  INIT && WATCHERS ***
             ************************/

            _init();
        });
})();
