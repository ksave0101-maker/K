import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function POST() {
  try {
    const tables = [
      // HR: Employees
      `CREATE TABLE IF NOT EXISTS kr_employees (
        id VARCHAR(20) NOT NULL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        position VARCHAR(100) NOT NULL,
        email VARCHAR(150),
        phone VARCHAR(30),
        department VARCHAR(50) NOT NULL,
        joinDate DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // HR: Salary Payments
      `CREATE TABLE IF NOT EXISTS kr_salary_payments (
        id VARCHAR(20) NOT NULL PRIMARY KEY,
        employeeId VARCHAR(20),
        employeeName VARCHAR(100),
        department VARCHAR(50),
        month VARCHAR(7),
        baseSalary BIGINT DEFAULT 0,
        bonus BIGINT DEFAULT 0,
        deductions BIGINT DEFAULT 0,
        netPay BIGINT DEFAULT 0,
        paymentDate DATE,
        paymentStatus ENUM('paid','pending') DEFAULT 'pending',
        cumulativeIncome BIGINT DEFAULT 0,
        cumulativeTax BIGINT DEFAULT 0,
        cumulativeNationalPension BIGINT DEFAULT 0,
        cumulativeHealthInsurance BIGINT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // HR: Expenses
      `CREATE TABLE IF NOT EXISTS kr_expenses (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        category ENUM('salary','utilities','materials','transportation','maintenance','office','marketing','other') NOT NULL,
        description TEXT,
        amount BIGINT DEFAULT 0,
        paidBy VARCHAR(100),
        recipient VARCHAR(100),
        receipt TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // HR: Invoices
      `CREATE TABLE IF NOT EXISTS kr_hr_invoices (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        invoiceNumber VARCHAR(50),
        customer VARCHAR(200),
        issueDate DATE,
        dueDate DATE,
        subtotal BIGINT DEFAULT 0,
        taxRate DECIMAL(5,2) DEFAULT 10.00,
        taxAmount BIGINT DEFAULT 0,
        totalAmount BIGINT DEFAULT 0,
        paymentStatus ENUM('paid','unpaid','partial','overdue') DEFAULT 'unpaid',
        notes TEXT,
        salesContractNumber VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // HR: Invoice Items
      `CREATE TABLE IF NOT EXISTS kr_hr_invoice_items (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        invoiceId VARCHAR(50) NOT NULL,
        name VARCHAR(200),
        quantity INT DEFAULT 1,
        unit VARCHAR(50),
        unitPrice BIGINT DEFAULT 0
      )`,
      // Production: QA Reports
      `CREATE TABLE IF NOT EXISTS kr_qa_reports (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        date DATE,
        station VARCHAR(100),
        inspector VARCHAR(100),
        status ENUM('pass','fail','pending') DEFAULT 'pending',
        notes TEXT,
        billId VARCHAR(50),
        product VARCHAR(200),
        qty INT DEFAULT 0,
        orderNumber VARCHAR(50),
        productionNumber VARCHAR(50),
        serialNumbers JSON,
        inspections JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Production: Orders
      `CREATE TABLE IF NOT EXISTS kr_production_orders (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        orderNumber VARCHAR(50),
        branch VARCHAR(100),
        branchCode ENUM('KR','BN','TH','VN'),
        product VARCHAR(200),
        quantity INT DEFAULT 0,
        status ENUM('pending','in-progress','ready') DEFAULT 'pending',
        dueDate DATE,
        priority ENUM('high','medium','low') DEFAULT 'medium',
        customerName VARCHAR(200),
        orderDate DATE,
        productionNote TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Production: Order Items
      `CREATE TABLE IF NOT EXISTS kr_production_order_items (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        orderId VARCHAR(50) NOT NULL,
        name VARCHAR(200),
        code VARCHAR(50),
        quantity INT DEFAULT 0,
        unit VARCHAR(50),
        description TEXT
      )`,
      // Production: Materials
      `CREATE TABLE IF NOT EXISTS kr_materials (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        materialCode VARCHAR(50),
        materialName VARCHAR(200),
        category ENUM('electronic','mechanical','packaging','chemical'),
        quantity INT DEFAULT 0,
        unit ENUM('pcs','kg','sets','liters','meters','rolls','boxes') DEFAULT 'pcs',
        estimatedCost BIGINT DEFAULT 0,
        supplier VARCHAR(200),
        urgency ENUM('high','medium','low') DEFAULT 'medium',
        requestedBy VARCHAR(100),
        requestDate DATE,
        requiredDate DATE,
        status ENUM('pending','approved','ordered') DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Domestic Market: Quotations
      `CREATE TABLE IF NOT EXISTS kr_domestic_quotations (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        quotationNumber VARCHAR(50),
        customerName VARCHAR(200),
        customerRegion VARCHAR(50),
        contactPerson VARCHAR(100),
        phone VARCHAR(30),
        email VARCHAR(150),
        product VARCHAR(300),
        quantity INT DEFAULT 0,
        unitPrice BIGINT DEFAULT 0,
        totalAmount BIGINT DEFAULT 0,
        validUntil DATE,
        status ENUM('draft','sent','accepted','rejected','expired') DEFAULT 'draft',
        createdDate DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Domestic Market: Invoices
      `CREATE TABLE IF NOT EXISTS kr_domestic_invoices (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        contractId VARCHAR(50),
        customer VARCHAR(200),
        product VARCHAR(300),
        region VARCHAR(100),
        issueDate DATE,
        paymentDueDate DATE,
        quantity INT DEFAULT 0,
        unitPrice BIGINT DEFAULT 0,
        totalAmount BIGINT DEFAULT 0,
        paymentMethod ENUM('bank_transfer','credit_card') DEFAULT 'bank_transfer',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // International Market: Quotations
      `CREATE TABLE IF NOT EXISTS kr_quotations (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        quotationNumber VARCHAR(50),
        customerName VARCHAR(200),
        customerCountry VARCHAR(100),
        branch VARCHAR(100),
        contactPerson VARCHAR(100),
        email VARCHAR(150),
        product VARCHAR(300),
        quantity INT DEFAULT 0,
        unitPrice BIGINT DEFAULT 0,
        totalAmount BIGINT DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        validUntil DATE,
        status ENUM('pending-signature','signed','testing','active') DEFAULT 'pending-signature',
        createdDate DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Pre-Installation Analysis (shared Domestic+International)
      `CREATE TABLE IF NOT EXISTS kr_pre_install_analysis (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        branch VARCHAR(100),
        location TEXT,
        equipment VARCHAR(200),
        datetime DATETIME,
        technician VARCHAR(100),
        voltage VARCHAR(20),
        frequency DECIMAL(6,2),
        powerFactor DECIMAL(4,3),
        thd DECIMAL(5,2),
        current_L1 DECIMAL(8,2),
        current_L2 DECIMAL(8,2),
        current_L3 DECIMAL(8,2),
        current_N DECIMAL(8,2),
        balance ENUM('Good','Fair','Poor'),
        result ENUM('Recommended','Not Recommended','Further Analysis Required'),
        recommendation TEXT,
        notes TEXT,
        riskAssessment ENUM('Low','Medium','High'),
        estimatedCost BIGINT,
        additionalEquipment JSON,
        additionalTests JSON,
        scheduledFollowUp_date DATE,
        scheduledFollowUp_technician VARCHAR(100),
        scheduledFollowUp_priority ENUM('Low','Medium','High','Critical'),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Pre-Installation Bills
      `CREATE TABLE IF NOT EXISTS kr_pre_install_bills (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        billNumber VARCHAR(50),
        analysisId VARCHAR(50),
        customerName VARCHAR(200),
        customerCountry VARCHAR(100),
        contactPerson VARCHAR(100),
        email VARCHAR(150),
        analysisType VARCHAR(100),
        serviceFee BIGINT DEFAULT 0,
        equipmentCost BIGINT DEFAULT 0,
        installationCost BIGINT DEFAULT 0,
        totalAmount BIGINT DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'KRW',
        dueDate DATE,
        status ENUM('pending','paid','overdue','cancelled') DEFAULT 'pending',
        createdDate DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Korea Customers
      `CREATE TABLE IF NOT EXISTS kr_customers (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200),
        nameEn VARCHAR(200),
        email VARCHAR(150),
        phone VARCHAR(30),
        company VARCHAR(200),
        address TEXT,
        type ENUM('individual','corporate') DEFAULT 'individual',
        status ENUM('active','pending','inactive') DEFAULT 'active',
        joinDate DATE,
        totalOrders INT DEFAULT 0,
        totalSpent BIGINT DEFAULT 0,
        rating TINYINT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Korea Orders
      `CREATE TABLE IF NOT EXISTS kr_orders (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        date DATE,
        product VARCHAR(200),
        quantity INT DEFAULT 0,
        total BIGINT DEFAULT 0,
        status ENUM('Delivered','In Transit','Processing','Cancelled') DEFAULT 'Processing',
        tracking VARCHAR(100),
        customerId INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Korea Products
      `CREATE TABLE IF NOT EXISTS kr_products (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        category VARCHAR(100),
        price BIGINT DEFAULT 0,
        rating DECIMAL(3,1) DEFAULT 0,
        reviews INT DEFAULT 0,
        inStock TINYINT(1) DEFAULT 1,
        description TEXT,
        specs JSON,
        features JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Executive: Branch KPIs
      `CREATE TABLE IF NOT EXISTS exec_branch_kpis (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        branch ENUM('korea','brunei','thailand','vietnam') NOT NULL,
        period VARCHAR(7) NOT NULL,
        revenue BIGINT DEFAULT 0,
        profit BIGINT DEFAULT 0,
        expenses BIGINT DEFAULT 0,
        employees INT DEFAULT 0,
        performance INT DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_branch_period (branch, period)
      )`,
      // Executive: Issues
      `CREATE TABLE IF NOT EXISTS exec_issues (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        branch VARCHAR(20),
        department VARCHAR(100),
        severity ENUM('high','medium','low') DEFAULT 'medium',
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Executive: Goals
      `CREATE TABLE IF NOT EXISTS exec_goals (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        branch VARCHAR(20),
        department VARCHAR(100),
        title TEXT,
        progress INT DEFAULT 0,
        deadline DATE,
        status ENUM('on-track','at-risk','delayed') DEFAULT 'on-track'
      )`,
      // Executive: Pending Bills
      `CREATE TABLE IF NOT EXISTS exec_pending_bills (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        branch VARCHAR(20),
        department VARCHAR(100),
        description TEXT,
        amount DECIMAL(15,2) DEFAULT 0,
        submittedDate DATE,
        priority ENUM('urgent','normal','low') DEFAULT 'normal',
        category VARCHAR(100),
        requestedBy VARCHAR(200),
        reason TEXT,
        approvalStatus ENUM('pending','approved','rejected') DEFAULT 'pending'
      )`,
      // Domestic Market: Sales Contracts
      `CREATE TABLE IF NOT EXISTS kr_domestic_contracts (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        contractNumber VARCHAR(50),
        region VARCHAR(100),
        regionKey VARCHAR(50),
        buyer VARCHAR(200),
        seller VARCHAR(200),
        productName VARCHAR(300),
        quantity INT DEFAULT 0,
        contractValue BIGINT DEFAULT 0,
        contractDate DATE,
        deliveryDate DATE,
        status ENUM('active','completed','pending','terminated') DEFAULT 'pending',
        remarks TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Domestic Market: Site Inspections
      `CREATE TABLE IF NOT EXISTS kr_domestic_site_inspections (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        inspectionNumber VARCHAR(50),
        region VARCHAR(100),
        siteLocation VARCHAR(300),
        inspector VARCHAR(100),
        inspectionDate DATE,
        structuralCondition ENUM('pass','fail','conditional') DEFAULT 'pass',
        electricalSystem ENUM('pass','fail','conditional') DEFAULT 'pass',
        safetyCompliance ENUM('pass','fail','conditional') DEFAULT 'pass',
        siteReadiness ENUM('pass','fail','conditional') DEFAULT 'pass',
        overallResult ENUM('pass','fail','conditional') DEFAULT 'pass',
        remarks TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Domestic Market: Sales Approvals
      `CREATE TABLE IF NOT EXISTS kr_domestic_approvals (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        approvalNumber VARCHAR(50),
        region VARCHAR(100),
        productName VARCHAR(300),
        quantity INT DEFAULT 0,
        amount BIGINT DEFAULT 0,
        requestedBy VARCHAR(100),
        approvedBy VARCHAR(100),
        approvalDate DATE,
        status ENUM('approved','pending','rejected') DEFAULT 'pending',
        remarks TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // International Market: Sales Contracts
      `CREATE TABLE IF NOT EXISTS kr_int_contracts (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        contractNumber VARCHAR(50),
        branch VARCHAR(100),
        branchKey VARCHAR(10),
        buyer VARCHAR(200),
        seller VARCHAR(200),
        productName VARCHAR(300),
        quantity INT DEFAULT 0,
        contractValue BIGINT DEFAULT 0,
        contractDate DATE,
        deliveryDate DATE,
        status ENUM('active','completed','pending','terminated') DEFAULT 'pending',
        remarks TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // International Market: Sales Approvals
      `CREATE TABLE IF NOT EXISTS kr_int_approvals (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        approvalNumber VARCHAR(50),
        branch VARCHAR(100),
        branchKey VARCHAR(10),
        productName VARCHAR(300),
        quantity INT DEFAULT 0,
        amount BIGINT DEFAULT 0,
        requestedBy VARCHAR(100),
        approvedBy VARCHAR(100),
        approvalDate DATE,
        status ENUM('approved','pending','rejected') DEFAULT 'pending',
        remarks TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Production: Daily Issues
      `CREATE TABLE IF NOT EXISTS kr_daily_issues (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        issueNumber VARCHAR(50),
        title VARCHAR(300),
        description TEXT,
        severity ENUM('critical','high','medium','low') DEFAULT 'medium',
        status ENUM('open','in-progress','resolved','closed') DEFAULT 'open',
        category ENUM('production','quality','equipment','materials','safety') DEFAULT 'production',
        reportedBy VARCHAR(100),
        reportedDate DATE,
        assignedTo VARCHAR(100),
        department VARCHAR(100),
        productionLine VARCHAR(100),
        affectedOrders JSON,
        resolution TEXT,
        resolvedDate DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Production: Test Results
      `CREATE TABLE IF NOT EXISTS kr_test_results (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        testNumber VARCHAR(50),
        productName VARCHAR(200),
        orderNumber VARCHAR(50),
        serialNumber VARCHAR(100),
        testType ENUM('functional','performance','safety','environmental','durability') DEFAULT 'functional',
        result ENUM('pass','fail','conditional') DEFAULT 'pass',
        testDate DATE,
        tester VARCHAR(100),
        testDuration VARCHAR(50),
        notes TEXT,
        retestRequired TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Production: Production Updates
      `CREATE TABLE IF NOT EXISTS kr_production_updates (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        orderNumber VARCHAR(50),
        productName VARCHAR(200),
        branch ENUM('Korea','Brunei','Thailand','Vietnam') DEFAULT 'Korea',
        branchCode ENUM('KR','BN','TH','VN') DEFAULT 'KR',
        totalQuantity INT DEFAULT 0,
        completedQuantity INT DEFAULT 0,
        progressPercent INT DEFAULT 0,
        currentStage ENUM('assembly','testing','packaging','ready') DEFAULT 'assembly',
        assignedTeam VARCHAR(100),
        startDate DATE,
        estimatedCompletion DATE,
        lastUpdate DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // Production: Pending Shipments
      `CREATE TABLE IF NOT EXISTS kr_production_shipments (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        shipmentNumber VARCHAR(50),
        orderNumber VARCHAR(50),
        destination ENUM('Korea','Brunei','Thailand','Vietnam') DEFAULT 'Korea',
        destinationCode ENUM('KR','BN','TH','VN') DEFAULT 'KR',
        destinationAddress TEXT,
        status ENUM('packed','ready-to-ship','in-transit','delivered') DEFAULT 'packed',
        shipDate DATE,
        estimatedDelivery DATE,
        carrier VARCHAR(100),
        trackingNumber VARCHAR(100),
        priority ENUM('urgent','normal','low') DEFAULT 'normal',
        items JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS kr_shipment_updates (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        shipmentNumber VARCHAR(50) NOT NULL,
        orderNumber VARCHAR(50) NOT NULL,
        destination ENUM('Korea','Brunei','Thailand','Vietnam') DEFAULT 'Korea',
        destCode ENUM('KR','BN','TH','VN') DEFAULT 'KR',
        shipmentMethod ENUM('land','sea','air') DEFAULT 'sea',
        currentStatus ENUM('preparing','in-transit','customs','delivered') DEFAULT 'preparing',
        currentLocation VARCHAR(255),
        estimatedDelivery DATE,
        trackingNumber VARCHAR(100),
        carrier VARCHAR(150),
        lastUpdate DATETIME,
        destinationAddress TEXT,
        contactPerson VARCHAR(150),
        contactPhone VARCHAR(100),
        packagingNote TEXT,
        totalWeight VARCHAR(50),
        totalBoxes INT DEFAULT 0,
        items JSON,
        updates JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      // Domestic Market: Domestic Shipments
      `CREATE TABLE IF NOT EXISTS kr_domestic_shipments (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        shipmentNumber VARCHAR(50),
        orderNumber VARCHAR(50),
        destinationRegion VARCHAR(100),
        destinationRegionKey VARCHAR(50),
        destinationAddress TEXT,
        status ENUM('packed','ready-to-ship','in-transit','delivered','delayed') DEFAULT 'packed',
        shipDate DATE,
        estimatedDelivery DATE,
        actualDelivery DATE,
        carrier VARCHAR(100),
        trackingNumber VARCHAR(100),
        items JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      // International Market: International Shipments
      `CREATE TABLE IF NOT EXISTS kr_int_shipments (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        shipmentNumber VARCHAR(50),
        orderNumber VARCHAR(50),
        branchCountry ENUM('Brunei','Thailand','Vietnam'),
        branchCountryCode ENUM('BN','TH','VN'),
        destination VARCHAR(200),
        destinationAddress TEXT,
        status ENUM('packed','ready-to-ship','in-transit','delivered','delayed') DEFAULT 'packed',
        shipDate DATE,
        estimatedDelivery DATE,
        actualDelivery DATE,
        carrier VARCHAR(100),
        trackingNumber VARCHAR(100),
        items JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
    ]

    const results: string[] = []
    for (const sql of tables) {
      await query(sql)
      const match = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)
      if (match) results.push(match[1])
    }

    return NextResponse.json({ success: true, tables: results, count: results.length })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
