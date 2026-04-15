-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: ksystem
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `user_list`
--

DROP TABLE IF EXISTS `user_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_list` (
  `userId` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `site` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `userName` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `create_datetime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `create_by` varchar(100) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'administrator',
  `typeID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_list`
--

LOCK TABLES `user_list` WRITE;
/*!40000 ALTER TABLE `user_list` DISABLE KEYS */;
INSERT INTO `user_list` VALUES (1,'pavinee boknoi','pavinee@tovzera.com','admin','admin','018644','2026-01-10 20:12:13','administrator',1),(2,'K_user','admintest@gmail.com','republic korea','K_user','00000','2026-01-10 20:12:13','administrator',1),(3,'Gundhi Pongsuwinai','gundhi@tovzera.com','Thailand','M-marketing','42888','2026-01-10 20:12:13','administrator',8),(4,'M_Accounting ','test@ksave.com','Thailand ','M-Accounting ','4444','2026-01-16 02:31:14','administrator',9),(5,'Paranya Jantraporn','paranya@tovzera.com ','Thailand','Branch-Manager','64480','2026-01-17 04:58:08','administrator',6),(8,'choi in guk','igdj0629@tovzera.com','republic korea','choi in guk','team123~!','2026-02-11 07:27:39','administrator',15),(9,'harry yang','harry@tovzera.com','republic korea','harry','6666','2026-02-11 07:27:39','administrator',14),(10,'jae hee seo','zera@tovzera.com','republic korea','jae hee seo','zera0611','2026-02-20 03:03:46','administrator',12),(1,'pavinee boknoi','pavinee@tovzera.com','admin','admin','018644','2026-01-10 20:12:13','administrator',1),(2,'K_user','admintest@gmail.com','republic korea','K_user','00000','2026-01-10 20:12:13','administrator',1),(3,'Gundhi Pongsuwinai','gundhi@tovzera.com','Thailand','M-marketing','42888','2026-01-10 20:12:13','administrator',8),(4,'M_Accounting ','test@ksave.com','Thailand ','M-Accounting ','4444','2026-01-16 02:31:14','administrator',9),(5,'Paranya Jantraporn','paranya@tovzera.com ','Thailand','Branch-Manager','64480','2026-01-17 04:58:08','administrator',6),(8,'choi in guk','igdj0629@tovzera.com','republic korea','choi in guk','team123~!','2026-02-11 07:27:39','administrator',15),(9,'harry yang','harry@tovzera.com','republic korea','harry','6666','2026-02-11 07:27:39','administrator',14),(10,'jae hee seo','zera@tovzera.com','republic korea','jae hee seo','zera0611','2026-02-20 03:03:46','administrator',12),(7,'executive','superadmin@kenergy-save.com','','executive','$2b$10$Crq8gL3KjNCKpF51jlelXumRlhDbUPWc1d8FyZqQS0VRHSBMaQBlO','2026-01-17 05:22:54','administrator',4);
/*!40000 ALTER TABLE `user_list` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-26 15:12:41
