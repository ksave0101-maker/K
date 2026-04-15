-- Make power_calcuNo nullable so users can save without entering it
ALTER TABLE power_calculations
MODIFY COLUMN power_calcuNo VARCHAR(225) NULL DEFAULT NULL;
