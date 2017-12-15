(function () {
    'use strict';
    /**
     * @ngdoc function
     * @name bitbloqApp.controller:TasksCtrl
     * @description
     * # TasksCtrl
     * Controller of the bitbloqApp
     */
    //QUE NO LLAMEIS TAREAS A LOS EJERCICIOS DE UN ALUMNO
    //QUE NO LLAMEIS TAREAS A LOS EJERCICIOS DE UN ALUMNO
    //QUE NO LLAMEIS TAREAS A LOS EJERCICIOS DE UN ALUMNO
    //by Jose
        //"No me llames Dolores, llámame Lola..."
        //By Ark ;)
    angular.module('bitbloqApp')
        .controller('TasksCtrl', function ($log, $scope, $rootScope, _, ngDialog, alertsService, centerModeApi, exerciseApi, centerModeService,
            $routeParams, $location, commonModals, $window, exerciseService, $q, moment, common, $translate) {

            $scope.tasks = [];
            $scope.pageno = 1;
            $scope.tasksCount = 0;
            $scope.itemsPerPage = 10;
            $scope.menuActive = {};
            $scope.pagination = {
                'tasks': {
                    'current': 1
                }
            };
            $scope.exerciseService = exerciseService;
            $scope.centerModeService = centerModeService;
            $scope.moment = moment;

            var currentModal,
                groupSelected;

            $scope.changeExerciseMenu = function (index) {
                var previousState;
                if ($scope.menuActive[index]) {
                    previousState = $scope.menuActive[index];
                } else {
                    previousState = false;
                }
                $scope.menuActive = {};
                $scope.menuActive[index] = !previousState;
            };

            $scope.getTasksPaginated = function (pageno) {
                _getTasksWithParams(pageno);
            };

            $scope.registerInGroup = function () {
                function confirmAction(accessId) {
                    centerModeApi.registerInGroup(accessId).then(function () {
                        console.log($scope);
                        var group = _.find($scope.groups, { accessId: accessId }),
                            alertText, alertType;
                        currentModal.close();
                        sessionStorage.newClassAddedAccessId = accessId;
                        _getGroups().then(function () {
                            _getMyTasks();
                            if (group) {
                                alertText = $translate.instant('centermode-class-register-duplicated', {
                                    value: group.name
                                });
                                alertType = 'info';
                            } else {
                                group = _.find($scope.groups, { accessId: accessId });
                                alertText = $translate.instant('centermode-class-register-sucessfully', {
                                    value: group.name
                                });
                                alertType = 'ok';
                            }
                            alertsService.add({
                                text: alertText,
                                id: 'class-register-status',
                                type: alertType
                            });
                        });

                    }).catch(function () {
                        modal.input.showError = true;
                    });
                }

                var modalOptions = $rootScope.$new(),
                    modal = _.extend(modalOptions, {
                        title: 'centerMode_student_registerInClass',
                        contentTemplate: 'views/modals/input.html',
                        mainText: 'centerMode_modal_registerInClassInfo',
                        modalInput: true,
                        secondaryText: false,
                        input: {
                            id: 'groupId',
                            name: 'groupId',
                            placeholder: 'centerMode_modal_classIdPlaceholder',
                            errorText: 'centerMode_modal_registerInGroup-error',
                            showError: false
                        },
                        confirmButton: 'centerMode_student_registerInClass',
                        condition: function () {
                            return this.input.value;
                        },
                        rejectButton: 'modal-button-cancel',
                        confirmAction: confirmAction,
                        modalButtons: true
                    });

                currentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input modal--register-in-group',
                    scope: modalOptions

                });
            };

            $scope.getTasksInGroup = function (group) {
                if (group) {
                    groupSelected = group._id;
                }
                _getTasksWithParams();
                sessionStorage['tasksViewSelectedGroup_' + common.user._id] = groupSelected;
            };

            function _init() {
                $scope.common.itsUserLoaded().then(function () {
                    centerModeService.setCenter();
                    _getGroups().then(function () {
                        _getMyTasks();
                    });
                }, function () {
                    $scope.common.setUser();
                    alertsService.add({
                        text: 'view-need-tobe-logged',
                        id: 'view-need-tobe-logged',
                        type: 'error'
                    });
                    $scope.common.goToLogin();
                });
            }

            function _getMyTasks() {
                if ($routeParams.page && $routeParams.group) {
                    groupSelected = $routeParams.group;
                    _getTasksWithParams($routeParams.page);
                    $scope.pagination.tasks.current = $routeParams.page;
                } else {
                    _getTasksWithParams($scope.pageno);
                }
            }

            function _getGroups() {
                var defered = $q.defer();
                centerModeApi.getGroups('student').then(function (response) {
                    $scope.groups = response.data;
                    $scope.groupArray = $scope.groups;
                    if ($scope.groupArray.length > 0) {
                        if (sessionStorage.newClassAddedAccessId) {
                            var newGroup = _.find($scope.groupArray, { accessId: sessionStorage.newClassAddedAccessId });
                            sessionStorage.removeItem('newClassAddedAccessId');
                            if (newGroup && newGroup._id) {
                                groupSelected = newGroup._id;
                                $routeParams.group = newGroup._id;
                                sessionStorage['tasksViewSelectedGroup_' + common.user._id] = newGroup._id;
                            } else {
                                groupSelected = sessionStorage['tasksViewSelectedGroup_' + common.user._id] || $scope.groupArray[0]._id;
                            }
                        } else {
                            groupSelected = sessionStorage['tasksViewSelectedGroup_' + common.user._id] || $scope.groupArray[0]._id;
                        }
                        var group = _.find($scope.groupArray, { _id: groupSelected });
                        if (!group) {
                            group = $scope.groupArray[0];
                            $routeParams.group = group._id;
                            groupSelected = group._id;
                            sessionStorage['tasksViewSelectedGroup_' + common.user._id] = group._id;
                        }
                        $scope.groupSelectedName = group.name;
                    }
                    defered.resolve();
                });

                return defered.promise;
            }

            function _getTasksWithParams(pageno) {
                if (groupSelected) {
                    exerciseApi.getMyTasksByGroup(groupSelected, {
                        'page': pageno,
                        'pageSize': $scope.itemsPerPage
                    }).then(function (response) {
                        response.data.tasks.forEach(function (task) {
                            if (task.status === 'pending' && exerciseService.getDatetime(task.endDate, true)) {
                                task.status = 'notDelivered';
                            }
                        });
                        $scope.tasksCount = response.data.count;
                        $scope.tasks = response.data.tasks;
                        $location.search({
                            'group': groupSelected,
                            'page': pageno
                        });
                    });
                } else {
                    $scope.tasks = [];
                }
            }

            _init();

            $scope.$watch('search.searchExercisesText', function (newValue, oldValue) {
                if (newValue !== oldValue && (oldValue || oldValue === '') || (!oldValue && newValue)) {
                    if (newValue || newValue === '') {
                        $scope.filterExercFisesParams.name = newValue;
                        if (newValue === '') {
                            $scope.filterExercisesParams = {};
                            $location.search('name', null);
                            $location.search('page', 1);
                        }
                        $scope.searchExercises();
                    } else {
                        delete $scope.filterExercisesParams.name;
                    }
                }
            });

        });
})();
