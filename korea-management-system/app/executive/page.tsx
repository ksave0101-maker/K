'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, TrendingUp, TrendingDown, AlertCircle, Target, 
  Calendar, CheckCircle, Clock, Users, DollarSign, Package,
  MapPin, Bell, Wrench, Headphones, BarChart3, FileText, X, Paperclip, Award
} from 'lucide-react';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CountryFlag from '@/components/CountryFlag';
import CompanyLogo from '@/components/CompanyLogo';
import { evaluationData } from './evaluationData';
import { departmentMeetingsData } from './departmentMeetingsData';
import { departmentIssuesData } from './issuesData';
import { departmentGoalsData } from './departmentGoalsData';

type Branch = 'brunei' | 'thailand' | 'vietnam' | 'korea';
type EvaluationPeriod = 'quarterly' | 'semi-annual' | 'annual';

interface EmployeeEvaluation {
  id: number;
  name: string;
  position: string;
  department: string;
  performance: number;
  attendance: number;
  teamwork: number;
  productivity: number;
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D';
  comments: string;
}

interface DepartmentEvaluation {
  department: string;
  overallPerformance: number;
  targetAchievement: number;
  teamEfficiency: number;
  customerSatisfaction: number;
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D';
  strengths: string[];
  improvements: string[];
}

interface BranchEvaluation {
  period: EvaluationPeriod;
  overallScore: number;
  financialPerformance: number;
  operationalEfficiency: number;
  employeeSatisfaction: number;
  customerSatisfaction: number;
  grade: 'A' | 'B' | 'C' | 'D';
  achievements: string[];
  challenges: string[];
  recommendations: string[];
}

interface BranchData {
  country: Branch;
  countryCode: 'BN' | 'TH' | 'VN' | 'KR';
  currency: string;
  revenue: number;
  profit: number;
  expenses: number;
  employees: number;
  performance: number;
  issues: Array<{ id: number; severity: 'high' | 'medium' | 'low'; title: string; department: string }>;
  departmentIssues: Record<string, Array<{ id: number; severity: 'high' | 'medium' | 'low'; title: string }>>;
  departmentGoals: Record<string, Array<{ id: number; title: string; progress: number; deadline: string; status: 'on-track' | 'at-risk' | 'delayed' }>>;
  goals: Array<{ id: number; title: string; progress: number; deadline: string; status: 'on-track' | 'at-risk' | 'delayed' }>;
  meetings: Array<{ id: number; date: string; title: string; attendees: number; key_decisions: string[] }>;  departmentMeetings: Record<string, Array<{ id: number; date: string; title: string; attendees: number; key_decisions: string[] }>>;
  departmentStats: Array<{ name: string; performance: number; staffing: number; budget: number; evaluation: string }>;
  recentUpdates: Array<{ id: number; date: string; title: string; description: string; updatedBy: string }>;
  pendingBills: Array<{ 
    id: number; 
    department: string; 
    description: string; 
    amount: number; 
    submittedDate: string; 
    priority: 'urgent' | 'normal' | 'low'; 
    category: string;
    requestedBy: string;
    reason: string;
    justification: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    attachments: number;
  }>;
  employeeEvaluations: Record<EvaluationPeriod, EmployeeEvaluation[]>;
  departmentEvaluations: Record<EvaluationPeriod, DepartmentEvaluation[]>;
  branchEvaluations: Record<EvaluationPeriod, BranchEvaluation>;
}

