"use strict";

const
    ZSchema = require('z-schema'),
    schema = require('../api/swagger-api-v2.1.5.json'),
    options = {assumeAdditional: true}, // ban additional properties and array items from the schema (no unexpected things)
    schemaValidator = new ZSchema(options);

/**
 * validate some object against the API schema
 *
 * @param actual        the object to be validated (usually a req.body)
 * @param schemaPath    if supplied, sub-schema to be used for validation (passed directly to ZSchema schemaPath)
 */
const validateSchema = (actual, schemaPath = 'definitions') => {
    return schemaValidator.validate(actual, schema,  {schemaPath: schemaPath })
};

module.exports = {
    isValidSchema: validateSchema
};
