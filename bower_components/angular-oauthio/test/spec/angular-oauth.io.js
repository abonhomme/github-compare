'use strict';

describe('Service OAuth.io', function () {

  describe('configuration', function () {

    var provider, handler;

    beforeEach(module('oauth.io'));
    beforeEach(function () {
      module(function (OAuthProvider) {
        handler = function () {};
        OAuthProvider.setPublicKey('public_key');
        OAuthProvider.setHandler('custom', handler);
        provider = OAuthProvider;
      });
    });

    it('should allow configuration of the public key', inject(function () {
      expect(provider.publicKey).toBe('public_key');
    }));

    it('should allow configuration of the handlers', inject(function () {
      expect(provider.handlers.custom).toBe(handler);
    }));
  });

  describe('wrapping OAuth.io', function () {
    beforeEach(module('oauth.io'));

    var $window, _$injector, handler, OAuthData;

    beforeEach(function () {
      $window = {
        OAuth: {
          initialize: function () {

          },
          popup: function (method, cb) {
            if('method' === 'error') {
              cb('error', false);
            } else {
              cb(false, {object: true});
            }
          }
        }
      };
      OAuthData = {};
      handler = {
        cb: function (OAuthData) {
        }
      };

      spyOn($window.OAuth, 'initialize').andCallThrough();
      spyOn($window.OAuth, 'popup').andCallThrough();
      spyOn(handler, 'cb').andCallThrough();
      module(function ($provide, OAuthProvider, $injector) {
        spyOn($injector, 'invoke').andCallThrough();
        _$injector = $injector;
        $provide.value('$window', $window);
        $provide.value('OAuthData', OAuthData);
        $provide.value('$injector', _$injector);
        OAuthProvider.setPublicKey('public_key');
        OAuthProvider.setHandler('custom', handler.cb);
      });
    });

    it('should initialize the oauth.io library with the public_key', inject(function (OAuth) {
      expect($window.OAuth.initialize).toHaveBeenCalledWith('public_key');
    }));

    it('should expose a popup method', inject(function (OAuth) {
      expect(OAuth.popup).toBeDefined();
    }));

    describe('when calling the popup method', function () {
      it('should call the original popup method', inject(function (OAuth) {
        OAuth.popup('custom');
        expect($window.OAuth.popup).toHaveBeenCalledWith('custom', jasmine.any(Function));
      }));

      it('should silently fail if there is an error', inject(function (OAuth) {
        OAuth.popup('error');
        expect(handler.cb).not.toHaveBeenCalled();
      }));

      it('should silently fail if there is no handler', inject(function (OAuth) {
        OAuth.popup('custom2');
        expect(handler.cb).not.toHaveBeenCalled();
      }));

      it('should set the OAuthData', inject(function (OAuth) {
        OAuth.popup('custom');
        expect(OAuthData.result).toEqual({object: true});
      }));

      it('should invoke the handler', inject(function (OAuth) {
        OAuth.popup('custom');
        expect(handler.cb).toHaveBeenCalled();
      }));
    });
  });
});
