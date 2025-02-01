DROP SCHEMA mydb;

-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
-- -----------------------------------------------------
-- Schema secdevdb
-- -----------------------------------------------------
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`user` (
  `user_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `profile_pic` VARCHAR(45) NOT NULL DEFAULT 'Default.png',
  `username` VARCHAR(45) NOT NULL DEFAULT 'user',
  `password` LONGTEXT NOT NULL,
  `bio` LONGTEXT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`post`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`post` (
  `post_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(45) NOT NULL DEFAULT 'none',
  `author` INT UNSIGNED NOT NULL,
  `content` LONGTEXT NULL,
  `image` VARCHAR(45) NULL DEFAULT 'none',
  `voteCtr` INT NULL DEFAULT 0,
  `comCtr` INT NULL,
  PRIMARY KEY (`post_id`),
  UNIQUE INDEX `post_id_UNIQUE` (`post_id` ASC) VISIBLE,
  CONSTRAINT `user_post`
    FOREIGN KEY (`author`)
    REFERENCES `mydb`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`comment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`comment` (
  `author` INT UNSIGNED NOT NULL,
  `content` LONGTEXT NOT NULL,
  `comment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_post` INT UNSIGNED NOT NULL,
  `parent_comment` INT UNSIGNED NULL DEFAULT 0,
  `reply` INT NULL,
  PRIMARY KEY (`comment_id`),
  UNIQUE INDEX `comment_id_UNIQUE` (`comment_id` ASC) VISIBLE,
  UNIQUE INDEX `author_UNIQUE` (`author` ASC) VISIBLE,
  INDEX `post_idx` (`parent_post` ASC) VISIBLE,
  CONSTRAINT `user_comment`
    FOREIGN KEY (`author`)
    REFERENCES `mydb`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `post_comment`
    FOREIGN KEY (`parent_post`)
    REFERENCES `mydb`.`post` (`post_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `comment_comment`
    FOREIGN KEY (`comment_id`)
    REFERENCES `mydb`.`comment` (`comment_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`likedBy`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`likedBy` (
  `post_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  INDEX `user_idx` (`user_id` ASC) VISIBLE,
  INDEX `post_idx` (`post_id` ASC) VISIBLE,
  CONSTRAINT `user_likedby`
    FOREIGN KEY (`user_id`)
    REFERENCES `mydb`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `post_likedby`
    FOREIGN KEY (`post_id`)
    REFERENCES `mydb`.`post` (`post_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`dislikedBy`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`dislikedBy` (
  `post_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  INDEX `user_idx` (`user_id` ASC) VISIBLE,
  INDEX `post_idx` (`post_id` ASC) VISIBLE,
  CONSTRAINT `user_dislikedby`
    FOREIGN KEY (`user_id`)
    REFERENCES `mydb`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `post_dislikedby`
    FOREIGN KEY (`post_id`)
    REFERENCES `mydb`.`post` (`post_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`madeBy`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`madeBy` (
  `post_id` INT UNSIGNED NULL DEFAULT 0,
  `user_id` INT UNSIGNED NOT NULL,
  `comment_id` INT UNSIGNED NULL DEFAULT 0,
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE,
  INDEX `post_idx` (`post_id` ASC) VISIBLE,
  INDEX `comment_idx` (`comment_id` ASC) VISIBLE,
  CONSTRAINT `user_madeby`
    FOREIGN KEY (`user_id`)
    REFERENCES `mydb`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `post_madeby`
    FOREIGN KEY (`post_id`)
    REFERENCES `mydb`.`post` (`post_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `comment_madeby`
    FOREIGN KEY (`comment_id`)
    REFERENCES `mydb`.`comment` (`comment_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `mydb` ;

-- -----------------------------------------------------
-- Placeholder table for view `mydb`.`view1`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`view1` (`id` INT);

-- -----------------------------------------------------
-- View `mydb`.`view1`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`view1`;
USE `mydb`;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

use mydb;
SELECT * FROM user;
SELECT * FROM post;
SELECT * FROM comment;
DELETE FROM post WHERE author > 0;
DELETE FROM user WHERE user_id > 0;
ALTER TABLE `user` AUTO_INCREMENT = 1;
INSERT INTO post VALUES(1, 'helo', 2, 'wasup guys welcome to my channel', null, 3, 0);
INSERT INTO post VALUES(2, 'test', 3, 'lolololol', null, 3, 0);