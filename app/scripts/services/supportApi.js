'use strict';
/*jshint quotmark: false */

/**
 * @ngdoc service
 * @name bitbloqApp.supportApi
 * @description
 * # supportApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp').service('supportApi', function(envData, $http) {
    var supportApi = {
        getId: getId
    };

    function getId(id, permalink) {
        return $http({
            method: 'get',
            url: envData.config.serverUrl + 'support/' + (permalink ? 'p/' : '') + id
        });
    }
    return supportApi;
});
