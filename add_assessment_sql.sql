-- เพิ่ม SQL สำหรับหน้าการประเมินผล
-- เพิ่มคอลัมน์ target_value ในตาราง evaluations_ce และ evaluations_ce_ai (ถ้ายังไม่มี)

-- เพิ่มคอลัมน์ target_value สำหรับตาราง evaluations_ce
ALTER TABLE `evaluations_ce` ADD COLUMN IF NOT EXISTS `target_value` TEXT NULL AFTER `score`;

-- เพิ่มคอลัมน์ target_value สำหรับตาราง evaluations_ce_ai  
ALTER TABLE `evaluations_ce_ai` ADD COLUMN IF NOT EXISTS `target_value` TEXT NULL AFTER `score`;

-- เพิ่มคอลัมน์ session_id และ major_name สำหรับตาราง indicators_ce (ถ้ายังไม่มี)
ALTER TABLE `indicators_ce` ADD COLUMN IF NOT EXISTS `session_id` INT NULL AFTER `data_source`;
ALTER TABLE `indicators_ce` ADD COLUMN IF NOT EXISTS `major_name` VARCHAR(255) NULL AFTER `session_id`;
ALTER TABLE `indicators_ce` ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `major_name`;
ALTER TABLE `indicators_ce` ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- เพิ่มคอลัมน์ session_id และ major_name สำหรับตาราง indicators_ce_ai (ถ้ายังไม่มี)
ALTER TABLE `indicators_ce_ai` ADD COLUMN IF NOT EXISTS `session_id` INT NULL AFTER `data_source`;
ALTER TABLE `indicators_ce_ai` ADD COLUMN IF NOT EXISTS `major_name` VARCHAR(255) NULL AFTER `session_id`;
ALTER TABLE `indicators_ce_ai` ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `major_name`;
ALTER TABLE `indicators_ce_ai` ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- เพิ่มคอลัมน์ session_id และ major_name สำหรับตาราง quality_components_ce (ถ้ายังไม่มี)
ALTER TABLE `quality_components_ce` ADD COLUMN IF NOT EXISTS `session_id` INT NULL AFTER `quality_name`;
ALTER TABLE `quality_components_ce` ADD COLUMN IF NOT EXISTS `major_name` VARCHAR(255) NULL AFTER `session_id`;
ALTER TABLE `quality_components_ce` ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `major_name`;
ALTER TABLE `quality_components_ce` ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- เพิ่มคอลัมน์ session_id และ major_name สำหรับตาราง quality_components_ce_ai (ถ้ายังไม่มี)
ALTER TABLE `quality_components_ce_ai` ADD COLUMN IF NOT EXISTS `session_id` INT NULL AFTER `quality_name`;
ALTER TABLE `quality_components_ce_ai` ADD COLUMN IF NOT EXISTS `major_name` VARCHAR(255) NULL AFTER `session_id`;
ALTER TABLE `quality_components_ce_ai` ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `major_name`;
ALTER TABLE `quality_components_ce_ai` ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- เพิ่มข้อมูลตัวอย่างสำหรับการทดสอบหน้าการประเมินผล
-- ข้อมูลองค์ประกอบคุณภาพสำหรับวิศวกรรมคอมพิวเตอร์
INSERT IGNORE INTO `quality_components_ce` (`id`, `component_id`, `quality_name`, `session_id`, `major_name`) VALUES
(5, 1, 'องค์ประกอบที่ 1 : ผลการเรียนรู้ที่คาดหวัง', 54, 'วิศวกรรมคอมพิวเตอร์'),
(6, 2, 'องค์ประกอบที่ 2 : โครงสร้างและเนื้อหาของหลักสูตร', 54, 'วิศวกรรมคอมพิวเตอร์'),
(7, 3, 'องค์ประกอบที่ 3 : วิธีการสอนและการประเมินผู้เรียน', 54, 'วิศวกรรมคอมพิวเตอร์'),
(8, 4, 'องค์ประกอบที่ 4 : คุณภาพของนิสิตนักศึกษา', 54, 'วิศวกรรมคอมพิวเตอร์'),
(9, 5, 'องค์ประกอบที่ 5 : คุณภาพของคณาจารย์', 54, 'วิศวกรรมคอมพิวเตอร์'),
(10, 6, 'องค์ประกอบที่ 6 : ทรัพยากรสำหรับการเรียนการสอน', 54, 'วิศวกรรมคอมพิวเตอร์'),
(11, 7, 'องค์ประกอบที่ 7 : โครงสร้างหลักสูตร', 54, 'วิศวกรรมคอมพิวเตอร์');

