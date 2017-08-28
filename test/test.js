/**
 * Created by linnandu on 27/08/17.
 */
const uuidV4 = require('uuid/v4');
const nJwt = require('njwt');
const jwt_decode = require('jwt-decode');
let secretKey = uuidV4();

let claims = {
    userid: 'userid',
    password: 'password'
};

let jwt = nJwt.create(claims,secretKey);
let token = jwt.compact();
let decoded = jwt_decode(token);

console.log(decoded['userid']);