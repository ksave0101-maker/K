// Evaluation data for all branches
export const evaluationData = {
  brunei: {
    employeeEvaluations: {
      quarterly: [
        { id: 1, name: 'Ahmad bin Hassan', position: 'Production Supervisor', department: 'Production', performance: 88, attendance: 95, teamwork: 90, productivity: 87, overallScore: 90, grade: 'A' as const, comments: 'Excellent leadership skills, consistently meets targets' },
        { id: 2, name: 'Sarah Johnson', position: 'HR Manager', department: 'HR', performance: 92, attendance: 98, teamwork: 94, productivity: 90, overallScore: 94, grade: 'A' as const, comments: 'Outstanding performance, great team player' },
        { id: 3, name: 'Michael Chen', position: 'Logistics Coordinator', department: 'Logistics', performance: 78, attendance: 85, teamwork: 80, productivity: 75, overallScore: 80, grade: 'B' as const, comments: 'Good performance, needs improvement in time management' },
      ],
      'semi-annual': [
        { id: 1, name: 'Ahmad bin Hassan', position: 'Production Supervisor', department: 'Production', performance: 90, attendance: 96, teamwork: 92, productivity: 89, overallScore: 92, grade: 'A' as const, comments: 'Consistent excellent performance over 6 months' },
        { id: 2, name: 'Sarah Johnson', position: 'HR Manager', department: 'HR', performance: 93, attendance: 97, teamwork: 95, productivity: 92, overallScore: 94, grade: 'A' as const, comments: 'Exceptional contribution to team development' },
      ],
      annual: [
        { id: 1, name: 'Ahmad bin Hassan', position: 'Production Supervisor', department: 'Production', performance: 91, attendance: 96, teamwork: 93, productivity: 90, overallScore: 93, grade: 'A' as const, comments: 'Year-round excellence, recommended for promotion' },
      ]
    },
    departmentEvaluations: {
      quarterly: [
        { department: 'HR', overallPerformance: 92, targetAchievement: 95, teamEfficiency: 90, customerSatisfaction: 88, overallScore: 91, grade: 'A' as const, strengths: ['Excellent recruitment process', 'Strong employee retention'], improvements: ['Training schedule optimization'] },
        { department: 'Production', overallPerformance: 85, targetAchievement: 88, teamEfficiency: 84, customerSatisfaction: 82, overallScore: 85, grade: 'B' as const, strengths: ['Quality standards maintained', 'Good output consistency'], improvements: ['Reduce production delays', 'Equipment maintenance'] },
      ],
      'semi-annual': [
        { department: 'HR', overallPerformance: 93, targetAchievement: 96, teamEfficiency: 92, customerSatisfaction: 89, overallScore: 93, grade: 'A' as const, strengths: ['Best-in-class hiring', 'Employee wellness programs'], improvements: ['Digital transformation in HR processes'] },
      ],
      annual: [
        { department: 'HR', overallPerformance: 94, targetAchievement: 97, teamEfficiency: 93, customerSatisfaction: 90, overallScore: 94, grade: 'A' as const, strengths: ['Industry-leading retention rate', 'Innovative benefits packages'], improvements: ['Succession planning enhancement'] },
      ]
    },
    branchEvaluations: {
      quarterly: { period: 'quarterly' as const, overallScore: 87, financialPerformance: 85, operationalEfficiency: 88, employeeSatisfaction: 89, customerSatisfaction: 86, grade: 'B' as const, achievements: ['Exceeded sales target by 8%', 'Zero safety incidents', 'New partnership launched'], challenges: ['Supply chain delays', 'Equipment aging'], recommendations: ['Invest in automation', 'Strengthen vendor relationships'] },
      'semi-annual': { period: 'semi-annual' as const, overallScore: 89, financialPerformance: 88, operationalEfficiency: 90, employeeSatisfaction: 90, customerSatisfaction: 87, grade: 'B' as const, achievements: ['Cost reduction of 5%', 'Customer satisfaction improved', 'Process optimization completed'], challenges: ['Market competition increasing', 'Skill gaps in tech'], recommendations: ['Upskill training programs', 'Market expansion study'] },
      annual: { period: 'annual' as const, overallScore: 91, financialPerformance: 90, operationalEfficiency: 92, employeeSatisfaction: 91, customerSatisfaction: 88, grade: 'A' as const, achievements: ['Annual profit target exceeded', 'ISO certification renewed', 'Regional market leader'], challenges: ['Economic uncertainty', 'Talent retention'], recommendations: ['Competitive compensation review', 'Digital transformation initiative'] }
    }
  },
  thailand: {
    employeeEvaluations: {
      quarterly: [
        { id: 1, name: 'Somchai Prasert', position: 'Sales Director', department: 'Domestic Market', performance: 96, attendance: 97, teamwork: 95, productivity: 98, overallScore: 97, grade: 'A' as const, comments: 'Outstanding sales performance, exceeded all KPIs' },
        { id: 2, name: 'Niran Suksai', position: 'HR Director', department: 'HR', performance: 88, attendance: 95, teamwork: 90, productivity: 87, overallScore: 90, grade: 'A' as const, comments: 'Strong leadership, effective team management' },
        { id: 3, name: 'Prasit Wongsa', position: 'Production Director', department: 'Production', performance: 94, attendance: 96, teamwork: 92, productivity: 96, overallScore: 95, grade: 'A' as const, comments: 'Exceptional production efficiency gains' },
        { id: 4, name: 'Wattana Suksa', position: 'R&D Manager', department: 'R&D', performance: 89, attendance: 92, teamwork: 88, productivity: 90, overallScore: 90, grade: 'A' as const, comments: 'Innovative approach, strong technical skills' },
      ],
      'semi-annual': [
        { id: 1, name: 'Somchai Prasert', position: 'Sales Director', department: 'Domestic Market', performance: 97, attendance: 98, teamwork: 96, productivity: 98, overallScore: 97, grade: 'A' as const, comments: 'Consistently exceptional, driving expansion success' },
        { id: 2, name: 'Prasit Wongsa', position: 'Production Director', department: 'Production', performance: 95, attendance: 97, teamwork: 94, productivity: 97, overallScore: 96, grade: 'A' as const, comments: 'Automation project delivered ahead of schedule' },
      ],
      annual: [
        { id: 1, name: 'Somchai Prasert', position: 'Sales Director', department: 'Domestic Market', performance: 98, attendance: 98, teamwork: 97, productivity: 99, overallScore: 98, grade: 'A' as const, comments: 'Employee of the year, exceptional contributions' },
      ]
    },
    departmentEvaluations: {
      quarterly: [
        { department: 'Executive', overallPerformance: 95, targetAchievement: 97, teamEfficiency: 94, customerSatisfaction: 92, overallScore: 95, grade: 'A' as const, strengths: ['Strategic vision execution', 'Strong market positioning'], improvements: ['Risk management enhancement'] },
        { department: 'HR', overallPerformance: 88, targetAchievement: 90, teamEfficiency: 87, customerSatisfaction: 86, overallScore: 88, grade: 'B' as const, strengths: ['Effective recruitment', 'Good retention rate'], improvements: ['Training completion rates', 'Performance review process'] },
        { department: 'Production', overallPerformance: 96, targetAchievement: 98, teamEfficiency: 95, customerSatisfaction: 94, overallScore: 96, grade: 'A' as const, strengths: ['Automation success', 'Quality excellence'], improvements: ['Energy efficiency optimization'] },
        { department: 'R&D', overallPerformance: 89, targetAchievement: 87, teamEfficiency: 90, customerSatisfaction: 91, overallScore: 89, grade: 'B' as const, strengths: ['Innovation pipeline strong', 'Patent applications'], improvements: ['Time-to-market acceleration', 'Budget adherence'] },
      ],
      'semi-annual': [
        { department: 'Production', overallPerformance: 97, targetAchievement: 99, teamEfficiency: 96, customerSatisfaction: 95, overallScore: 97, grade: 'A' as const, strengths: ['Record output achieved', 'Zero defects maintained'], improvements: ['Sustainability initiatives'] },
        { department: 'Domestic Market', overallPerformance: 98, targetAchievement: 99, teamEfficiency: 97, customerSatisfaction: 96, overallScore: 98, grade: 'A' as const, strengths: ['Market share gains', 'Customer loyalty programs'], improvements: ['Digital sales channels'] },
      ],
      annual: [
        { department: 'Production', overallPerformance: 97, targetAchievement: 98, teamEfficiency: 97, customerSatisfaction: 96, overallScore: 97, grade: 'A' as const, strengths: ['Industry-leading efficiency', 'Continuous improvement culture'], improvements: ['Advanced automation phase 2'] },
      ]
    },
    branchEvaluations: {
      quarterly: { period: 'quarterly' as const, overallScore: 95, financialPerformance: 97, operationalEfficiency: 96, employeeSatisfaction: 93, customerSatisfaction: 94, grade: 'A' as const, achievements: ['120% of sales target achieved', 'Regional expansion approved', 'Record profitability'], challenges: ['Rapid growth management', 'Capacity constraints'], recommendations: ['Accelerate hiring', 'Expand production capacity'] },
      'semi-annual': { period: 'semi-annual' as const, overallScore: 96, financialPerformance: 98, operationalEfficiency: 97, employeeSatisfaction: 94, customerSatisfaction: 95, grade: 'A' as const, achievements: ['Market leadership position', 'Automation milestone reached', 'Customer NPS increased to 85'], challenges: ['Competition intensifying', 'Talent acquisition in tech'], recommendations: ['R&D budget increase', 'Employer branding enhancement'] },
      annual: { period: 'annual' as const, overallScore: 97, financialPerformance: 98, operationalEfficiency: 98, employeeSatisfaction: 95, customerSatisfaction: 96, grade: 'A' as const, achievements: ['Branch of the year', 'Record annual profit', 'Successful regional expansion'], challenges: ['Sustaining growth momentum', 'Infrastructure scaling'], recommendations: ['Strategic planning for next phase', 'Leadership development program'] }
    }
  },
  vietnam: {
    employeeEvaluations: {
      quarterly: [
        { id: 1, name: 'Nguyen Van Minh', position: 'Production Manager', department: 'Production', performance: 89, attendance: 94, teamwork: 90, productivity: 88, overallScore: 90, grade: 'A' as const, comments: 'Strong technical skills, good team coordination' },
        { id: 2, name: 'Tran Thi Lan', position: 'HR Director', department: 'HR', performance: 90, attendance: 96, teamwork: 92, productivity: 89, overallScore: 92, grade: 'A' as const, comments: 'Excellent employee relations, effective programs' },
        { id: 3, name: 'Le Hong Phuc', position: 'R&D Director', department: 'R&D', performance: 93, attendance: 95, teamwork: 91, productivity: 94, overallScore: 93, grade: 'A' as const, comments: 'Outstanding innovation contributions, 2 patents filed' },
      ],
      'semi-annual': [
        { id: 1, name: 'Le Hong Phuc', position: 'R&D Director', department: 'R&D', performance: 94, attendance: 96, teamwork: 93, productivity: 95, overallScore: 95, grade: 'A' as const, comments: 'Innovation leader, driving product development success' },
        { id: 2, name: 'Nguyen Van Minh', position: 'Production Manager', department: 'Production', performance: 91, attendance: 95, teamwork: 92, productivity: 90, overallScore: 92, grade: 'A' as const, comments: 'Automation project success, efficiency gains achieved' },
      ],
      annual: [
        { id: 1, name: 'Le Hong Phuc', position: 'R&D Director', department: 'R&D', performance: 95, attendance: 97, teamwork: 94, productivity: 96, overallScore: 96, grade: 'A' as const, comments: 'Top performer, critical to innovation strategy' },
      ]
    },
    departmentEvaluations: {
      quarterly: [
        { department: 'R&D', overallPerformance: 93, targetAchievement: 92, teamEfficiency: 94, customerSatisfaction: 93, overallScore: 93, grade: 'A' as const, strengths: ['Strong innovation pipeline', 'Patent portfolio growth'], improvements: ['Commercialization speed', 'Cross-functional collaboration'] },
        { department: 'Production', overallPerformance: 89, targetAchievement: 90, teamEfficiency: 88, customerSatisfaction: 87, overallScore: 89, grade: 'B' as const, strengths: ['Quality improvement', 'Automation progress'], improvements: ['Production scheduling', 'Waste reduction'] },
        { department: 'HR', overallPerformance: 90, targetAchievement: 91, teamEfficiency: 89, customerSatisfaction: 88, overallScore: 90, grade: 'A' as const, strengths: ['Talent development programs', 'Low turnover'], improvements: ['Compensation competitiveness'] },
      ],
      'semi-annual': [
        { department: 'R&D', overallPerformance: 94, targetAchievement: 93, teamEfficiency: 95, customerSatisfaction: 94, overallScore: 94, grade: 'A' as const, strengths: ['Innovation excellence', '3 patents submitted'], improvements: ['Budget efficiency'] },
      ],
      annual: [
        { department: 'R&D', overallPerformance: 95, targetAchievement: 94, teamEfficiency: 96, customerSatisfaction: 95, overallScore: 95, grade: 'A' as const, strengths: ['Industry-leading innovation', 'Strategic partnerships'], improvements: ['Global collaboration enhancement'] },
      ]
    },
    branchEvaluations: {
      quarterly: { period: 'quarterly' as const, overallScore: 91, financialPerformance: 90, operationalEfficiency: 92, employeeSatisfaction: 91, customerSatisfaction: 90, grade: 'A' as const, achievements: ['3 partnerships established', 'Production efficiency +18%', 'Team expanded by 5 engineers'], challenges: ['Regulatory compliance timeline', 'Supply chain optimization'], recommendations: ['Compliance task force', 'Vendor diversification'] },
      'semi-annual': { period: 'semi-annual' as const, overallScore: 92, financialPerformance: 91, operationalEfficiency: 93, employeeSatisfaction: 92, customerSatisfaction: 91, grade: 'A' as const, achievements: ['Partnership targets exceeded', 'Innovation lab upgraded', 'Quality certifications achieved'], challenges: ['Infrastructure constraints', 'Market competition'], recommendations: ['Facility expansion', 'Marketing investment increase'] },
      annual: { period: 'annual' as const, overallScore: 93, financialPerformance: 92, operationalEfficiency: 94, employeeSatisfaction: 93, customerSatisfaction: 92, grade: 'A' as const, achievements: ['Strong annual growth', 'R&D excellence recognized', 'Operational maturity achieved'], challenges: ['Scaling challenges', 'Talent competition'], recommendations: ['Strategic growth plan', 'Talent retention programs'] }
    }
  },
  korea: {
    employeeEvaluations: {
      quarterly: [
        { id: 1, name: 'Kim Min-ji', position: 'CEO', department: 'Executive', performance: 98, attendance: 99, teamwork: 97, productivity: 98, overallScore: 98, grade: 'A' as const, comments: 'Exceptional strategic leadership, driving company growth' },
        { id: 2, name: 'Park Sung-ho', position: 'CFO', department: 'Executive', performance: 96, attendance: 98, teamwork: 95, productivity: 97, overallScore: 97, grade: 'A' as const, comments: 'Outstanding financial management, revenue optimization' },
        { id: 3, name: 'Lee Ji-eun', position: 'CTO', department: 'Executive', performance: 95, attendance: 97, teamwork: 94, productivity: 96, overallScore: 96, grade: 'A' as const, comments: 'Innovation leader, technology transformation success' },
        { id: 4, name: 'Choi Soo-jin', position: 'HR Director', department: 'HR', performance: 94, attendance: 98, teamwork: 96, productivity: 93, overallScore: 95, grade: 'A' as const, comments: 'Talent management excellence, company culture champion' },
        { id: 5, name: 'Jung Hyun-woo', position: 'Production Director', department: 'Production', performance: 93, attendance: 96, teamwork: 92, productivity: 95, overallScore: 94, grade: 'A' as const, comments: 'Manufacturing excellence, quality standards leader' },
      ],
      'semi-annual': [
        { id: 1, name: 'Kim Min-ji', position: 'CEO', department: 'Executive', performance: 98, attendance: 99, teamwork: 98, productivity: 99, overallScore: 99, grade: 'A' as const, comments: 'Visionary leadership, record-breaking performance' },
        { id: 2, name: 'Park Sung-ho', position: 'CFO', department: 'Executive', performance: 97, attendance: 98, teamwork: 96, productivity: 98, overallScore: 97, grade: 'A' as const, comments: 'Strategic financial planning, business expansion success' },
        { id: 3, name: 'Lee Ji-eun', position: 'CTO', department: 'Executive', performance: 96, attendance: 97, teamwork: 95, productivity: 97, overallScore: 96, grade: 'A' as const, comments: 'Digital transformation milestone achieved' },
      ],
      annual: [
        { id: 1, name: 'Kim Min-ji', position: 'CEO', department: 'Executive', performance: 99, attendance: 99, teamwork: 98, productivity: 99, overallScore: 99, grade: 'A' as const, comments: 'Leadership of the year, company transformation achievement' },
        { id: 2, name: 'Park Sung-ho', position: 'CFO', department: 'Executive', performance: 97, attendance: 98, teamwork: 97, productivity: 98, overallScore: 98, grade: 'A' as const, comments: 'Financial excellence award recipient, best practices leader' },
      ]
    },
    departmentEvaluations: {
      quarterly: [
        { department: 'Executive', overallPerformance: 98, targetAchievement: 99, teamEfficiency: 97, customerSatisfaction: 96, overallScore: 98, grade: 'A' as const, strengths: ['Strategic vision clarity', 'Global expansion leadership', 'Innovation culture'], improvements: ['Risk management framework enhancement'] },
        { department: 'HR', overallPerformance: 95, targetAchievement: 96, teamEfficiency: 94, customerSatisfaction: 93, overallScore: 95, grade: 'A' as const, strengths: ['Talent acquisition excellence', 'Employee engagement programs', 'Training effectiveness'], improvements: ['Succession planning depth'] },
        { department: 'Production', overallPerformance: 94, targetAchievement: 95, teamEfficiency: 93, customerSatisfaction: 92, overallScore: 94, grade: 'A' as const, strengths: ['Quality leadership', 'Automation advancement', 'Safety record'], improvements: ['Sustainability initiatives acceleration'] },
        { department: 'R&D', overallPerformance: 96, targetAchievement: 97, teamEfficiency: 95, customerSatisfaction: 94, overallScore: 96, grade: 'A' as const, strengths: ['Patent portfolio growth', 'Innovation pipeline', 'Research collaboration'], improvements: ['Commercialization speed'] },
      ],
      'semi-annual': [
        { department: 'Executive', overallPerformance: 98, targetAchievement: 99, teamEfficiency: 98, customerSatisfaction: 97, overallScore: 98, grade: 'A' as const, strengths: ['Market leadership position', 'Branch expansion success', 'Strategic partnerships'], improvements: ['Digital transformation acceleration'] },
        { department: 'Production', overallPerformance: 95, targetAchievement: 96, teamEfficiency: 94, customerSatisfaction: 93, overallScore: 95, grade: 'A' as const, strengths: ['Industry-leading efficiency', 'Zero-defect culture', 'Supply chain resilience'], improvements: ['Carbon footprint reduction'] },
        { department: 'R&D', overallPerformance: 97, targetAchievement: 98, teamEfficiency: 96, customerSatisfaction: 95, overallScore: 97, grade: 'A' as const, strengths: ['Breakthrough innovations', '5 new patents filed', 'Industry recognition'], improvements: ['Global research collaboration'] },
      ],
      annual: [
        { department: 'Executive', overallPerformance: 99, targetAchievement: 99, teamEfficiency: 98, customerSatisfaction: 97, overallScore: 98, grade: 'A' as const, strengths: ['Company of the year', 'Record profitability', 'International expansion', 'Leadership excellence'], improvements: ['ESG strategy enhancement'] },
        { department: 'R&D', overallPerformance: 97, targetAchievement: 98, teamEfficiency: 97, customerSatisfaction: 96, overallScore: 97, grade: 'A' as const, strengths: ['Innovation award winner', 'Technology leadership', 'Partnership ecosystem'], improvements: ['Open innovation platforms'] },
      ]
    },
    branchEvaluations: {
      quarterly: { period: 'quarterly' as const, overallScore: 98, financialPerformance: 99, operationalEfficiency: 97, employeeSatisfaction: 96, customerSatisfaction: 97, grade: 'A' as const, achievements: ['Record quarterly profit', 'All branches exceeded targets', 'Market share increased 15%', 'New technology platform launched'], challenges: ['Global market volatility', 'Talent acquisition competition'], recommendations: ['Enhance global risk management', 'Expand R&D investment', 'Strengthen employer branding'] },
      'semi-annual': { period: 'semi-annual' as const, overallScore: 98, financialPerformance: 99, operationalEfficiency: 98, employeeSatisfaction: 97, customerSatisfaction: 97, grade: 'A' as const, achievements: ['Headquarters expansion completed', '4th international branch approved', 'Innovation center established', 'Industry leadership award'], challenges: ['Scaling operations globally', 'Regulatory compliance across regions'], recommendations: ['Global operations framework', 'Compliance automation system', 'Leadership development program'] },
      annual: { period: 'annual' as const, overallScore: 99, financialPerformance: 99, operationalEfficiency: 98, employeeSatisfaction: 97, customerSatisfaction: 98, grade: 'A' as const, achievements: ['Company of the year award', 'Record annual revenue and profit', 'Successful global expansion to 4 countries', 'Industry innovation leader', '10 patents awarded'], challenges: ['Sustaining rapid growth', 'Cross-cultural management'], recommendations: ['Strategic 5-year growth plan', 'Global talent management system', 'Innovation ecosystem development'] }
    }
  }
};
