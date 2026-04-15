// Department-specific issues data for all branches
// 10 แผนก: Executive, HR, Production, International Market, Domestic Market, Logistics, Quality Control, After-Sales, Maintenance, R&D

export const departmentIssuesData = {
  korea: {
    'Executive': [
      { id: 1, severity: 'medium' as const, title: 'Global expansion coordination needs enhancement' },
      { id: 2, severity: 'low' as const, title: 'New headquarters building planning' },
      { id: 3, severity: 'medium' as const, title: 'Quarterly board meeting preparation' }
    ],
    'HR': [
      { id: 4, severity: 'high' as const, title: 'High employee turnover in Q4' },
      { id: 5, severity: 'medium' as const, title: 'Training budget allocation review needed' },
      { id: 6, severity: 'low' as const, title: 'Employee handbook updates pending' }
    ],
    'Production': [
      { id: 7, severity: 'medium' as const, title: 'Production line efficiency below target' },
      { id: 8, severity: 'high' as const, title: 'Quality control process refinement needed' },
      { id: 9, severity: 'low' as const, title: 'Equipment maintenance schedule update' }
    ],
    'International Market': [
      { id: 10, severity: 'medium' as const, title: 'International sales targets adjustment needed' },
      { id: 11, severity: 'high' as const, title: 'Customer retention rate declining in foreign markets' },
      { id: 12, severity: 'medium' as const, title: 'Global sales pipeline management system issues' }
    ],
    'Domestic Market': [
      { id: 13, severity: 'low' as const, title: 'Local market engagement metrics review' },
      { id: 14, severity: 'medium' as const, title: 'Domestic campaign ROI analysis pending' },
      { id: 15, severity: 'medium' as const, title: 'Brand positioning strategy refinement' }
    ],
    'Logistics': [
      { id: 16, severity: 'high' as const, title: 'Logistics infrastructure upgrade required' },
      { id: 17, severity: 'medium' as const, title: 'Delivery route optimization needed' },
      { id: 18, severity: 'low' as const, title: 'Warehouse management system update' }
    ],
    'Quality Control': [
      { id: 19, severity: 'high' as const, title: 'Quality standards compliance audit findings' },
      { id: 20, severity: 'medium' as const, title: 'Inspection process standardization needed' },
      { id: 21, severity: 'low' as const, title: 'Quality documentation system migration' }
    ],
    'After-Sales': [
      { id: 22, severity: 'medium' as const, title: 'Customer complaint response time high' },
      { id: 23, severity: 'medium' as const, title: 'Support ticket backlog increasing' },
      { id: 24, severity: 'low' as const, title: 'Customer satisfaction survey updates' }
    ],
    'Maintenance': [
      { id: 25, severity: 'high' as const, title: 'Equipment maintenance schedule delays' },
      { id: 26, severity: 'medium' as const, title: 'Preventive maintenance program review needed' },
      { id: 27, severity: 'low' as const, title: 'Maintenance tools inventory update' }
    ],
    'R&D': [
      { id: 28, severity: 'medium' as const, title: 'AI integration project timeline adjustment' },
      { id: 29, severity: 'high' as const, title: 'Patent application documentation delays' },
      { id: 30, severity: 'low' as const, title: 'Research collaboration agreements review' }
    ]
  },
  thailand: {
    'Executive': [
      { id: 31, severity: 'medium' as const, title: 'Regional market expansion strategy review' },
      { id: 32, severity: 'low' as const, title: 'Branch facility renovation planning' },
      { id: 33, severity: 'high' as const, title: 'Cross-department coordination gaps identified' }
    ],
    'HR': [
      { id: 34, severity: 'medium' as const, title: 'Recruitment process optimization needed' },
      { id: 35, severity: 'low' as const, title: 'Employee wellness program expansion' },
      { id: 36, severity: 'medium' as const, title: 'Performance review system updates' }
    ],
    'Production': [
      { id: 37, severity: 'high' as const, title: 'Supply chain disruption affecting output' },
      { id: 38, severity: 'medium' as const, title: 'Production waste reduction targets unmet' },
      { id: 39, severity: 'low' as const, title: 'Shift scheduling optimization needed' }
    ],
    'International Market': [
      { id: 40, severity: 'medium' as const, title: 'Regional competitor activity increasing' },
      { id: 41, severity: 'medium' as const, title: 'Export market training needs assessment' },
      { id: 42, severity: 'low' as const, title: 'International CRM system user adoption low' }
    ],
    'Domestic Market': [
      { id: 43, severity: 'low' as const, title: 'Local market research data update needed' },
      { id: 44, severity: 'medium' as const, title: 'Domestic marketing budget reallocation' },
      { id: 45, severity: 'medium' as const, title: 'Local partnership marketing opportunities review' }
    ],
    'Logistics': [
      { id: 46, severity: 'medium' as const, title: 'Network bandwidth upgrade required' },
      { id: 47, severity: 'high' as const, title: 'Distribution center capacity expansion needed' },
      { id: 48, severity: 'medium' as const, title: 'Transport fleet modernization' }
    ],
    'Quality Control': [
      { id: 49, severity: 'medium' as const, title: 'Local regulatory changes compliance review' },
      { id: 50, severity: 'low' as const, title: 'Quality certification renewal updates' },
      { id: 51, severity: 'medium' as const, title: 'Inspection equipment calibration required' }
    ],
    'After-Sales': [
      { id: 52, severity: 'high' as const, title: 'Language support capacity insufficient' },
      { id: 53, severity: 'medium' as const, title: 'Customer feedback system integration issues' },
      { id: 54, severity: 'low' as const, title: 'Service level agreement updates pending' }
    ],
    'Maintenance': [
      { id: 55, severity: 'medium' as const, title: 'Facility maintenance backlog' },
      { id: 56, severity: 'high' as const, title: 'Critical equipment repair scheduling conflicts' },
      { id: 57, severity: 'low' as const, title: 'Maintenance staff training program updates' }
    ],
    'R&D': [
      { id: 58, severity: 'medium' as const, title: 'Product development timeline extension needed' },
      { id: 59, severity: 'low' as const, title: 'Research equipment maintenance backlog' },
      { id: 60, severity: 'high' as const, title: 'Innovation pipeline insufficient' }
    ]
  },
  vietnam: {
    'Executive': [
      { id: 61, severity: 'high' as const, title: 'Branch operational efficiency improvement needed' },
      { id: 62, severity: 'medium' as const, title: 'Local partnership development strategy' },
      { id: 63, severity: 'low' as const, title: 'Executive team capacity building' }
    ],
    'HR': [
      { id: 64, severity: 'medium' as const, title: 'Talent acquisition challenges in key roles' },
      { id: 65, severity: 'high' as const, title: 'Employee retention program enhancement required' },
      { id: 66, severity: 'low' as const, title: 'Workplace culture assessment pending' }
    ],
    'Production': [
      { id: 67, severity: 'medium' as const, title: 'Production capacity utilization below optimal' },
      { id: 68, severity: 'medium' as const, title: 'Quality standards alignment with HQ' },
      { id: 69, severity: 'low' as const, title: 'Process documentation updates required' }
    ],
    'International Market': [
      { id: 70, severity: 'high' as const, title: 'Market penetration below projections' },
      { id: 71, severity: 'medium' as const, title: 'Sales channel development opportunities' },
      { id: 72, severity: 'medium' as const, title: 'Pricing strategy localization needed' }
    ],
    'Domestic Market': [
      { id: 73, severity: 'medium' as const, title: 'Brand awareness building campaigns needed' },
      { id: 74, severity: 'low' as const, title: 'Marketing collateral localization pending' },
      { id: 75, severity: 'medium' as const, title: 'Local influencer partnership development' }
    ],
    'Logistics': [
      { id: 76, severity: 'high' as const, title: 'IT infrastructure capacity constraints' },
      { id: 77, severity: 'medium' as const, title: 'System security audit findings' },
      { id: 78, severity: 'low' as const, title: 'Technology vendor management review' }
    ],
    'Quality Control': [
      { id: 79, severity: 'high' as const, title: 'Legal compliance gap analysis completed' },
      { id: 80, severity: 'medium' as const, title: 'Local legal counsel capacity expansion' },
      { id: 81, severity: 'low' as const, title: 'Contract management process improvement' }
    ],
    'After-Sales': [
      { id: 82, severity: 'medium' as const, title: 'Customer service team training enhancement' },
      { id: 83, severity: 'high' as const, title: 'Response time targets consistently missed' },
      { id: 84, severity: 'medium' as const, title: 'Service quality monitoring system upgrade' }
    ],
    'Maintenance': [
      { id: 85, severity: 'medium' as const, title: 'Equipment upkeep resource allocation' },
      { id: 86, severity: 'high' as const, title: 'Maintenance workflow optimization required' },
      { id: 87, severity: 'low' as const, title: 'Spare parts inventory management' }
    ],
    'R&D': [
      { id: 88, severity: 'low' as const, title: 'R&D team skill development programs' },
      { id: 89, severity: 'medium' as const, title: 'Product adaptation for local market' },
      { id: 90, severity: 'medium' as const, title: 'Innovation collaboration with HQ enhancement' }
    ]
  },
  brunei: {
    'Executive': [
      { id: 91, severity: 'medium' as const, title: 'Branch growth strategy refinement needed' },
      { id: 92, severity: 'low' as const, title: 'Regional collaboration enhancement' },
      { id: 93, severity: 'medium' as const, title: 'Leadership team development planning' }
    ],
    'HR': [
      { id: 94, severity: 'high' as const, title: 'Recruitment pipeline development critical' },
      { id: 95, severity: 'medium' as const, title: 'Employee benefits program competitiveness' },
      { id: 96, severity: 'low' as const, title: 'HR policy localization updates' }
    ],
    'Production': [
      { id: 97, severity: 'low' as const, title: 'Production planning optimization opportunities' },
      { id: 98, severity: 'medium' as const, title: 'Equipment maintenance cost reduction' },
      { id: 99, severity: 'medium' as const, title: 'Production team skill enhancement programs' }
    ],
    'International Market': [
      { id: 100, severity: 'medium' as const, title: 'International sales territory management optimization' },
      { id: 101, severity: 'high' as const, title: 'Key account relationship strengthening' },
      { id: 102, severity: 'medium' as const, title: 'Sales forecast accuracy improvement needed' }
    ],
    'Domestic Market': [
      { id: 103, severity: 'low' as const, title: 'Marketing effectiveness measurement system' },
      { id: 104, severity: 'medium' as const, title: 'Local market positioning refinement' },
      { id: 105, severity: 'low' as const, title: 'Marketing automation tool implementation' }
    ],
    'Logistics': [
      { id: 106, severity: 'medium' as const, title: 'IT support capacity expansion needed' },
      { id: 107, severity: 'high' as const, title: 'System reliability issues affecting operations' },
      { id: 108, severity: 'low' as const, title: 'IT asset management process update' }
    ],
    'Quality Control': [
      { id: 109, severity: 'medium' as const, title: 'Legal risk assessment process enhancement' },
      { id: 110, severity: 'low' as const, title: 'Corporate governance documentation review' },
      { id: 111, severity: 'high' as const, title: 'Regulatory reporting compliance gaps' }
    ],
    'After-Sales': [
      { id: 112, severity: 'medium' as const, title: 'Customer service platform upgrade needed' },
      { id: 113, severity: 'medium' as const, title: 'Service team capacity planning' },
      { id: 114, severity: 'low' as const, title: 'Customer feedback analysis enhancement' }
    ],
    'Maintenance': [
      { id: 115, severity: 'medium' as const, title: 'Maintenance schedule coordination' },
      { id: 116, severity: 'low' as const, title: 'Equipment lifecycle management review' },
      { id: 117, severity: 'high' as const, title: 'Critical infrastructure maintenance prioritization' }
    ],
    'R&D': [
      { id: 118, severity: 'medium' as const, title: 'R&D project prioritization framework' },
      { id: 119, severity: 'low' as const, title: 'Knowledge sharing with other branches' },
      { id: 120, severity: 'medium' as const, title: 'Research resource allocation optimization' }
    ]
  }
};
