-- สร้างตารางสำหรับเก็บข้อมูลการประเมินผลจริง (แยกจากการประเมินเกณฑ์)

-- ตารางการประเมินผลจริงสำหรับวิศวกรรมคอมพิวเตอร์
CREATE TABLE IF NOT EXISTS `evaluations_actual_ce` (
  `evaluation_id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) DEFAULT NULL,
  `indicator_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `evaluator_id` int(11) DEFAULT NULL,
  `operation_result` TEXT NULL COMMENT 'ผลการดำเนินงาน',
  `operation_score` decimal(5,2) DEFAULT NULL COMMENT 'คะแนนผลการดำเนินงาน',
  `reference_score` decimal(5,2) DEFAULT NULL COMMENT 'คะแนนอ้างอิงเกณฑ์',
  `goal_achievement` varchar(50) DEFAULT NULL COMMENT 'การบรรลุเป้า',
  `evidence_number` varchar(255) DEFAULT NULL COMMENT 'หมายเลขหลักฐานอ้างอิง',
  `comment` text DEFAULT NULL COMMENT 'หมายเหตุ',
  `evidence_file` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'submitted',
  `major_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'วันและเวลาในการประเมินผล',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`evaluation_id`),
  KEY `idx_session_indicator` (`session_id`, `indicator_id`),
  KEY `idx_major_name` (`major_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='ตารางการประเมินผลจริงสำหรับวิศวกรรมคอมพิวเตอร์';

-- ตารางการประเมินผลจริงสำหรับวิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์
CREATE TABLE IF NOT EXISTS `evaluations_actual_ce_ai` (
  `evaluation_id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) DEFAULT NULL,
  `indicator_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `evaluator_id` int(11) DEFAULT NULL,
  `operation_result` TEXT NULL COMMENT 'ผลการดำเนินงาน',
  `operation_score` decimal(5,2) DEFAULT NULL COMMENT 'คะแนนผลการดำเนินงาน',
  `reference_score` decimal(5,2) DEFAULT NULL COMMENT 'คะแนนอ้างอิงเกณฑ์',
  `goal_achievement` varchar(50) DEFAULT NULL COMMENT 'การบรรลุเป้า',
  `evidence_number` varchar(255) DEFAULT NULL COMMENT 'หมายเลขหลักฐานอ้างอิง',
  `comment` text DEFAULT NULL COMMENT 'หมายเหตุ',
  `evidence_file` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'submitted',
  `major_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'วันและเวลาในการประเมินผล',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`evaluation_id`),
  KEY `idx_session_indicator` (`session_id`, `indicator_id`),
  KEY `idx_major_name` (`major_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='ตารางการประเมินผลจริงสำหรับวิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์';

-- เพิ่มข้อมูลตัวอย่างการประเมินผลสำหรับทดสอบ
INSERT IGNORE INTO `evaluations_actual_ce` (`evaluation_id`, `session_id`, `indicator_id`, `operation_result`, `operation_score`, `reference_score`, `goal_achievement`, `evidence_number`, `comment`, `status`, `major_name`) VALUES
(1, 54, 139, 'มีการกำหนดผลการเรียนรู้ที่คาดหวังของหลักสูตรครบถ้วนตามกรอบมาตรฐานคุณวุฒิและสอดคล้องกับวิสัยทัศน์ของมหาวิทยาลัย', 4.5, 4.0, 'บรรลุ', 'DOC-PLO-001', 'ผลการเรียนรู้ได้รับการกำหนดอย่างชัดเจนและสื่อสารให้ผู้มีส่วนได้ส่วนเสียทราบ', 'submitted', 'วิศวกรรมคอมพิวเตอร์'),
(2, 54, 140, 'มีการจัดทำเอกสารและการสื่อสารผลการเรียนรู้ที่คาดหวังให้กับอาจารย์ นิสิต และผู้มีส่วนได้ส่วนเสีย', 4.0, 4.0, 'บรรลุ', 'DOC-PLO-002', 'มีการประชุมชี้แจงและแจกเอกสารให้ทุกฝ่าย', 'submitted', 'วิศวกรรมคอมพิวเตอร์');