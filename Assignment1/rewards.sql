# get projects/{id}/rewards
SELECT `reward`.`reward_id`,
    `reward`.`amount`,
    `reward`.`description`
FROM `mysql`.`reward`
WHERE  `reward`.`project_id` =

# put /projects/{id}/rewards
UPDATE `mysql`.`reward`
SET
`amount` = <{amount: }>,
`description` = <{description: }>,
`project_id` = <{project_id: }>
WHERE `reward_id` = <{expr}>;
