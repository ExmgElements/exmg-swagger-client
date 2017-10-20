const Swagger = require('swagger-client');
const fs = require('fs');
const util = require('util');

class generateAPI {
    constructor() {
      this.swaggerUrl = 'http://127.0.0.1:8081/src/swagger.json';
      this.getSwaggerAPI();
    }

    getSwaggerAPI() {
      Swagger(this.swaggerUrl)
        .then( res =>
          this.formatRes(res));
    }

    formatRes(res) {
      let resStringified = [];
      Object.keys(res.apis).forEach((key) => {
        const result = JSON.stringify(res.apis[key], (key, value) => {
          if (typeof value === 'function') {
              return value.toString();
          }
          return value;
        }, '\t');

        resStringified.push(result);
      });

      this.writeFile(res.apis, resStringified);
    }

    writeFile(apisMap, resStringified) {
      fs.writeFile('swaggerclientapifunction.js', resStringified, (err) => {
          if (err) throw err;
      });

      fs.writeFile('swaggerclientapimap.js', util.inspect(apisMap), (err) => {
          if (err) throw err;
      });
    }
}

const generatedAPI = new generateAPI;
