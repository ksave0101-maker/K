-- Restore user_list table from backup
-- Table structure for table `user_list`

DROP TABLE IF EXISTS `user_list`;
CREATE TABLE `user_list` (
  `userId` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `site` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `userName` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `create_datetime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `create_by` varchar(100) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'administrator',
  `typeID` int NOT NULL,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_list`
--

LOCK TABLES `user_list` WRITE;
INSERT INTO `user_list` VALUES (1,'pavinee boknoi','pavinee@tovzera.com','admin','pavinee','$2b$10$XMDItbWEz/T2fSWUM4bTTejEXERSzblHBfb1YpikUy0C2t8sJDIFC','2026-01-10 20:12:13','administrator',7),(2,'K_user','admintest@gmail.com','republic korea','K_user','00000','2026-01-10 20:12:13','administrator',1),(3,'Gundhi Pongsuwinai','gundhi@tovzera.com','Thailand','M-marketing','42888','2026-01-10 20:12:13','administrator',8),(4,'Thanrada Thumnichart','test@ksave.com','Thailand','M-Accounting','4444','2026-01-16 02:31:14','administrator',9),(5,'Paranya Jantraporn','paranya@tovzera.com ','Thailand','Branch-Manager','64480','2026-01-17 04:58:08','administrator',6),(7,'executive','superadmin@kenergy-save.com','admin','executive','$2b$10$q6IfzQ42ObCAuDfz2VuHWOV5O/vEr13kvl6PH6JGmKVliLhUOPsdS','2026-01-17 05:22:54','administrator',7),(8,'choi in guk','igdj0629@tovzera.com','republic korea','choi in guk','team123~\!','2026-02-11 07:27:39','administrator',15),(9,'harry yang','harry@tovzera.com','republic korea','harry','6666','2026-02-11 07:27:39','administrator',14),(10,'jae hee seo','zera@tovzera.com','republic korea','jae hee seo','zera0611','2026-02-20 03:03:46','administrator',12),(11,'Kitti Phupluem','','Thailand','maintanance','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVn27MiTKe','2026-04-08 04:11:26','admin',5);
UNLOCK TABLES;
