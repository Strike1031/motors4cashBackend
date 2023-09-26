/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 100428
 Source Host           : localhost:3306
 Source Schema         : motors4cash

 Target Server Type    : MySQL
 Target Server Version : 100428
 File Encoding         : 65001

 Date: 26/09/2023 01:56:49
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for appointments
-- ----------------------------
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `postcode` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `phone` int NULL DEFAULT NULL,
  `car_id` int NULL DEFAULT NULL,
  `appointment_place` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `appointment_date` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `appointment_time` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of appointments
-- ----------------------------
INSERT INTO `appointments` VALUES (1, 'abc@gmail.com', '3215sdfasf', 2147483647, 1, '112', 'Sunday,  24 Sep', '10:20', '2023-09-24 06:07:45', '2023-09-24 06:07:45');
INSERT INTO `appointments` VALUES (2, 'abc@gmail.com', '3215sdfasf', 2147483647, 1, '112', 'Sunday,  24 Sep', '10:20', '2023-09-24 06:11:19', '2023-09-24 06:11:19');
INSERT INTO `appointments` VALUES (3, 'abc@gmail.com', '3215sdfasf', 2147483647, 1, '112', 'Sunday,  24 Sep', '10:20', '2023-09-24 06:11:22', '2023-09-24 06:11:22');
INSERT INTO `appointments` VALUES (4, 'abc@gmail.com', '3215sdfasf', 2147483647, 1, '112', 'Sunday,  24 Sep', '10:20', '2023-09-24 06:13:03', '2023-09-24 06:13:03');
INSERT INTO `appointments` VALUES (5, 'abc@gmail.com', '3215sdfasf', 2147483647, 1, '112', 'Sunday,  24 Sep', '10:20', '2023-09-24 06:13:12', '2023-09-24 06:13:12');
INSERT INTO `appointments` VALUES (6, 'abc@gmail.com', '3215sdfasf', 2147483647, 1, '1111', 'Sunday,  24 Sep', '10:00', '2023-09-24 06:13:50', '2023-09-24 06:13:50');
INSERT INTO `appointments` VALUES (7, 'asdfasdf', 'adsfasdfsda', 0, 1, '1111', 'Sunday,  24 Sep', '10:00', '2023-09-24 06:15:37', '2023-09-24 06:15:37');
INSERT INTO `appointments` VALUES (8, 'asdfasdf', 'adsfasdfsda', 0, 1, '1111', 'Sunday,  24 Sep', '10:00', '2023-09-24 06:15:38', '2023-09-24 06:15:38');
INSERT INTO `appointments` VALUES (9, 'asdfasdf', 'adsfasdfsda', 0, 1, '1111', 'Sunday,  24 Sep', '10:00', '2023-09-24 06:15:39', '2023-09-24 06:15:39');
INSERT INTO `appointments` VALUES (10, 'asdfasdf', 'adsfasdfsda', 0, 1, '1111', 'Sunday,  24 Sep', '10:00', '2023-09-24 06:15:58', '2023-09-24 06:15:58');
INSERT INTO `appointments` VALUES (11, 'ewfewef', 'sdfsdfsdf56651', 2147483647, 1, '', 'Saturday,  30 Sep', '12:40', '2023-09-24 06:34:53', '2023-09-24 06:34:53');
INSERT INTO `appointments` VALUES (12, '', '', 0, 1, '123123123123', 'Wednesday,  27 Sep', '10:40', '2023-09-25 23:37:54', '2023-09-25 23:37:54');

-- ----------------------------
-- Table structure for cars
-- ----------------------------
DROP TABLE IF EXISTS `cars`;
CREATE TABLE `cars`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_number` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `vehicle_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `created_year` int NULL DEFAULT NULL,
  `price` int NULL DEFAULT NULL,
  `bodyStyle` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `fuelType` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `color` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `mileage` int NULL DEFAULT NULL,
  `previous_owners` int NULL DEFAULT NULL,
  `service_history` int NULL DEFAULT NULL,
  `personal_register` tinyint(1) NULL DEFAULT NULL,
  `import_status` int NULL DEFAULT NULL,
  `v_key` tinyint(1) NULL DEFAULT NULL,
  `non_runner` tinyint(1) NULL DEFAULT NULL,
  `mot_month` int NULL DEFAULT NULL,
  `insurance` int NULL DEFAULT NULL,
  `private_hire` tinyint(1) NULL DEFAULT NULL,
  `driving_tuition` tinyint(1) NULL DEFAULT NULL,
  `police` tinyint(1) NULL DEFAULT NULL,
  `seats` tinyint(1) NULL DEFAULT NULL,
  `zone` int NULL DEFAULT NULL,
  `component` int NULL DEFAULT NULL,
  `fault` int NULL DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cars
-- ----------------------------
INSERT INTO `cars` VALUES (1, 'RA13PRA', 'TESLA MODEL S 75D', 2018, NULL, 'Hatchback', 'ELECTRICITY', 'RED', 13000, 2, 2, 1, 1, 1, 1, 2, 2, 1, 1, 0, 1, 2, 4, 3, '2023-09-24 06:07:45', '2023-09-25 23:37:54');

SET FOREIGN_KEY_CHECKS = 1;
