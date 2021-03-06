/**
 * Created by tjy17 on 24/08/17.
 */

"use strict";

const
    bunyan = require('bunyan');

let
    logger,
    createLogger = (options={name: 'myapp'}) => {

    if (logger) return logger;

    logger = bunyan.createLogger(options);
    return logger;
    }


module.exports = createLogger;
