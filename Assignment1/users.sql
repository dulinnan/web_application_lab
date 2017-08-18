# get /users/{id}
SELECT *
FROM `seng_365`.`public_user`
WHERE 'id' = ?

# post /users
INSERT INTO `seng_365`.`user`
(`id`,
`password`)
VALUES
(<{id: }>,
<{password: }>);

INSERT INTO `seng_365`.`public_user`
(`id`,
`username`,
`location`,
`email`)
VALUES
(<{id: }>,
<{username: }>,
<{location: }>,
<{email: }>);

# login /users/login
INSERT INTO `seng_365`.`login_response`
(`login_id`)
VALUES
(<{login_id: }>);

# logout /users/logout (where login id = input)
DELETE FROM `seng_365`.`login_response`
WHERE <{where_expression}>;

# put /users/{id}
UPDATE `seng_365`.`public_user`
SET
`username` = <{username: }>,
`location` = <{location: }>,
`email` = <{email: }>
WHERE `id` = <{expr}>;

#delete /users/{id} (where id = input)
DELETE FROM `seng_365`.`user`
WHERE <{where_expression}>;

