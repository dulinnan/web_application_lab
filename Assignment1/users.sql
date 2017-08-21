# get /users/{id}
SELECT *
FROM `mysql`.`public_user`
WHERE 'id' = ?

# post /users
INSERT INTO `mysql`.`Users`
(`id`,
`password`)
VALUES
(<{id: }>,
<{password: }>);

INSERT INTO `mysql`.`public_user`
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
INSERT INTO `mysql`.`login_response`
(`login_id`)
VALUES
(<{login_id: }>);

# logout /users/logout (where login id = input)
DELETE FROM `mysql`.`login_response`
WHERE <{where_expression}>;

# put /users/{id}
UPDATE `mysql`.`public_user`
SET
`username` = <{username: }>,
`location` = <{location: }>,
`email` = <{email: }>
WHERE `id` = <{expr}>;

#delete /users/{id} (where id = input)
DELETE FROM `mysql`.`Users`
WHERE <{where_expression}>;
