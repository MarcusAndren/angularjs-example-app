'use strict';

angular.module('myApp.album', [])

.component('album', {
  templateUrl: 'album/album.html',
  bindings: {
    album: '<'
  },
  controller: ['$stateParams', 'PhotoService', function($stateParams, PhotoService) {
    var _this = this;

    function getPhotos() {
      PhotoService.query({'albumId': _this.album.id}).$promise.then(function(photos) {
        _this.photos = photos;
        _this.loading = false;
      }, function(error) {
        _this.photos = [];
        _this.loading = false;
        console.log(error);
      })
    }

    _this.$onInit = function() {
      _this.loading = true;
      _this.album.$promise.then(function() {
        getPhotos();
      });
    }
  }]
})
.directive('photoViewer', function($timeout) {
  return {
    restrict: 'A',
    templateUrl: 'album/photoviewer.html',
    scope: {
      photos: "=ngModel"
    },
    link: function(scope) {
      var backdropElem = document.getElementById('photo-viewer-modal');
      var displayPhotoElem;
      var displayPhotoId;
      var photoDim;

      scope.displayPhotoTitle;

      function setDisplayPhoto(photoId) {
        var displayPhoto;
        scope.photos.forEach(function(photo) {
          if(photo.id === photoId) {
            displayPhoto = photo;
          }
        });
        displayPhotoId = displayPhoto.id;
        displayPhotoElem = document.getElementById('photo-' + displayPhotoId);
        photoDim = displayPhotoElem.getBoundingClientRect();
        scope.displayPhotoTitle = displayPhoto.title;
      }

      function setDisplayPhotoFixed() {
        var cssText = 'position: fixed;' +
          'top: ' + photoDim.top + 'px;' +
          'left:' + photoDim.left + 'px;' +
          'width:' + photoDim.width + 'px;' +
          'height:' + photoDim.height + 'px;' +
          'z-index: 100;';
        displayPhotoElem.style.cssText += cssText;
      }

      function closeDisplayPhoto(callback) {
        displayPhotoElem.classList.remove('col-image--img__active');
        $timeout(function() {
          displayPhotoElem.style.cssText = '';
          callback();
        }, 300);
      }

      scope.closePhotoViewModal = function() {
        backdropElem.classList.remove('photo-viewer-modal-backdrop__fadein');
        closeDisplayPhoto(function() {
          backdropElem.style.display = 'none';
        });
      };

      function openDisplayPhoto(callback) {
        setDisplayPhotoFixed();
        $timeout(function() {
          displayPhotoElem.classList.add('col-image--img__active');
          if(callback) {
            callback();
          }
        });
      }

      scope.openPhotoViewModal = function(photoId) {
        setDisplayPhoto(photoId);

        backdropElem.style.display = 'block';
        openDisplayPhoto(function() {
          backdropElem.classList.add('photo-viewer-modal-backdrop__fadein');
        });
      };

      scope.moveLeft = function() {
        var idx = scope.photos.findIndex(function(photo) {
          return displayPhotoId === photo.id;
        });
        if(idx > 0) {
          closeDisplayPhoto(function() {
            setDisplayPhoto(scope.photos[idx-1].id);
            openDisplayPhoto();
          });
        }
      };

      scope.moveRight = function() {
        var idx = scope.photos.findIndex(function(photo) {
          return displayPhotoId === photo.id;
        });
        if(idx < scope.photos.length-1) {
          closeDisplayPhoto(function() {
            setDisplayPhoto(scope.photos[idx+1].id);
            openDisplayPhoto();
          });
        }
      };

      setTimeout(function() {
        var imageWrappers = document.getElementsByClassName('col-image-wrapper');
        for(var i = 0; i < imageWrappers.length; i++) {
          imageWrappers[i].addEventListener("click", function(event) {
            scope.openPhotoViewModal(parseInt(event.srcElement.id.split('-')[1], 10));
          });
        }
      });

      document.addEventListener("keyup", function(event) {
        if(event.keyCode === 37) {
          scope.moveLeft();
        } else if(event.keyCode === 39) {
          scope.moveRight();
        } else if(event.keyCode === 27) {
          scope.closePhotoViewModal();
        }
      });
    }
  };
})
.factory("PhotoService", function($resource) {
  return $resource("https://jsonplaceholder.typicode.com/photos");
});
