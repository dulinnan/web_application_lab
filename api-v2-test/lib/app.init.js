"use strict";

/**
 * start the app through docker-compose and then wait until it can respond to connection requests.
 *
 * tricky to do well. Some apps automatically wait for mysql and start cleanly; others expect mysql to be ready and fail immediately
 * the FSM looks like:
 * starting -> starting (if app exists and is not ready)
 * starting -> failed (if app no longer exists - check with ECONNREFUSED, or docker ps --filter name=..._app is empty, of docker-compose ps doesn't contain Exit
 * failed -> waiting (if mysql not yet "ready" - check (ideally) with healthcheck)
 * waiting -> starting (once mysql "ready")
 * waiting -> failed (if app no longer exists)
 *
 * unfortunately, the docker-compose.yml we use doesn't include a healthcheck section for mysql, and doesn't expose any ports to monitor,
 * so must just assume mysql ready after some amount of time...
 */

const
    log = require('../logger')(),
    path = require('path'),
    chai = require('chai'),
    chaiHttp = require('chai-http');

chai.use(chaiHttp);

const { exec } = require('child_process');

// from https://stackoverflow.com/questions/38213668/promise-retry-design-patterns

const wait = ms => new Promise(r => setTimeout(r, ms));

const retryCheckUrl = (config, delay, times) => new Promise((resolve, reject) => {
    return checkUrl(config.get('baseurl')+config.get('basepath'))
        .then(resolve)
        .catch(() => {
                checkUrl(config.get('baseurl'))
                    .then(resolve)
                    .catch(reason => {
                        if (times - 1 > 0) {
                            return wait(delay)
                                .then(retryCheckUrl.bind(null, config, delay, times - 1))
                                .then(resolve)
                                .catch(reject);
                        }
                        return reject(reason);
                    })
            }
        );
});

const checkUrl = url => {
    log.debug(`checking ${url}`);
    return chai.request(url)
               .get(`/projects`)
               .then(
                   (res) => {
                       log.debug(res.statusCode);
                       return res.statusCode === 200 ? Promise.resolve(url) : Promise.reject() // a 200 response is fine, but...
                   },
                   (res) => {
                       log.debug("ERROR", res.message, res.code);
                       return res.response.statusCode ? Promise.resolve(url) : Promise.reject() // any 400+ status code will also work
                   })
};

/**
 * exec the command and then retry retryCheckUrl `reps` times at intervals of 2s
 * @param command
 * @param reps
 * @param config
 * @returns {Promise}
 */
const waitUntilRunning = (command, reps, config) => {
    return new Promise((resolve, reject) => {
        log.debug(command);
        exec(command, {maxBuffer: 1024*1024}, err => {  // increase maxBuffer to allow for long npm install traces in child process
            if (err) {
                log.fatal(`error when starting containers: ${err}`);
                return reject(err);
            }

            // wait until app is up (or until have tried n times unsuccessfully)
            return retryCheckUrl(config, 20000, reps)
                .then(resolve)
                .catch(reject)
        })
    })
};

/**
 * start the app through docker-compose and then wait until it can respond to connection requests.
 *
 * app is started in two steps - first, stop it if already running (so it'll startup in a clean state), and then start
 * it using --force-recreate and --build (again, so in clean state). If it fails to start though, restart
 * it. This gives an app, which doesn't properly wait for the db to be up, a second chance.
 *
 * If the config is undefined or null then Reject.
 *
 * @param config    configuration object with properties for host, port
 * @returns {Promise}
 */
module.exports = (config) => {
        // Expect that these environment variables are set for docker-compose - docker-compose.yml passes these through and config.js in the container overrides standard config with them
        // process.env.SENG365_PORT=config.get('port');
        // process.env.SENG365_MYSQL_HOST=config.get('db.host');
        // process.env.SENG365_MYSQL_PORT=config.get('db.port');

    return new Promise((resolve, reject) => {

        if (!config) return reject('no config');
        if (config.get('url')) {
            log.info(`using config value ${config.get('url')} for url`);
            return resolve(config.get('url'));
        }

        let yamlPathname = path.join(config.get('yaml'), `docker-compose.yml`);

        // don't just use 'up' (even with --force-recreate) or 'restart' as both will leave the MySQL container intact

        exec(`docker-compose  -f ${yamlPathname} down`, () => {

            // TODO: if app doesn't start, then wait until mysql ready (how to tell when 1) mysql not exposed outside and 2) no healthcheck configured?) and restart app
            waitUntilRunning(`docker-compose -f ${yamlPathname} up -d --force-recreate --build`, 5, config) // total time must be long enough for mysql to become ready
                .then(url => resolve(url))
                // may have failed because app didn't wait for the db; try simple restart assuming that mysql now ready
                .catch(() => {
                    log.info(`didn't start at first attempt - not waiting for db?`);
                    waitUntilRunning(`docker-compose -f ${yamlPathname} restart app`, 30, config)
                        .then(url => resolve(url))
                        .catch(reject)
                })
        })

    })
};
