'use strict';

angular.module('oauth.io', [])
  .provider('OAuth', function () {

    this.publicKey = '';
    this.handlers = {};

    this.setPublicKey = function (key) {
      this.publicKey = key;
    };

    this.setHandler = function (method, handler) {
      this.handlers[method] = handler;
    };

    var provider = this;

    this.$get = function ($window, OAuthData, $injector) {
      function OAuth() {

        /* Display the popup and fire the callbacks */
        this.popup = function (method) {
          $window.OAuth.popup(method, function(error, result) {
            if(!error) {
              if(provider.handlers[method]){
                OAuthData.result = result;
                $injector.invoke(provider.handlers[method]);
              }
            }
          });
        };


        // Initialize
        $window.OAuth.initialize(provider.publicKey);
      }

      return new OAuth();
    };
  })
  .service('OAuthData', function OAuthData() {});
