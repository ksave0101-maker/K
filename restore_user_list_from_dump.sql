-- Restore user_list table from backup
-- Date: 2026-04-21
-- Source: user_list (1).sql dump

USE ksystem;

-- Drop existing table if exists
DROP TABLE IF EXISTS user_list_backup_temp;
DROP TABLE IF EXISTS user_list;

-- Create user_list table
CREATE TABLE `user_list` (
  `userId` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name_th` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `site` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `userName` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `create_datetime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `create_by` varchar(100) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'administrator',
  `typeID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert data from backup
INSERT INTO `user_list` (`userId`, `name`, `name_th`, `email`, `site`, `userName`, `password`, `create_datetime`, `create_by`, `typeID`) VALUES
(1, 'pavinee boknoi', NULL, 'pavinee@tovzera.com', 'republic korea', 'pavinee', '$2b$10$2Fhu2xxl2rVguKWGxDofQu0YgwHeAv1ko.M/sJACo1Kx2qBNgm0Qq', '2026-01-10 20:12:13', 'administrator', 18),
(3, 'Gundhi Pongsuwinai', 'กันต์ธีร์ พงษ์สุวินัย', 'gundhi@tovzera.com', 'Thailand', 'M-marketing', '$2b$10$1UiLJ4U7cD2JQ8yNtD1/Pu1XqNOcA5e1VysYoXe.daeil9NN8JfCq', '2026-01-10 20:12:13', 'administrator', 9),
(4, 'Thanrada Tumnichart', 'ธันย์รดา ตำหนิชาติ', 'thanrada@kenergy-save.com', 'Thailand', 'M-Accounting', 'b857eed5c9405c1f2b98048aae506792', '2026-01-16 02:31:14', 'administrator', 11),
(5, 'Paranya Jantraporn', 'ปรัญญา จันทราภรณ์', 'paranya@tovzera.com ', 'Thailand', 'Branch-Manager', '$2b$10$SIf8fumtQBXnx6JjLV.RmuyhnJC6ABm5iQDSDw7HtosZOxi4OdlHm', '2026-01-17 04:58:08', 'administrator', 10),
(7, 'executive ', NULL, 'superadmin@kenergy-save.com', 'admin', 'executive', '$2b$10$cSR1ePnUBtoT39oG9AbQX.szlg9K8gIMcpPXi2gzb89CJ28nHZc.K', '2026-01-17 05:22:54', 'administrator', 4),
(8, 'choi in guk', NULL, 'igdj0629@tovzera.com', 'republic korea', 'choi in guk', '$2b$10$T.aPEqLwrD55Urmb6/uzgeZOup50dxPbrc0rxXObFgueWEuhJ.9Hu', '2026-02-11 07:27:39', 'administrator', 15),
(9, 'harry yang', NULL, 'harry@tovzera.com', 'republic korea', 'harry', '$2b$10$1bS4QiLMcbxqWxulz7jxGeDlVjzBtBub1BjShu0.4sT1Y3VkbFaNa', '2026-02-11 07:27:39', 'administrator', 14),
(10, 'jae hee seo', NULL, 'zera@tovzera.com', 'republic korea', 'jae hee seo', '$2b$10$0GFANUKQoK0PHXrJrm2YXueHD2jzysSRIQEvJrUYSELBa550asv9O', '2026-02-20 03:03:46', 'administrator', 12),
(11, '오은석', NULL, 'esoh@tovzera.com', 'republic korea', 'esoh', '$2b$10$.LMQg9Y.AghafLF6PAkgEuzsOK3jP9NImRuBtZddg5qRUjpxm0s4i', '2026-03-17 06:29:22', 'administrator', 13),
(12, '강동규', NULL, 'kdg1761@naver.com', 'republic korea', 'kdg1761', '$2b$10$C2Izi.TGtF1hAf2UPFx7CuqN9uD8ltCfXq4t.fc0O9Kf94AWkFTmW', '2026-03-17 07:05:00', 'administrator', 13),
(13, 'Kitti Phuphuem', NULL, 'kitti@tovzera.com', 'Thailand', 'Kitti', '88190', '2026-03-20 01:15:25', 'administrator', 5),
(14, 'kattarin sukakate', NULL, 'kattarin30122526@gmail.com', 'admin', 'Accountant84', '$2b$10$GFj1MvCi541XdxOUcu/aHu2yA.OEZnMF/MsF.y6IkRKaddlR19aku', '2026-03-24 10:20:42', 'thailand admin', 4),
(15, 'NAM CHAL JANG', NULL, 'Patrick@gmail.com', 'Thailand', 'patrick', 'ead2c45193f745276a47543d47bb718b', '2026-03-24 15:46:46', 'administrator', 4),
(19, 'ฐานิดา', NULL, 'yodin.thanida@gmail.com', 'Thailand', 'yodin.thanida.1', '50f64af6b79adf9acd80ca20addaed1d', '2026-04-07 05:13:40', 'administrator', 26),
(20, 'ธิศนา ', NULL, 'thissana.nhoowhong@gmail.com', 'Thailand', 'thissana.nhoowhong.1', 'c90b55e488a9731d52f5286dd20fafc1', '2026-04-07 05:18:36', 'administrator', 25),
(21, 'สินาด', NULL, 'sinad270@gmail.com', 'Thailand', 'sinad270.1', '6502509ed0b8795f5f9a3364ad2d370c', '2026-04-07 05:21:26', 'administrator', 25);

-- Add indexes
ALTER TABLE `user_list`
  ADD PRIMARY KEY (`userId`),
  ADD KEY `idx_site` (`site`),
  ADD KEY `idx_typeID` (`typeID`),
  ADD KEY `idx_userName` (`userName`);

-- Enable auto increment
ALTER TABLE `user_list` MODIFY `userId` int NOT NULL AUTO_INCREMENT;

COMMIT;
