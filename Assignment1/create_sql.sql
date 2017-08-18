CREATE DATABASE `seng_365` /*!40100 DEFAULT CHARACTER SET utf8 */;
CREATE TABLE `backer` (
  `project_id` int(11) DEFAULT NULL,
  `backer_id` int(11) DEFAULT NULL,
  KEY `project_id_backer_idx` (`project_id`),
  KEY `backer_id_ref_idx` (`backer_id`),
  CONSTRAINT `backer_id_ref` FOREIGN KEY (`backer_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `project_id_backer` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='link supporter to the project';

CREATE TABLE `creator` (
  `project_id` int(11) DEFAULT NULL,
  `creator_id` int(11) DEFAULT NULL,
  KEY `id_idx` (`project_id`),
  KEY `id_idx1` (`creator_id`),
  CONSTRAINT `project_id_ref` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `user_id_ref` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='link creator and projects';

CREATE TABLE `login_response` (
  `login_id` int(11) NOT NULL,
  `token` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`login_id`),
  CONSTRAINT `user_id_ref_login` FOREIGN KEY (`login_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='each token assign to a id';

CREATE TABLE `pledge` (
  `pledge_id` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `anonymous` tinyint(4) DEFAULT NULL,
  `project_id` int(11) NOT NULL,
  `backer_id` int(11) NOT NULL,
  PRIMARY KEY (`pledge_id`),
  KEY `project_id_ref_pledge_idx` (`project_id`),
  KEY `backer_id_ref_pledge_idx` (`backer_id`),
  CONSTRAINT `backer_id_ref_pledge` FOREIGN KEY (`backer_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `project_id_ref_pledge` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='money from backer, single time single count';

CREATE TABLE `progress` (
  `target` int(11) NOT NULL,
  `current_Pledged` varchar(45) DEFAULT NULL,
  `number_Of_Backers` varchar(45) DEFAULT NULL,
  `project_id` int(11) NOT NULL,
  PRIMARY KEY (`project_id`),
  CONSTRAINT `project_id_progress` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='progress of funding';

CREATE TABLE `project` (
  `project_id` int(11) NOT NULL AUTO_INCREMENT,
  `creation_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `open` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='object containing project, and generated data (creation date, id)';

CREATE TABLE `project_data` (
  `project_id` int(11) NOT NULL,
  `title` varchar(45) NOT NULL,
  `subtitle` varchar(45) NOT NULL,
  `description` varchar(45) NOT NULL,
  `image_uri` varchar(45) DEFAULT NULL,
  `target` int(11) NOT NULL,
  PRIMARY KEY (`project_id`),
  CONSTRAINT `project_id_ref_data` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='detailed info of project';


--CREATE TABLE `public_user` (
--  `id` int(11) NOT NULL,
--  `username` varchar(45) DEFAULT NULL,
--  `location` varchar(45) DEFAULT NULL,
--  `email` varchar(45) DEFAULT NULL,
--  PRIMARY KEY (`id`),
--  CONSTRAINT `user_id_ref_public` FOREIGN KEY (`id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
--) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='basic info about user';

CREATE TABLE `reward` (
  `reward_id` int(11) NOT NULL AUTO_INCREMENT,
  `amount` varchar(45) DEFAULT NULL,
  `description` varchar(45) DEFAULT NULL,
  `project_id` int(11) NOT NULL,
  PRIMARY KEY (`reward_id`),
  KEY `project_id_ref_reward_idx` (`project_id`),
  CONSTRAINT `project_id_ref_reward` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='a project reward';


--CREATE TABLE `user` (
--  `id` int(11) NOT NULL,
--  `password` varchar(45) DEFAULT NULL,
--  PRIMARY KEY (`id`)
--) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='user info and password';
