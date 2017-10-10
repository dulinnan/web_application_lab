'use strict';

const
    VERSION = 'v2',
    BASEURL = 'http://localhost:4941',
    BASEPATH = `/api/${VERSION}`,
    convict = require('convict');

let
    config = convict({
        version: {
            format: String,
            default: VERSION,
            arg: 'version'
        },
        baseurl: {
            format: 'url',
            default: BASEURL,
            arg: 'baseurl'
        },
        basepath: {
            format: String,
            default: BASEPATH,
            arg: 'basepath'
        },
        yaml: {
            format: String,
            default: ``,
            arg: 'docker-compose-yaml',
        },
        url: {
            format: 'url',
            default: BASEURL+BASEPATH,
            arg: 'url',
            env: 'URL'
        },
        log: {
            name: {
                format: String,
                default: 'apitest'
            },
            level: {
                format: String,
                default: 'debug',
                arg: 'log-level',
            }
        },
        authToken: {
            format: String,
            default: 'X-Authorization'
        },
    });

module.exports = config;
