-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema covid
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema covid
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `covid` DEFAULT CHARACTER SET utf8 ;
USE `covid` ;

-- -----------------------------------------------------
-- Table `covid`.`userType`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `covid`.`userType` ;

CREATE TABLE IF NOT EXISTS `covid`.`userType` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userType` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `userType_UNIQUE` (`userType` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `covid`.`user`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `covid`.`user` ;

CREATE TABLE IF NOT EXISTS `covid`.`user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fullName` VARCHAR(255) NOT NULL,
  `address` VARCHAR(255) NULL,
  `dateOfBirth` DATE NULL,
  `phoneNumber` VARCHAR(45) NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NULL,
  `fkUserType` INT NULL,
  `registrationDate` DATE NOT NULL,
  `lastLoginDate` DATE NULL,
  `active` TINYINT NULL,
  `approved` TINYINT NULL,
  `registrationNumber` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  INDEX `fkUserType_idx` (`fkUserType` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  CONSTRAINT `fkUserType`
    FOREIGN KEY (`fkUserType`)
    REFERENCES `covid`.`userType` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `covid`.`assessment`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `covid`.`assessment` ;

CREATE TABLE IF NOT EXISTS `covid`.`assessment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date` DATE NOT NULL,
  `viewedByNurse` TINYINT NOT NULL,
  `fkPatientId` INT NOT NULL,
  `q_difficultyBreathing` TINYINT NOT NULL,
  `q_ageRange` ENUM('', '5', '6-17', '18+') NULL,
  `q_firstSymptoms` TINYINT NULL,
  `q_situation` TINYINT NULL,
  `q_secondSymptoms` TINYINT NULL,
  `q_hasBeenCloseContact` TINYINT NOT NULL,
  `q_hasBeenTested` TINYINT NOT NULL,
  `q_hasTraveled` TINYINT NOT NULL,
  `assignedDoctorId` INT NULL,
  `rejected` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `fkPatientId_idx` (`fkPatientId` ASC) VISIBLE,
  CONSTRAINT `fk_assessment_patient`
    FOREIGN KEY (`fkPatientId`)
    REFERENCES `covid`.`user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `covid`.`appointment`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `covid`.`appointment` ;

CREATE TABLE IF NOT EXISTS `covid`.`appointment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `location` VARCHAR(255) NOT NULL,
  `startDateTime` DATETIME NOT NULL,
  `endDateTime` DATETIME NULL,
  `fkPatientId` INT NULL,
  `fkProfessionalId` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `fkProfessionalId_idx` (`fkProfessionalId` ASC) VISIBLE,
  INDEX `fkPatientId_idx` (`fkPatientId` ASC) VISIBLE,
  CONSTRAINT `fk_appointment_patient`
    FOREIGN KEY (`fkProfessionalId`)
    REFERENCES `covid`.`user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_appointment_professional`
    FOREIGN KEY (`fkPatientId`)
    REFERENCES `covid`.`user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

GRANT ALL ON `covid`.* TO 'coviddbuser';

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Data for table `covid`.`userType`
-- -----------------------------------------------------
START TRANSACTION;
USE `covid`;
INSERT INTO `covid`.`userType` (`id`, `userType`) VALUES (1, 'patient');
INSERT INTO `covid`.`userType` (`id`, `userType`) VALUES (2, 'doctor');
INSERT INTO `covid`.`userType` (`id`, `userType`) VALUES (3, 'nurse');
INSERT INTO `covid`.`userType` (`id`, `userType`) VALUES (4, 'manager');

COMMIT;


