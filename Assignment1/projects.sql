--# get /projects
--SELECT `project_data`.`project_id`,
--    `project_data`.`title`,
--    `project_data`.`subtitle`,
--    `project_data`.`image_uri`
--FROM `mysql`.`project_data`;
--
--# get /projects/{id}
--## get project data
--SELECT
--    `project_data`.`title`,
--    `project_data`.`subtitle`,
--    `project_data`.`description`,
--    `project_data`.`image_uri`,
--    `project_data`.`target`
--FROM `mysql`.`project_data`
--WHERE `project_data`.`project_id` = ?
--
--## get creator name
--SELECT `creator`.`creator_id`, `public_user`.`username`
--FROM `mysql`.`creator` JOIN `public_user`.`username` ON `public_user`.`id` = `creator`.`creator_id`
--WHERE `creator`.`project_id` = ?
--
--## get rewards
--SELECT `reward`.`reward_id`,
--    `reward`.`amount`,
--    `reward`.`description`,
--FROM `mysql`.`reward`
--WHERE `reward`.`project_id` = ?

--## get project details
--SELECT `project`.`creation_date`
--FROM `mysql`.`project`
--WHERE  `project`.`project_id` =?

--## get progress
--SELECT `progress`.`target`,
--    `progress`.`current_Pledged`,
--    `progress`.`number_Of_Backers`
--FROM `mysql`.`progress`
--WHERE `progress`.`project_id` = ?
--
--## get backer
--SELECT `public_user`.`username`, `pledge`.`amount`
--FROM `mysql`.`pledge` JOIN `public_user`.`username` ON `pledge`.`backer_id` =  `public_user`.`id`
--WHERE  `pledge`.`project_id` = ? AND `pledge`.`backer_id` = `public_user`.`id` AND `pledge`.`anonymous` = 0

--# get /projects/{id}/image
--SELECT `project_data`.`image_uri`
--FROM `mysql`.`project_data`
--WHERE `project_data`.`project_id` = ?

# post /projects
INSERT INTO `mysql`.`project`
(`project_id`)
VALUES
(<{project_id: }>);

--# post /projects/{id}/pledge
--INSERT INTO `mysql`.`pledge`
--(`amount`,
--`anonymous`,
--`project_id`,
--`backer_id`)
--VALUES
--(<{amount: }>,
--<{anonymous: }>,
--<{project_id: }>,
--<{backer_id: }>);

--# put /projects/{id}
--UPDATE `mysql`.`project`
--SET `open` = 0
--WHERE `project_id` = <{expr}>;

--# put /projects/{id}/image
--UPDATE `mysql`.`project_data`
--SET `image_uri` = <{image_uri: }>
--WHERE `project_id` = <{expr}>
