import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {SwaggerCommonMixin} from './exmg-swagger-common.js';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
import {timeOut} from '@polymer/polymer/lib/utils/async.js';

/**
* @namespace Exmg
*/
window.Exmg = window.Exmg || {};

/**
* Element for using Swagger 2.0 generated API
*
* ```html
* <exmg-swagger-client
*   api="pet"
*   operation-id="getPet"
*   params='{petId:'324421445'}'
*   last-response="{{response}}"
*   last-error="{{error}}"
*   auto></exmg-swagger-client>
* ```
*
* @customElement
* @polymer
* @group Exmg Core Elements
* @element exmg-swagger-client
* @demo demo/index.html
* @memberof Exmg
* @extends Polymer.Element
* @summary Custom element to connect to a restfull API layer using a Swagger 2.0 schema
*/

export class DataConnectionElement extends SwaggerCommonMixin(PolymerElement) {

  /**
   * Fired when an error occurse
   * @event exmg-swagger-error
   * @param {Event} event
   */

  /**
   * Fired when an request is send
   * @event exmg-swagger-request
   * @param {Event} event
   */

  /**
   * Fired when an server response is received
   * @event exmg-swagger-response
   * @param {Event} event
   */

  static get is() {
    return 'exmg-swagger-client';
  }
  static get properties() {
    return {
      /**
       * Available Api's
       */
      api: {
        type: String,
      },

      /**
       * Is a unique key within the spec
       */
      operationId: {
        type: String,
      },

      /**
       * An object that contains query parameters to be appended to the
       * specified `url` when generating a request. If you wish to set the body
       * content when making a POST request, you should use the `body` property
       * instead.
      */
      params: {
        type: Object,
        value: () => ({}),
      },

      /**
       * lastRequest's response.
       *
       * Note that lastResponse and lastError are set when lastRequest finishes.
       *
       * @type {Object}
       */
      lastResponse: {
        type: Object,
        notify: true,
        readOnly: true
      },

      /**
       * lastRequest's error, if any.
       *
       * @type {Object}
       */
      lastError: {
        type: Object,
        notify: true,
        readOnly: true
      },

      /**
       * If true, automatically performs an Ajax request when either `url` or
       * `params` changes.
       */
      auto: {
        type: Boolean,
        notify: true,
        value: false,
      },

      /**
       * Length of time in milliseconds to debounce multiple automatically generated requests.
       */
      debounceDuration: {
        type: Number,
        readOnly: true,
        value: 0,
      },

      /**
       * The most recent request made.
       */
      lastRequest: {
        type: Object,
        notify: true,
        readOnly: true
      },

      /**
       * By default, exmg-swagger-client events do not bubble. Setting this attribute will cause its
       * events to bubble to the window object.
       */
      bubbles: {
        type: Boolean,
        value: false
      },
      /**
       * True while request is in flight.
       */
      loading: {
        type: Boolean,
        notify: true,
        readOnly: true
      },

      _boundHandleResponse: {
        type: Function,
      }

      /**
       * Fired when a response is received.
       *
       * @event response
       */

      /**
       * Fired when an error is received.
       *
       * @event error
       */
    };
  }

  static get observers() {
    return [
      '_requestOptionsChanged(swaggerClientApi, api, operationId, auto, debounceDuration)'
    ];
  }

  constructor() {
    super();
    this._boundHandleResponse = this._handleResponse.bind(this);
    this._boundHandleError = this._handleError.bind(this);
  }

  /**
   * Performs an AJAX request using the swagger api.
   *
   */
  generateRequest() {
    return new Promise((resolve, reject) => {
      if (!this.swaggerClientApi) {
        this._handleError('Data connection config not loaded!');
        return;
      }

      const api = this._apiAvailable();
      console.log('generateRequest', api, this.operationId, this.params);

      if (api.error) {
        this._handleError(api.error);
        throw new Error(this.lastError.error);
      }

      const {apis} = this.swaggerClientApi;

      if (typeof apis[api][this.operationId] !== 'function') {
        this._handleError(`Operation Id ${this.operationId} not found`);
        console.log(`Operation Id ${this.operationId} not found. Maybe one of these?`);
        Object.keys(apis[api]).forEach(k => console.log(k));
        throw new Error(this.lastError.error);
      }

      const request = this.swaggerClientApi.apis[api][this.operationId];
      this._setLoading(true);

      this.dispatchEvent(new CustomEvent('exmg-swagger-request', {
        bubbles: this.bubbles,
        composed: true,
        detail: {
          request: request,
          api: this.api,
          operationId: this.operationId,
          params: this.params,
        }
      }));

      resolve(request(this.params).then(
        this._boundHandleResponse
      ).catch(
        this._boundHandleError
      ));
    });
  }

  _handleError(error) {
    this._setLastError({error: error});
    this._setLastResponse(null);
    this._setLoading(false);
    this.dispatchEvent(new CustomEvent('exmg-swagger-error', {bubbles: this.bubbles, composed: true, detail: {error: error}}));
    throw error;
  }

  _handleResponse(response) {
    this._setLastResponse(response.body);
    this._setLastError(null);
    this._setLoading(false);
    this.dispatchEvent(new CustomEvent('exmg-swagger-response', {bubbles: this.bubbles, composed: true, detail: response}));
    return response.body;
  }

  /**
   * Checks if Api is available in Swagger 2.0 schema
   *
   */
  _apiAvailable() {
    if (!this.api) {
      return ({error: `No api given`});
    }

    const isAvailable = this.swaggerClientApi.apis.hasOwnProperty(this.api);

    if (isAvailable) {
      return this.api;
    }

    return ({error: `Api ${this.api} not found`});
  }

  _requestOptionsChanged() {
    if (!this.swaggerClientApi) {
      return;
    }
    this._debouncer = Debouncer.debounce(
      this._debouncer,
      timeOut.after(this.debounceDuration), () => {
        if (!this.operationId && !this.api) {
          return null;
        }
        if (this.auto) {
          this.generateRequest();
        }
      });
  }
}

window.customElements.define(DataConnectionElement.is, DataConnectionElement);

Exmg.DataConnectionElement = DataConnectionElement;
