'use strict';

angular.module('myApp.breadcrumbs', [])
.component('breadcrumbs', {
  templateUrl: 'components/breadcrumbs/breadcrumbs.html',
  controller: ['$rootScope', '$state', '$transitions', '$window', '$q', 'BreadcrumbService', function($rootScope, $state, $transitions, $window, $q, BreadcrumbService) {

    var _this = this;
    var breadcrumbs = [];
    var stateData = {};

    function addBreadcrumb(title, state) {
      breadcrumbs.push({
        'title': title,
        'state': state
      })
    }

    function generateBreadcrumb(state) {
      if(state.data.breadcrumbParent) {
        generateBreadcrumb(angular.copy($state.get(state.data.breadcrumbParent)));
      }
      if(state.data.showBreadcrumb) {
        var stateName = state.data.breadcrumbIdProp ? state.name + '({' + state.data.breadcrumbIdProp + ': ' + stateData[state.name].id + '})' : state.name;
        var title = state.data.breadcrumbName ? state.data.breadcrumbName : stateData[state.name] ? stateData[state.name].name : state.name;
        addBreadcrumb(title, stateName);
      }
    }

    function generateBreadcrumbs() {
      breadcrumbs = [];
      generateBreadcrumb($state.$current);
      _this.breadcrumbs = breadcrumbs;
    }

    $rootScope.$on('$myAppLocationChangeSuccess', function() {
      stateData = BreadcrumbService.getStateData();
      generateBreadcrumbs();
    });
  }]
})
.factory("BreadcrumbService", function($window) {
  var stateData = {};
  return {
    getStateData: function() {
      return stateData;
    },
    setStateData: function(data) {
      stateData = angular.copy(data);
    }
  }
});
