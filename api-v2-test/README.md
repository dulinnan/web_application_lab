# Crowdfunding API v2.1 tests

Validates the API of a running service against the Crowdfunding v2.1.5 API (defined in api/swagger-api-v2.1.5.json)

The SUT must already be running on the URL given in `config.js` and we assume that it provides a `POST /admin/reset` endpoint to reset its state.

## Usage

`npm start`

Or to run a single test directly from node.js:
  1. reset the db to the desired state and start it running with the configuration expected by your SUT
  1. start the SUT
  1. `URL=<SUT URL> node node_modules/mocha/bin/mocha test/<test to run>`, e.g., `URL=http://localhost:4551/api/v2 node node_modules/mocha/bin/mocha test/test.users.auth`
