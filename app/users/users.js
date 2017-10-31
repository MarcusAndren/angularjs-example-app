'use strict';

angular.module('myApp.users', [])

.component('users', {
  templateUrl: 'users/users.html',
  controller: ['$window', '$state', 'UsersService', function($window, $state, UsersService) {
    var _this = this;
    var savedFavorites = JSON.parse($window.localStorage.getItem('favorites')) || [];

    function generateUsersLists(allUsers) {
      var users = [];
      var favorites = [];
      allUsers.forEach(function(user, idx) {
        if(savedFavorites.indexOf(user.id) >= 0) {
          favorites.push(user);
        } else {
          users.push(user);
        }
      });
      _this.users = users;
      _this.favorites = favorites;
    }

    function getUsers() {
      _this.loading = true;
      UsersService.query().$promise.then(function(users) {
        generateUsersLists(users);
        _this.loading = false;
      }, function(error) {
        _this.loading = false;
      });
    }

    _this.addFavorite = function($event, user) {
      $event.stopPropagation();
      var usersIdx = _this.users.findIndex(function(usersUser) {
        return usersUser.id === user.id;
      });
      if(savedFavorites.indexOf(user.id) < 0) {
        _this.users.splice(usersIdx, 1);
        _this.favorites.push(user);
        savedFavorites.push(user.id);
        $window.localStorage.setItem('favorites', JSON.stringify(savedFavorites));
      }
    };

    _this.removeFavorite = function($event, user) {
      $event.stopPropagation();
      var savedFavoritesIdx = savedFavorites.indexOf(user.id);
      var favoritesIdx = _this.favorites.findIndex(function(favoritesUser) {
        return favoritesUser.id === user.id;
      });
      if(savedFavoritesIdx >= 0) {
        _this.favorites.splice(favoritesIdx, 1);
        _this.users.push(user);
        savedFavorites.splice(savedFavoritesIdx, 1);
        $window.localStorage.setItem('favorites', JSON.stringify(savedFavorites));
      }
    };

    _this.goToUser =  function(user) {
      $state.go('user', {userId: user.id});
    };

    _this.$onInit = function() {
      getUsers();
    };
  }]
})
.factory("UsersService", function($resource) {
  return $resource("https://jsonplaceholder.typicode.com/users/:userId");
});
