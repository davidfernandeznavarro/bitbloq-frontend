'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.hardwareService
 * @description
 * # hardwareService
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('hardwareService', function (common, $q, _, hardwareApi) {

        var exports = {},
            loadedHardwarePromise = $q.defer();

        exports.hardware = null;

        exports.componentsMap = {};
        exports.boardsMap = {};

        exports.getUserHardware = function () {
            var defered = $q.defer();
            common.itsUserLoaded().then(function () {
                _.forEach(common.userHardware.boards, function (board) {
                    board.category = 'boards';
                });
                _.forEach(common.userHardware.components, function (board) {
                    board.category = 'components';
                });
                _.forEach(common.userHardware.robots, function (board) {
                    board.category = 'robots';
                });

                exports.getRobots().then(function (robots) {
                    exports.getUserKits(common.userHardware).then(function (kits) {
                        defered.resolve(groupRobotsByFamily(common.userHardware.robots, robots)
                            .concat(common.userHardware.boards).concat(common.userHardware.components).concat(kits));

                    });
                });

            });
            return defered.promise;
        };

        exports.getUserKits = function (userHardware) {
            var defered = $q.defer();

            var userHW = _.map(userHardware.boards.concat(userHardware.components), function (element) {
                return element._id || element;
            });
            hardwareApi.getKits().then(function (res) {
                var totalKit;
                var kitDetected = [];
                _.forEach(res.data, function (kit) {
                    totalKit = kit.boards.concat(kit.components);
                    if (_.difference(totalKit, userHW).length === 0) {
                        kit.category = 'kit';
                        kitDetected.push(kit);
                    }
                });
                defered.resolve(kitDetected);
            });
            return defered.promise;
        };

        exports.getComponents = function () {
            var defered = $q.defer();
            hardwareApi.getComponents().then(function (res) {
                defered.resolve(res.data);
            });
            return defered.promise;
        };

        exports.getRobots = function () {
            var defered = $q.defer();
            hardwareApi.getRobots().then(function (res) {
                defered.resolve(res.data);
            });
            return defered.promise;
        };

        exports.getBoards = function () {
            var defered = $q.defer();
            hardwareApi.getBoards().then(function (res) {
                defered.resolve(res.data);
            });
            return defered.promise;
        };

        exports.getKits = function () {
            var defered = $q.defer();
            hardwareApi.getKits().then(function (res) {
                defered.resolve(res.data);
            });
            return defered.promise;
        };

        exports.itsHardwareLoaded = function () {
            return loadedHardwarePromise.promise;
        };

        exports.manageKitHW = function (kits, hardwareSelected, removed) {
            if (removed) {
                _.forEach(kits, function (kit) {
                    if (kit._id === removed) {
                        hardwareSelected.boards = hardwareSelected.boards.filter(function (item) {
                            return kit.boards.indexOf(item) === -1;
                        });
                        hardwareSelected.components = hardwareSelected.components.filter(function (item) {
                            return kit.components.indexOf(item) === -1;
                        });
                    }
                });
            } else {
                _.forEach(hardwareSelected.kits, function (kit) {
                    _.forEach(kits, function (element) {
                        if (element._id === kit) {
                            hardwareSelected.boards = _.merge(hardwareSelected.boards, element.boards);
                            hardwareSelected.components = _.merge(hardwareSelected.components, element.components);
                        }
                    });
                });
            }
            return hardwareSelected;
        };

        exports.managethirdPartyRobots = function (robots, hardwareSelected, removed) {
            if (removed) {
                _.forEach(robots, function (robot) {
                    if (robot.family === removed) {
                        hardwareSelected.components = hardwareSelected.components.filter(function (item) {
                            return robot.includedComponents.indexOf(item) === -1;
                        });

                    }
                });
            }
            _.forEach(hardwareSelected.robots, function (robot) {
                _.forEach(robots, function (element) {
                    if (element.family === robot) {
                        hardwareSelected.boards = _.merge(hardwareSelected.boards, element.board);
                        hardwareSelected.components = _.merge(hardwareSelected.components, element.includedComponents);
                    }
                });
            });
            return hardwareSelected;
        };

        exports.getFamilyFromRobots = function (userRobots, robots) {
            var robotsCopy;

            robotsCopy = _.cloneDeep(userRobots);

            _.forEach(userRobots, function (robot) {
                var family = _.without(_.map(_.filter(robots, function (r) {
                    return r._id === robot;
                }), 'family'), undefined);
                if (family.length > 0) {
                    _.remove(robotsCopy, function (r) {
                        return r === robot;
                    });
                    if (robotsCopy.indexOf(family[0]) <= -1) {
                        robotsCopy = robotsCopy.concat(family);
                    }
                }
            });

            return robotsCopy;
        };

        /******************************
         ***** PRIVATE FUNCTIONS ******
         ******************************/

        function groupRobotsByFamily(userRobots, robots) {
            var robotsCopy;

            robotsCopy = _.cloneDeep(userRobots);

            _.forEach(userRobots, function (robot) {
                var family = _.without(_.map(_.filter(robots, function (r) {
                    return r._id === robot._id;
                }), 'family'), undefined);

                if (family.length > 0) {
                    _.remove(robotsCopy, function (r) {
                        return r._id === robot._id;
                    });

                    var element = {
                        'category': 'robots',
                        'uuid': family[0]
                    };
                    robotsCopy = robotsCopy.concat(element);
                }
            });

            return _.uniqBy(robotsCopy, 'uuid');
        }

        function _generateComponentsMaps(componentsArray) {
            exports.componentsMap = {};

            for (var i = 0; i < componentsArray.length; i++) {
                exports.componentsMap[componentsArray[i].uuid] = componentsArray[i];
            }
        }

        function _generateBoardsMaps(boards) {
            exports.boardsMap = {};

            for (var i = 0; i < boards.length; i++) {
                exports.boardsMap[boards[i].uuid] = boards[i];
            }
        }

        /******************************
         *********** INIT *************
         ******************************/

        hardwareApi.getAll().then(function (response) {
            exports.hardware = response.data;
            _generateComponentsMaps(exports.hardware.components);
            _generateBoardsMaps(exports.hardware.boards);
            loadedHardwarePromise.resolve();
        }).catch(loadedHardwarePromise.reject);

        return exports;

    });