-- -----------------------------------------------------
-- Data for table `covid`.`user`
-- -----------------------------------------------------
START TRANSACTION;
USE `covid`;
INSERT INTO `covid`.`user` (`id`, `fullName`, `address`, `dateOfBirth`, `phoneNumber`, `email`, `password`, `fkUserType`, `registrationDate`, `lastLoginDate`, `active`, `approved`, `registrationNumber`) VALUES (1, 'Patrick Smith', '123 Test', '2000-01-01', '5147557112', 'patient@test.com', 'patient', 1, '2021-10-17', NULL, 1, 1, NULL);
INSERT INTO `covid`.`user` (`id`, `fullName`, `address`, `dateOfBirth`, `phoneNumber`, `email`, `password`, `fkUserType`, `registrationDate`, `lastLoginDate`, `active`, `approved`, `registrationNumber`) VALUES (2, 'Naril Logan', '123 Test', '2002-02-02', '5147557112', 'nurse@test.com', 'nurse', 3, '2021-10-17', NULL, 1, 1, '12345678');
INSERT INTO `covid`.`user` (`id`, `fullName`, `address`, `dateOfBirth`, `phoneNumber`, `email`, `password`, `fkUserType`, `registrationDate`, `lastLoginDate`, `active`, `approved`, `registrationNumber`) VALUES (3, 'Daniel Chang', '123 Test', '2003-03-03', '5147557112', 'doctor@test.com', 'doctor', 2, '2021-10-17', NULL, 1, 1, '987654321');
INSERT INTO `covid`.`user` (`id`, `fullName`, `address`, `dateOfBirth`, `phoneNumber`, `email`, `password`, `fkUserType`, `registrationDate`, `lastLoginDate`, `active`, `approved`, `registrationNumber`) VALUES (4, 'Admin', '1234 Admin', '2004-04-04', '5147557112', 'admin@test.com', 'admin', 4, '2021-10-17', NULL, 1, 1, NULL);
INSERT INTO `covid`.`user` (`id`, `fullName`, `address`, `dateOfBirth`, `phoneNumber`, `email`, `password`, `fkUserType`, `registrationDate`, `lastLoginDate`, `active`, `approved`, `registrationNumber`) VALUES (5, 'Paul Miller', '222 Avenue', '1999-01-01', '4507557777', 'pmiller@test.com', 'pmiller', 1, '2021-11-11', NULL, 1, 1, NULL);
INSERT INTO `covid`.`user` (`id`, `fullName`, `address`, `dateOfBirth`, `phoneNumber`, `email`, `password`, `fkUserType`, `registrationDate`, `lastLoginDate`, `active`, `approved`, `registrationNumber`) VALUES (6, 'Peppa Swine', '333 Street', '2000-02-02', '8195857766', 'pswine@test.com', 'pswine', 1, '2021-11-11', NULL, 1, 1, NULL);
INSERT INTO `covid`.`user` (`id`, `fullName`, `address`, `dateOfBirth`, `phoneNumber`, `email`, `password`, `fkUserType`, `registrationDate`, `lastLoginDate`, `active`, `approved`, `registrationNumber`) VALUES (7, 'Phil Gamon', '444 Road', '2001-03-03', '5147310607', 'pgamon@test.com', 'pgamon', 1, '2021-11-11', NULL, 1, 1, NULL);
INSERT INTO `covid`.`user` (`id`, `fullName`, `address`, `dateOfBirth`, `phoneNumber`, `email`, `password`, `fkUserType`, `registrationDate`, `lastLoginDate`, `active`, `approved`, `registrationNumber`) VALUES (8, 'Phillys Vance', '555 Boulevard', '1975-02-04', '5147331234', 'pvance@test.com', 'pvance', 1, '2021-11-11', NULL, 1, 1, NULL);
INSERT INTO `covid`.`user` (`id`, `fullName`, `address`, `dateOfBirth`, `phoneNumber`, `email`, `password`, `fkUserType`, `registrationDate`, `lastLoginDate`, `active`, `approved`, `registrationNumber`) VALUES (9, 'Nancy Brown', '666 Highway', '1985-05-15', '5148989909', 'nbrown@test.com', 'nbrown', 3, '2021-11-11', NULL, 1, 0, '335577');
INSERT INTO `covid`.`user` (`id`, `fullName`, `address`, `dateOfBirth`, `phoneNumber`, `email`, `password`, `fkUserType`, `registrationDate`, `lastLoginDate`, `active`, `approved`, `registrationNumber`) VALUES (10, 'Nicolas Tesla', '777 Crescent', '1956-11-11', '5142546011', 'ntesla@test.com', 'ntesla', 3, '2021-11-11', NULL, 1, 1, '556677');
INSERT INTO `covid`.`user` (`id`, `fullName`, `address`, `dateOfBirth`, `phoneNumber`, `email`, `password`, `fkUserType`, `registrationDate`, `lastLoginDate`, `active`, `approved`, `registrationNumber`) VALUES (11, 'Daryl Phibin', '888 Rondpoint', '1988-05-02', '5144441919', 'dphibin@test.com', 'dphibin', 2, '2021-11-11', NULL, 1, 1, '112233');
INSERT INTO `covid`.`user` (`id`, `fullName`, `address`, `dateOfBirth`, `phoneNumber`, `email`, `password`, `fkUserType`, `registrationDate`, `lastLoginDate`, `active`, `approved`, `registrationNumber`) VALUES (12, 'Dom Khan', '999 Ruelle', '1995-11-12', '5143546676', 'dkhan@test.com', 'dkhan', 2, '2021-11-11', NULL, 1, 0, '667788');
INSERT INTO `covid`.`user` (`id`, `fullName`, `address`, `dateOfBirth`, `phoneNumber`, `email`, `password`, `fkUserType`, `registrationDate`, `lastLoginDate`, `active`, `approved`, `registrationNumber`) VALUES (13, 'Prince Consuella', '1001 Castle', '2002-07-07', '5145695808', 'pconsuella@test.com', 'pconsuella', 1, '2021-11-11', NULL, 1, 1, NULL);