-- ข้อมูลตัวบ่งชี้สำหรับวิศวกรรมคอมพิวเตอร์
INSERT IGNORE INTO `indicators_ce` (`id`, `component_id`, `sequence`, `indicator_type`, `criteria_type`, `indicator_name`, `data_source`, `session_id`, `major_name`) VALUES
-- องค์ประกอบที่ 1
(139, 1, '1', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.1 Expected Learning Outcomes', '', 54, 'วิศวกรรมคอมพิวเตอร์'),
(140, 1, '1.1', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the expected learning outcomes are appropriately formulated in accordance with an established learning taxonomy, are aligned to the vision and mission of the university, and are known to all stakeholders.', '', 54, 'วิศวกรรมคอมพิวเตอร์'),
(141, 1, '1.2', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the expected learning outcomes for all courses are appropriately formulated and are aligned to the expected learning outcomes of the programme.', '', 54, 'วิศวกรรมคอมพิวเตอร์'),
(142, 1, '1.3', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the expected learning outcomes consist of both generic outcomes (related to written and oral communication, problem-solving, information technology, teambuilding skills, etc) and subject specific outcomes (related to knowledge and skills of the study discipline).', '', 54, 'วิศวกรรมคอมพิวเตอร์'),
(143, 1, '1.4', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the requirements of the stakeholders, especially the external stakeholders, are gathered, and that these are reflected in the expected learning outcomes.', '', 54, 'วิศวกรรมคอมพิวเตอร์'),
(144, 1, '1.5', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The programme to show that the expected learning outcomes are achieved by the students by the time they graduate.', '', 54, 'วิศวกรรมคอมพิวเตอร์'),

-- องค์ประกอบที่ 2
(145, 2, '2', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.2 Programme Structure and Content', '', 54, 'วิศวกรรมคอมพิวเตอร์'),
(146, 2, '2.1', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The specifications of the programme and all its courses are shown to be comprehensive, up-to-date, and made available and communicated to all stakeholders.', '', 54, 'วิศวกรรมคอมพิวเตอร์'),
(147, 2, '2.2', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The design of the curriculum is shown to be constructively aligned with achieving the expected learning outcomes.', '', 54, 'วิศวกรรมคอมพิวเตอร์'),

-- องค์ประกอบที่ 3
(148, 3, '3', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.3 Teaching and Learning Approach', '', 54, 'วิศวกรรมคอมพิวเตอร์'),
(149, 3, '3.1', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The teaching and learning approaches are appropriate for achieving the expected learning outcomes.', '', 54, 'วิศวกรรมคอมพิวเตอร์'),
(150, 3, '3.2', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The teaching methods are appropriate for the nature of courses.', '', 54, 'วิศวกรรมคอมพิวเตอร์'),

-- องค์ประกอบที่ 4
(151, 4, '4', 'ผลลัพธ์', 'เชิงคุณภาพ', 'AUN.4 Student Assessment', '', 54, 'วิศวกรรมคอมพิวเตอร์'),
(152, 4, '4.1', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The student assessment is aligned with the expected learning outcomes.', '', 54, 'วิศวกรรมคอมพิวเตอร์'),
(153, 4, '4.2', 'ผลลัพธ์', 'เชิงคุณภาพ', 'The student assessment methods are appropriate for the nature of courses.', '', 54, 'วิศวกรรมคอมพิวเตอร์');

-- เพิ่มข้อมูลตัวอย่างการประเมินสำหรับทดสอบ
INSERT IGNORE INTO `evaluations_ce` (`evaluation_id`, `session_id`, `indicator_id`, `score`, `target_value`, `comment`, `status`) VALUES
(13, 54, 139, 4.5, 'มีการกำหนดผลการเรียนรู้ที่คาดหวังระดับ 4-5', 'ผลการเรียนรู้ได้รับการกำหนดอย่างชัดเจน', 'submitted'),
(14, 54, 140, 4.0, 'มีการกำหนดผลการเรียนรู้ระดับ 4', 'ผลการเรียนรู้สอดคล้องกับวิสัยทัศน์ของมหาวิทยาลัย', 'submitted'),
(15, 54, 141, 3.5, 'มีการกำหนดผลการเรียนรู้ระดับ 3-4', 'ผลการเรียนรู้ของรายวิชาสอดคล้องกับหลักสูตร', 'submitted');

-- สร้าง indexes สำหรับการค้นหาที่เร็วขึ้น
CREATE INDEX IF NOT EXISTS idx_evaluations_ce_session_indicator ON evaluations_ce(session_id, indicator_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_ce_ai_session_indicator ON evaluations_ce_ai(session_id, indicator_id);
CREATE INDEX IF NOT EXISTS idx_indicators_ce_session_major ON indicators_ce(session_id, major_name);
CREATE INDEX IF NOT EXISTS idx_indicators_ce_ai_session_major ON indicators_ce_ai(session_id, major_name);
CREATE INDEX IF NOT EXISTS idx_quality_components_ce_session_major ON quality_components_ce(session_id, major_name);
CREATE INDEX IF NOT EXISTS idx_quality_components_ce_ai_session_major ON quality_components_ce_ai(session_id, major_name);