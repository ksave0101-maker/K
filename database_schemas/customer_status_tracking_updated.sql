-- Updated comprehensive customer status tracking table
-- Combines both activity tracking and customer details

-- Main customer database
CREATE TABLE IF NOT EXISTS customers_detailed (
  customerID INT AUTO_INCREMENT PRIMARY KEY,
  customerCompanyName VARCHAR(255) NOT NULL,
  industryType VARCHAR(100),
  locationProvince VARCHAR(100),
  contactPersonName VARCHAR(100),
  contactPosition VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  estimatedLoadKW DECIMAL(10,2),
  estimatedSavingMonth DECIMAL(10,2),
  estimatedMonthlySavingTHB DECIMAL(12,2),
  salesOwner VARCHAR(100),
  firstContactDate DATE,
  currentStage VARCHAR(50),
  licensingProbability INT,
  expectedContractMonth VARCHAR(20),
  strategicImportance VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_currentStage (currentStage),
  INDEX idx_salesOwner (salesOwner),
  INDEX idx_firstContactDate (firstContactDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity tracking table
CREATE TABLE IF NOT EXISTS customer_activities (
  activityID INT AUTO_INCREMENT PRIMARY KEY,
  activityDate DATE NOT NULL,
  salesStaffName VARCHAR(100) NOT NULL,
  customerName VARCHAR(255) NOT NULL,
  customerID INT NULL,
  activityType VARCHAR(50) NOT NULL,
  keyDiscussionSummary TEXT,
  customerReaction VARCHAR(50),
  technicalQuestionsRaised TEXT,
  nextAction VARCHAR(255),
  nextActionDate DATE,
  hqSupportNeeded VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (customerID) REFERENCES customers_detailed(customerID) ON DELETE SET NULL,
  INDEX idx_activityDate (activityDate),
  INDEX idx_customerID (customerID),
  INDEX idx_salesStaffName (salesStaffName),
  INDEX idx_activityType (activityType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for customers_detailed
INSERT INTO customers_detailed
(customerCompanyName, industryType, locationProvince, contactPersonName, contactPosition, phone, email,
 estimatedLoadKW, estimatedSavingMonth, estimatedMonthlySavingTHB, salesOwner, firstContactDate,
 currentStage, licensingProbability, expectedContractMonth, strategicImportance, notes)
VALUES
('CJ More', 'Shopping Mall', 'Bangkok', 'Khun Supapan E.', 'Purchasing Manager', '02-2333146', '', 50, 10, 15000, 'Gundhi P.', '2026-01-10', 'Lead', 20, '2026-05', 'Low', 'High potential customer'),
('Top Supermarket', 'Shopping Mall', 'Bangkok', '', '', '02-8317300', '', 0, 0, 0, 'Gundhi P.', '2026-01-10', 'Lead', 20, '', 'Low', ''),
('Lawson 108', 'Shopping Mall', 'Bangkok', 'K.Papatsara', 'Franchise Owner', '090-9713035', '', 0, 0, 0, 'Gundhi P.', '2026-01-10', 'Lead', 20, '', 'Low', ''),
('BCPG', 'Shopping Mall', 'Bangkok', 'Mr.Narongk', 'Procurement Manager', '02-3338999', '', 0, 0, 0, 'Gundhi P.', '2026-01-10', 'Lead', 30, '', 'Low', ''),
('Susco', 'Energy', 'Bangkok', 'K.Yotsapa', 'Procurement Manager', '024086065', '', 0, 0, 0, 'Gundhi P.', '2026-01-10', 'Lead', 40, '', 'Low', ''),
('Lotus Go Fresh', 'Shopping Mall', 'Bangkok', 'Mr. Chatusith', 'Energy Strategy Development', '0979000041838', '', 0, 0, 0, 'Gundhi P.', '2026-01-10', 'Proposal', 50, '', 'Medium', ''),
('J&E Lighting', 'Manufacturing', 'Bangkok', 'K.Graiukk', 'Head of Lighting Procurement Depart', '081-6475249', '', 0, 0, 0, 'Gundhi P.', '2026-01-10', 'Meter Installation', 70, '', 'High', ''),
('PTG Energy', 'Energy', 'Bangkok', 'Mr.Jansouk', 'Engineering Manager', '02-1683377, 02-1683388', '', 0, 0, 0, 'Gundhi P./Paranya J.', '2026-01-10', 'Meter Installation', 70, '', 'High', '');

-- Sample data for customer_activities
INSERT INTO customer_activities
(activityDate, salesStaffName, customerName, activityType, keyDiscussionSummary, customerReaction,
 technicalQuestionsRaised, nextAction, nextActionDate, hqSupportNeeded)
VALUES
('2026-02-04', 'Gundhi P.', 'CJ More', 'Follow-up', 'Sent an email introducing the product to Purchasing Department.', 'Neutral', '', 'Follow up', '2026-02-11', 'No'),
('2026-02-04', 'Gundhi P.', 'Top Supermarket', 'Follow-up', 'Sent an email introducing the product to Purchasing Department.', 'Neutral', '', 'Follow up', '2026-02-11', 'No'),
('2026-02-04', 'Gundhi P.', 'Lawson 108', 'Follow-up', 'Sent an email introducing the product to Purchasing Department.', 'Neutral', '', 'Follow up', '2026-02-11', 'No'),
('2026-02-05', 'Gundhi P.', 'BCPG', 'Follow-up', 'Sent an email introducing the product to Mr.Narong, Procurement Manager.', 'Neutral', '', 'Follow up for appointment', '2026-02-12', 'No'),
('2026-02-05', 'Gundhi P.', 'Susco', 'Follow-up', 'Sent the price of 100 kVA to Mr. Chawuth/Energy Strategy Development.', 'Neutral', '', 'Follow up for appointment', '2026-02-12', 'No'),
('2026-02-05', 'Gundhi P.', 'Lotus Go Fresh', 'Follow-up', 'Follow up', 'Neutral', '', 'Follow up', '2026-02-12', 'Yes'),
('2026-02-09', 'Gundhi P.', 'J&E Lighting', 'Meter Installation', 'Installed a meter at Innovation Center.', 'Positive', '', 'Initial data collection', '2026-02-12', 'Yes'),
('2026-02-09', 'Paranya J.', 'Siricharil Industry', 'Meter Installation', 'Installed a meter at Factory 2', 'Positive', '', 'Initial data collection', '2026-02-12', 'Yes'),
('2026-02-09', 'Paranya J.', 'IMOS Dental Clinic', 'Follow-up', 'Sent an email introducing the product and offering a free 90-day trial of the equipment.', 'Neutral', '', 'Follow up', '2026-02-16', 'No'),
('2026-02-10', 'Gundhi P.', 'PTG Energy', 'Meter Installation', '2 meters installation at customer site; Awaiting steps.', 'Positive', '', 'Follow up for meter installation at Site#3', '2026-02-17', 'No'),
('2026-02-16', 'Gundhi P.', 'Caltex', 'Follow-up', 'Sent an email introducing the product to Purchasing Department.', 'Neutral', '', 'Follow up', '2026-02-23', 'No'),
('2026-02-16', 'Gundhi P.', 'Shell', 'Follow-up', 'Sent an email introducing the product to Purchasing Department.', 'Neutral', '', 'Follow up', '2026-02-23', 'No'),
('2026-02-18', 'Gundhi P.', 'Crab House', 'Email Introduction', 'Present products to Owner', 'Positive', '', 'Site survey for meter installation. Install power meter to get initial data', '2026-02-27', 'No'),
('2026-02-23', 'Gundhi P.', 'Watchara Chicken Farm', 'Site Survey', 'Appointment for digital meter installation.', 'Positive', '', 'collection', '2026-03-13', 'No'),
('2026-02-23', 'Gundhi P.', 'Cannabis Farm', 'Call', 'Initial presentation and site visit', 'Neutral', '', 'Follow up', '2026-03-02', 'No'),
('2026-02-24', 'Gundhi P.', 'Royal Thai Air Force, Renewable Energy Office', 'Meeting', 'Schedule for meeting on 13 March 2026 at 9:00 a.m.', 'Positive', '', '', '2026-03-13', 'No');