COMMIT;


-- -----------------------------------------------------
-- Data for table `covid`.`assessment`
-- -----------------------------------------------------
START TRANSACTION;
USE `covid`;
INSERT INTO `covid`.`assessment` (`id`, `date`, `viewedByNurse`, `fkPatientId`, `q_difficultyBreathing`, `q_ageRange`, `q_firstSymptoms`, `q_situation`, `q_secondSymptoms`, `q_hasBeenCloseContact`, `q_hasBeenTested`, `q_hasTraveled`, `assignedDoctorId`, `rejected`) VALUES (1, '2021-11-01', 1, 1, 1, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, 0);
INSERT INTO `covid`.`assessment` (`id`, `date`, `viewedByNurse`, `fkPatientId`, `q_difficultyBreathing`, `q_ageRange`, `q_firstSymptoms`, `q_situation`, `q_secondSymptoms`, `q_hasBeenCloseContact`, `q_hasBeenTested`, `q_hasTraveled`, `assignedDoctorId`, `rejected`) VALUES (2, '2021-11-01', 1, 1, 1, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, 0);
INSERT INTO `covid`.`assessment` (`id`, `date`, `viewedByNurse`, `fkPatientId`, `q_difficultyBreathing`, `q_ageRange`, `q_firstSymptoms`, `q_situation`, `q_secondSymptoms`, `q_hasBeenCloseContact`, `q_hasBeenTested`, `q_hasTraveled`, `assignedDoctorId`, `rejected`) VALUES (3, '2021-11-02', 1, 1, 1, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, 0);
INSERT INTO `covid`.`assessment` (`id`, `date`, `viewedByNurse`, `fkPatientId`, `q_difficultyBreathing`, `q_ageRange`, `q_firstSymptoms`, `q_situation`, `q_secondSymptoms`, `q_hasBeenCloseContact`, `q_hasBeenTested`, `q_hasTraveled`, `assignedDoctorId`, `rejected`) VALUES (4, '2021-11-03', 1, 1, 1, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, 0);
INSERT INTO `covid`.`assessment` (`id`, `date`, `viewedByNurse`, `fkPatientId`, `q_difficultyBreathing`, `q_ageRange`, `q_firstSymptoms`, `q_situation`, `q_secondSymptoms`, `q_hasBeenCloseContact`, `q_hasBeenTested`, `q_hasTraveled`, `assignedDoctorId`, `rejected`) VALUES (5, '2021-11-03', 1, 1, 1, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, 0);
INSERT INTO `covid`.`assessment` (`id`, `date`, `viewedByNurse`, `fkPatientId`, `q_difficultyBreathing`, `q_ageRange`, `q_firstSymptoms`, `q_situation`, `q_secondSymptoms`, `q_hasBeenCloseContact`, `q_hasBeenTested`, `q_hasTraveled`, `assignedDoctorId`, `rejected`) VALUES (6, '2021-11-04', 1, 1, 1, NULL, NULL, NULL, NULL, 1, 1, 1, 11, 0);
INSERT INTO `covid`.`assessment` (`id`, `date`, `viewedByNurse`, `fkPatientId`, `q_difficultyBreathing`, `q_ageRange`, `q_firstSymptoms`, `q_situation`, `q_secondSymptoms`, `q_hasBeenCloseContact`, `q_hasBeenTested`, `q_hasTraveled`, `assignedDoctorId`, `rejected`) VALUES (7, '2021-11-05', 1, 6, 0, '5', 1, 0, NULL, 1, 1, 1, 11, 0);
INSERT INTO `covid`.`assessment` (`id`, `date`, `viewedByNurse`, `fkPatientId`, `q_difficultyBreathing`, `q_ageRange`, `q_firstSymptoms`, `q_situation`, `q_secondSymptoms`, `q_hasBeenCloseContact`, `q_hasBeenTested`, `q_hasTraveled`, `assignedDoctorId`, `rejected`) VALUES (8, '2021-11-06', 1, 7, 0, '6-17', 0, 0, 1, 0, 0, 0, 11, 0);
INSERT INTO `covid`.`assessment` (`id`, `date`, `viewedByNurse`, `fkPatientId`, `q_difficultyBreathing`, `q_ageRange`, `q_firstSymptoms`, `q_situation`, `q_secondSymptoms`, `q_hasBeenCloseContact`, `q_hasBeenTested`, `q_hasTraveled`, `assignedDoctorId`, `rejected`) VALUES (9, '2021-11-07', 1, 8, 0, '18+', 1, NULL, NULL, 0, 0, 0, 11, 0);
INSERT INTO `covid`.`assessment` (`id`, `date`, `viewedByNurse`, `fkPatientId`, `q_difficultyBreathing`, `q_ageRange`, `q_firstSymptoms`, `q_situation`, `q_secondSymptoms`, `q_hasBeenCloseContact`, `q_hasBeenTested`, `q_hasTraveled`, `assignedDoctorId`, `rejected`) VALUES (10, '2021-11-08', 1, 13, 0, '18+', 0, 1, NULL, 0, 1, 0, 11, 0);