export default function ExecutiveDashboard() {
  const { locale } = useLocale();
  const t = translations[locale];
  
  const [selectedBranch, setSelectedBranch] = useState<Branch>('korea');
  const [selectedBill, setSelectedBill] = useState<BranchData['pendingBills'][0] | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [evaluationPeriod, setEvaluationPeriod] = useState<EvaluationPeriod>('quarterly');
  const [evaluationType, setEvaluationType] = useState<'employee' | 'department' | 'branch'>('employee');
  const [departmentView, setDepartmentView] = useState<'byBranch' | 'byDepartment'>('byBranch');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('Executive');
  const [issuesView, setIssuesView] = useState<'byBranch' | 'byDepartment'>('byBranch');
  const [selectedIssueDepartment, setSelectedIssueDepartment] = useState<string>('Executive');
  const [goalsView, setGoalsView] = useState<'byBranch' | 'byDepartment'>('byBranch');
  const [selectedGoalDepartment, setSelectedGoalDepartment] = useState<string>('Executive');
  const [selectedSection, setSelectedSection] = useState<'all' | 'keyMetrics' | 'pendingBills' | 'evaluations' | 'issues' | 'goals' | 'departmentPerformance' | 'recentUpdates'>('all');

  const openBillDetails = (bill: BranchData['pendingBills'][0]) => {
    setSelectedBill(bill);
    setShowBillModal(true);
  };

  const closeBillModal = () => {
    setShowBillModal(false);
    setSelectedBill(null);
  };

  const branchesData: Record<Branch, BranchData> = {
    brunei: {
      country: 'brunei',
      countryCode: 'BN',
      currency: 'B$',
      revenue: 1890000,
      profit: 456000,
      expenses: 1434000,
      employees: 45,
      performance: 87,
      issues: [
        { id: 1, severity: 'medium', title: 'Supply chain delay in Q1', department: 'Logistics' },
        { id: 2, severity: 'low', title: 'New hire orientation pending', department: 'HR' },
        { id: 3, severity: 'medium', title: 'Equipment maintenance scheduled', department: 'Maintenance' }
      ],
      goals: [
        { id: 1, title: 'Increase market share by 15%', progress: 68, deadline: '2026-06-30', status: 'on-track' },
        { id: 2, title: 'Launch energy saving program', progress: 45, deadline: '2026-04-15', status: 'at-risk' },
        { id: 3, title: 'Reduce operational costs by 8%', progress: 82, deadline: '2026-08-31', status: 'on-track' }
      ],
      meetings: [
        { 
          id: 1, 
          date: '2026-02-10', 
          title: 'Q1 Performance Review', 
          attendees: 12,
          key_decisions: ['Approved new marketing budget', 'Hired 3 additional staff', 'Postponed facility expansion']
        },
        { 
          id: 2, 
          date: '2026-01-28', 
          title: 'Strategic Planning Session', 
          attendees: 8,
          key_decisions: ['Set Q1 revenue target at B$520K', 'Approved training programs']
        }
      ],
      departmentStats: [
        { name: 'Executive', performance: 90, staffing: 100, budget: 92, evaluation: 'Strong leadership, strategic planning on track' },
        { name: 'HR', performance: 92, staffing: 100, budget: 95, evaluation: 'Excellent recruitment, training programs effective' },
        { name: 'Production', performance: 85, staffing: 95, budget: 88, evaluation: 'Good output quality, minor delays in Q1' },
        { name: 'International Market', performance: 88, staffing: 94, budget: 90, evaluation: 'New markets identified, expansion planning phase' },
        { name: 'Domestic Market', performance: 86, staffing: 92, budget: 87, evaluation: 'Steady growth, customer retention high' },
        { name: 'Logistics', performance: 78, staffing: 90, budget: 82, evaluation: 'Route optimization needed, costs above target' },
        { name: 'Quality Control', performance: 94, staffing: 100, budget: 90, evaluation: 'Zero defects this quarter, ISO standards met' },
        { name: 'After-Sales', performance: 89, staffing: 96, budget: 88, evaluation: 'Customer satisfaction improving, fast response time' },
        { name: 'Maintenance', performance: 91, staffing: 98, budget: 93, evaluation: 'Equipment uptime excellent, preventive maintenance on schedule' },
        { name: 'R&D', performance: 87, staffing: 95, budget: 94, evaluation: 'Innovation projects progressing, prototype testing phase' }
      ],
      recentUpdates: [
        { id: 1, date: '2026-02-12', title: 'New partnership signed', description: 'Secured deal with local supplier for raw materials', updatedBy: 'Branch Manager' },
        { id: 2, date: '2026-02-08', title: 'Production milestone achieved', description: 'Exceeded monthly production target by 12%', updatedBy: 'Production Head' },
        { id: 3, date: '2026-02-05', title: 'Quality certification renewed', description: 'ISO 9001 certification successfully renewed', updatedBy: 'QC Manager' }
      ],
      pendingBills: [
        { id: 1, department: 'HR', description: 'Employee training program - Q1 2026', amount: 12500, submittedDate: '2026-02-10', priority: 'normal', category: 'Training', requestedBy: 'Sarah Johnson - HR Manager', reason: 'Annual employee training program', justification: 'Essential for maintaining skill levels and compliance with industry standards. Training includes safety protocols, new software systems, and leadership development.', approvalStatus: 'pending', attachments: 3 },
        { id: 2, department: 'Production', description: 'Raw materials procurement - February', amount: 45000, submittedDate: '2026-02-13', priority: 'urgent', category: 'Materials', requestedBy: 'Michael Chen - Production Head', reason: 'Monthly raw material inventory replenishment', justification: 'Current inventory levels at 15% below safety stock. Production scheduled to increase by 20% next week. Urgent procurement needed to avoid production delays.', approvalStatus: 'pending', attachments: 5 },
        { id: 3, department: 'Logistics', description: 'Vehicle maintenance and fuel costs', amount: 8300, submittedDate: '2026-02-09', priority: 'normal', category: 'Operations', requestedBy: 'David Lee - Logistics Coordinator', reason: 'Routine vehicle maintenance and Q1 fuel budget', justification: 'Scheduled maintenance for 3 delivery vehicles. Includes oil changes, tire rotation, and brake inspections. Fuel costs for estimated 5,000km operations.', approvalStatus: 'pending', attachments: 2 },
        { id: 4, department: 'Quality Control', description: 'Testing equipment calibration', amount: 6700, submittedDate: '2026-02-11', priority: 'low', category: 'Equipment', requestedBy: 'Emma Wilson - QC Manager', reason: 'Annual equipment calibration', justification: 'ISO 9001 compliance requires annual calibration. Equipment includes precision scales, temperature gauges, and measurement tools. Certification expires March 1st.', approvalStatus: 'pending', attachments: 1 },
        { id: 5, department: 'Maintenance', description: 'Spare parts inventory replenishment', amount: 15200, submittedDate: '2026-02-14', priority: 'urgent', category: 'Inventory', requestedBy: 'James Brown - Maintenance Supervisor', reason: 'Critical spare parts inventory low', justification: 'Several critical components below minimum stock levels. Includes motor parts, belts, and electrical components. Delays could result in extended downtime.', approvalStatus: 'pending', attachments: 4 }
      ],
      departmentMeetings: departmentMeetingsData.brunei,
      departmentIssues: departmentIssuesData.brunei,
      departmentGoals: departmentGoalsData.brunei,
      ...evaluationData.brunei
    },
    thailand: {
      country: 'thailand',
      countryCode: 'TH',
      currency: '฿',
      revenue: 67320000,
      profit: 18560000,
      expenses: 48760000,
      employees: 78,
      performance: 95,
      issues: [
        { id: 1, severity: 'low', title: 'Minor equipment calibration needed', department: 'Production' },
        { id: 2, severity: 'high', title: 'Urgent: Customer complaint escalation', department: 'After-Sales' },
        { id: 3, severity: 'medium', title: 'Staff training completion deadline approaching', department: 'HR' }
      ],
      goals: [
        { id: 1, title: 'Achieve 120% of quarterly sales target', progress: 95, deadline: '2026-03-31', status: 'on-track' },
        { id: 2, title: 'Expand to 2 new regions', progress: 55, deadline: '2026-07-01', status: 'on-track' },
        { id: 3, title: 'Implement new CRM system', progress: 35, deadline: '2026-05-20', status: 'delayed' }
      ],
      meetings: [
        { 
          id: 1, 
          date: '2026-02-09', 
          title: 'Weekly Operations Meeting', 
          attendees: 15,
          key_decisions: ['Fast-track customer service improvements', 'Allocate budget for regional expansion', 'Approve overtime for production team']
        },
        { 
          id: 2, 
          date: '2026-02-01', 
          title: 'Monthly Management Review', 
          attendees: 18,
          key_decisions: ['Exceeded targets - bonus approved', 'New hiring approved for expansion', 'Marketing campaign greenlit']
        }
      ],
      departmentStats: [
        { name: 'Executive', performance: 95, staffing: 100, budget: 96, evaluation: 'Outstanding leadership, all targets exceeded' },
        { name: 'HR', performance: 88, staffing: 98, budget: 92, evaluation: 'Strong team building, low turnover rate' },
        { name: 'Production', performance: 96, staffing: 100, budget: 94, evaluation: 'Record output achieved, efficiency at peak' },
        { name: 'International Market', performance: 94, staffing: 98, budget: 95, evaluation: 'Regional expansion successful, strong partnerships' },
        { name: 'Domestic Market', performance: 97, staffing: 100, budget: 96, evaluation: 'Market leader position maintained, excellent sales' },
        { name: 'Logistics', performance: 93, staffing: 96, budget: 89, evaluation: 'Fast delivery times, distribution network optimized' },
        { name: 'Quality Control', performance: 95, staffing: 100, budget: 92, evaluation: 'Best-in-class quality metrics, customer complaints minimal' },
        { name: 'After-Sales', performance: 91, staffing: 97, budget: 90, evaluation: 'Quick resolution times, high satisfaction scores' },
        { name: 'Maintenance', performance: 92, staffing: 98, budget: 91, evaluation: 'Zero downtime achieved, proactive maintenance excellence' },
        { name: 'R&D', performance: 89, staffing: 96, budget: 93, evaluation: 'New product launches successful, innovation pipeline strong' }
      ],
      recentUpdates: [
        { id: 1, date: '2026-02-13', title: 'Record sales achieved', description: '฿22.4M in sales for the week - highest ever', updatedBy: 'Sales Director' },
        { id: 2, date: '2026-02-11', title: 'Regional expansion approved', description: 'Board approved expansion to Chiang Mai and Phuket', updatedBy: 'CEO' },
        { id: 3, date: '2026-02-07', title: 'Customer satisfaction improved', description: 'NPS score increased from 78 to 85', updatedBy: 'Customer Service Manager' }
      ],
      pendingBills: [
        { id: 1, department: 'Executive', description: 'Regional expansion feasibility study', amount: 280000, submittedDate: '2026-02-12', priority: 'urgent', category: 'Consulting', requestedBy: 'Somchai Prasert - CEO', reason: 'Strategic expansion planning for northern regions', justification: 'Market research shows 35% growth potential in Chiang Mai and Phuket regions. Consulting fee covers 3-month study including market analysis, competitor research, and financial projections. Expected ROI: 180% within 2 years.', approvalStatus: 'pending', attachments: 8 },
        { id: 2, department: 'HR', description: 'Recruitment agency fees - 15 positions', amount: 95000, submittedDate: '2026-02-13', priority: 'normal', category: 'Recruitment', requestedBy: 'Niran Suksai - HR Director', reason: 'Regional expansion staffing requirements', justification: 'Expansion requires 15 new hires: 5 engineers, 4 sales reps, 3 logistics staff, 3 admin. Agency provides pre-screened candidates, reducing time-to-hire by 60%. Average placement fee: ฿6,333 per position.', approvalStatus: 'pending', attachments: 2 },
        { id: 3, department: 'Production', description: 'Production line automation upgrade', amount: 520000, submittedDate: '2026-02-11', priority: 'urgent', category: 'Capital Investment', requestedBy: 'Prasit Wongsa - Production Director', reason: 'Increase capacity to meet Q2 demand surge', justification: 'Current orders exceed capacity by 25%. Automation upgrade reduces cycle time by 40% and labor costs by 30%. Payback period: 14 months. Vendor quote attached with 3-year warranty.', approvalStatus: 'pending', attachments: 12 },
        { id: 4, department: 'International Market', description: 'Market research - Southeast Asia', amount: 67000, submittedDate: '2026-02-10', priority: 'normal', category: 'Research', requestedBy: 'Anong Buathong - Market Research Manager', reason: 'Vietnam and Cambodia market entry study', justification: 'Preliminary data shows strong demand in Ho Chi Minh City and Phnom Penh. Research covers regulatory requirements, distribution channels, and local partnerships. Duration: 2 months.', approvalStatus: 'pending', attachments: 4 },
        { id: 5, department: 'After-Sales', description: 'Customer support software license renewal', amount: 42000, submittedDate: '2026-02-09', priority: 'normal', category: 'Software', requestedBy: 'Suwan Chaiya - Customer Service Manager', reason: 'Annual CRM system renewal', justification: 'Zendesk license for 25 agents. Current contract expires Feb 28. System handles 1,200+ tickets monthly with 95% satisfaction rate. Includes training and technical support.', approvalStatus: 'pending', attachments: 1 },
        { id: 6, department: 'Logistics', description: 'New delivery vehicles (3 units)', amount: 1250000, submittedDate: '2026-02-14', priority: 'urgent', category: 'Vehicles', requestedBy: 'Somkid Thammarat - Logistics Director', reason: 'Replace aging fleet and support expansion', justification: 'Current vehicles: 8+ years old, maintenance costs ฿45K/month. New vehicles reduce fuel costs by 25%, lower emissions 40%. Expansion requires 20% more delivery capacity. Lease vs buy analysis attached.', approvalStatus: 'pending', attachments: 7 },
        { id: 7, department: 'R&D', description: 'Product development materials - Phase 2', amount: 185000, submittedDate: '2026-02-08', priority: 'low', category: 'Development', requestedBy: 'Wattana Suksa - R&D Manager', reason: 'Next-gen energy saving product prototype', justification: 'Phase 1 testing successful. Phase 2 requires advanced materials for durability testing. Expected energy savings: 35% vs current model. Patent application in progress.', approvalStatus: 'pending', attachments: 6 }
      ],
      departmentMeetings: departmentMeetingsData.thailand,
      departmentIssues: departmentIssuesData.thailand,
      departmentGoals: departmentGoalsData.thailand,
      ...evaluationData.thailand
    },
    vietnam: {
      country: 'vietnam',
      countryCode: 'VN',
      currency: '₫',
      revenue: 32258000000,
      profit: 8456000000,
      expenses: 23802000000,
      employees: 62,
      performance: 91,
      issues: [
        { id: 1, severity: 'high', title: 'Regulatory compliance deadline - Feb 28', department: 'Executive' },
        { id: 2, severity: 'medium', title: 'Logistics route optimization needed', department: 'Logistics' },
        { id: 3, severity: 'low', title: 'Office renovation scheduled', department: 'HR' }
      ],
      goals: [
        { id: 1, title: 'Establish 3 new partnerships', progress: 100, deadline: '2026-02-28', status: 'on-track' },
        { id: 2, title: 'Increase production efficiency by 20%', progress: 72, deadline: '2026-06-15', status: 'on-track' },
        { id: 3, title: 'Launch Vietnamese-language support', progress: 88, deadline: '2026-03-31', status: 'on-track' }
      ],
      meetings: [
        { 
          id: 1, 
          date: '2026-02-07', 
          title: 'Partnership Strategy Meeting', 
          attendees: 10,
          key_decisions: ['3rd partnership finalized', 'Q2 partnership targets set', 'Marketing collaboration approved']
        },
        { 
          id: 2, 
          date: '2026-01-30', 
          title: 'Operations Efficiency Review', 
          attendees: 14,
          key_decisions: ['Automation project approved', 'Process improvements implemented', 'New KPIs established']
        }
      ],
      departmentStats: [
        { name: 'Executive', performance: 92, staffing: 100, budget: 93, evaluation: 'Strategic initiatives on track, partnership goals met' },
        { name: 'HR', performance: 90, staffing: 97, budget: 88, evaluation: 'Talent acquisition strong, training budget optimized' },
        { name: 'Production', performance: 89, staffing: 94, budget: 91, evaluation: 'Automation improving efficiency, capacity expansion planned' },
        { name: 'International Market', performance: 91, staffing: 96, budget: 90, evaluation: 'Export growth strong, compliance requirements met' },
        { name: 'Domestic Market', performance: 88, staffing: 93, budget: 86, evaluation: 'Local partnerships established, market share growing' },
        { name: 'Logistics', performance: 87, staffing: 92, budget: 85, evaluation: 'Supply chain needs optimization, costs slightly high' },
        { name: 'Quality Control', performance: 93, staffing: 98, budget: 92, evaluation: 'Quality standards excellent, audit passed with distinction' },
        { name: 'After-Sales', performance: 90, staffing: 95, budget: 89, evaluation: 'Customer support responsive, warranty claims handled well' },
        { name: 'Maintenance', performance: 89, staffing: 94, budget: 90, evaluation: 'Equipment reliability high, maintenance costs controlled' },
        { name: 'R&D', performance: 93, staffing: 100, budget: 95, evaluation: 'Innovation team expanded, 2 patents filed this quarter' }
      ],
      recentUpdates: [
        { id: 1, date: '2026-02-14', title: 'Partnership milestone reached', description: 'Successfully onboarded 3rd major partner ahead of schedule', updatedBy: 'Business Development' },
        { id: 2, date: '2026-02-10', title: 'Production efficiency gains', description: 'Automated processes reduced cycle time by 18%', updatedBy: 'Operations Manager' },
        { id: 3, date: '2026-02-06', title: 'Team expansion completed', description: 'Hired 5 new engineers for R&D department', updatedBy: 'HR Manager' }
      ],
      pendingBills: [
        { id: 1, department: 'Production', description: 'Manufacturing equipment maintenance contract', amount: 125000000, submittedDate: '2026-02-13', priority: 'urgent', category: 'Maintenance', requestedBy: 'Nguyen Van Minh - Production Manager', reason: 'Annual maintenance contract renewal', justification: 'Contract covers 15 production machines. Preventive maintenance reduces downtime by 60%. Current uptime: 98.5%. Includes emergency repair service and spare parts. Contract expires Feb 20th.', approvalStatus: 'pending', attachments: 5 },
        { id: 2, department: 'HR', description: 'Employee benefits package - Q1', amount: 68000000, submittedDate: '2026-02-12', priority: 'normal', category: 'Benefits', requestedBy: 'Tran Thi Lan - HR Director', reason: 'Quarterly employee health insurance and benefits', justification: 'Covers 62 employees. Package includes health insurance, dental, transportation allowance. Benefits retention rate improved employee satisfaction by 25%. Competitive with market standards.', approvalStatus: 'pending', attachments: 3 },
        { id: 3, department: 'R&D', description: 'Innovation lab equipment upgrade', amount: 245000000, submittedDate: '2026-02-14', priority: 'urgent', category: 'Equipment', requestedBy: 'Le Hong Phuc - R&D Director', reason: 'Advanced testing equipment for new product line', justification: 'Current equipment cannot test new specifications. Upgrade enables 40% faster testing cycles. 2 patents pending require this capability. Equipment includes precision testing machines and AI analysis software.', approvalStatus: 'pending', attachments: 9 },
        { id: 4, department: 'Logistics', description: 'Warehouse expansion - Phase 1', amount: 380000000, submittedDate: '2026-02-11', priority: 'normal', category: 'Facility', requestedBy: 'Pham Duc Thanh - Logistics Manager', reason: 'Increase storage capacity by 50%', justification: 'Current warehouse at 95% capacity. Expansion adds 2,000 sq meters. Supports growth projections for next 3 years. Construction timeline: 4 months. Land permit approved.', approvalStatus: 'pending', attachments: 11 },
        { id: 5, department: 'Quality Control', description: 'ISO compliance audit fees', amount: 42000000, submittedDate: '2026-02-10', priority: 'low', category: 'Compliance', requestedBy: 'Vo Minh Tri - QC Manager', reason: 'Annual ISO 9001:2015 certification audit', justification: 'Mandatory annual audit for ISO certification. Certification required for international clients. Includes pre-audit consultation and corrective action review. Audit scheduled March 15-17.', approvalStatus: 'pending', attachments: 2 },
        { id: 6, department: 'Maintenance', description: 'Preventive maintenance supplies', amount: 55000000, submittedDate: '2026-02-09', priority: 'normal', category: 'Supplies', requestedBy: 'Hoang Van Kiet - Maintenance Supervisor', reason: 'Q1 maintenance supplies and consumables', justification: 'Supplies for scheduled maintenance of all facility equipment. Includes lubricants, filters, belts, electrical components. Preventive maintenance reduces emergency repairs by 75%.', approvalStatus: 'pending', attachments: 4 }
      ],
      departmentMeetings: departmentMeetingsData.vietnam,
      departmentIssues: departmentIssuesData.vietnam,
      departmentGoals: departmentGoalsData.vietnam,
      ...evaluationData.vietnam
    },
    korea: {
      country: 'korea',
      countryCode: 'KR',
      currency: '₩',
      revenue: 158420000000,
      profit: 42180000000,
      expenses: 116240000000,
      employees: 156,
      performance: 98,
      issues: [
        { id: 1, severity: 'medium', title: 'Global expansion coordination needs enhancement', department: 'Executive' },
        { id: 2, severity: 'low', title: 'New headquarters building planning', department: 'Executive' },
        { id: 3, severity: 'medium', title: 'AI integration project timeline adjustment', department: 'R&D' }
      ],
      goals: [
        { id: 1, title: 'Establish 4th international branch by Q3', progress: 65, deadline: '2026-09-30', status: 'on-track' },
        { id: 2, title: 'Launch next-gen energy platform', progress: 78, deadline: '2026-06-30', status: 'on-track' },
        { id: 3, title: 'Achieve 50% increase in global market share', progress: 52, deadline: '2026-12-31', status: 'on-track' }
      ],
      meetings: [
        { 
          id: 1, 
          date: '2026-02-12', 
          title: 'Board of Directors - Q1 Strategic Review', 
          attendees: 25,
          key_decisions: ['Approved 4th branch expansion', 'R&D budget increased 20%', 'Global partnership strategy approved', 'CEO performance bonus authorized']
        },
        { 
          id: 2, 
          date: '2026-02-05', 
          title: 'Global Operations Summit', 
          attendees: 32,
          key_decisions: ['Integration framework for all branches', 'Unified IT platform rollout', 'Cross-branch talent mobility program']
        }
      ],
      departmentStats: [
        { name: 'Executive', performance: 98, staffing: 100, budget: 98, evaluation: 'Outstanding leadership, record-breaking results, global expansion on track' },
        { name: 'HR', performance: 95, staffing: 100, budget: 96, evaluation: 'Exceptional talent management, company culture excellence' },
        { name: 'Production', performance: 94, staffing: 98, budget: 95, evaluation: 'Industry-leading efficiency, quality standards benchmark' },
        { name: 'International Market', performance: 96, staffing: 100, budget: 97, evaluation: 'Global expansion success, strategic partnerships thriving' },
        { name: 'Domestic Market', performance: 93, staffing: 97, budget: 94, evaluation: 'Market leader position, strong local partnerships' },
        { name: 'Logistics', performance: 92, staffing: 96, budget: 93, evaluation: 'Global supply chain excellence, cost optimization achieved' },
        { name: 'Quality Control', performance: 96, staffing: 100, budget: 95, evaluation: 'Zero-defect achievement, industry awards received' },
        { name: 'After-Sales', performance: 94, staffing: 98, budget: 93, evaluation: 'Customer satisfaction leadership, rapid response excellence' },
        { name: 'Maintenance', performance: 93, staffing: 97, budget: 94, evaluation: 'Predictive maintenance success, facility excellence' },
        { name: 'R&D', performance: 97, staffing: 100, budget: 98, evaluation: 'Innovation leadership, 5 patents filed, technology breakthrough' }
      ],
      recentUpdates: [
        { id: 1, date: '2026-02-14', title: 'Record quarterly results announced', description: 'Highest quarterly revenue and profit in company history', updatedBy: 'CEO Office' },
        { id: 2, date: '2026-02-11', title: '4th international branch approved', description: 'Board approved expansion to new Southeast Asian market', updatedBy: 'Executive Committee' },
        { id: 3, date: '2026-02-08', title: 'Innovation award received', description: 'National technology innovation award for energy saving platform', updatedBy: 'R&D Department' }
      ],
      pendingBills: [
        { id: 1, department: 'Executive', description: 'New headquarters building - Phase 1 design', amount: 2800000000, submittedDate: '2026-02-13', priority: 'urgent', category: 'Capital Investment', requestedBy: 'Kim Min-ji - CEO', reason: 'Headquarters expansion for growth', justification: 'Current headquarters at 95% capacity. New building accommodates 300 employees, includes innovation center, executive facilities. Architectural design competition winner selected. Expected completion: 18 months. Property value appreciation estimated 40%.', approvalStatus: 'pending', attachments: 25 },
        { id: 2, department: 'R&D', description: 'AI research center establishment', amount: 1650000000, submittedDate: '2026-02-12', priority: 'urgent', category: 'Research', requestedBy: 'Lee Ji-eun - CTO', reason: 'Next-generation technology development', justification: 'AI integration critical for competitive advantage. Center includes advanced computing infrastructure, research labs, 15 AI specialists. Expected to reduce product development cycle by 35%. Patent pipeline potential: 10+ within 2 years.', approvalStatus: 'pending', attachments: 18 },
        { id: 3, department: 'International Market', description: '4th branch setup - Singapore', amount: 4200000000, submittedDate: '2026-02-14', priority: 'urgent', category: 'Expansion', requestedBy: 'Park Sung-ho - CFO', reason: 'Strategic Southeast Asian expansion', justification: 'Singapore chosen as regional hub for Southeast Asia expansion. Includes office lease, initial inventory, staffing 25 employees, marketing launch. Market analysis shows 125M potential customers, estimated 5-year ROI: 280%. Government incentives secured.', approvalStatus: 'pending', attachments: 32 },
        { id: 4, department: 'HR', description: 'Global leadership development program', amount: 380000000, submittedDate: '2026-02-11', priority: 'normal', category: 'Training', requestedBy: 'Choi Soo-jin - HR Director', reason: 'Executive talent pipeline development', justification: 'Comprehensive 12-month program for 30 high-potential managers. Includes international rotations, executive coaching, MBA-level coursework. Critical for sustaining global growth. Retention rate of program graduates: 95%.', approvalStatus: 'pending', attachments: 8 },
        { id: 5, department: 'Production', description: 'Smart factory automation - Phase 3', amount: 1580000000, submittedDate: '2026-02-10', priority: 'urgent', category: 'Technology', requestedBy: 'Jung Hyun-woo - Production Director', reason: 'Industry 4.0 transformation completion', justification: 'Final phase of smart factory transformation. IoT sensors, AI-driven quality control, predictive maintenance systems. Expected efficiency gain: 45%, defect reduction: 80%, payback period: 11 months. Supplier partnership finalized.', approvalStatus: 'pending', attachments: 22 },
        { id: 6, department: 'R&D', description: 'Patent portfolio expansion - 2026', amount: 620000000, submittedDate: '2026-02-09', priority: 'normal', category: 'Intellectual Property', requestedBy: 'Lee Ji-eun - CTO', reason: 'IP protection and commercialization', justification: 'Filing fees and legal services for 8 new patent applications (3 international). Portfolio strengthens market position, enables licensing revenue stream. Estimated licensing potential: ₩2B annually. Protects core technologies from competition.', approvalStatus: 'pending', attachments: 15 }
      ],
      departmentMeetings: {
        'Executive': [
          { id: 1, date: '2026-02-12', title: 'Leadership Strategy Session', attendees: 8, key_decisions: ['Q1 targets all exceeded', 'Approved branch expansion roadmap', 'CEO succession planning initiated'] },
          { id: 2, date: '2026-02-06', title: 'Risk Management Review', attendees: 6, key_decisions: ['Updated enterprise risk framework', 'Cybersecurity investment approved'] }
        ],
        'HR': [
          { id: 1, date: '2026-02-13', title: 'Talent Acquisition Planning', attendees: 12, key_decisions: ['Hire 30 new employees for expansion', 'Launch employer branding campaign', 'Update compensation structure'] },
          { id: 2, date: '2026-02-07', title: 'Employee Engagement Review', attendees: 8, key_decisions: ['Employee satisfaction at 94%', 'New wellness programs approved'] }
        ],
        'Production': [
          { id: 1, date: '2026-02-11', title: 'Smart Factory Phase 3 Kickoff', attendees: 15, key_decisions: ['Automation timeline finalized', 'Vendor contracts signed', 'Training schedule approved'] },
          { id: 2, date: '2026-02-04', title: 'Quality Standards Review', attendees: 10, key_decisions: ['Zero defects maintained', 'ISO audit passed with excellence'] }
        ],
        'International Market': [
          { id: 1, date: '2026-02-14', title: 'Singapore Expansion Planning', attendees: 14, key_decisions: ['Office location finalized', 'Local partnerships identified', 'Marketing strategy approved'] },
          { id: 2, date: '2026-02-08', title: 'Global Partnership Review', attendees: 11, key_decisions: ['5 new partnership agreements', 'Market entry plan for Philippines'] }
        ],
        'Domestic Market': [
          { id: 1, date: '2026-02-10', title: 'Market Share Analysis', attendees: 9, key_decisions: ['Increased to 38% market share', 'New product launch in March', 'Distribution network expansion'] },
          { id: 2, date: '2026-02-03', title: 'Customer Loyalty Program', attendees: 7, key_decisions: ['Loyalty program exceeds targets', 'Retention rate at 92%'] }
        ],
        'Logistics': [
          { id: 1, date: '2026-02-09', title: 'Supply Chain Optimization', attendees: 11, key_decisions: ['New warehouse management system', 'Delivery time reduced by 15%', 'Sustainability initiatives launched'] },
          { id: 2, date: '2026-02-02', title: 'Fleet Management Review', attendees: 8, key_decisions: ['Electric vehicle pilot approved', 'Route optimization completed'] }
        ],
        'Quality Control': [
          { id: 1, date: '2026-02-12', title: 'Quality Excellence Program', attendees: 13, key_decisions: ['Zero defects for 6 months achieved', 'Quality awards received', 'New testing protocols implemented'] },
          { id: 2, date: '2026-02-05', title: 'Compliance Audit Preparation', attendees: 9, key_decisions: ['ISO 9001 renewal on track', 'All documentation updated'] }
        ],
        'After-Sales': [
          { id: 1, date: '2026-02-11', title: 'Customer Service Excellence', attendees: 16, key_decisions: ['Customer satisfaction at 96%', 'Response time reduced to 2 hours', 'New support channels launched'] },
          { id: 2, date: '2026-02-04', title: 'Warranty Program Review', attendees: 10, key_decisions: ['Warranty claims down 25%', 'Extended warranty program approved'] }
        ],
        'Maintenance': [
          { id: 1, date: '2026-02-10', title: 'Predictive Maintenance Implementation', attendees: 12, key_decisions: ['AI-based prediction system launched', 'Downtime reduced by 40%', 'Preventive maintenance schedule optimized'] },
          { id: 2, date: '2026-02-03', title: 'Facility Upgrades Planning', attendees: 8, key_decisions: ['Equipment upgrade budget approved', 'Energy efficiency project initiated'] }
        ],
        'R&D': [
          { id: 1, date: '2026-02-13', title: 'Innovation Pipeline Review', attendees: 18, key_decisions: ['5 new patents filed', 'AI research center approved', 'Next-gen product development on schedule'] },
          { id: 2, date: '2026-02-06', title: 'Technology Partnerships', attendees: 12, key_decisions: ['University research collaboration', '3 tech partnerships established'] }
        ]
      },
      departmentIssues: departmentIssuesData.korea,
      departmentGoals: departmentGoalsData.korea,
      ...evaluationData.korea
    }
  };

  const currentData = branchesData[selectedBranch];

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityColor = (priority: 'urgent' | 'normal' | 'low') => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: 'on-track' | 'at-risk' | 'delayed') => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-50';
      case 'at-risk': return 'text-orange-600 bg-orange-50';
      case 'delayed': return 'text-red-600 bg-red-50';
    }
  };

  const getStatusIcon = (status: 'on-track' | 'at-risk' | 'delayed') => {
    switch (status) {
      case 'on-track': return <CheckCircle className="w-4 h-4" />;
      case 'at-risk': return <Clock className="w-4 h-4" />;
      case 'delayed': return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getGradeColor = (grade: 'A' | 'B' | 'C' | 'D') => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100 border-green-300';
      case 'B': return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'C': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'D': return 'text-red-600 bg-red-100 border-red-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <CompanyLogo size="2xl" />
              <div className="border-l-2 border-gray-200 pl-4">
                <h1 className="text-xl font-bold text-slate-700">{t.executiveDepartment}</h1>
                <p className="text-sm text-gray-500">{t.executiveDashboardTitle}</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Selector (links to branch pages) */}
        <div className="flex gap-3 mb-4">
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <div className="flex items-center gap-2">
              <Link href="/branches/thailand" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all border ${selectedBranch === 'thailand' ? 'bg-slate-800 text-white shadow' : 'bg-white text-gray-800 border-gray-200 hover:bg-slate-50'} focus:outline-none focus:ring-2 focus:ring-slate-300`}>
                {t.thailandSystem || t.thailand}
              </Link>

              <Link href="/branches/korea" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all border ${selectedBranch === 'korea' ? 'bg-slate-800 text-white shadow' : 'bg-white text-gray-800 border-gray-200 hover:bg-slate-50'} focus:outline-none focus:ring-2 focus:ring-slate-300`}>
                {t.koreaSystem || t.korea}
              </Link>

              <Link href="/branches/brunei" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all border ${selectedBranch === 'brunei' ? 'bg-slate-800 text-white shadow' : 'bg-white text-gray-800 border-gray-200 hover:bg-slate-50'} focus:outline-none focus:ring-2 focus:ring-slate-300`}>
                {t.bruneiSystem || t.brunei}
              </Link>

              <Link href="/branches/vietnam" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all border ${selectedBranch === 'vietnam' ? 'bg-slate-800 text-white shadow' : 'bg-white text-gray-800 border-gray-200 hover:bg-slate-50'} focus:outline-none focus:ring-2 focus:ring-slate-300`}>
                {t.vietnamSystem || t.vietnam}
              </Link>
            </div>
          </div>
        </div>

        {/* Section Menu (moved to top) */}
        <div className="bg-white rounded-lg p-3 mb-6">
          <div className="flex items-center gap-3 overflow-x-auto">
            <button
              onClick={() => setSelectedSection('all')}
              className={`px-4 py-2 rounded-full text-base font-semibold transition-all shadow-sm ${selectedSection === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t.menuAll}
            </button>

            <button
              onClick={() => setSelectedSection('keyMetrics')}
              className={`px-4 py-2 rounded-full text-base font-semibold transition-all shadow-sm ${selectedSection === 'keyMetrics' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t.kpiMetrics || t.menuKeyMetrics}
            </button>

            <button
              onClick={() => setSelectedSection('pendingBills')}
              className={`px-4 py-2 rounded-full text-base font-semibold transition-all shadow-sm ${selectedSection === 'pendingBills' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t.menuPendingBills}
            </button>

            <button
              onClick={() => setSelectedSection('evaluations')}
              className={`px-4 py-2 rounded-full text-base font-semibold transition-all shadow-sm ${selectedSection === 'evaluations' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t.menuEvaluations}
            </button>

            <button
              onClick={() => setSelectedSection('issues')}
              className={`px-4 py-2 rounded-full text-base font-semibold transition-all shadow-sm ${selectedSection === 'issues' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t.menuIssues}
            </button>

            <button
              onClick={() => setSelectedSection('goals')}
              className={`px-4 py-2 rounded-full text-base font-semibold transition-all shadow-sm ${selectedSection === 'goals' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t.menuGoals}
            </button>

            <button
              onClick={() => setSelectedSection('departmentPerformance')}
              className={`px-4 py-2 rounded-full text-base font-semibold transition-all shadow-sm ${selectedSection === 'departmentPerformance' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t.menuDeptPerformance}
            </button>

            <button
              onClick={() => setSelectedSection('recentUpdates')}
              className={`px-4 py-2 rounded-full text-base font-semibold transition-all shadow-sm ${selectedSection === 'recentUpdates' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t.menuRecentUpdates}
            </button>
          </div>
        </div>

        {/* Branch Selector */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.selectBranch}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(branchesData) as Branch[]).map((branch) => {
              const data = branchesData[branch];
              const isSelected = selectedBranch === branch;
              return (
                <button
                  key={branch}
                  onClick={() => setSelectedBranch(branch)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? 'border-slate-600 bg-slate-50 shadow-md' 
                      : 'border-gray-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <CountryFlag country={data.countryCode} size="lg" />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{t[branch]}</h3>
                      <p className="text-sm text-gray-500">{data.employees} {t.employees}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t.performance}:</span>
                    <span className={`font-bold ${data.performance >= 90 ? 'text-green-600' : 'text-orange-600'}`}>
                      {data.performance}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Key Metrics */}
        <div className={`${selectedSection !== 'all' && selectedSection !== 'keyMetrics' ? 'hidden' : ''} grid grid-cols-1 md:grid-cols-4 gap-6 mb-6`}>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm text-gray-600 mb-1">{t.revenue}</h3>
            <p className="text-2xl font-bold text-gray-900">
              {currentData.currency}{new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(currentData.revenue)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm text-gray-600 mb-1">{t.netProfit}</h3>
            <p className="text-2xl font-bold text-gray-900">
              {currentData.currency}{new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(currentData.profit)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-8 h-8 text-orange-600" />
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-sm text-gray-600 mb-1">{t.expenses}</h3>
            <p className="text-2xl font-bold text-gray-900">
              {currentData.currency}{new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(currentData.expenses)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-purple-600" />
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm text-gray-600 mb-1">{t.overallPerformance}</h3>
            <p className="text-2xl font-bold text-gray-900">{currentData.performance}%</p>
          </div>
        </div>

        {/* menu moved to top */}

        {/* Pending Bills for Approval - Full Width */}
        <div className={`${selectedSection !== 'all' && selectedSection !== 'pendingBills' ? 'hidden' : ''} bg-white rounded-xl shadow-md p-6 mb-6`}>
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-6 h-6 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">{t.pendingBills}</h2>
            <span className="ml-auto bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full">
              {currentData.pendingBills.length} {t.items}
            </span>
          </div>
          
          {/* Branch Info Badge */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
            <CountryFlag country={currentData.countryCode} size="xl" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t[currentData.country]} {t.branchBillsTitle}</h3>
              <p className="text-sm text-gray-600">{t.totalAmount}: {currentData.currency}{new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(currentData.pendingBills.reduce((sum, bill) => sum + bill.amount, 0))}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentData.pendingBills.map((bill) => (
              <div 
                key={bill.id} 
                onClick={() => openBillDetails(bill)}
                className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-orange-300 transition-all bg-gradient-to-br from-white to-gray-50 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 ${getPriorityColor(bill.priority)} uppercase tracking-wide`}>
                        {bill.priority}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        #{bill.id.toString().padStart(4, '0')}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-base mb-2 leading-tight group-hover:text-orange-600 transition-colors">{bill.description}</h4>
                    <p className="text-xs text-blue-600 mb-1 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" />
                      {bill.attachments} {t.attachments}
                    </p>
                    <p className="text-xs text-orange-600 font-medium group-hover:text-orange-700">
                      {t.clickForDetails} →
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-4 pb-3 border-b border-gray-200">
                  <span className="flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-700">{bill.department}</span>
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="bg-purple-50 px-3 py-1 rounded-full text-purple-700 font-medium">{bill.category}</span>
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t.amount}:</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentData.currency}{new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(bill.amount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {t.submitted}: {bill.submittedDate}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluations Section */}
        <div className={`${selectedSection !== 'all' && selectedSection !== 'evaluations' ? 'hidden' : ''} bg-white rounded-xl shadow-md p-6 mb-6`}>
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">{t.evaluations}</h2>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <span className="text-sm font-semibold text-gray-700">{t.evaluationPeriod}:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setEvaluationPeriod('quarterly')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  evaluationPeriod === 'quarterly'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-purple-100'
                }`}
              >
                {t.quarterly}
              </button>
              <button
                onClick={() => setEvaluationPeriod('semi-annual')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  evaluationPeriod === 'semi-annual'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-purple-100'
                }`}
              >
                {t.semiAnnual}
              </button>
              <button
                onClick={() => setEvaluationPeriod('annual')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  evaluationPeriod === 'annual'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-purple-100'
                }`}
              >
                {t.annual}
              </button>
            </div>
          </div>

          {/* Evaluation Type Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setEvaluationType('employee')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                evaluationType === 'employee'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.employeeEvaluation}
            </button>
            <button
              onClick={() => setEvaluationType('department')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                evaluationType === 'department'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.departmentEvaluation}
            </button>
            <button
              onClick={() => setEvaluationType('branch')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                evaluationType === 'branch'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.branchEvaluation}
            </button>
          </div>

          {/* Employee Evaluations */}
          {evaluationType === 'employee' && (
            <div className="space-y-4">
              {currentData.employeeEvaluations[evaluationPeriod].length > 0 ? (
                currentData.employeeEvaluations[evaluationPeriod].map((emp) => (
                  <div key={emp.id} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{emp.name}</h3>
                        <p className="text-sm text-gray-600">{emp.position} • {emp.department}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-lg border-2 font-bold text-lg ${getGradeColor(emp.grade)}`}>
                        {emp.grade}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <p className="text-xs text-blue-700 font-medium">{t.performanceScore}</p>
                        <p className="text-lg font-bold text-blue-900">{emp.performance}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2">
                        <p className="text-xs text-green-700 font-medium">{t.attendance}</p>
                        <p className="text-lg font-bold text-green-900">{emp.attendance}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2">
                        <p className="text-xs text-purple-700 font-medium">{t.teamwork}</p>
                        <p className="text-lg font-bold text-purple-900">{emp.teamwork}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-2">
                        <p className="text-xs text-orange-700 font-medium">{t.productivity}</p>
                        <p className="text-lg font-bold text-orange-900">{emp.productivity}</p>
                      </div>
                      <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-lg p-2">
                        <p className="text-xs text-red-700 font-medium">{t.overallScore}</p>
                        <p className="text-lg font-bold text-red-900">{emp.overallScore}</p>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-700 font-semibold mb-1">{t.comments}</p>
                      <p className="text-sm text-gray-900">{emp.comments}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>{t.noEvaluationData}</p>
                </div>
              )}
            </div>
          )}

          {/* Department Evaluations */}
          {evaluationType === 'department' && (
            <div className="space-y-4">
              {currentData.departmentEvaluations[evaluationPeriod].length > 0 ? (
                currentData.departmentEvaluations[evaluationPeriod].map((dept, idx) => (
                  <div key={idx} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{dept.department}</h3>
                      </div>
                      <div className={`px-4 py-2 rounded-lg border-2 font-bold text-lg ${getGradeColor(dept.grade)}`}>
                        {dept.grade}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <p className="text-xs text-blue-700 font-medium">{t.overallPerformance}</p>
                        <p className="text-lg font-bold text-blue-900">{dept.overallPerformance}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2">
                        <p className="text-xs text-green-700 font-medium">{t.targetAchievement}</p>
                        <p className="text-lg font-bold text-green-900">{dept.targetAchievement}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2">
                        <p className="text-xs text-purple-700 font-medium">{t.teamEfficiency}</p>
                        <p className="text-lg font-bold text-purple-900">{dept.teamEfficiency}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-2">
                        <p className="text-xs text-orange-700 font-medium">{t.customerSatisfaction}</p>
                        <p className="text-lg font-bold text-orange-900">{dept.customerSatisfaction}</p>
                      </div>
                      <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-lg p-2">
                        <p className="text-xs text-red-700 font-medium">{t.overallScore}</p>
                        <p className="text-lg font-bold text-red-900">{dept.overallScore}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs text-green-700 font-semibold mb-2">{t.strengths}</p>
                        <ul className="space-y-1">
                          {dept.strengths.map((strength, i) => (
                            <li key={i} className="text-sm text-gray-900 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs text-amber-700 font-semibold mb-2">{t.improvements}</p>
                        <ul className="space-y-1">
                          {dept.improvements.map((improvement, i) => (
                            <li key={i} className="text-sm text-gray-900 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>{t.noEvaluationData}</p>
                </div>
              )}
            </div>
          )}

          {/* Branch Evaluations */}
          {evaluationType === 'branch' && (
            <div>
              {currentData.branchEvaluations[evaluationPeriod] ? (
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <CountryFlag country={currentData.countryCode} size="xl" />
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">{t[currentData.country]}</h3>
                      <p className="text-sm text-gray-600">
                        {evaluationPeriod === 'quarterly' ? t.quarterly : evaluationPeriod === 'semi-annual' ? t.semiAnnual : t.annual}
                      </p>
                    </div>
                    <div className={`px-6 py-3 rounded-xl border-2 font-bold text-2xl ${getGradeColor(currentData.branchEvaluations[evaluationPeriod].grade)}`}>
                      {currentData.branchEvaluations[evaluationPeriod].grade}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <p className="text-xs text-blue-700 font-semibold mb-2">{t.financialPerformance}</p>
                      <p className="text-3xl font-bold text-blue-900">{currentData.branchEvaluations[evaluationPeriod].financialPerformance}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                      <p className="text-xs text-green-700 font-semibold mb-2">{t.operationalEfficiency}</p>
                      <p className="text-3xl font-bold text-green-900">{currentData.branchEvaluations[evaluationPeriod].operationalEfficiency}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                      <p className="text-xs text-purple-700 font-semibold mb-2">{t.employeeSatisfaction}</p>
                      <p className="text-3xl font-bold text-purple-900">{currentData.branchEvaluations[evaluationPeriod].employeeSatisfaction}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                      <p className="text-xs text-orange-700 font-semibold mb-2">{t.customerSatisfaction}</p>
                      <p className="text-3xl font-bold text-orange-900">{currentData.branchEvaluations[evaluationPeriod].customerSatisfaction}</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-red-100 rounded-xl p-4 border border-red-200">
                      <p className="text-xs text-red-700 font-semibold mb-2">{t.overallScore}</p>
                      <p className="text-3xl font-bold text-red-900">{currentData.branchEvaluations[evaluationPeriod].overallScore}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-sm text-green-700 font-bold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {t.achievements}
                      </p>
                      <ul className="space-y-2">
                        {currentData.branchEvaluations[evaluationPeriod].achievements.map((achievement, i) => (
                          <li key={i} className="text-sm text-gray-900 flex items-start gap-3 bg-white p-2 rounded-lg">
                            <span className="text-green-600 font-bold">{i + 1}.</span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-sm text-amber-700 font-bold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {t.challenges}
                      </p>
                      <ul className="space-y-2">
                        {currentData.branchEvaluations[evaluationPeriod].challenges.map((challenge, i) => (
                          <li key={i} className="text-sm text-gray-900 flex items-start gap-3 bg-white p-2 rounded-lg">
                            <span className="text-amber-600 font-bold">{i + 1}.</span>
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-700 font-bold mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        {t.recommendations}
                      </p>
                      <ul className="space-y-2">
                        {currentData.branchEvaluations[evaluationPeriod].recommendations.map((recommendation, i) => (
                          <li key={i} className="text-sm text-gray-900 flex items-start gap-3 bg-white p-2 rounded-lg">
                            <span className="text-blue-600 font-bold">{i + 1}.</span>
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>{t.noEvaluationData}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Issues & Problems - Full Width */}
        <div className={`${selectedSection !== 'all' && selectedSection !== 'issues' ? 'hidden' : ''} bg-white rounded-xl shadow-md p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">{t.issuesAndProblems}</h2>
            </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIssuesView('byBranch')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    issuesView === 'byBranch'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t.viewByBranch}
                </button>
                <button
                  onClick={() => setIssuesView('byDepartment')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    issuesView === 'byDepartment'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t.viewByDepartment}
                </button>
              </div>
            </div>

            {issuesView === 'byBranch' ? (
              // View by Branch - Show all departments in selected branch
              <>
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                    <CountryFlag country={currentData.countryCode} size="sm" />
                    {t[currentData.country]} - {t.allDepartments}
                  </span>
                </div>
                <div className="space-y-4">
                  {Object.entries(currentData.departmentIssues).map(([deptName, deptIssues]) => (
                    <div key={deptName} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                      <h3 className="font-bold text-lg text-gray-900 mb-3">{deptName}</h3>
                      <div className="space-y-2">
                        {(deptIssues as Array<{ id: number; severity: 'high' | 'medium' | 'low'; title: string }>).map((issue) => (
                          <div key={issue.id} className={`border-2 rounded-lg p-3 hover:shadow transition-shadow ${getSeverityColor(issue.severity)}`}>
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-sm flex-1">{issue.title}</h4>
                              <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded ml-2">
                                {issue.severity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // View by Department - Show selected department across all branches
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.selectDepartmentToCompare}
                  </label>
                  <select
                    value={selectedIssueDepartment}
                    onChange={(e) => setSelectedIssueDepartment(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Executive">Executive</option>
                    <option value="HR">HR</option>
                    <option value="Production">Production</option>
                    <option value="International Market">International Market</option>
                    <option value="Domestic Market">Domestic Market</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Quality Control">Quality Control</option>
                    <option value="After-Sales">After-Sales</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="R&D">R&D</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(['korea', 'thailand', 'vietnam', 'brunei'] as Branch[]).map((branchKey) => {
                    const branchData = branchesData[branchKey];
                    const deptIssues = branchData.departmentIssues[selectedIssueDepartment] || [];
                    
                    return (
                      <div key={branchKey} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-2 mb-3">
                          <CountryFlag country={branchData.countryCode} size="md" />
                          <h3 className="font-bold text-base text-gray-900">{t[branchData.country]}</h3>
                        </div>
                        
                        <div className="space-y-2">
                          {(deptIssues as Array<{ id: number; severity: 'high' | 'medium' | 'low'; title: string }>).length > 0 ? (
                            (deptIssues as Array<{ id: number; severity: 'high' | 'medium' | 'low'; title: string }>).map((issue) => (
                              <div key={issue.id} className={`border rounded-lg p-3 ${getSeverityColor(issue.severity)}`}>
                                <div className="flex items-start justify-between">
                                  <h4 className="font-semibold text-sm flex-1">{issue.title}</h4>
                                  <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded ml-2">
                                    {issue.severity}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 italic">No issues reported</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

        {/* Goals & Targets - Full Width */}
        <div className={`${selectedSection !== 'all' && selectedSection !== 'goals' ? 'hidden' : ''} bg-white rounded-xl shadow-md p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">{t.goalsTargets}</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setGoalsView('byBranch')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  goalsView === 'byBranch'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.viewByBranch}
              </button>
              <button
                onClick={() => setGoalsView('byDepartment')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  goalsView === 'byDepartment'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.viewByDepartment}
              </button>
            </div>
          </div>

          {goalsView === 'byBranch' ? (
            // View by Branch - Show all departments in selected branch
            <>
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  <CountryFlag country={currentData.countryCode} size="sm" />
                  {t[currentData.country]} - {t.allDepartments}
                </span>
              </div>
              <div className="space-y-4">
                {Object.entries(currentData.departmentGoals).map(([deptName, deptGoals]) => (
                  <div key={deptName} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <h3 className="font-bold text-lg text-gray-900 mb-3">{deptName}</h3>
                    <div className="space-y-3">
                      {(deptGoals as Array<{ id: number; title: string; progress: number; deadline: string; status: 'on-track' | 'at-risk' | 'delayed' }>).map((goal) => (
                        <div key={goal.id} className="border-2 border-gray-200 rounded-lg p-3 hover:shadow transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm text-gray-900 flex-1">{goal.title}</h4>
                            <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ml-2 ${getStatusColor(goal.status)}`}>
                              {getStatusIcon(goal.status)}
                              {goal.status}
                            </span>
                          </div>
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>{t.progress}</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">{t.deadline}: {goal.deadline}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            // View by Department - Show selected department across all branches
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.selectDepartmentToCompare}
                </label>
                <select
                  value={selectedGoalDepartment}
                  onChange={(e) => setSelectedGoalDepartment(e.target.value)}
                  className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Executive">Executive</option>
                  <option value="HR">HR</option>
                  <option value="Production">Production</option>
                  <option value="International Market">International Market</option>
                  <option value="Domestic Market">Domestic Market</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Quality Control">Quality Control</option>
                  <option value="After-Sales">After-Sales</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="R&D">R&D</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['korea', 'thailand', 'vietnam', 'brunei'] as Branch[]).map((branchKey) => {
                  const branchData = branchesData[branchKey];
                  const deptGoals = branchData.departmentGoals[selectedGoalDepartment] || [];
                  
                  return (
                    <div key={branchKey} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <CountryFlag country={branchData.countryCode} size="md" />
                        <h3 className="font-bold text-base text-gray-900">{t[branchData.country]}</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {(deptGoals as Array<{ id: number; title: string; progress: number; deadline: string; status: 'on-track' | 'at-risk' | 'delayed' }>).length > 0 ? (
                          (deptGoals as Array<{ id: number; title: string; progress: number; deadline: string; status: 'on-track' | 'at-risk' | 'delayed' }>).map((goal) => (
                            <div key={goal.id} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-sm text-gray-900 flex-1">{goal.title}</h4>
                                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ml-2 ${getStatusColor(goal.status)}`}>
                                  {getStatusIcon(goal.status)}
                                  {goal.status}
                                </span>
                              </div>
                              <div className="mb-2">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>{t.progress}</span>
                                  <span>{goal.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full transition-all"
                                    style={{ width: `${goal.progress}%` }}
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">{t.deadline}: {goal.deadline}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">No goals defined</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Branch Meeting Reports */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">{t.branchMeetings}</h2>
            <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
              {currentData.meetings.length} {t.meetingReports}
            </span>
          </div>
          <div className="space-y-4">
            {currentData.meetings.map((meeting) => (
              <div key={meeting.id} className="border-2 border-blue-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{meeting.title}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-blue-600 font-medium flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {meeting.date}
                      </span>
                      <span className="text-sm text-purple-600 font-medium flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {meeting.attendees} {t.attendees}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {t.keyDecisions}:
                  </p>
                  <ul className="space-y-2">
                    {meeting.key_decisions.map((decision, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2 pl-2">
                        <span className="text-green-600 mt-0.5 font-bold">✓</span>
                        <span className="flex-1">{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Performance - Full Width */}
        <div className={`${selectedSection !== 'all' && selectedSection !== 'departmentPerformance' ? 'hidden' : ''} bg-white rounded-xl shadow-md p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">{t.departmentPerformance}</h2>
            </div>
            <div className="flex gap-2">
                <button
                  onClick={() => setDepartmentView('byBranch')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    departmentView === 'byBranch'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t.viewByBranch}
                </button>
                <button
                  onClick={() => setDepartmentView('byDepartment')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    departmentView === 'byDepartment'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t.viewByDepartment}
                </button>
              </div>
            </div>

            {/* View by Branch - Current Branch Only */}
            {departmentView === 'byBranch' && (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {currentData.departmentStats.map((dept, idx) => (
                  <div key={idx} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-lg text-gray-900">{dept.name}</h4>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                        {t[selectedBranch]}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                      <div>
                        <p className="text-gray-500 mb-1">{t.performance}</p>
                        <p className="font-bold text-gray-900 text-lg">{dept.performance}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${dept.performance}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">{t.staffing}</p>
                        <p className="font-bold text-gray-900 text-lg">{dept.staffing}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${dept.staffing}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">{t.budget}</p>
                        <p className="font-bold text-gray-900 text-lg">{dept.budget}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${dept.budget}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">{t.evaluation}:</p>
                      <p className="text-sm text-gray-700 italic">{dept.evaluation}</p>
                    </div>
                    
                    {/* Department Meetings */}
                    {currentData.departmentMeetings && currentData.departmentMeetings[dept.name] && currentData.departmentMeetings[dept.name].length > 0 && (
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <p className="text-xs text-gray-600 font-semibold mb-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {t.departmentMeetings}
                        </p>
                        <div className="space-y-2">
                          {currentData.departmentMeetings[dept.name].map((meeting) => (
                            <div key={meeting.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-2 border border-indigo-200">
                              <div className="flex items-start justify-between mb-1">
                                <h5 className="text-xs font-semibold text-gray-900">{meeting.title}</h5>
                                <span className="text-xs text-indigo-600 font-medium">{meeting.date}</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {meeting.attendees} {t.attendees}
                              </p>
                              <div className="bg-white rounded p-2 border border-indigo-100">
                                <p className="text-xs text-indigo-700 font-semibold mb-1">{t.keyDecisions}:</p>
                                <ul className="space-y-1">
                                  {meeting.key_decisions.map((decision, dIdx) => (
                                    <li key={dIdx} className="text-xs text-gray-700 flex items-start gap-1">
                                      <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                      <span>{decision}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* View by Department - Compare Across All Branches */}
            {departmentView === 'byDepartment' && (
              <div>
                {/* Department Selector */}
                <div className="mb-4">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Executive">Executive</option>
                    <option value="HR">HR</option>
                    <option value="Production">Production</option>
                    <option value="International Market">International Market</option>
                    <option value="Domestic Market">Domestic Market</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Quality Control">Quality Control</option>
                    <option value="After-Sales">After-Sales</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="R&D">R&D</option>
                  </select>
                </div>

                {/* Show selected department across all branches */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {(Object.keys(branchesData) as Branch[]).map((branchKey) => {
                    const branch = branchesData[branchKey];
                    const deptData = branch.departmentStats.find(d => d.name === selectedDepartment);
                    
                    if (!deptData) return null;

                    return (
                      <div key={branchKey} className="border-2 border-purple-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-gradient-to-r from-purple-50 to-pink-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <CountryFlag country={branch.countryCode} size="md" />
                            <h4 className="font-bold text-gray-900">{t[branchKey]}</h4>
                          </div>
                          <span className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full font-bold">
                            {deptData.performance}%
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                          <div>
                            <p className="text-gray-500 mb-1">{t.performance}</p>
                            <p className="font-bold text-gray-900 text-base">{deptData.performance}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-green-600 h-1.5 rounded-full"
                                style={{ width: `${deptData.performance}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">{t.staffing}</p>
                            <p className="font-bold text-gray-900 text-base">{deptData.staffing}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${deptData.staffing}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">{t.budget}</p>
                            <p className="font-bold text-gray-900 text-base">{deptData.budget}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-purple-600 h-1.5 rounded-full"
                                style={{ width: `${deptData.budget}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-purple-200 pt-2 mt-2 bg-white rounded-lg p-2">
                          <p className="text-xs text-gray-500 font-medium mb-1">{t.evaluation}:</p>
                          <p className="text-xs text-gray-700 italic">{deptData.evaluation}</p>
                        </div>
                        
                        {/* Department Meetings for this branch */}
                        {branch.departmentMeetings && branch.departmentMeetings[selectedDepartment] && branch.departmentMeetings[selectedDepartment].length > 0 && (
                          <div className="border-t border-purple-200 pt-3 mt-3">
                            <p className="text-xs text-purple-700 font-semibold mb-2 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {t.departmentMeetings}
                            </p>
                            <div className="space-y-2">
                              {branch.departmentMeetings[selectedDepartment].map((meeting) => (
                                <div key={meeting.id} className="bg-white rounded-lg p-2 border border-purple-200">
                                  <div className="flex items-start justify-between mb-1">
                                    <h5 className="text-xs font-semibold text-gray-900">{meeting.title}</h5>
                                    <span className="text-xs text-purple-600 font-medium">{meeting.date}</span>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {meeting.attendees} {t.attendees}
                                  </p>
                                  <div className="bg-purple-50 rounded p-2">
                                    <p className="text-xs text-purple-700 font-semibold mb-1">{t.keyDecisions}:</p>
                                    <ul className="space-y-1">
                                      {meeting.key_decisions.map((decision, dIdx) => (
                                        <li key={dIdx} className="text-xs text-gray-700 flex items-start gap-1">
                                          <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                          <span>{decision}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        {/* Recent Updates - Full Width */}
        <div className={`${selectedSection !== 'all' && selectedSection !== 'recentUpdates' ? 'hidden' : ''} bg-white rounded-xl shadow-md p-6 mb-6`}>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-yellow-600" />
            <h2 className="text-xl font-bold text-gray-900">{t.recentUpdates}</h2>
          </div>
          <div className="space-y-4">
            {currentData.recentUpdates.map((update) => (
              <div key={update.id} className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-r-xl p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-base text-gray-900">{update.title}</h4>
                  <span className="text-xs text-gray-500 font-semibold">{update.date}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{update.description}</p>
                <p className="text-xs text-gray-600 font-medium">— {update.updatedBy}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bill Details Modal */}
      {showBillModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeBillModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                      #{selectedBill.id.toString().padStart(4, '0')}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 ${getPriorityColor(selectedBill.priority)} bg-white uppercase tracking-wide`}>
                      {selectedBill.priority}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{selectedBill.description}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {selectedBill.department}
                    </span>
                    <span>•</span>
                    <span>{selectedBill.category}</span>
                  </div>
                </div>
                <button 
                  onClick={closeBillModal}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-700 font-medium mb-1">{t.amount}</p>
                  <p className="text-3xl font-bold text-green-900">
                    {currentData.currency}{new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(selectedBill.amount)}
                  </p>
                </div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-700 font-medium mb-1">{t.submitted}</p>
                  <p className="text-xl font-bold text-blue-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {selectedBill.submittedDate}
                  </p>
                </div>
              </div>

              {/* Requested By */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                <p className="text-sm text-purple-700 font-semibold mb-2">{t.requestedBy}</p>
                <p className="text-lg font-bold text-purple-900">{selectedBill.requestedBy}</p>
              </div>

              {/* Reason */}
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 font-semibold mb-2">{t.reason}</p>
                <p className="text-gray-900 font-medium">{selectedBill.reason}</p>
              </div>

              {/* Justification */}
              <div className="border-2 border-gray-200 rounded-xl p-4 bg-amber-50">
                <p className="text-sm text-amber-700 font-semibold mb-2">{t.justification}</p>
                <p className="text-gray-900 leading-relaxed">{selectedBill.justification}</p>
              </div>

              {/* Attachments */}
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 font-semibold mb-3 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  {t.attachments}
                </p>
                <div className="space-y-2">
                  {Array.from({ length: selectedBill.attachments }).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedBill.category.toLowerCase().replace(/\s+/g, '_')}_{idx + 1}.pdf
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.floor(Math.random() * 5) + 1}.{Math.floor(Math.random() * 10)} MB
                        </p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                        {t.download}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <button className="flex-1 px-6 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  {t.approve}
                </button>
                <button className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  {t.reject}
                </button>
                <button 
                  onClick={closeBillModal}
                  className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg font-bold rounded-xl transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
