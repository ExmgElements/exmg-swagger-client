import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';

/**
 * This mixin is used by exmg-swagger-client element to specify which
 * client condig is used and when the API is ready.
 *
 *
 * @polymer
 * @memberof Exmg
 * @mixinFunction
 */

const swaggerCommon = (superClass) => class extends superClass {
  static get properties() {
    return {
      /**
       * Will contain the swagger API after initialisation
       */
      swaggerClientApi: {
        type: Object,
        notify: true,
        observer: '_swaggerClientApiChanged'
      },
      /**
       * This property can be used if you would like to use multiple swagger
       * api's. By default the api has no name.
       */
      apiName: {
        type: String,
        notify: true,
        value: '',
        observer: '_apiNameChanged'
      }
    };
  }

  _apiNameChanged(apiName) {
    if (this.swaggerClientApi && this.swaggerClientApi.name === apiName) {
      return;
    }
    try {
      this.swaggerClientApi = Exmg.swaggerClients.api(apiName);
    } catch (e) {
      /* Api hasn't been initialized yet */
      var self = this;
      window.addEventListener('swagger-api-initialized', function onSwaggerApiInitialized(event) {
        window.removeEventListener('swagger-api-initialized', onSwaggerApiInitialized);
        self._apiNameChanged(self.apiName);
      });
    }
  }

  _swaggerClientApiChanged(api) {
    if (api && api.name === this.apiName) {
      return;
    }
    this.apiName = api ? api.name : '';
  }
};

export const SwaggerCommonMixin = dedupingMixin(swaggerCommon);
