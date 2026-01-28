-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 30, 2025 at 12:16 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `project_aunqa`
--

-- --------------------------------------------------------

--
-- Table structure for table `assessment_sessions`
--

CREATE TABLE `assessment_sessions` (
  `id` int(11) NOT NULL,
  `level_id` varchar(50) NOT NULL,
  `faculty_id` varchar(100) DEFAULT NULL,
  `faculty_name` varchar(255) DEFAULT NULL,
  `major_id` varchar(100) DEFAULT NULL,
  `major_name` varchar(255) DEFAULT NULL,
  `evaluator_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assessment_sessions`
--

INSERT INTO `assessment_sessions` (`id`, `level_id`, `faculty_id`, `faculty_name`, `major_id`, `major_name`, `evaluator_id`, `created_at`) VALUES
(1, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-09-26 14:43:38'),
(2, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-09-26 14:50:16'),
(3, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-09-26 14:52:56'),
(4, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-09-26 14:55:20'),
(5, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-09-26 15:03:10'),
(6, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-09-26 15:03:26'),
(7, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-09-26 15:03:44'),
(8, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-09-26 15:03:56'),
(9, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-09-26 15:09:33'),
(10, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-09-26 15:09:54'),
(11, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-09-26 15:26:24'),
(12, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-09-26 15:26:31'),
(13, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-09-26 16:15:50'),
(14, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-09-26 16:16:41'),
(15, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-09-26 16:17:50'),
(16, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-09-29 08:25:29'),
(17, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-09-29 08:25:55'),
(18, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-09-29 08:29:24'),
(19, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-09-29 08:35:23');

-- --------------------------------------------------------

--
-- Table structure for table `evaluations`
--

CREATE TABLE `evaluations` (
  `evaluation_id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `indicator_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `evaluator_id` int(11) DEFAULT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `evidence_file` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'submitted',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluations_ce`
--

CREATE TABLE `evaluations_ce` (
  `evaluation_id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `indicator_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `evaluator_id` int(11) DEFAULT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `evidence_file` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'submitted',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluations_ce_ai`
--

CREATE TABLE `evaluations_ce_ai` (
  `evaluation_id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `indicator_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `evaluator_id` int(11) DEFAULT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `evidence_file` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'submitted',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `indicators`
--

CREATE TABLE `indicators` (
  `id` int(11) NOT NULL,
  `component_id` int(11) NOT NULL,
  `sequence` varchar(10) NOT NULL,
  `indicator_type` varchar(50) NOT NULL,
  `criteria_type` varchar(50) NOT NULL,
  `indicator_name` text NOT NULL,
  `data_source` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `indicators`
--

INSERT INTO `indicators` (`id`, `component_id`, `sequence`, `indicator_type`, `criteria_type`, `indicator_name`, `data_source`, `created_at`, `updated_at`) VALUES
(3, 1, '1', 'ผลผลิต', 'เชิงปริมาณ', '1', '1', '2025-09-18 15:46:28', '2025-09-18 15:46:28'),
(4, 1, '5555', 'กระบวนการ', 'เชิงเวลา', '5555', '555', '2025-09-18 15:47:16', '2025-09-18 15:47:16'),
(5, 1, '1', 'ปัจจัยนำเข้า', 'เชิงปริมาณ', '1213414214214', '2141241241241', '2025-09-18 15:54:16', '2025-09-18 15:54:16');

-- --------------------------------------------------------

--
-- Table structure for table `indicators_ce`
--

CREATE TABLE `indicators_ce` (
  `id` int(11) NOT NULL,
  `component_id` int(11) NOT NULL,
  `sequence` varchar(50) NOT NULL,
  `indicator_type` varchar(100) NOT NULL,
  `criteria_type` varchar(100) NOT NULL,
  `indicator_name` text NOT NULL,
  `data_source` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `indicators_ce_ai`
--

CREATE TABLE `indicators_ce_ai` (
  `id` int(11) NOT NULL,
  `component_id` int(11) NOT NULL,
  `sequence` varchar(50) NOT NULL,
  `indicator_type` varchar(100) NOT NULL,
  `criteria_type` varchar(100) NOT NULL,
  `indicator_name` text NOT NULL,
  `data_source` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `indicators_ce_ai`
--

INSERT INTO `indicators_ce_ai` (`id`, `component_id`, `sequence`, `indicator_type`, `criteria_type`, `indicator_name`, `data_source`) VALUES
(1, 4, '2.1', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.1 Expected Learning Outcomes', '');

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `program_id` int(11) NOT NULL,
  `program_name` varchar(200) NOT NULL,
  `faculty` varchar(100) DEFAULT NULL,
  `level` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `programs`
--

INSERT INTO `programs` (`program_id`, `program_name`, `faculty`, `level`, `status`) VALUES
(1, 'ตัวอย่างหลักสูตร', NULL, NULL, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `quality_components1`
--

CREATE TABLE `quality_components1` (
  `id` int(11) NOT NULL,
  `component_id` varchar(50) DEFAULT NULL,
  `quality_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quality_components1`
--

INSERT INTO `quality_components1` (`id`, `component_id`, `quality_name`) VALUES
(1, '1', ' องค์ประกอบที่ 1 : ผลการประเมินตนเอง ระดับหลักสูตร ตามเกณฑ์ สกอ.'),
(5, '2', 'องค์ประกอบที่ 2 : ผลการดำเนินตามเกณฑ์ AUN-QA');

-- --------------------------------------------------------

--
-- Table structure for table `quality_components_ce`
--

CREATE TABLE `quality_components_ce` (
  `id` int(11) NOT NULL,
  `component_id` int(11) DEFAULT NULL,
  `quality_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quality_components_ce`
--

INSERT INTO `quality_components_ce` (`id`, `component_id`, `quality_name`) VALUES
(3, 1, ' องค์ประกอบที่ 1 : ผลการประเมินตนเอง ระดับหลักสูตร ตามเกณฑ์ สกอ.'),
(4, 2, 'องค์ประกอบที่ 2 : ผลการดำเนินตามเกณฑ์ AUN-QA');

-- --------------------------------------------------------

--
-- Table structure for table `quality_components_ce_ai`
--

CREATE TABLE `quality_components_ce_ai` (
  `id` int(11) NOT NULL,
  `component_id` int(11) DEFAULT NULL,
  `quality_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quality_components_ce_ai`
--

INSERT INTO `quality_components_ce_ai` (`id`, `component_id`, `quality_name`) VALUES
(3, 1, ' องค์ประกอบที่ 1 : ผลการประเมินตนเอง ระดับหลักสูตร ตามเกณฑ์ สกอ.'),
(4, 2, 'องค์ประกอบที่ 2 : ผลการดำเนินตามเกณฑ์ AUN-QA');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'Admin'),
(2, 'Staff'),
(3, 'Evaluator'),
(4, 'External Evaluator'),
(5, 'Dev');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `role_id`, `department`, `password`) VALUES
(2, 'Admin', 'admin@example.com', 1, NULL, 'adminpass'),
(3, 'Staff', 'staff@example.com', 2, NULL, 'staffpass'),
(4, 'Evaluator Name', 'evaluator@example.com', 3, NULL, 'evaluatorpass'),
(6, 'External Evaluator', 'external@example.com', 4, NULL, 'externalpass'),
(7, 'Developer', 'dev@example.com', 5, NULL, 'devpass');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assessment_sessions`
--
ALTER TABLE `assessment_sessions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`evaluation_id`);

--
-- Indexes for table `evaluations_ce`
--
ALTER TABLE `evaluations_ce`
  ADD PRIMARY KEY (`evaluation_id`);

--
-- Indexes for table `evaluations_ce_ai`
--
ALTER TABLE `evaluations_ce_ai`
  ADD PRIMARY KEY (`evaluation_id`);

--
-- Indexes for table `indicators`
--
ALTER TABLE `indicators`
  ADD PRIMARY KEY (`id`),
  ADD KEY `component_id` (`component_id`);

--
-- Indexes for table `indicators_ce`
--
ALTER TABLE `indicators_ce`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `indicators_ce_ai`
--
ALTER TABLE `indicators_ce_ai`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`program_id`);

--
-- Indexes for table `quality_components1`
--
ALTER TABLE `quality_components1`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `quality_components_ce`
--
ALTER TABLE `quality_components_ce`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `quality_components_ce_ai`
--
ALTER TABLE `quality_components_ce_ai`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assessment_sessions`
--
ALTER TABLE `assessment_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `evaluation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluations_ce`
--
ALTER TABLE `evaluations_ce`
  MODIFY `evaluation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluations_ce_ai`
--
ALTER TABLE `evaluations_ce_ai`
  MODIFY `evaluation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `indicators`
--
ALTER TABLE `indicators`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `indicators_ce`
--
ALTER TABLE `indicators_ce`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `indicators_ce_ai`
--
ALTER TABLE `indicators_ce_ai`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `program_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `quality_components1`
--
ALTER TABLE `quality_components1`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `quality_components_ce`
--
ALTER TABLE `quality_components_ce`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `quality_components_ce_ai`
--
ALTER TABLE `quality_components_ce_ai`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `indicators`
--
ALTER TABLE `indicators`
  ADD CONSTRAINT `indicators_ibfk_1` FOREIGN KEY (`component_id`) REFERENCES `quality_components1` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
