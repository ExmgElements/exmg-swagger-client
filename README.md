exmg-swagger-client [![Build Status](https://travis-ci.org/ExmgElements/exmg-swagger-client.svg?branch=master)](https://travis-ci.org/ExmgElements/exmg-swagger-client)
================

Element for using Swagger 2.0 generated API

Example:
```html
<exmg-swagger-client-config
  swagger-url="http://petstore.swagger.io/v2/swagger.json">
</exmg-swagger-client-config>

<exmg-swagger-client
  api="pet"
  operation-id="getPet"
  params='{petId:'324421445'}'
  last-response="{{response}}"
  last-error="{{error}}"
  auto></exmg-swagger-client>
```

Please visit the [API Documentation and demo](http://ExmgElements.github.io/exmg-swagger-client/) page for more information.

## Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) installed. Then run `polymer serve` to serve your element locally.

## Viewing Your Element

```
$ polymer serve
```
