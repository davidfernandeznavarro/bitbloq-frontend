(function() {
    'use strict';
    /**
     * @ngdoc function
     * @name bitbloqApp.controller:ExerciseInfoCtrl
     * @description
     * # ExerciseInfoCtrl
     * Controller of the bitbloqApp
     */
    angular.module('bitbloqApp')
        .controller('ExerciseInfoCtrl', function($log, $scope, $rootScope, _, ngDialog, alertsService, centerModeApi, exerciseApi, centerModeService, $routeParams, $location, commonModals, $window, exerciseService, $document, utils, $q) {
            $scope.tasks = [];
            $scope.class = {};
            $scope.groups = [];
            $scope.pageno = 1;
            $scope.itemsPerPage = 10;
            $scope.showMoreActions = false;
            $scope.taskSortArray = ['tasks-sortby-mark-high', 'tasks-sortby-mark-low'];
            $scope.taskStatusArray = ['tasks-status-all', 'tasks-status-not-delivered', 'tasks-status-not-corrected', 'tasks-status-corrected'];
            $scope.exercisesCount = 0;
            $scope.pagination = {
                'tasks': {
                    'current': 1
                }
            };
            $scope.groupArray = {};
            $scope.exerciseService = exerciseService;
            $scope.centerModeService = centerModeService;

            $scope.groupSelected = false;
            $scope.moment = moment;

            $scope.assignToGroup = function(exercise) {
                centerModeApi.getGroupsByExercise(exercise._id).then(function(response) {
                    exerciseService.assignGroup(exercise, $scope.common.user._id, response.data).then(function() {
                        _getGroups(exercise._id).then(function() {
                            _getExercise(exercise._id);
                        });
                    });
                });
            };

            $scope.createExerciseCopy = function(exercise) {
                exerciseService.clone(exercise);
                localStorage.exercisesChange = true;
            };

            $scope.getTasksPaginated = function(pageno) {
                var queryParamsArray = getRequest(),
                    queryParams = queryParamsArray || {},
                    groupPage = pageno ? pageno : 1,
                    groupId;

                var pageParams = {
                    'page': groupPage
                };
                angular.extend(queryParams, pageParams);
                $log.debug('getPublicProjects', queryParams);

                groupId = $scope.groupSelected ? $scope.groupSelected._id : null;
                if (groupId) {
                    exerciseApi.getTasksByExerciseAndGroup($scope.exercise._id, groupId, queryParams).then(function(response) {
                        response.data.forEach(function(task) {
                            var taskId = task._id;
                            _.extend(task, task.student);
                            if (task.status === 'pending' && exerciseService.getDatetime(task.endDate, true)) {
                                task.status = 'notDelivered';
                            }
                            task._id = taskId;
                        });
                        _getTasksByExerciseCount($routeParams.id, queryParams);
                        $scope.tasks = response.data;
                        $location.search('page', pageno);
                    });
                }
            };

            $scope.renameExercise = function(exercise) {
                commonModals.rename(exercise, 'exercise').then(function() {
                    exerciseApi.update(exercise._id, exercise);
                });
            };

            $scope.setMoreOptions = function() {
                $scope.showMoreActions = !$scope.showMoreActions;
            };

            $scope.getTasksByGroup = function(group) {
                $scope.groupSelected = group;
                $scope.getTasksPaginated($scope.pageno);
            };

            $scope.sortTasks = function(option) {
                $scope.sortSelected = option;
                $scope.getTasksPaginated($scope.pageno);
            };

            $scope.filterTasksByStatus = function(option) {
                $scope.taskStatusSelected = option;
                $scope.getTasksPaginated($scope.pageno);
            };

            /**************************
             ***  PRIVATE FUNCTIONS ***
             **************************/

            function _init() {
                $scope.common.itsUserLoaded().then(function() {
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
                }, function() {
                    $scope.common.setUser();
                    alertsService.add({
                        text: 'view-need-tobe-logged',
                        id: 'view-need-tobe-logged',
                        type: 'error'
                    });
                    $scope.common.goToLogin();
                });
            }

            function _checkUrl() {
                $scope.common.section = 'exercise-info';
                if ($routeParams.classId) {
                    centerModeApi.getGroup($routeParams.classId).then(function(response) {
                        $scope.class = response.data;
                        $scope.groupSelected = $scope.class;
                        _getExercise($routeParams.id);
                    });
                } else {
                    _getGroups($routeParams.id).then(function() {
                        _getExercise($routeParams.id);
                    });
                }
            }

            function _getExercise(exerciseId) {
                exerciseApi.get(exerciseId).then(function(response) {
                    $scope.exercise = response.data;
                    _getTasksByExercise();
                });
            }

            function _getGroups(exerciseId) {
                var defered = $q.defer();
                centerModeApi.getGroupsByExercise(exerciseId).then(function(response) {
                    $scope.groups = response.data;
                    $scope.groupArray = $scope.groups;
                    $scope.groupSelected = $scope.groups[0];
                    defered.resolve();
                });

                return defered.promise;
            }

            function _getTasksByExercise() {
                if ($routeParams.page) {
                    $scope.getTasksPaginated($routeParams.page);
                    $scope.pagination.tasks.current = $routeParams.page;
                } else {
                    $scope.getTasksPaginated($scope.pageno);
                }
            }

            function _getTasksByExerciseCount(exerciseId, params) {
                var groupId = $scope.groupSelected ? $scope.groupSelected._id : null;
                if (groupId) {
                    exerciseApi.getTasksByExerciseAndGroupCount(exerciseId, groupId, params).then(function(response) {
                        $scope.tasksCount = response.data.count;
                    });
                }
            }

            function clickDocumentHandler(evt) {
                if (!angular.element(evt.target).hasClass('btn--showMoreActions')) {
                    $scope.showMoreActions = false;
                    utils.apply($scope);
                }
            }

            function getRequest() {
                var queryParams = {},
                    sortParams = getSortRequest(),
                    statusParams = getStatusRequest();

                queryParams = _.extend(queryParams, sortParams);
                queryParams = _.extend(queryParams, statusParams);

                return queryParams;
            }

            function getSortRequest() {
                var queryParams = {};
                switch ($scope.sortSelected) {
                    case 'tasks-sortby-name-az':
                        queryParams.sortParams = {
                            'name': 'asc'
                        };
                        break;
                    case 'tasks-sortby-name-za':
                        queryParams.sortParams = {
                            'name': 'desc'
                        };
                        break;
                    case 'tasks-sortby-mark-high':
                        queryParams.sortParams = {
                            'mark': 'desc'
                        };
                        break;
                    case 'tasks-sortby-mark-low':
                        queryParams.sortParams = {
                            'mark': 'asc'
                        };
                        break;

                    default:
                        queryParams.sortParams = {
                            'name': 'asc'
                        };
                        break;
                }

                return queryParams;
            }

            function getStatusRequest() {
                var queryParams = {};

                switch ($scope.taskStatusSelected) {
                    case 'tasks-status-not-delivered':
                        queryParams.statusParams = {
                            'status': 'pending'
                        };
                        break;
                    case 'tasks-status-not-corrected':
                        queryParams.statusParams = {
                            'status': 'delivered'
                        };
                        break;
                    case 'tasks-status-corrected':
                        queryParams.statusParams = {
                            'status': 'corrected'
                        };
                        break;
                }

                return queryParams;
            }

            /************************
             **  INIT && WATCHERS ***
             ************************/

            $window.onfocus = function() {
                if (localStorage.exercisesChange && JSON.parse(localStorage.exercisesChange) && $scope.common.itsUserLoaded()) {
                    localStorage.exercisesChange = false;
                    _getExercise($routeParams.id);
                }
            };

            $document.on('click', clickDocumentHandler);

            $scope.$on('$destroy', function() {
                $window.onfocus = null;
                $document.off('click', clickDocumentHandler);
            });

            _init();
        });
})();
