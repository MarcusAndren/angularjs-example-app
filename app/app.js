'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ui.router',
  'ngResource',
  'myApp.users',
  'myApp.user',
  'myApp.album',
  'myApp.breadcrumbs',
  'myApp.util'
]).
config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
  $urlRouterProvider.otherwise('/');

  var usersState = {
    'url': '/',
    'component': 'users',
    'data': {
      'breadcrumbParent': null,
      'breadcrumbName': 'Users',
      'breadcrumbIdProp': null,
      'showBreadcrumb': true
    }
  }

  var userWrapperState = {
    'url': '/user/:userId',
    'component': 'userWrapper',
    'params': {
      'userId': null
    },
    'data': {
      'breadcrumbParent': 'users',
      'breadcrumbName': null,
      'breadcrumbIdProp': 'userId',
      'showBreadcrumb': true
    },
    'resolve': {
      'user': function($stateParams, UsersService) {
        return UsersService.get({'userId': $stateParams.userId});
      }
    },
    'redirectTo': 'user.details'
  }

  var userState = {
    'url': '/details',
    'component': 'user',
    'data': {
      'breadcrumbParent': 'user',
      'breadcrumbName': null,
      'breadcrumbIdProp': null,
      'showBreadcrumb': false
    },
    'resolve': {
      'user': function(user) {
        return user;
      }
    }
  }

  var albumState = {
    'url': '/album/:albumId',
    'component': 'album',
    'params': {
      'albumId': null
    },
    'data': {
      'breadcrumbParent': 'user',
      'breadcrumbName': 'Album',
      'breadcrumbIdProp': null,
      'showBreadcrumb': true
    },
    'resolve': {
      'album': function($stateParams, AlbumService) {
        return AlbumService.get({'albumId': $stateParams.albumId});
      }
    }
  }

  $stateProvider.state('users', usersState);
  $stateProvider.state('user', userWrapperState);
  $stateProvider.state('user.details', userState);
  $stateProvider.state('user.album', albumState);
}])
.run(function($rootScope, $transitions, $q, BreadcrumbService) {
  $transitions.onSuccess({}, function(trans){
    var stateData = {};
    var tokens = trans.getResolveTokens();
    var promises = tokens.map(function(token) {
      if(trans.injector().get(token).$promise) {
        return trans.injector().get(token).$promise.then(function(value) {
          var stateToken = {key: token, value: value};
          return stateToken;
        });
      } else {
        return null;
      }
    });
    promises = promises.filter(function(promise) {
      return promise;
    });
    if(promises.length) {
      $q.all(promises).then(function(values) {
        values.forEach(function(value) {
          if(value && value.key) {
            stateData[value.key] = value.value;
          }
        });
        BreadcrumbService.setStateData(stateData);
        $rootScope.$emit('$myAppLocationChangeSuccess');
      });
    } else {
      setTimeout(function() {
        $rootScope.$emit('$myAppLocationChangeSuccess');
      })
    }
  });
});
