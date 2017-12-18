'use strict';

angular.module('bitbloqApp').directive('konami', ['$document',
    function($document) {
        var link = function($scope) {
            var keys = '',
                code = '38384040373937396665', // up-up-down-down-left-right-left-right-b-a
                codeSimple = '384037396665', // up-down-left-right-b-a
                timer = null,
                success = function() {
                    $scope.clearPunishment();
                },
                cleanup = function() {
                    clearTimeout(timer);
                    keys = '';
                },
                keyup = function(event) {
                    clearTimeout(timer);
                    keys += event.which;
                    timer = setTimeout(cleanup, 1000);
                    if (keys === code || keys === codeSimple) {
                        success();
                    } else {
                        return false;
                    }
                };
            $document.off('keyup', keyup).on('keyup', keyup);
        };

        return {
            restrict: 'A',
            link: link
        };
    }
]);
