'use strict';

angular.module('myApp.user', [])

.component('userWrapper', {
  template: '<div ui-view></div>',
  bindings: {
    user: '<'
  },
  controller: ['$state', function($state) {
  }]
})

.component('user', {
  templateUrl: 'user/user.html',
  bindings: {
    user: '<'
  },
  controller: ['$state', 'AlbumService', function($state, AlbumService) {
    var _this = this;
    _this.loading = true;

    function getAlbums() {
      _this.loadingAlbums = true;
      AlbumService.query({'userId': _this.user.id}).$promise.then(function(albums) {
        _this.albums = albums;
        _this.loadingAlbums = false;
      }, function(error) {
        _this.albums = [];
        _this.loadingAlbums = false;
        console.log(error);
      });
    }

    _this.goToAlbum = function(album) {
      $state.go('user.album', {'albumId': album.id});
    }

    _this.$onInit = function() {
      _this.user.$promise.then(function() {
        _this.loading = false;
        getAlbums();
      });
    };
  }]
})
.factory("AlbumService", function($resource) {
  return $resource("https://jsonplaceholder.typicode.com/albums/:albumId");
});
