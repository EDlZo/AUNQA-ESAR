-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 22, 2025 at 11:10 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

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
(19, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-09-29 08:35:23'),
(20, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-09-30 10:31:24'),
(21, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-09-30 10:35:06'),
(22, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-09-30 10:38:05'),
(23, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-09-30 10:38:31'),
(24, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-09-30 10:42:08'),
(25, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-09-30 11:11:18'),
(26, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-09-30 11:11:44'),
(27, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-09-30 11:14:07'),
(28, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-09-30 12:05:35'),
(29, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-09-30 12:42:07'),
(30, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-09-30 12:42:26'),
(31, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 08:55:15'),
(32, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-10-01 09:31:00'),
(33, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-10-01 09:33:54'),
(34, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 09:35:13'),
(35, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 09:41:11'),
(36, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-10-01 09:41:31'),
(37, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-10-01 09:42:46'),
(38, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 09:43:00'),
(39, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 09:43:28'),
(40, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-10-01 09:43:33'),
(41, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 09:44:43'),
(42, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 09:46:16'),
(43, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 09:46:40'),
(44, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 09:49:36'),
(45, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 09:49:37'),
(46, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 09:49:38'),
(47, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 09:49:38'),
(48, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 09:49:38'),
(49, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 09:49:38'),
(50, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 09:49:49'),
(51, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-10-01 09:54:15'),
(52, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 09:54:51'),
(53, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 10:00:41'),
(54, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 10:07:37'),
(55, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 10:19:28'),
(56, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-10-01 10:44:56'),
(57, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 10:51:37'),
(58, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 10:51:52'),
(59, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 11:00:41'),
(60, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 11:01:02'),
(61, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 11:07:59'),
(62, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 11:11:29'),
(63, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 11:13:02'),
(64, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 11:15:24'),
(65, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 11:17:06'),
(66, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 11:30:48'),
(67, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 11:32:27'),
(68, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 11:35:58'),
(69, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 11:36:20'),
(70, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 11:45:11'),
(71, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 11:48:49'),
(72, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-01 11:54:59'),
(73, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 08:58:20'),
(74, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:05:59'),
(75, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:00'),
(76, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:01'),
(77, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:01'),
(78, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:01'),
(79, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:05'),
(80, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:06'),
(81, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:06'),
(82, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:07'),
(83, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:07'),
(84, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:08'),
(85, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:08'),
(86, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:08'),
(87, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:09'),
(88, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:09'),
(89, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:09'),
(90, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:09'),
(91, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:09'),
(92, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-10-03 09:06:31'),
(93, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:06:34'),
(94, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:07:10'),
(95, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:08:16'),
(96, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:10:28'),
(97, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:11:21'),
(98, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:11:31'),
(99, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:11:52'),
(100, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:12:15'),
(101, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-2', 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)', 7, '2025-10-03 09:12:25'),
(102, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:12:39'),
(103, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:21:33'),
(104, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:22:23'),
(105, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:23:20'),
(106, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-03 09:23:36'),
(107, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-06 12:19:47'),
(108, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-22 08:55:24'),
(109, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-22 08:56:56'),
(110, 'programs', 'fac-1', 'คณะวิศวกรรมศาสตร์', 'maj-1', 'วิศวกรรมคอมพิวเตอร์', 7, '2025-10-22 08:57:04');

-- --------------------------------------------------------

--
-- Table structure for table `committee_evaluations_ce`
--

CREATE TABLE `committee_evaluations_ce` (
  `id` int(11) NOT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `indicator_id` int(11) DEFAULT NULL,
  `major_name` varchar(255) DEFAULT NULL,
  `committee_score` decimal(5,2) DEFAULT NULL,
  `strengths` longtext DEFAULT NULL,
  `improvements` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='การประเมินโดยกรรมการ (วิศวกรรมคอมพิวเตอร์)';

--
-- Dumping data for table `committee_evaluations_ce`
--

INSERT INTO `committee_evaluations_ce` (`id`, `session_id`, `indicator_id`, `major_name`, `committee_score`, `strengths`, `improvements`, `created_at`, `updated_at`) VALUES
(2, '110', 143, 'วิศวกรรมคอมพิวเตอร์', 5.00, 'sdfsdfsd', 'fsdfsdfsdfsdfsdf', '2025-10-22 09:09:26', '2025-10-22 09:09:26');

-- --------------------------------------------------------

--
-- Table structure for table `committee_evaluations_ce_ai`
--

CREATE TABLE `committee_evaluations_ce_ai` (
  `id` int(11) NOT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `indicator_id` int(11) DEFAULT NULL,
  `major_name` varchar(255) DEFAULT NULL,
  `committee_score` decimal(5,2) DEFAULT NULL,
  `strengths` longtext DEFAULT NULL,
  `improvements` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='การประเมินโดยกรรมการ (วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์)';

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
-- Table structure for table `evaluations_actual_ce`
--

CREATE TABLE `evaluations_actual_ce` (
  `evaluation_id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `indicator_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `evaluator_id` int(11) DEFAULT NULL,
  `operation_result` text DEFAULT NULL COMMENT 'ผลการดำเนินงาน',
  `operation_score` decimal(5,2) DEFAULT NULL COMMENT 'คะแนนผลการดำเนินงาน',
  `reference_score` decimal(5,2) DEFAULT NULL COMMENT 'คะแนนอ้างอิงเกณฑ์',
  `goal_achievement` varchar(50) DEFAULT NULL COMMENT 'การบรรลุเป้า',
  `evidence_number` varchar(255) DEFAULT NULL COMMENT 'หมายเลขหลักฐานอ้างอิง',
  `evidence_name` varchar(255) DEFAULT NULL,
  `evidence_url` text DEFAULT NULL,
  `comment` text DEFAULT NULL COMMENT 'หมายเหตุ',
  `evidence_file` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'submitted',
  `major_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'วันและเวลาในการประเมินผล',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `evidence_files_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`evidence_files_json`)),
  `evidence_meta_json` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='ตารางการประเมินผลจริงสำหรับวิศวกรรมคอมพิวเตอร์';

--
-- Dumping data for table `evaluations_actual_ce`
--

INSERT INTO `evaluations_actual_ce` (`evaluation_id`, `session_id`, `indicator_id`, `program_id`, `year`, `evaluator_id`, `operation_result`, `operation_score`, `reference_score`, `goal_achievement`, `evidence_number`, `evidence_name`, `evidence_url`, `comment`, `evidence_file`, `status`, `major_name`, `created_at`, `updated_at`, `evidence_files_json`, `evidence_meta_json`) VALUES
(31, 110, 143, NULL, NULL, NULL, '<p style=\"line-height: 21.6px; color: rgb(34, 34, 34); font-family: Arial, Helvetica, sans-serif; font-size: 12px;\">หลักสูตรมีการประเมินนิสิตตลอดช่วงเวลาการศึกษาโดยแบ่งออกเป็น 3 ช่วง ได้แก่ การประเมินก่อนเข้าเรียน การประเมินระหว่างเรียน และการประเมินก่อนจบการศึกษา โดยการประเมินต่าง ๆ จะสอดคล้องกับ PLOs ของหลักสูตร และกลยุทธ์การประเมินผลการเรียนรู้ทั้ง 5 ด้านตามกรอบมาตรฐานคุณวุฒิระดับปริญญาตรี สาขาวิศวกรรมศาสตร์ ซึ่งหลักสูตรมีการเปิดรับสมัครทั้งนักเรียนที่จบชั้น ม. 6 และนักเรียนที่จบชั้น ปวช. หลักสูตรมีการทำประกันคุณภาพกระบวนการจัดการเรียนการสอน เกณฑ์การประเมิน และข้อสอบ เพื่อให้มีความถูกต้อง น่าเชื่อถือและยุติธรรม นอกจากนี้หลักสูตรยังมีระบบให้นิสิตสามารถอุทธรณ์หรือส่งข้อร้องเรียน</p><p style=\"line-height: 21.6px; color: rgb(34, 34, 34); font-family: Arial, Helvetica, sans-serif; font-size: 12px;\">&nbsp; &nbsp; การประเมินคุณสมบัติผู้เรียนในระหว่างการศึกษาในแต่ละชั้นปี ได้มีการประเมินการบรรลุตาม PLOs และ CLOs ของนิสิตในแต่ละรายวิชา โดยใช้วิธีการประเมินที่หลากหลาย เช่น ใช้รูปแบบการประเมินตามรูปแบบของ Bloom’s Taxonomy และระดับของทักษะการเรียนรู้ที่ผู้เรียนจะต้องมีเมื่อเรียนจบในแต่ละรายวิชาตามที่กำหนดไว้ ตามที่ออกแบบไว้ใน มคอ. 3 และ 4 ได้แก่ การสอบ การสอบปฏิบัติ การศึกษาจากกรณีศึกษา การศึกษาจากงานวิจัย การสอบปากเปล่า การตรวจชิ้นงาน การประเมินการนำเสนอ การประเมินการเขียนรายงาน เป็นต้น &nbsp;รวมทั้งการให้นิสิตเข้ามามีส่วนร่วมในการออกแบบการวัดและประเมินผลของแต่ละรายวิชา การแบ่งสอบ สัดส่วนคะแนน วิธีการสอบ ซึ่งจะมีการทำความตกลงร่วมกันเมื่อผู้สอนได้อธิบายรายละเอียดของรายวิชาการ รูปแบบการจัดการเรียนการสอนและการวัดและประเมินผล พร้อมทั้งแก้ไขใน มคอ. 3 โดยผู้สอนแจ้งเกณฑ์การประเมินให้ผู้เรียนรับทราบทั้งก่อน และระหว่างเรียนรายวิชานั้น ๆ&nbsp;&nbsp;</p><p style=\"line-height: 21.6px; color: rgb(34, 34, 34); font-family: Arial, Helvetica, sans-serif; font-size: 12px;\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; นอกจากนี้ปีการศึกษา 2566 หลักสูตรมีการพิจารณาเกณฑ์การวัดการประเมินเพิ่มเติม เช่น การสอบวัดคุณภาพซึ่งเป็นการสอบวัดความรู้พื้นฐาน ทฤษฎี&nbsp;ทักษะเชิงวิเคราะห์ และศักยภาพของนิสิต โดยจะทำการสอบวัดระดับคุณภาพสำหรับนิสิตชั้นปีที่ 3 และชั้นปีที่ 4&nbsp;เพื่อประเมินการบรรลุผลการเรียนรู้ที่คาดหวังและพัฒนานิสิตได้ตาม PLOs ของหลักสูตร</p>', 5.00, 5.00, 'บรรลุ', '1', '1', NULL, '-', '1761124155980-965370253.pdf', 'submitted', 'วิศวกรรมคอมพิวเตอร์', '2025-10-22 09:09:16', '2025-10-22 09:09:16', '[\"1761124155980-965370253.pdf\",\"url_1_2\"]', '{\"1761124155980-965370253.pdf\":{\"number\":\"1\",\"name\":\"1\",\"url\":null},\"url_1_2\":{\"number\":\"2\",\"name\":\"2\",\"url\":\"https://esar.tsu.ac.th/resources/pdf/qt_course.pdf\"}}');

-- --------------------------------------------------------

--
-- Table structure for table `evaluations_actual_ce_ai`
--

CREATE TABLE `evaluations_actual_ce_ai` (
  `evaluation_id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `indicator_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `evaluator_id` int(11) DEFAULT NULL,
  `operation_result` text DEFAULT NULL COMMENT 'ผลการดำเนินงาน',
  `operation_score` decimal(5,2) DEFAULT NULL COMMENT 'คะแนนผลการดำเนินงาน',
  `reference_score` decimal(5,2) DEFAULT NULL COMMENT 'คะแนนอ้างอิงเกณฑ์',
  `goal_achievement` varchar(50) DEFAULT NULL COMMENT 'การบรรลุเป้า',
  `evidence_number` varchar(255) DEFAULT NULL COMMENT 'หมายเลขหลักฐานอ้างอิง',
  `evidence_name` varchar(255) DEFAULT NULL,
  `evidence_url` text DEFAULT NULL,
  `comment` text DEFAULT NULL COMMENT 'หมายเหตุ',
  `evidence_file` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'submitted',
  `major_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'วันและเวลาในการประเมินผล',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `evidence_files_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`evidence_files_json`)),
  `evidence_meta_json` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='ตารางการประเมินผลจริงสำหรับวิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์';

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
  `target_value` text DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `evidence_file` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'submitted',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `evaluations_ce`
--

INSERT INTO `evaluations_ce` (`evaluation_id`, `session_id`, `indicator_id`, `program_id`, `year`, `evaluator_id`, `score`, `target_value`, `comment`, `evidence_file`, `status`, `created_at`) VALUES
(39, 110, 143, NULL, NULL, NULL, 5.00, 'มีการดำเนินงานระดับ 5-7', '-', NULL, 'submitted', '2025-10-22 09:04:48'),
(40, 110, 143, NULL, NULL, NULL, 5.00, 'มีการดำเนินงานระดับ 5-7', '-', NULL, 'submitted', '2025-10-22 09:05:45'),
(41, 110, 143, NULL, NULL, NULL, 5.00, 'มีการดำเนินงานระดับ 5-7', '-', NULL, 'submitted', '2025-10-22 09:05:48'),
(42, 110, 143, NULL, NULL, NULL, 5.00, 'มีการดำเนินงานระดับ 5-7', '-', NULL, 'submitted', '2025-10-22 09:06:16');

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
  `target_value` text DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `evidence_file` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'submitted',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `evaluations_ce_ai`
--

INSERT INTO `evaluations_ce_ai` (`evaluation_id`, `session_id`, `indicator_id`, `program_id`, `year`, `evaluator_id`, `score`, `target_value`, `comment`, `evidence_file`, `status`, `created_at`) VALUES
(1, 30, 4, NULL, NULL, NULL, 5.00, 'มีการดำเนินงานระดับ 5-7', NULL, NULL, 'submitted', '2025-10-01 08:54:06');

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

--
-- Dumping data for table `indicators_ce`
--

INSERT INTO `indicators_ce` (`id`, `component_id`, `sequence`, `indicator_type`, `criteria_type`, `indicator_name`, `data_source`) VALUES
(15, 4, '2.1', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.1 Expected Learning Outcomes', ''),
(16, 6, '04.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'A variety of assessment methods are shown to be used and are shown to be constructively aligned to achieving the expected learning outcomes and the teaching and learning objectives.', ''),
(17, 6, '04.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The assessment and assessment-appeal policies are shown to be explicit, communicated to students, and applied consistently.', ''),
(18, 6, '04.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The assessment standards and procedures for student progression and degree completion, are shown to be explicit, communicated to students, and applied consistently.', ''),
(19, 6, '04.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The assessments methods are shown to include rubrics, marking schemes, timelines, and regulations, and these are shown to ensure validity, reliability, and fairness in assessment.', ''),
(20, 6, '04.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The assessment methods are shown to measure the achievement of the expected learning outcomes of the programme and its courses.', ''),
(21, 6, '04.06', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Feedback of student assessment is shown to be provided in a timely manner.', ''),
(22, 6, '04.07', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The student assessment and its processes are shown to be continuously reviewed and improved to ensure their relevance to the needs of industry and alignment to the expected learning outcomes.', ''),
(23, 6, '01.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the expected learning outcomes are appropriately formulated in accordance with an established learning taxonomy, are aligned to the vision and mission of the university, and are known to all stakeholders.', ''),
(24, 6, '01.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the expected learning outcomes for all courses are appropriately formulated and are aligned to the expected learning outcomes of the programme.', ''),
(25, 6, '01.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the expected learning outcomes consist of both generic outcomes (related to written and oral communication, problemsolving, information technology, teambuilding skills, etc) and subject specific outcomes (related to knowledge and skills of the study discipline).', ''),
(26, 6, '01.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the requirements of the stakeholders, especially the external stakeholders, are gathered, and that these are reflected in the expected learning outcomes.', ''),
(27, 6, '01.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the expected learning outcomes are achieved by the students by the time they graduate.', ''),
(48, 7, '02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.2 Programme Structure and Content', ''),
(49, 7, '02.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The specifications of the programme and all its courses are shown to be comprehensive, up-to-date, and made available and communicated to all stakeholders.', ''),
(50, 7, '02.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The design of the curriculum is shown to be constructively aligned with achieving the expected learning outcomes.', ''),
(51, 7, '02.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The design of the curriculum is shown to include feedback from stakeholders, especially external stakeholders.', ''),
(52, 7, '02.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The contribution made by each course in achieving the expected learning outcomes is shown to be clear.', ''),
(53, 7, '02.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The curriculum to show that all its courses are logically structured, properly sequenced (progression from basic to intermediate to specialised courses), and are integrated.', ''),
(54, 7, '02.06', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The curriculum to have option(s) for students to pursue major and/or minor specialisations.', ''),
(55, 7, '02.07', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that its curriculum is reviewed periodically following an established procedure and that it remains up-to-date and relevant to industry.', ''),
(56, 7, '03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.3 Teaching and Learning Approach', ''),
(57, 7, '03.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The educational philosophy is shown to be articulated and communicated to all stakeholders. It is also shown to be reflected in the teaching and learning activities.', ''),
(58, 7, '03.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The teaching and learning activities are shown to allow students to participate responsibly in the learning process.', ''),
(59, 7, '03.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The teaching and learning activities are shown to involve active learning by the students.', ''),
(60, 7, '03.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The teaching and learning activities are shown to promote learning, learning how to learn, and instilling in students a commitment for life-long learning (e.g., commitment to critical inquiry, information-processing skills, and a willingness to experiment with new ideas and practices).', ''),
(61, 7, '03.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The teaching and learning activities are shown to inculcate in students, new ideas, creative thought, innovation, and an entrepreneurial mindset.', ''),
(62, 7, '03.06', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The teaching and learning processes are shown to be continuously improved to ensure their relevance to the needs of industry and are aligned to the expected learning outcomes.', ''),
(64, 7, '04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.4 Student Assessment', ''),
(65, 7, '04.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'A variety of assessment methods are shown to be used and are shown to be constructively aligned to achieving the expected learning outcomes and the teaching and learning objectives.', ''),
(66, 7, '04.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The assessment and assessment-appeal policies are shown to be explicit, communicated to students, and applied consistently.', ''),
(67, 7, '04.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The assessment standards and procedures for student progression and degree completion, are shown to be explicit, communicated to students, and applied consistently.', ''),
(68, 7, '04.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The assessments methods are shown to include rubrics, marking schemes, timelines, and regulations, and these are shown to ensure validity, reliability, and fairness in assessment.', ''),
(69, 7, '04.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The assessment methods are shown to measure the achievement of the expected learning outcomes of the programme and its courses.', ''),
(70, 7, '04.06', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Feedback of student assessment is shown to be provided in a timely manner.', ''),
(71, 7, '04.07', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The student assessment and its processes are shown to be continuously reviewed and improved to ensure their relevance to the needs of industry and alignment to the expected learning outcomes.', ''),
(72, 7, '05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.5 Academic Staff', ''),
(73, 7, '05.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that academic staff planning (including succession, promotion, re-deployment, termination, and retirement plans) is carried out to ensure that the quality and quantity of the academic staff fulfil the needs for education, research, and service.', ''),
(74, 7, '05.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that staff workload is measured and monitored to improve the quality of education, research, and service.', ''),
(75, 7, '05.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the competences of the academic staff are determined, evaluated, and communicated.', ''),
(76, 7, '05.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the duties allocated to the academic staff are appropriate to qualifications, experience, and aptitude.', ''),
(77, 7, '05.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that promotion of the academic staff is based on a merit system which accounts for teaching, research, and service.', ''),
(78, 7, '05.06', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the rights and privileges, benefits, roles and relationships, and accountability of the academic staff, taking into account professional ethics and their academic freedom, are well defined and understood.', ''),
(79, 7, '05.07', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the training and developmental needs of the academic staff are systematically identified, and that appropriate training and development activities are implemented to fulfil the identified needs.', ''),
(80, 7, '05.08', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that performance management including reward and recognition is implemented to assess academic staff teaching and research quality.', ''),
(108, 7, '06', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.6 Student Support Services', ''),
(109, 7, '06.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The student intake policy, admission criteria, and admission procedures to the programme are shown to be clearly defined, communicated, published, and up-to-date.', ''),
(110, 7, '06.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Both short-term and long-term planning of academic and non-academic support services are shown to be carried out to ensure sufficiency and quality of support services for teaching, research, and community service.', ''),
(111, 7, '06.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'An adequate system is shown to exist for student progress, academic performance, and workload monitoring. Student progress, academic performance, and workload are shown to be systematically recorded and monitored. Feedback to students and corrective actions are made where necessary.', ''),
(112, 7, '06.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Co-curricular activities, student competition, and other student support services are shown to be available to improve learning experience and employability.', ''),
(113, 7, '06.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The competences of the support staff rendering student services are shown to be identified for recruitment and deployment. These competences are shown to be evaluated to ensure their continued relevance to stakeholders needs. Roles and relationships are shown to be well-defined to ensure smooth delivery of the services.', ''),
(114, 7, '06.06', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Student support services are shown to be subjected to evaluation, benchmarking, and enhancement.', ''),
(143, 7, '01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.1 Expected Learning Outcomes', ''),
(144, 7, '01.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the expected learning outcomes are appropriately formulated in accordance with an established learning taxonomy, are aligned to the vision and mission of the university, and are known to all stakeholders.', ''),
(145, 7, '01.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the expected learning outcomes for all courses are appropriately formulated and are aligned to the expected learning outcomes of the programme.', ''),
(146, 7, '01.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the expected learning outcomes consist of both generic outcomes (related to written and oral communication, problemsolving, information technology, teambuilding skills, etc) and subject specific outcomes (related to knowledge and skills of the study discipline).', ''),
(147, 7, '01.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the requirements of the stakeholders, especially the external stakeholders, are gathered, and that these are reflected in the expected learning outcomes.', ''),
(148, 7, '01.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the expected learning outcomes are achieved by the students by the time they graduate.', ''),
(149, 7, '07', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.7 Facilities and Infrastructure', ''),
(150, 7, '07.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The physical resources to deliver the curriculum, including equipment, material, and information technology, are shown to be sufficient.', ''),
(151, 7, '07.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The laboratories and equipment are shown to be up-to-date, readily available, and effectively deployed.', ''),
(152, 7, '07.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'A digital library is shown to be set-up, in keeping with progress in information and communication technology.', ''),
(153, 7, '07.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The information technology systems are shown to be set up to meet the needs of staff and students.', ''),
(154, 7, '07.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The university is shown to provide a highly accessible computer and network infrastructure that enables the campus community to fully exploit information technology for teaching, research, service, and administration.', ''),
(155, 7, '07.06', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The environmental, health, and safety standards and access for people with special needs are shown to be defined and implemented.', ''),
(156, 7, '07.07', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The university is shown to provide a physical, social, and psychological environment that is conducive for education, research, and personal well-being.', ''),
(157, 7, '07.08', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The competences of the support staff rendering services related to facilities are shown to be identified and evaluated to ensure that their skills remain relevant to stakeholder needs.', ''),
(158, 7, '07.09', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The quality of the facilities (library, laboratory, IT, and student services) are shown to be subjected to evaluation and enhancement.', ''),
(159, 7, '08', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.8 Output and Outcomes', ''),
(160, 7, '08.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The pass rate, dropout rate, and average time to graduate are shown to be established, monitored, and benchmarked for improvement.', ''),
(161, 7, '08.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Employability as well as self-employment, entrepreneurship, and advancement to further studies, are shown to be established, monitored, and benchmarked for improvement.', ''),
(162, 7, '08.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Research and creative work output and activities carried out by the academic staff and students, are shown to be established, monitored, and benchmarked for improvement.', ''),
(163, 7, '08.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Data are provided to show directly the achievement of the programme outcomes, which are established and monitored.', ''),
(164, 7, '08.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Satisfaction level of the various stakeholders are shown to be established, monitored, and benchmarked for improvement.', '');

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
(4, 4, '01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.1 Expected Learning Outcomes', ''),
(5, 4, '01.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the expected learning outcomes are appropriately formulated in accordance with an established learning taxonomy, are aligned to the vision and mission of the university, and are known to all stakeholders.', ''),
(6, 4, '01.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the expected learning outcomes for all courses are appropriately formulated and are aligned to the expected learning outcomes of the programme.', ''),
(7, 4, '01.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the expected learning outcomes consist of both generic outcomes (related to written and oral communication, problemsolving, information technology, teambuilding skills, etc) and subject specific outcomes (related to knowledge and skills of the study discipline).', ''),
(8, 4, '01.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the requirements of the stakeholders, especially the external stakeholders, are gathered, and that these are reflected in the expected learning outcomes.', ''),
(9, 4, '01.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the expected learning outcomes are achieved by the students by the time they graduate.', ''),
(10, 4, '02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.2 Programme Structure and Content', ''),
(11, 4, '02.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The specifications of the programme and all its courses are shown to be comprehensive, up-to-date, and made available and communicated to all stakeholders.', ''),
(12, 4, '02.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The design of the curriculum is shown to be constructively aligned with achieving the expected learning outcomes.', ''),
(13, 4, '02.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The design of the curriculum is shown to include feedback from stakeholders, especially external stakeholders.', ''),
(14, 4, '02.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The contribution made by each course in achieving the expected learning outcomes is shown to be clear.', ''),
(15, 4, '02.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The curriculum to show that all its courses are logically structured, properly sequenced (progression from basic to intermediate to specialised courses), and are integrated.', ''),
(16, 4, '02.06', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The curriculum to have option(s) for students to pursue major and/or minor specialisations.', ''),
(17, 4, '02.07', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that its curriculum is reviewed periodically following an established procedure and that it remains up-to-date and relevant to industry.', ''),
(18, 4, '03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.3 Teaching and Learning Approach', ''),
(19, 4, '03.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The educational philosophy is shown to be articulated and communicated to all stakeholders. It is also shown to be reflected in the teaching and learning activities.', ''),
(20, 4, '03.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The teaching and learning activities are shown to allow students to participate responsibly in the learning process.', ''),
(21, 4, '03.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The teaching and learning activities are shown to involve active learning by the students.', ''),
(22, 4, '03.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The teaching and learning activities are shown to promote learning, learning how to learn, and instilling in students a commitment for life-long learning (e.g., commitment to critical inquiry, information-processing skills, and a willingness to experiment with new ideas and practices).', ''),
(23, 4, '03.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The teaching and learning activities are shown to inculcate in students, new ideas, creative thought, innovation, and an entrepreneurial mindset.', ''),
(24, 4, '03.06', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The teaching and learning processes are shown to be continuously improved to ensure their relevance to the needs of industry and are aligned to the expected learning outcomes.', ''),
(25, 4, '04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.4 Student Assessment', ''),
(26, 4, '04.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'A variety of assessment methods are shown to be used and are shown to be constructively aligned to achieving the expected learning outcomes and the teaching and learning objectives.', ''),
(27, 4, '04.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The assessment and assessment-appeal policies are shown to be explicit, communicated to students, and applied consistently.', ''),
(28, 4, '04.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The assessment standards and procedures for student progression and degree completion, are shown to be explicit, communicated to students, and applied consistently.', ''),
(29, 4, '04.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The assessments methods are shown to include rubrics, marking schemes, timelines, and regulations, and these are shown to ensure validity, reliability, and fairness in assessment.', ''),
(30, 4, '04.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The assessment methods are shown to measure the achievement of the expected learning outcomes of the programme and its courses.', ''),
(31, 4, '04.06', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Feedback of student assessment is shown to be provided in a timely manner.', ''),
(32, 4, '04.07', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The student assessment and its processes are shown to be continuously reviewed and improved to ensure their relevance to the needs of industry and alignment to the expected learning outcomes.', ''),
(33, 4, '05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.5 Academic Staff', ''),
(34, 4, '05.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that academic staff planning (including succession, promotion, re-deployment, termination, and retirement plans) is carried out to ensure that the quality and quantity of the academic staff fulfil the needs for education, research, and service.', ''),
(35, 4, '05.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that staff workload is measured and monitored to improve the quality of education, research, and service.', ''),
(36, 4, '05.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the competences of the academic staff are determined, evaluated, and communicated.', ''),
(37, 4, '05.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the duties allocated to the academic staff are appropriate to qualifications, experience, and aptitude.', ''),
(38, 4, '05.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that promotion of the academic staff is based on a merit system which accounts for teaching, research, and service.', ''),
(39, 4, '05.06', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the rights and privileges, benefits, roles and relationships, and accountability of the academic staff, taking into account professional ethics and their academic freedom, are well defined and understood.', ''),
(40, 4, '05.07', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the training and developmental needs of the academic staff are systematically identified, and that appropriate training and development activities are implemented to fulfil the identified needs.', ''),
(41, 4, '05.08', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that performance management including reward and recognition is implemented to assess academic staff teaching and research quality.', ''),
(42, 4, '06', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.6 Student Support Services', ''),
(43, 4, '06.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The student intake policy, admission criteria, and admission procedures to the programme are shown to be clearly defined, communicated, published, and up-to-date.', ''),
(44, 4, '06.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Both short-term and long-term planning of academic and non-academic support services are shown to be carried out to ensure sufficiency and quality of support services for teaching, research, and community service.', ''),
(45, 4, '06.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'An adequate system is shown to exist for student progress, academic performance, and workload monitoring. Student progress, academic performance, and workload are shown to be systematically recorded and monitored. Feedback to students and corrective actions are made where necessary.', ''),
(46, 4, '06.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Co-curricular activities, student competition, and other student support services are shown to be available to improve learning experience and employability.', ''),
(47, 4, '06.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The competences of the support staff rendering student services are shown to be identified for recruitment and deployment. These competences are shown to be evaluated to ensure their continued relevance to stakeholders needs. Roles and relationships are shown to be well-defined to ensure smooth delivery of the services.', ''),
(48, 4, '06.06', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Student support services are shown to be subjected to evaluation, benchmarking, and enhancement.', ''),
(65, 4, '07', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.7 Facilities and Infrastructure', ''),
(66, 4, '07.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The physical resources to deliver the curriculum, including equipment, material, and information technology, are shown to be sufficient.', ''),
(67, 4, '07.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The laboratories and equipment are shown to be up-to-date, readily available, and effectively deployed.', ''),
(68, 4, '07.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'A digital library is shown to be set-up, in keeping with progress in information and communication technology.', ''),
(69, 4, '07.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The information technology systems are shown to be set up to meet the needs of staff and students.', ''),
(70, 4, '07.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The university is shown to provide a highly accessible computer and network infrastructure that enables the campus community to fully exploit information technology for teaching, research, service, and administration.', ''),
(71, 4, '07.06', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The environmental, health, and safety standards and access for people with special needs are shown to be defined and implemented.', ''),
(72, 4, '07.07', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The university is shown to provide a physical, social, and psychological environment that is conducive for education, research, and personal well-being.', ''),
(73, 4, '07.08', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The competences of the support staff rendering services related to facilities are shown to be identified and evaluated to ensure that their skills remain relevant to stakeholder needs.', ''),
(74, 4, '07.09', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The quality of the facilities (library, laboratory, IT, and student services) are shown to be subjected to evaluation and enhancement.', ''),
(75, 4, '08', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.8 Output and Outcomes', ''),
(76, 4, '08.01', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The pass rate, dropout rate, and average time to graduate are shown to be established, monitored, and benchmarked for improvement.', ''),
(77, 4, '08.02', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Employability as well as self-employment, entrepreneurship, and advancement to further studies, are shown to be established, monitored, and benchmarked for improvement.', ''),
(78, 4, '08.03', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Research and creative work output and activities carried out by the academic staff and students, are shown to be established, monitored, and benchmarked for improvement.', ''),
(79, 4, '08.04', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Data are provided to show directly the achievement of the programme outcomes, which are established and monitored.', ''),
(80, 4, '08.05', 'ผลลัพธ์', 'เชิงคุณภาพ', 'Satisfaction level of the various stakeholders are shown to be established, monitored, and benchmarked for improvement.', '');

-- --------------------------------------------------------

--
-- Table structure for table `main_topic`
--

CREATE TABLE `main_topic` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `target_score` tinyint(4) DEFAULT NULL,
  `self_score` tinyint(4) DEFAULT NULL,
  `achievement_status` varchar(50) DEFAULT NULL,
  `external_score` tinyint(4) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `major_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `main_topic`
--

INSERT INTO `main_topic` (`id`, `code`, `title`, `target_score`, `self_score`, `achievement_status`, `external_score`, `session_id`, `major_name`, `created_at`) VALUES
(1, 'AUN.1', 'Expected Learning Outcomes', 4, 4, 'บรรลุ', 3, NULL, NULL, '2025-09-30 11:00:33'),
(2, 'AUN.2', 'Programme Structure and Content', 4, 4, 'บรรลุ', 4, NULL, NULL, '2025-09-30 11:00:33'),
(3, 'AUN.3', 'Teaching and Learning Approach', 4, 4, 'บรรลุ', 3, NULL, NULL, '2025-09-30 11:00:33'),
(4, 'AUN.4', 'Student Assessment', 3, 3, 'บรรลุ', 3, NULL, NULL, '2025-09-30 11:00:33'),
(5, 'AUN.5', 'Academic Staff', 3, 3, 'บรรลุ', 3, NULL, NULL, '2025-09-30 11:00:33'),
(6, 'AUN.6', 'Student Support Services', 4, 4, 'บรรลุ', 4, NULL, NULL, '2025-09-30 11:00:33'),
(7, 'AUN.7', 'Facilities and Infrastructure', 4, 4, 'บรรลุ', 4, NULL, NULL, '2025-09-30 11:00:33'),
(8, 'AUN.8', 'Output and Outcomes', 3, 3, 'บรรลุ', 3, NULL, NULL, '2025-09-30 11:00:33'),
(9, 'AUN.1', 'Expected Learning Outcomes', 4, 4, 'บรรลุ', 3, NULL, NULL, '2025-09-30 11:00:45'),
(10, 'AUN.2', 'Programme Structure and Content', 4, 4, 'บรรลุ', 4, NULL, NULL, '2025-09-30 11:00:45'),
(11, 'AUN.3', 'Teaching and Learning Approach', 4, 4, 'บรรลุ', 3, NULL, NULL, '2025-09-30 11:00:45'),
(12, 'AUN.4', 'Student Assessment', 3, 3, 'บรรลุ', 3, NULL, NULL, '2025-09-30 11:00:45'),
(13, 'AUN.5', 'Academic Staff', 3, 3, 'บรรลุ', 3, NULL, NULL, '2025-09-30 11:00:45'),
(14, 'AUN.6', 'Student Support Services', 4, 4, 'บรรลุ', 4, NULL, NULL, '2025-09-30 11:00:45'),
(15, 'AUN.7', 'Facilities and Infrastructure', 4, 4, 'บรรลุ', 4, NULL, NULL, '2025-09-30 11:00:45'),
(16, 'AUN.8', 'Output and Outcomes', 3, 3, 'บรรลุ', 3, NULL, NULL, '2025-09-30 11:00:45'),
(17, 'AUN.1', 'Expected Learning Outcomes', 4, 4, 'บรรลุ', 3, NULL, NULL, '2025-09-30 11:06:50'),
(18, 'AUN.2', 'Programme Structure and Content', 4, 4, 'บรรลุ', 4, NULL, NULL, '2025-09-30 11:06:50'),
(19, 'AUN.3', 'Teaching and Learning Approach', 4, 4, 'บรรลุ', 3, NULL, NULL, '2025-09-30 11:06:50'),
(20, 'AUN.4', 'Student Assessment', 3, 3, 'บรรลุ', 3, NULL, NULL, '2025-09-30 11:06:50'),
(21, 'AUN.5', 'Academic Staff', 3, 3, 'บรรลุ', 3, NULL, NULL, '2025-09-30 11:06:50'),
(22, 'AUN.6', 'Student Support Services', 4, 4, 'บรรลุ', 4, NULL, NULL, '2025-09-30 11:06:50'),
(23, 'AUN.7', 'Facilities and Infrastructure', 4, 4, 'บรรลุ', 4, NULL, NULL, '2025-09-30 11:06:50'),
(24, 'AUN.8', 'Output and Outcomes', 3, 3, 'บรรลุ', 3, NULL, NULL, '2025-09-30 11:06:50');

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
(7, 2, 'องค์ประกอบที่ 2 : ผลการดำเนินตามเกณฑ์ AUN-QA');

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
-- Table structure for table `sub_topic`
--

CREATE TABLE `sub_topic` (
  `id` int(11) NOT NULL,
  `main_topic_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `title` text NOT NULL,
  `target_score` tinyint(4) DEFAULT NULL,
  `self_score` tinyint(4) DEFAULT NULL,
  `achievement_status` varchar(50) DEFAULT NULL,
  `external_score` tinyint(4) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sub_topic`
--

INSERT INTO `sub_topic` (`id`, `main_topic_id`, `code`, `title`, `target_score`, `self_score`, `achievement_status`, `external_score`, `created_at`) VALUES
(1, 1, 'AUN.1.1', 'The programme to show that the expected learning outcomes are appropriately formulated in accordance with an established learning taxonomy, are aligned to the vision and mission of the university, and are known to all stakeholders.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(2, 1, 'AUN.1.2', 'The programme to show that the expected learning outcomes for all courses are appropriately formulated and are aligned to the expected learning outcomes of the programme.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(3, 1, 'AUN.1.3', 'The programme to show that the expected learning outcomes consist of both generic outcomes (related to written and oral communication, problemsolving, information technology, teambuilding skills, etc) and subject specific outcomes (related to knowledge and skills of the study discipline).', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(4, 1, 'AUN.1.4', 'The programme to show that the requirements of the stakeholders, especially the external stakeholders, are gathered, and that these are reflected in the expected learning outcomes.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(5, 1, 'AUN.1.5', 'The programme to show that the expected learning outcomes are achieved by the students by the time they graduate.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(6, 2, 'AUN.2.1', 'The specifications of the programme and all its courses are shown to be comprehensive, up-to-date, and made available and communicated to all stakeholders.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(7, 2, 'AUN.2.2', 'The design of the curriculum is shown to be constructively aligned with achieving the expected learning outcomes.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(8, 2, 'AUN.2.3', 'The design of the curriculum is shown to include feedback from stakeholders, especially external stakeholders.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(9, 2, 'AUN.2.4', 'The contribution made by each course in achieving the expected learning outcomes is shown to be clear.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(10, 2, 'AUN.2.5', 'The curriculum to show that all its courses are logically structured, properly sequenced (progression from basic to intermediate to specialised courses), and are integrated.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(11, 2, 'AUN.2.6', 'The curriculum to have option(s) for students to pursue major and/or minor specialisations.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(12, 2, 'AUN.2.7', 'The programme to show that its curriculum is reviewed periodically following an established procedure and that it remains up-to-date and relevant to industry.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(13, 3, 'AUN.3.1', 'The educational philosophy is shown to be articulated and communicated to all stakeholders. It is also shown to be reflected in the teaching and learning activities.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(14, 3, 'AUN.3.2', 'The teaching and learning activities are shown to allow students to participate responsibly in the learning process.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(15, 3, 'AUN.3.3', 'The teaching and learning activities are shown to involve active learning by the students.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(16, 3, 'AUN.3.4', 'The teaching and learning activities are shown to promote learning, learning how to learn, and instilling in students a commitment for life-long learning (e.g., commitment to critical inquiry, information-processing skills, and a willingness to experiment with new ideas and practices).', 4, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(17, 3, 'AUN.3.5', 'The teaching and learning activities are shown to inculcate in students, new ideas, creative thought, innovation, and an entrepreneurial mindset.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(18, 3, 'AUN.3.6', 'The teaching and learning processes are shown to be continuously improved to ensure their relevance to the needs of industry and are aligned to the expected learning outcomes.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(19, 4, 'AUN.4.1', 'A variety of assessment methods are shown to be used and are shown to be constructively aligned to achieving the expected learning outcomes and the teaching and learning objectives.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(20, 4, 'AUN.4.2', 'The assessment and assessment-appeal policies are shown to be explicit, communicated to students, and applied consistently.', 3, 3, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(21, 4, 'AUN.4.3', 'The assessment standards and procedures for student progression and degree completion, are shown to be explicit, communicated to students, and applied consistently.', 3, 3, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(22, 4, 'AUN.4.4', 'The assessments methods are shown to include rubrics, marking schemes, timelines, and regulations, and these are shown to ensure validity, reliability, and fairness in assessment.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(23, 4, 'AUN.4.5', 'The assessment methods are shown to measure the achievement of the expected learning outcomes of the programme and its courses.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(24, 4, 'AUN.4.6', 'Feedback of student assessment is shown to be provided in a timely manner.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(25, 4, 'AUN.4.7', 'The student assessment and its processes are shown to be continuously reviewed and improved to ensure their relevance to the needs of industry and alignment to the expected learning outcomes.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(26, 5, 'AUN.5.1', 'The programme to show that academic staff planning (including succession, promotion, re-deployment, termination, and retirement plans) is carried out to ensure that the quality and quantity of the academic staff fulfil the needs for education, research, and service.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(27, 5, 'AUN.5.2', 'The programme to show that staff workload is measured and monitored to improve the quality of education, research, and service.', 3, 3, 'บรรลุ', 2, '2025-09-30 11:00:34'),
(28, 5, 'AUN.5.3', 'The programme to show that the competences of the academic staff are determined, evaluated, and communicated.', 3, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(29, 5, 'AUN.5.4', 'The programme to show that the duties allocated to the academic staff are appropriate to qualifications, experience, and aptitude.', 3, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(30, 5, 'AUN.5.5', 'The programme to show that promotion of the academic staff is based on a merit system which accounts for teaching, research, and service.', 3, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(31, 5, 'AUN.5.6', 'The programme to show that the rights and privileges, benefits, roles and relationships, and accountability of the academic staff, taking into account professional ethics and their academic freedom, are well defined and understood.', 3, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(32, 5, 'AUN.5.7', 'The programme to show that the training and developmental needs of the academic staff are systematically identified, and that appropriate training and development activities are implemented to fulfil the identified needs.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(33, 5, 'AUN.5.8', 'The programme to show that performance management including reward and recognition is implemented to assess academic staff teaching and research quality.', 3, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(34, 6, 'AUN.6.1', 'The student intake policy, admission criteria, and admission procedures to the programme are shown to be clearly defined, communicated, published, and up-to-date.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(35, 6, 'AUN.6.2', 'Both short-term and long-term planning of academic and non-academic support services are shown to be carried out to ensure sufficiency and quality of support services for teaching, research, and community service.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(36, 6, 'AUN.6.3', 'An adequate system is shown to exist for student progress, academic performance, and workload monitoring. Student progress, academic performance, and workload are shown to be systematically recorded and monitored. Feedback to students and corrective actions are made where necessary.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(37, 6, 'AUN.6.4', 'Co-curricular activities, student competition, and other student support services are shown to be available to improve learning experience and employability.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(38, 6, 'AUN.6.5', 'The competences of the support staff rendering student services are shown to be identified for recruitment and deployment. These competences are shown to be evaluated to ensure their continued relevance to stakeholders needs. Roles and relationships are shown to be well-defined to ensure smooth delivery of the services.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(39, 6, 'AUN.6.6', 'Student support services are shown to be subjected to evaluation, benchmarking, and enhancement.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(40, 7, 'AUN.7.1', 'The physical resources to deliver the curriculum, including equipment, material, and information technology, are shown to be sufficient.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(41, 7, 'AUN.7.2', 'The laboratories and equipment are shown to be up-to-date, readily available, and effectively deployed.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(42, 7, 'AUN.7.3', 'A digital library is shown to be set-up, in keeping with progress in information and communication technology.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(43, 7, 'AUN.7.4', 'The information technology systems are shown to be set up to meet the needs of staff and students.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(44, 7, 'AUN.7.5', 'The university is shown to provide a highly accessible computer and network infrastructure that enables the campus community to fully exploit information technology for teaching, research, service, and administration.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(45, 7, 'AUN.7.6', 'The environmental, health, and safety standards and access for people with special needs are shown to be defined and implemented.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(46, 7, 'AUN.7.7', 'The university is shown to provide a physical, social, and psychological environment that is conducive for education, research, and personal well-being.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(47, 7, 'AUN.7.8', 'The competences of the support staff rendering services related to facilities are shown to be identified and evaluated to ensure that their skills remain relevant to stakeholder needs.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:00:34'),
(48, 7, 'AUN.7.9', 'The quality of the facilities (library, laboratory, IT, and student services) are shown to be subjected to evaluation and enhancement.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(49, 8, 'AUN.8.1', 'The pass rate, dropout rate, and average time to graduate are shown to be established, monitored, and benchmarked for improvement.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(50, 8, 'AUN.8.2', 'Employability as well as self-employment, entrepreneurship, and advancement to further studies, are shown to be established, monitored, and benchmarked for improvement.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(51, 8, 'AUN.8.3', 'Research and creative work output and activities carried out by the academic staff and students, are shown to be established, monitored, and benchmarked for improvement.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(52, 8, 'AUN.8.4', 'Data are provided to show directly the achievement of the programme outcomes, which are established and monitored.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:00:34'),
(53, 8, 'AUN.8.5', 'Satisfaction level of the various stakeholders are shown to be established, monitored, and benchmarked for improvement.', 3, 3, 'บรรลุ', NULL, '2025-09-30 11:00:34'),
(54, 17, 'AUN.1.1', 'The programme to show that the expected learning outcomes are appropriately formulated in accordance with an established learning taxonomy, are aligned to the vision and mission of the university, and are known to all stakeholders.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(55, 17, 'AUN.1.2', 'The programme to show that the expected learning outcomes for all courses are appropriately formulated and are aligned to the expected learning outcomes of the programme.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(56, 17, 'AUN.1.3', 'The programme to show that the expected learning outcomes consist of both generic outcomes (related to written and oral communication, problemsolving, information technology, teambuilding skills, etc) and subject specific outcomes (related to knowledge and skills of the study discipline).', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(57, 17, 'AUN.1.4', 'The programme to show that the requirements of the stakeholders, especially the external stakeholders, are gathered, and that these are reflected in the expected learning outcomes.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(58, 17, 'AUN.1.5', 'The programme to show that the expected learning outcomes are achieved by the students by the time they graduate.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(59, 18, 'AUN.2.1', 'The specifications of the programme and all its courses are shown to be comprehensive, up-to-date, and made available and communicated to all stakeholders.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(60, 18, 'AUN.2.2', 'The design of the curriculum is shown to be constructively aligned with achieving the expected learning outcomes.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(61, 18, 'AUN.2.3', 'The design of the curriculum is shown to include feedback from stakeholders, especially external stakeholders.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(62, 18, 'AUN.2.4', 'The contribution made by each course in achieving the expected learning outcomes is shown to be clear.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(63, 18, 'AUN.2.5', 'The curriculum to show that all its courses are logically structured, properly sequenced (progression from basic to intermediate to specialised courses), and are integrated.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(64, 18, 'AUN.2.6', 'The curriculum to have option(s) for students to pursue major and/or minor specialisations.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(65, 18, 'AUN.2.7', 'The programme to show that its curriculum is reviewed periodically following an established procedure and that it remains up-to-date and relevant to industry.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(66, 19, 'AUN.3.1', 'The educational philosophy is shown to be articulated and communicated to all stakeholders. It is also shown to be reflected in the teaching and learning activities.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(67, 19, 'AUN.3.2', 'The teaching and learning activities are shown to allow students to participate responsibly in the learning process.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(68, 19, 'AUN.3.3', 'The teaching and learning activities are shown to involve active learning by the students.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(69, 19, 'AUN.3.4', 'The teaching and learning activities are shown to promote learning, learning how to learn, and instilling in students a commitment for life-long learning (e.g., commitment to critical inquiry, information-processing skills, and a willingness to experiment with new ideas and practices).', 4, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(70, 19, 'AUN.3.5', 'The teaching and learning activities are shown to inculcate in students, new ideas, creative thought, innovation, and an entrepreneurial mindset.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(71, 19, 'AUN.3.6', 'The teaching and learning processes are shown to be continuously improved to ensure their relevance to the needs of industry and are aligned to the expected learning outcomes.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(72, 20, 'AUN.4.1', 'A variety of assessment methods are shown to be used and are shown to be constructively aligned to achieving the expected learning outcomes and the teaching and learning objectives.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(73, 20, 'AUN.4.2', 'The assessment and assessment-appeal policies are shown to be explicit, communicated to students, and applied consistently.', 3, 3, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(74, 20, 'AUN.4.3', 'The assessment standards and procedures for student progression and degree completion, are shown to be explicit, communicated to students, and applied consistently.', 3, 3, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(75, 20, 'AUN.4.4', 'The assessments methods are shown to include rubrics, marking schemes, timelines, and regulations, and these are shown to ensure validity, reliability, and fairness in assessment.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(76, 20, 'AUN.4.5', 'The assessment methods are shown to measure the achievement of the expected learning outcomes of the programme and its courses.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(77, 20, 'AUN.4.6', 'Feedback of student assessment is shown to be provided in a timely manner.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(78, 20, 'AUN.4.7', 'The student assessment and its processes are shown to be continuously reviewed and improved to ensure their relevance to the needs of industry and alignment to the expected learning outcomes.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(79, 21, 'AUN.5.1', 'The programme to show that academic staff planning (including succession, promotion, re-deployment, termination, and retirement plans) is carried out to ensure that the quality and quantity of the academic staff fulfil the needs for education, research, and service.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(80, 21, 'AUN.5.2', 'The programme to show that staff workload is measured and monitored to improve the quality of education, research, and service.', 3, 3, 'บรรลุ', 2, '2025-09-30 11:06:50'),
(81, 21, 'AUN.5.3', 'The programme to show that the competences of the academic staff are determined, evaluated, and communicated.', 3, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(82, 21, 'AUN.5.4', 'The programme to show that the duties allocated to the academic staff are appropriate to qualifications, experience, and aptitude.', 3, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(83, 21, 'AUN.5.5', 'The programme to show that promotion of the academic staff is based on a merit system which accounts for teaching, research, and service.', 3, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(84, 21, 'AUN.5.6', 'The programme to show that the rights and privileges, benefits, roles and relationships, and accountability of the academic staff, taking into account professional ethics and their academic freedom, are well defined and understood.', 3, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(85, 21, 'AUN.5.7', 'The programme to show that the training and developmental needs of the academic staff are systematically identified, and that appropriate training and development activities are implemented to fulfil the identified needs.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(86, 21, 'AUN.5.8', 'The programme to show that performance management including reward and recognition is implemented to assess academic staff teaching and research quality.', 3, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(87, 22, 'AUN.6.1', 'The student intake policy, admission criteria, and admission procedures to the programme are shown to be clearly defined, communicated, published, and up-to-date.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(88, 22, 'AUN.6.2', 'Both short-term and long-term planning of academic and non-academic support services are shown to be carried out to ensure sufficiency and quality of support services for teaching, research, and community service.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(89, 22, 'AUN.6.3', 'An adequate system is shown to exist for student progress, academic performance, and workload monitoring. Student progress, academic performance, and workload are shown to be systematically recorded and monitored. Feedback to students and corrective actions are made where necessary.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(90, 22, 'AUN.6.4', 'Co-curricular activities, student competition, and other student support services are shown to be available to improve learning experience and employability.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(91, 22, 'AUN.6.5', 'The competences of the support staff rendering student services are shown to be identified for recruitment and deployment. These competences are shown to be evaluated to ensure their continued relevance to stakeholders needs. Roles and relationships are shown to be well-defined to ensure smooth delivery of the services.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(92, 22, 'AUN.6.6', 'Student support services are shown to be subjected to evaluation, benchmarking, and enhancement.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(93, 23, 'AUN.7.1', 'The physical resources to deliver the curriculum, including equipment, material, and information technology, are shown to be sufficient.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(94, 23, 'AUN.7.2', 'The laboratories and equipment are shown to be up-to-date, readily available, and effectively deployed.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(95, 23, 'AUN.7.3', 'A digital library is shown to be set-up, in keeping with progress in information and communication technology.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(96, 23, 'AUN.7.4', 'The information technology systems are shown to be set up to meet the needs of staff and students.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(97, 23, 'AUN.7.5', 'The university is shown to provide a highly accessible computer and network infrastructure that enables the campus community to fully exploit information technology for teaching, research, service, and administration.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(98, 23, 'AUN.7.6', 'The environmental, health, and safety standards and access for people with special needs are shown to be defined and implemented.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(99, 23, 'AUN.7.7', 'The university is shown to provide a physical, social, and psychological environment that is conducive for education, research, and personal well-being.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(100, 23, 'AUN.7.8', 'The competences of the support staff rendering services related to facilities are shown to be identified and evaluated to ensure that their skills remain relevant to stakeholder needs.', 4, 4, 'บรรลุ', 4, '2025-09-30 11:06:50'),
(101, 23, 'AUN.7.9', 'The quality of the facilities (library, laboratory, IT, and student services) are shown to be subjected to evaluation and enhancement.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(102, 24, 'AUN.8.1', 'The pass rate, dropout rate, and average time to graduate are shown to be established, monitored, and benchmarked for improvement.', 4, 4, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(103, 24, 'AUN.8.2', 'Employability as well as self-employment, entrepreneurship, and advancement to further studies, are shown to be established, monitored, and benchmarked for improvement.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(104, 24, 'AUN.8.3', 'Research and creative work output and activities carried out by the academic staff and students, are shown to be established, monitored, and benchmarked for improvement.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(105, 24, 'AUN.8.4', 'Data are provided to show directly the achievement of the programme outcomes, which are established and monitored.', 3, 3, 'บรรลุ', 3, '2025-09-30 11:06:50'),
(106, 24, 'AUN.8.5', 'Satisfaction level of the various stakeholders are shown to be established, monitored, and benchmarked for improvement.', 3, 3, 'บรรลุ', NULL, '2025-09-30 11:06:50');

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
-- Indexes for table `committee_evaluations_ce`
--
ALTER TABLE `committee_evaluations_ce`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_session_indicator` (`session_id`,`indicator_id`),
  ADD KEY `idx_major_session_indicator` (`major_name`,`session_id`,`indicator_id`);

--
-- Indexes for table `committee_evaluations_ce_ai`
--
ALTER TABLE `committee_evaluations_ce_ai`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_session_indicator` (`session_id`,`indicator_id`),
  ADD KEY `idx_major_session_indicator` (`major_name`,`session_id`,`indicator_id`);

--
-- Indexes for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`evaluation_id`);

--
-- Indexes for table `evaluations_actual_ce`
--
ALTER TABLE `evaluations_actual_ce`
  ADD PRIMARY KEY (`evaluation_id`),
  ADD KEY `idx_session_indicator` (`session_id`,`indicator_id`),
  ADD KEY `idx_major_name` (`major_name`);

--
-- Indexes for table `evaluations_actual_ce_ai`
--
ALTER TABLE `evaluations_actual_ce_ai`
  ADD PRIMARY KEY (`evaluation_id`),
  ADD KEY `idx_session_indicator` (`session_id`,`indicator_id`),
  ADD KEY `idx_major_name` (`major_name`);

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
-- Indexes for table `main_topic`
--
ALTER TABLE `main_topic`
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
-- Indexes for table `sub_topic`
--
ALTER TABLE `sub_topic`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_subtopic` (`main_topic_id`,`code`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT for table `committee_evaluations_ce`
--
ALTER TABLE `committee_evaluations_ce`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `committee_evaluations_ce_ai`
--
ALTER TABLE `committee_evaluations_ce_ai`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `evaluation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluations_actual_ce`
--
ALTER TABLE `evaluations_actual_ce`
  MODIFY `evaluation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `evaluations_actual_ce_ai`
--
ALTER TABLE `evaluations_actual_ce_ai`
  MODIFY `evaluation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluations_ce`
--
ALTER TABLE `evaluations_ce`
  MODIFY `evaluation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `evaluations_ce_ai`
--
ALTER TABLE `evaluations_ce_ai`
  MODIFY `evaluation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `indicators`
--
ALTER TABLE `indicators`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `indicators_ce`
--
ALTER TABLE `indicators_ce`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=165;

--
-- AUTO_INCREMENT for table `indicators_ce_ai`
--
ALTER TABLE `indicators_ce_ai`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `main_topic`
--
ALTER TABLE `main_topic`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
-- AUTO_INCREMENT for table `sub_topic`
--
ALTER TABLE `sub_topic`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

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
-- Constraints for table `sub_topic`
--
ALTER TABLE `sub_topic`
  ADD CONSTRAINT `fk_subtopic_main` FOREIGN KEY (`main_topic_id`) REFERENCES `main_topic` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
