import {PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
* @namespace Exmg
*/
window.Exmg = window.Exmg || {};

/**
* Element for initializing Swagger Client Api's
*
* ```html
* <exmg-swagger-client-config swagger-url="[[swaggerUrl]]"></exmg-swagger-client-config>
* ```
*
* @customElement
* @polymer
* @group Exmg Core Elements
* @element exmg-swagger-client-config
* @memberof Exmg
* @extends Polymer.Element
* @summary Custom element to initialize Swagger Client Api's
*/

export class DataConnectionConfigElement extends PolymerElement {
  static get is() {
    return 'exmg-swagger-client-config';
  }
  static get properties() {
    return {
      /**
       * The name of your config.
       *
       * You can use this with the `configName` property of other client element
       * in order to use multiple configurations on a page at once.
       * In that case the name is used as a key to lookup the configuration.
       */
      name: {
        type: String,
        value: ''
      },
      /**
       * Url pointing to the swagger 2.0 json file
       */
      swaggerUrl: {
        type: String,
        observer: '_swaggerUrlChanged',
      },

      /**
       * By default the server url from json file will be used. This serverUrl property is optional
       * and can be used as an override.
       */
      serverUrl: {
        type: String,
        observer: '_serverUrlChanged',
      },

      /**
       * hook into the response globaly
       */
      responseInterceptor: Function,

      /**
       * hook into the requests globaly
       */
      requestInterceptor: Function,

      /**
       * Gives the initialization state of the API
       */
      apiInitialized: {
        type: Boolean,
        notify: true,
        readOnly: true,
        value: false,
      },
    };
  }
  _swaggerUrlChanged(url) {
    this._reset();
    this.initSwagger();
  }
  _serverUrlChanged(url) {
    if (Exmg.swaggerClients.getApi(this.name) && this.serverUrl) {
      Exmg.swaggerClients.getApi(this.name).url = this.serverUrl;
    }
  }
  _reset() {
    this._setApiInitialized(false);
    Exmg.swaggerClients.setApi(this.name, null);
  }
  initSwagger() {
    /* Load swagger api */
    this.swaggerClient = new SwaggerClient(this.swaggerUrl, {
      url: this.serverUrl,
      responseInterceptor: this.responseInterceptor,
      requestInterceptor: this.requestInterceptor
    }).then((swaggerClient) => {
      /* enable cors */
      swaggerClient.http.withCredentials = true;
      swaggerClient.name = this.name;

      /* if server url is different then the one specified in api */
      if (this.serverUrl && this.serverUrl !== swaggerClient.url) {
        swaggerClient.url = this.serverUrl;
      }

      /* Add swagger api to Exmg scope */
      window.Exmg.swaggerClients.setApi(this.name, swaggerClient);

      this.dispatchEvent(new CustomEvent('swagger-api-initialized', {bubbles: true, composed: true, detail: {
        name: this.name, swaggerClient: swaggerClient}
      }));

      setTimeout(_ => this._setApiInitialized(true), 0);

      return swaggerClient;
    });
    return this.swaggerClient;
  }
}
window.customElements.define(DataConnectionConfigElement.is, DataConnectionConfigElement);

Exmg.DataConnectionConfigElement = DataConnectionConfigElement;

if (!window.Exmg.swaggerClients) {
  class ExmgSwaggerClient {
    constructor() {
      this.apis = {};
    }
    setApi(name, api) {
      this.apis[name] = api;
    }
    getApi(name) {
      return this.apis[name];
    }
    api(name) {
      const api = this.apis[name];
      if (!api) {
        throw new Error(`Api ${api} not found`);
      }
      return api;
    }
  }
  window.Exmg.swaggerClients = new ExmgSwaggerClient();
}