COMMIT;


-- -----------------------------------------------------
-- Data for table `covid`.`appointment`
-- -----------------------------------------------------
START TRANSACTION;
USE `covid`;
INSERT INTO `covid`.`appointment` (`id`, `location`, `startDateTime`, `endDateTime`, `fkPatientId`, `fkProfessionalId`) VALUES (1, 'Hospital', '2021-11-25 12:00:00', '2021-11-25 13:00:00', 1, 11);
INSERT INTO `covid`.`appointment` (`id`, `location`, `startDateTime`, `endDateTime`, `fkPatientId`, `fkProfessionalId`) VALUES (2, 'Hospital', '2021-11-25 14:00:00', '2021-11-25 14:30:00', 6, 11);
INSERT INTO `covid`.`appointment` (`id`, `location`, `startDateTime`, `endDateTime`, `fkPatientId`, `fkProfessionalId`) VALUES (3, 'Hospital', '2021-11-25 08:00:00', '2021-11-25 10:00:00', 7, 11);
INSERT INTO `covid`.`appointment` (`id`, `location`, `startDateTime`, `endDateTime`, `fkPatientId`, `fkProfessionalId`) VALUES (4, 'Hospital', '2021-11-17 09:30:00', '2021-11-17 10:30:00', 8, 11);
INSERT INTO `covid`.`appointment` (`id`, `location`, `startDateTime`, `endDateTime`, `fkPatientId`, `fkProfessionalId`) VALUES (5, 'Hospital', '2021-12-01 10:30:00', '2021-12-01 11:30:00', 9, 11);

COMMIT;

