import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Calendar as CalendarIcon,
  Settings,
  Megaphone,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ArrowLeft,
  Printer,
  MessageSquare,
  Trash2,
  Edit,
  Copy,
  Wrench,
  Lock,
  Unlock,
  Download,
  Upload,
  RotateCcw,
  Sun,
  Moon,
  X,
  Check,
  Tag,
  Building2,
  Archive,
  Cloud,
  CloudOff,
  RefreshCw
} from 'lucide-react';

// ============================================================================
// CLOUD SYNC CONFIGURATION (Connected to Legacy Cooling Google Sheet)
// ============================================================================

const DEFAULT_GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwtBiygk3Z4U29XRtvowMB77mUw0hTw2X30SNFjAr9woycIGY5JQogo0Fd-uBjIRqRh/exec';

// ============================================================================
// UTILITIES & FORMATTING (South African Rand, DD/MM/YYYY, Africa/Johannesburg)
// ============================================================================

const STORAGE_KEY = 'legacy_cooling_fsm_v1';
const GSHEETS_URL_KEY = 'legacy_cooling_gsheets_url_v1';

const getTodayISO = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split('T')[0];
};

const addDaysISO = (baseISO, days) => {
  const d = new Date(baseISO || getTodayISO());
  d.setDate(d.getDate() + Number(days || 0));
  return d.toISOString().split('T')[0];
};

const formatDate = (isoStr) => {
  if (!isoStr) return '-';
  const parts = isoStr.split('T')[0].split('-');
  if (parts.length !== 3) return isoStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const formatZAR = (amount) => {
  const num = Number(amount) || 0;
  return 'R ' + num.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
};

const cleanPhoneForWhatsApp = (phone) => {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '27' + digits.substring(1);
  }
  return digits;
};

// ============================================================================
// DEFAULT SEED DATA (Durban, South Africa)
// ============================================================================

const buildSeedData = () => {
  const today = getTodayISO();
  const yesterday = addDaysISO(today, -1);
  const tomorrow = addDaysISO(today, 1);
  const inThreeDays = addDaysISO(today, 3);
  const lastWeek = addDaysISO(today, -7);
  const twoWeeksAgo = addDaysISO(today, -16);
  const nextMonth = addDaysISO(today, 30);

  return {
    settings: {
      companyName: 'Legacy Cooling (Pty) Ltd',
      tagline: 'Air Conditioning Installation, Servicing & Repairs • Durban',
      address: '14 Umhlanga Rocks Drive, Durban North, 4051',
      phone: '031 563 8820',
      email: 'service@legacycooling.co.za',
      vatNumber: '4420298114',
      vatRate: 15,
      quoteExpiryDays: 14,
      invoiceDueDays: 7,
      bankingDetails: 'Bank: First National Bank (FNB)\nAccount Name: Legacy Cooling (Pty) Ltd\nAccount No: 62849103842\nBranch Code: 250655\nReference: Quote/Invoice Number',
      defaultTerms: '1. 50% deposit required to confirm new unit installations.\n2. Balance payable strictly upon completion.\n3. All new installations carry a 12-month workmanship warranty.',
      technicians: ['Thabo Mkhize', 'Kyle van der Merwe', 'Rory Naidoo']
    },
    categories: [
      'Units',
      'Installation',
      'Services',
      'Repairs',
      'Parts',
      'Refrigerant / Regas',
      'Labour',
      'Call-out Fees'
    ],
    catalogue: [
      { id: 'cat1', category: 'Units', name: 'Samsung AR3000 12,000 BTU Non-Inverter Split', description: 'Wall-mounted cooling & heating split unit', costPrice: 5400, sellPrice: 7850 },
      { id: 'cat2', category: 'Units', name: 'Samsung AR5000 12,000 BTU Inverter Split', description: 'Energy-efficient Digital Inverter split unit', costPrice: 6900, sellPrice: 9600 },
      { id: 'cat3', category: 'Units', name: 'Daikin 24,000 BTU Cassette Inverter', description: 'Commercial 4-way blow ceiling cassette', costPrice: 18500, sellPrice: 24900 },
      { id: 'cat4', category: 'Installation', name: 'Standard Back-to-Back Split Installation (Up to 3m)', description: 'Includes brackets, 3m copper piping, drain & electrical isolator', costPrice: 1200, sellPrice: 2650 },
      { id: 'cat5', category: 'Services', name: 'Major Chemical Clean & Service (Split Unit)', description: 'Full coil wash, drain flush, pressure & amp check', costPrice: 180, sellPrice: 650 },
      { id: 'cat6', category: 'Services', name: 'Commercial Cassette Service', description: 'Pump flush, filter & coil chemical treatment', costPrice: 280, sellPrice: 950 },
      { id: 'cat7', category: 'Refrigerant / Regas', name: 'R410A Refrigerant Gas (per kg)', description: 'High-pressure inverter refrigerant refill', costPrice: 320, sellPrice: 850 },
      { id: 'cat8', category: 'Refrigerant / Regas', name: 'R22 / R407C Refrigerant Gas (per kg)', description: 'Standard refrigerant refill per kg', costPrice: 380, sellPrice: 920 },
      { id: 'cat9', category: 'Parts', name: 'Outdoor Capacitor 35/5 uF', description: 'Dual run compressor & fan capacitor', costPrice: 140, sellPrice: 480 },
      { id: 'cat10', category: 'Call-out Fees', name: 'Durban Metro Call-Out & Diagnostics (First Hour)', description: 'Fault finding within Greater Durban area', costPrice: 150, sellPrice: 550 }
    ],
    clients: [
      {
        id: 'cl1',
        name: 'Sarah Jenkins',
        company: '',
        phone: '082 441 9012',
        email: 'sarah.jenkins@gmail.com',
        address: '45 Marine Drive, Umhlanga Rocks',
        archived: false,
        notes: 'Gate code: #4589. Two friendly Labradors in the back garden.',
        units: [
          {
            id: 'u1',
            brand: 'Samsung',
            model: 'AR12TXHQ',
            serialNumber: 'SN-SAM-88412',
            capacity: '12000',
            type: 'Split (Inverter)',
            location: 'Main Bedroom',
            installDate: '2024-02-15',
            nextService: addDaysISO(today, 60)
          },
          {
            id: 'u2',
            brand: 'LG',
            model: 'S4-Q18KL3AA',
            serialNumber: 'SN-LG-30918',
            capacity: '18000',
            type: 'Split (Inverter)',
            location: 'Open Plan Lounge',
            installDate: '2023-11-10',
            nextService: yesterday
          }
        ],
        activityNotes: [
          { id: 'an1', date: lastWeek, text: 'Inspected lounge unit; slight R410A pressure drop noted. Quoted for service and 0.4kg top-up.' }
        ]
      },
      {
        id: 'cl2',
        name: 'Marco Bellini',
        company: 'Lighthouse Cafe & Bakery',
        phone: '031 561 4400',
        email: 'manager@lighthousecafe.co.za',
        address: 'Shop 4, Chartwell Centre, Umhlanga',
        archived: false,
        notes: 'Must arrive before 07:30 AM before breakfast rush. Park in loading bay B.',
        units: [
          {
            id: 'u3',
            brand: 'Daikin',
            model: 'FCAHG71G',
            serialNumber: 'SN-DAI-44109',
            capacity: '24000',
            type: 'Cassette',
            location: 'Main Dining Area',
            installDate: '2022-05-10',
            nextService: today
          },
          {
            id: 'u4',
            brand: 'Daikin',
            model: 'FCAHG71G',
            serialNumber: 'SN-DAI-44110',
            capacity: '24000',
            type: 'Cassette',
            location: 'Prep Kitchen',
            installDate: '2022-05-10',
            nextService: today
          }
        ],
        activityNotes: [
          { id: 'an2', date: twoWeeksAgo, text: 'Cleared blocked condensate drain pump on Dining Area cassette.' }
        ]
      },
      {
        id: 'cl3',
        name: 'Dr. Priya Naidoo',
        company: 'Westville Family Dental',
        phone: '071 987 6543',
        email: 'reception@westvilledental.co.za',
        address: '12 Jan Hofmeyr Road, Westville',
        archived: false,
        notes: 'Ask for Sister Zanele at reception.',
        units: [
          {
            id: 'u5',
            brand: 'Carrier',
            model: '42QHC018DS',
            serialNumber: 'SN-CAR-77210',
            capacity: '18000',
            type: 'Split (Non-Inverter)',
            location: 'Surgery Room 1',
            installDate: '2021-08-20',
            nextService: nextMonth
          }
        ],
        activityNotes: []
      },
      {
        id: 'cl4',
        name: 'Gareth Govender',
        company: 'Coastal Logistics Warehouse',
        phone: '083 772 1904',
        email: 'gareth@coastallogistics.co.za',
        address: '88 Brickfield Road, Briardene, Durban',
        archived: false,
        notes: 'Sign in at security boom with ID. Safety boots required in warehouse.',
        units: [
          {
            id: 'u6',
            brand: 'Alliance',
            model: 'FOU36',
            serialNumber: 'SN-ALL-99012',
            capacity: '36000',
            type: 'Ducted',
            location: 'Admin Offices',
            installDate: '2023-03-14',
            nextService: addDaysISO(today, 14)
          }
        ],
        activityNotes: []
      },
      {
        id: 'cl5',
        name: 'Claire van Rooyen',
        company: '',
        phone: '084 512 3390',
        email: 'claire.vr@outlook.com',
        address: '219 Florida Road, Morningside, Durban',
        archived: false,
        notes: 'Intercom 04. Street parking available.',
        units: [],
        activityNotes: []
      }
    ],
    quotes: [
      {
        id: 'q1',
        number: 'QUO-1001',
        clientId: 'cl5',
        date: lastWeek,
        expiryDate: addDaysISO(lastWeek, 14),
        status: 'Sent',
        discount: 0,
        notes: 'Supply and back-to-back installation for upstairs study.',
        items: [
          { id: 'qi1', description: 'Samsung AR5000 12,000 BTU Inverter Split', qty: '1', unitPrice: 9600 },
          { id: 'qi2', description: 'Standard Back-to-Back Split Installation (Up to 3m)', qty: '1', unitPrice: 2650 }
        ],
        subtotal: 12250,
        vat: 1837.50,
        total: 14087.50
      },
      {
        id: 'q2',
        number: 'QUO-1002',
        clientId: 'cl1',
        date: yesterday,
        expiryDate: addDaysISO(yesterday, 14),
        status: 'Accepted',
        discount: 0,
        notes: 'Major chemical service + 0.4kg R410A gas top-up on Lounge unit.',
        items: [
          { id: 'qi3', description: 'Major Chemical Clean & Service (Split Unit)', qty: '1', unitPrice: 650 },
          { id: 'qi4', description: 'R410A Refrigerant Gas (per kg)', qty: '0.4', unitPrice: 850 }
        ],
        subtotal: 990,
        vat: 148.50,
        total: 1138.50
      },
      {
        id: 'q3',
        number: 'QUO-1003',
        clientId: 'cl4',
        date: today,
        expiryDate: addDaysISO(today, 14),
        status: 'Draft',
        discount: 500,
        notes: 'Boardroom upgrade quote.',
        items: [
          { id: 'qi5', description: 'Daikin 24,000 BTU Cassette Inverter', qty: '1', unitPrice: 24900 },
          { id: 'qi6', description: 'Standard Back-to-Back Split Installation (Up to 3m)', qty: '1', unitPrice: 2650 }
        ],
        subtotal: 27050,
        vat: 4057.50,
        total: 31107.50
      }
    ],
    invoices: [
      {
        id: 'inv1',
        number: 'INV-2001',
        clientId: 'cl2',
        quoteId: '',
        issueDate: yesterday,
        dueDate: addDaysISO(yesterday, 7),
        status: 'Sent',
        discount: 0,
        notes: 'Bi-annual commercial cassette servicing (2 units).',
        items: [
          { id: 'ii1', description: 'Commercial Cassette Service', qty: '2', unitPrice: 950 }
        ],
        subtotal: 1900,
        vat: 285,
        total: 2185,
        amountPaid: 0,
        balance: 2185,
        paymentDate: '',
        payments: []
      },
      {
        id: 'inv2',
        number: 'INV-2002',
        clientId: 'cl3',
        quoteId: '',
        issueDate: twoWeeksAgo,
        dueDate: lastWeek,
        status: 'Overdue',
        discount: 0,
        notes: 'Emergency capacitor replacement in Surgery Room 1.',
        items: [
          { id: 'ii2', description: 'Durban Metro Call-Out & Diagnostics (First Hour)', qty: '1', unitPrice: 550 },
          { id: 'ii3', description: 'Outdoor Capacitor 35/5 uF', qty: '1', unitPrice: 480 }
        ],
        subtotal: 1030,
        vat: 154.50,
        total: 1184.50,
        amountPaid: 0,
        balance: 1184.50,
        paymentDate: '',
        payments: []
      },
      {
        id: 'inv3',
        number: 'INV-2003',
        clientId: 'cl4',
        quoteId: '',
        issueDate: lastWeek,
        dueDate: today,
        status: 'Paid',
        discount: 0,
        notes: 'Ducted unit quarterly filter clean & gas check.',
        items: [
          { id: 'ii4', description: 'Commercial Cassette Service', qty: '1', unitPrice: 950 },
          { id: 'ii5', description: 'R410A Refrigerant Gas (per kg)', qty: '0.5', unitPrice: 850 }
        ],
        subtotal: 1375,
        vat: 206.25,
        total: 1581.25,
        amountPaid: 1581.25,
        balance: 0,
        paymentDate: lastWeek,
        payments: [
          { id: 'pay1', date: lastWeek, amount: 1581.25, method: 'EFT' }
        ]
      }
    ],
    jobs: [
      {
        id: 'job1',
        clientId: 'cl2',
        quoteId: '',
        unitIds: ['u3', 'u4'],
        jobType: 'Service/Maintenance',
        date: today,
        startTime: '07:00',
        duration: '2 hrs',
        technician: 'Thabo Mkhize',
        status: 'In progress',
        instructions: 'Chemical clean both ceiling cassettes before cafe opens at 8am.'
      },
      {
        id: 'job2',
        clientId: 'cl1',
        quoteId: 'q2',
        unitIds: ['u2'],
        jobType: 'Service/Maintenance',
        date: today,
        startTime: '10:30',
        duration: '1.5 hrs',
        technician: 'Kyle van der Merwe',
        status: 'Scheduled',
        instructions: 'Major chemical clean on lounge LG split + 0.4kg R410A gas top-up.'
      },
      {
        id: 'job3',
        clientId: 'cl3',
        quoteId: '',
        unitIds: ['u5'],
        jobType: 'Diagnostics',
        date: tomorrow,
        startTime: '09:00',
        duration: '1 hr',
        technician: 'Rory Naidoo',
        status: 'Scheduled',
        instructions: 'Check indoor fan motor noise in Surgery Room 1.'
      },
      {
        id: 'job4',
        clientId: 'cl5',
        quoteId: 'q1',
        unitIds: [],
        jobType: 'Quote visit',
        date: inThreeDays,
        startTime: '14:00',
        duration: '1 hr',
        technician: 'Thabo Mkhize',
        status: 'Scheduled',
        instructions: 'Confirm outdoor condenser bracket placement with client.'
      }
    ],
    notices: [
      {
        id: 'not1',
        title: 'Summer Peak Season Stock & R410A Cylinders',
        body: 'All vans have been restocked with fresh R410A cylinders and 35/5uF capacitors. Please log exact decimal kg usage (e.g. 0.4kg) on every job card and quote.',
        date: today,
        author: 'Management'
      },
      {
        id: 'not2',
        title: 'Friday Toolbox Talk & Vehicle Check',
        body: 'Reminder: All technicians to meet at the Durban North depot at 07:15 AM this Friday for ladder safety inspection and vacuum pump oil changes.',
        date: yesterday,
        author: 'Operations'
      }
    ]
  };
};

// ============================================================================
// STORAGE & GOOGLE SHEETS SYNC LAYER
// ============================================================================

const normalizeData = (rawParsed) => {
  const defaults = buildSeedData();
  if (!rawParsed || typeof rawParsed !== 'object') return defaults;
  return {
    ...defaults,
    ...rawParsed,
    settings: { ...defaults.settings, ...(rawParsed.settings || {}) },
    categories: Array.isArray(rawParsed.categories) && rawParsed.categories.length > 0 ? rawParsed.categories : defaults.categories,
    catalogue: Array.isArray(rawParsed.catalogue) ? rawParsed.catalogue : defaults.catalogue,
    clients: Array.isArray(rawParsed.clients) ? rawParsed.clients : defaults.clients,
    quotes: Array.isArray(rawParsed.quotes) ? rawParsed.quotes : defaults.quotes,
    invoices: Array.isArray(rawParsed.invoices) ? rawParsed.invoices : defaults.invoices,
    jobs: Array.isArray(rawParsed.jobs) ? rawParsed.jobs : defaults.jobs,
    notices: Array.isArray(rawParsed.notices) ? rawParsed.notices : defaults.notices
  };
};

const StorageService = {
  loadLocal: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = buildSeedData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      return normalizeData(JSON.parse(raw));
    } catch (err) {
      console.error('Failed to load local storage:', err);
      return buildSeedData();
    }
  },
  saveLocal: (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save local storage:', err);
    }
  },
  resetLocal: () => {
    const seeded = buildSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  },
  getSheetsUrl: () => {
    try {
      return localStorage.getItem(GSHEETS_URL_KEY) || DEFAULT_GOOGLE_SHEETS_URL || '';
    } catch {
      return DEFAULT_GOOGLE_SHEETS_URL || '';
    }
  },
  setSheetsUrl: (url) => {
    try {
      if (url && url.trim()) {
        localStorage.setItem(GSHEETS_URL_KEY, url.trim());
      } else {
        localStorage.removeItem(GSHEETS_URL_KEY);
      }
    } catch (err) {
      console.error('Failed to store Google Sheets URL:', err);
    }
  },
  pullFromGoogleSheets: async (url) => {
    if (!url) return null;
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow'
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const json = await response.json();
    if (json.status === 'ok' && json.data) {
      return normalizeData(json.data);
    }
    if (json.status === 'empty') {
      return { empty: true };
    }
    throw new Error(json.message || 'Unknown Google Sheets response');
  },
  pushToGoogleSheets: async (url, data) => {
    if (!url) return null;
    const response = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({ data })
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const json = await response.json();
    if (json.status !== 'ok') {
      throw new Error(json.message || 'Failed to write to Google Sheets');
    }
    return json;
  }
};

// ============================================================================
// REUSABLE UI PRIMITIVES
// ============================================================================

const JOB_TYPE_COLORS = {
  'Installation': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800',
  'Service/Maintenance': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-800',
  'Repair': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
  'Diagnostics': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800',
  'Quote visit': 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-800',
  'Warranty callout': 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800'
};

const JOB_DOT_COLORS = {
  'Installation': 'bg-indigo-500',
  'Service/Maintenance': 'bg-cyan-500',
  'Repair': 'bg-amber-500',
  'Diagnostics': 'bg-purple-500',
  'Quote visit': 'bg-teal-500',
  'Warranty callout': 'bg-rose-500'
};

const StatusBadge = ({ status }) => {
  const styles = {
    Draft: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    Sent: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
    Unpaid: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
    'Partially paid': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
    Accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
    Paid: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
    Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
    Declined: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800',
    Overdue: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800',
    Expired: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800',
    Cancelled: 'bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    Scheduled: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800',
    'On the way': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800',
    'In progress': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-800',
    'Awaiting parts': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  );
};

const Card = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm ${onClick ? 'cursor-pointer hover:border-cyan-400 dark:hover:border-cyan-600 transition-colors' : ''} ${className}`}
  >
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[34px]',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[42px]',
    lg: 'px-5 py-3 text-base gap-2 min-h-[48px]'
  };
  const variants = {
    primary: 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 dark:text-white dark:focus:ring-cyan-500 shadow-sm',
    accent: 'bg-cyan-600 hover:bg-cyan-700 text-white focus:ring-cyan-500 shadow-sm',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon size={size === 'sm' ? 14 : 18} />}
      {children}
    </button>
  );
};

const Input = ({ label, className = '', ...props }) => (
  <div className={`space-y-1 ${className}`}>
    {label && <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">{label}</label>}
    <input
      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 min-h-[42px] dark:[color-scheme:dark]"
      {...props}
    />
  </div>
);

const Select = ({ label, options = [], className = '', ...props }) => (
  <div className={`space-y-1 ${className}`}>
    {label && <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">{label}</label>}
    <select
      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 min-h-[42px]"
      {...props}
    >
      {options.map(opt => {
        const val = typeof opt === 'object' ? opt.value : opt;
        const lbl = typeof opt === 'object' ? opt.label : opt;
        return <option key={val} value={val}>{lbl}</option>;
      })}
    </select>
  </div>
);

// ============================================================================
// GOOGLE-STYLE CLIENT AUTOCOMPLETE (Supports [Tab] & [Enter] instant autofill)
// ============================================================================

const ClientAutocomplete = ({ clients, selectedClientId, onSelectClient, onQuickAddClient }) => {
  const activeClients = useMemo(() => clients.filter(c => !c.archived), [clients]);
  const selectedClient = useMemo(
    () => activeClients.find(c => c.id === selectedClientId),
    [activeClients, selectedClientId]
  );

  const [query, setQuery] = useState(selectedClient ? selectedClient.name : '');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (selectedClient) {
      setQuery(selectedClient.name);
    } else if (!selectedClientId) {
      setQuery('');
    }
  }, [selectedClient, selectedClientId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activeClients.slice(0, 8);
    return activeClients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [activeClients, query]);

  const topMatch = matches[0];

  const handleSelect = (client) => {
    setQuery(client.name);
    onSelectClient(client.id);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Tab' || e.key === 'Enter') && isOpen && topMatch) {
      if (e.key === 'Tab' && query.trim().length > 0 && query.toLowerCase() !== topMatch.name.toLowerCase()) {
        e.preventDefault();
        handleSelect(topMatch);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(topMatch);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const ghostCompletion = useMemo(() => {
    if (!isOpen || !query.trim() || !topMatch) return '';
    if (topMatch.name.toLowerCase().startsWith(query.toLowerCase())) {
      return topMatch.name.slice(query.length);
    }
    return '';
  }, [isOpen, query, topMatch]);

  return (
    <div ref={wrapperRef} className="relative space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Client * <span className="normal-case font-normal text-cyan-600 dark:text-cyan-400 ml-1">(Type to search • Press Tab to autofill)</span>
        </label>
        {onQuickAddClient && (
          <button
            type="button"
            onClick={onQuickAddClient}
            className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 flex items-center gap-1"
          >
            <Plus size={13} /> Quick New Client
          </button>
        )}
      </div>

      <div className="relative">
        {ghostCompletion && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm text-slate-400 dark:text-slate-500 overflow-hidden whitespace-nowrap">
            <span className="opacity-0">{query}</span>
            <span>{ghostCompletion}</span>
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
              Tab ⇥
            </span>
          </div>
        )}

        <input
          type="text"
          value={query}
          placeholder="Start typing client name, company, phone, or street..."
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (selectedClientId) {
              onSelectClient('');
            }
          }}
          onKeyDown={handleKeyDown}
          className="w-full px-3.5 py-2.5 pr-9 text-sm bg-transparent relative z-10 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[42px]"
        />
        <div className="absolute inset-0 bg-white dark:bg-slate-950 rounded-lg -z-0" />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onSelectClient('');
              setIsOpen(true);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 text-slate-400 hover:text-slate-600 p-1"
            title="Clear selection"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {matches.length === 0 ? (
            <div className="p-3 text-sm text-slate-500 flex items-center justify-between">
              <span>No matching client found for "{query}"</span>
              {onQuickAddClient && (
                <Button type="button" size="sm" variant="accent" icon={Plus} onClick={onQuickAddClient}>
                  Create Client
                </Button>
              )}
            </div>
          ) : (
            matches.map((client, idx) => (
              <button
                key={client.id}
                type="button"
                onClick={() => handleSelect(client)}
                className={`w-full text-left px-3.5 py-2.5 hover:bg-cyan-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between gap-2 ${
                  idx === 0 ? 'bg-slate-50/80 dark:bg-slate-800/50' : ''
                }`}
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>{client.name}</span>
                    {client.company && (
                      <span className="text-xs font-normal text-cyan-700 dark:text-cyan-400">({client.company})</span>
                    )}
                    {idx === 0 && query.trim().length > 0 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">
                        Tab to fill
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {client.phone} • {client.address}
                  </div>
                </div>
                {client.id === selectedClientId && <Check size={16} className="text-emerald-600 shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 1. DASHBOARD VIEW
// ============================================================================

const DashboardView = ({ data, navigate, onQuickMarkInvoicePaid, onQuickMarkQuoteSent }) => {
  const today = getTodayISO();

  const todaysJobs = data.jobs
    .filter(j => j.date === today && j.status !== 'Cancelled')
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const upcomingJobs = data.jobs
    .filter(j => j.date > today && j.status !== 'Cancelled')
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))
    .slice(0, 5);

  const pendingQuotes = data.quotes.filter(q => q.status === 'Draft' || q.status === 'Sent');
  const unpaidInvoices = data.invoices.filter(i => i.status === 'Sent' || i.status === 'Unpaid' || i.status === 'Overdue' || i.status === 'Partially paid');
  const overdueInvoices = unpaidInvoices.filter(i => i.status === 'Overdue');
  const totalUnpaidAmount = unpaidInvoices.reduce((sum, i) => sum + (Number(i.balance ?? i.total) || 0), 0);

  const getClientName = (id) => {
    const c = data.clients.find(cl => cl.id === id);
    return c ? (c.company ? `${c.name} (${c.company})` : c.name) : 'Unknown Client';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Operations Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Legacy Cooling Durban • {formatDate(today)}</p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          <Button variant="primary" icon={Plus} onClick={() => navigate('quote_form')}>New Quote</Button>
          <Button variant="accent" icon={Receipt} onClick={() => navigate('invoice_form')}>New Invoice</Button>
          <Button variant="secondary" icon={CalendarIcon} onClick={() => navigate('job_form')}>Book Job</Button>
          <Button variant="secondary" icon={Users} onClick={() => navigate('client_form')}>Add Client</Button>
        </div>
      </div>

      {/* 3-Column KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-cyan-500" onClick={() => navigate('jobs')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Jobs Today</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{todaysJobs.length}</p>
              <p className="text-xs text-slate-500 mt-1">{upcomingJobs.length} upcoming scheduled</p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
              <Wrench size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500" onClick={() => navigate('quotes')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Quotes Awaiting</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{pendingQuotes.length}</p>
              <p className="text-xs text-slate-500 mt-1">
                {formatZAR(pendingQuotes.reduce((s, q) => s + (Number(q.total) || 0), 0))} pipeline
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <FileText size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-red-500" onClick={() => navigate('invoices')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Unpaid Invoices</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatZAR(totalUnpaidAmount)}</p>
              <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                {unpaidInvoices.length} open ({overdueInvoices.length} overdue)
              </p>
            </div>
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
              <AlertCircle size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Jobs Schedule */}
      <Card>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-cyan-600" />
            <h2 className="font-bold text-slate-900 dark:text-white">Today's Field Schedule</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('jobs')}>Full Calendar</Button>
        </div>
        {todaysJobs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No jobs booked for today ({formatDate(today)}).
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {todaysJobs.map(job => {
              const client = data.clients.find(c => c.id === job.clientId);
              return (
                <div
                  key={job.id}
                  onClick={() => navigate('job_detail', { id: job.id })}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{job.startTime}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium border ${JOB_TYPE_COLORS[job.jobType] || ''}`}>
                        {job.jobType}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{getClientName(job.clientId)}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin size={13} /> {client?.address || 'No address'} • Tech: <strong className="text-slate-700 dark:text-slate-300">{job.technician}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <StatusBadge status={job.status} />
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Two-Column Action Lists: Unpaid Invoices & Quotes Awaiting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">Unpaid & Overdue Invoices</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('invoices')}>View All</Button>
          </div>
          {unpaidInvoices.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">All invoices are paid up!</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {unpaidInvoices.slice(0, 6).map(inv => (
                <div key={inv.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="min-w-0 cursor-pointer flex-1" onClick={() => navigate('invoice_detail', { id: inv.id })}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{inv.number}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">{getClientName(inv.clientId)}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-cyan-400 mt-0.5">{formatZAR(inv.balance ?? inv.total)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="success"
                    icon={CheckCircle}
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickMarkInvoicePaid(inv.id);
                    }}
                  >
                    Mark Paid
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">Quotes Awaiting Response</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('quotes')}>View All</Button>
          </div>
          {pendingQuotes.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No pending quotes.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingQuotes.slice(0, 6).map(q => (
                <div key={q.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="min-w-0 cursor-pointer flex-1" onClick={() => navigate('quote_detail', { id: q.id })}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{q.number}</span>
                      <StatusBadge status={q.status} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">{getClientName(q.clientId)}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{formatZAR(q.total)}</p>
                  </div>
                  {q.status === 'Draft' ? (
                    <Button
                      size="sm"
                      variant="accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickMarkQuoteSent(q.id);
                      }}
                    >
                      Mark Sent
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => navigate('quote_detail', { id: q.id })}>
                      Open
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// 2. CLIENTS MODULE
// ============================================================================

const ClientsList = ({ data, navigate }) => {
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.clients.filter(c => {
      if (!showArchived && c.archived) return false;
      if (showArchived && !c.archived) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    });
  }, [data.clients, search, showArchived]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Clients</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{filtered.length} {showArchived ? 'archived' : 'active'} clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowArchived(!showArchived)}>
            {showArchived ? 'Show Active' : 'Archived'}
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => navigate('client_form')}>Add Client</Button>
        </div>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by client name, company, street address, or phone..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-slate-500">
          No clients match your search.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(client => {
            const unitCount = (client.units || []).length;
            return (
              <Card key={client.id} className="p-4" onClick={() => navigate('client_detail', { id: client.id })}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{client.name}</h3>
                    {client.company && (
                      <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 flex items-center gap-1">
                        <Building2 size={13} /> {client.company}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Phone size={13} /> {client.phone}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <MapPin size={13} /> {client.address}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {unitCount} {unitCount === 1 ? 'Unit' : 'Units'}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ClientDetail = ({ params, data, navigate, updateCollection }) => {
  const today = getTodayISO();
  const [noteDate, setNoteDate] = useState(today);
  const [noteText, setNoteText] = useState('');

  const client = data.clients.find(c => c.id === params.id);
  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 mb-4">Client not found.</p>
        <Button onClick={() => navigate('clients')}>Back to Clients</Button>
      </div>
    );
  }

  const clientQuotes = data.quotes.filter(q => q.clientId === client.id);
  const clientInvoices = data.invoices.filter(i => i.clientId === client.id);
  const clientJobs = data.jobs.filter(j => j.clientId === client.id);

  const totalBilled = clientInvoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const outstanding = clientInvoices.reduce((sum, i) => sum + (Number(i.balance) || 0), 0);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    const newNote = {
      id: generateId('note'),
      date: noteDate || today,
      text: noteText.trim()
    };
    const updatedNotes = [newNote, ...(client.activityNotes || [])];
    updateCollection('clients', { ...client, activityNotes: updatedNotes });
    setNoteText('');
    setNoteDate(today);
  };

  const handleDeleteNote = (noteId) => {
    const updatedNotes = (client.activityNotes || []).filter(n => n.id !== noteId);
    updateCollection('clients', { ...client, activityNotes: updatedNotes });
  };

  const toggleArchive = () => {
    updateCollection('clients', { ...client, archived: !client.archived });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('clients')}>Clients</Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{client.name}</h1>
            {client.company && <p className="text-sm font-medium text-cyan-700 dark:text-cyan-400">{client.company}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="primary" icon={FileText} onClick={() => navigate('quote_form', { clientId: client.id })}>New Quote</Button>
          <Button size="sm" variant="accent" icon={Receipt} onClick={() => navigate('invoice_form', { clientId: client.id })}>New Invoice</Button>
          <Button size="sm" variant="secondary" icon={CalendarIcon} onClick={() => navigate('job_form', { clientId: client.id })}>Book Job</Button>
          <Button size="sm" variant="secondary" icon={Edit} onClick={() => navigate('client_form', { id: client.id })}>Edit</Button>
          <Button size="sm" variant="ghost" icon={Archive} onClick={toggleArchive}>
            {client.archived ? 'Restore' : 'Archive'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact & Site Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Phone size={15} className="text-cyan-600" />
              <a href={`tel:${client.phone}`} className="hover:underline">{client.phone}</a>
              {client.phone && (
                <a
                  href={`https://wa.me/${cleanPhoneForWhatsApp(client.phone)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold"
                >
                  WhatsApp
                </a>
              )}
            </p>
            <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Mail size={15} className="text-cyan-600" />
              {client.email || 'No email'}
            </p>
            <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300 sm:col-span-2">
              <MapPin size={15} className="text-cyan-600 shrink-0" />
              {client.address}
            </p>
          </div>
          {client.notes && (
            <div className="mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
              <strong>Access Notes:</strong> {client.notes}
            </div>
          )}
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Summary</h2>
          <div className="space-y-2 my-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Billed:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatZAR(totalBilled)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Outstanding:</span>
              <span className={`font-bold ${outstanding > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600'}`}>
                {formatZAR(outstanding)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Registered Units:</span>
              <span className="font-bold text-slate-900 dark:text-white">{(client.units || []).length}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Aircon Unit Register */}
      <Card>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Aircon Unit Register</h2>
            <p className="text-xs text-slate-500">Installed equipment, serial numbers & service intervals</p>
          </div>
          <Button size="sm" variant="primary" icon={Plus} onClick={() => navigate('unit_form', { clientId: client.id })}>
            Add Unit
          </Button>
        </div>
        {(client.units || []).length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">No aircon units registered for this client yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {client.units.map(unit => (
              <div key={unit.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex justify-between items-center gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {unit.brand} {unit.model}
                    <span className="text-xs text-slate-500 font-normal ml-2">{unit.capacity} BTU • {unit.type}</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Location: <strong className="text-slate-800 dark:text-slate-200">{unit.location}</strong></span>
                    {unit.serialNumber && (
                      <span>Serial No: <strong className="font-mono text-cyan-700 dark:text-cyan-400">{unit.serialNumber}</strong></span>
                    )}
                    <span>Installed: {formatDate(unit.installDate)}</span>
                    <span>
                      Next Service:{' '}
                      <strong className={new Date(unit.nextService) < new Date() ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}>
                        {formatDate(unit.nextService)}
                      </strong>
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="secondary" icon={Edit} onClick={() => navigate('unit_form', { clientId: client.id, id: unit.id })}>
                  Edit
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Dated Work & Service Notes Log */}
      <Card>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Work & Service Notes</h2>
            <p className="text-xs text-slate-500">Log dated records of work completed, parts fitted, and technician findings</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{(client.activityNotes || []).length} entries</span>
        </div>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50">
          <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              value={noteDate}
              onChange={(e) => setNoteDate(e.target.value)}
              required
              className="px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:w-44 min-h-[42px] dark:[color-scheme:dark]"
            />
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write what was done on site (e.g. Replaced capacitor, topped up 0.3kg R410A)..."
              required
              className="flex-1 px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[42px]"
            />
            <Button type="submit" variant="primary" icon={Plus}>Add Note</Button>
          </form>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {(client.activityNotes || []).length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No dated work notes recorded yet.</div>
          ) : (
            [...(client.activityNotes || [])]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(note => (
                <div key={note.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-cyan-700 dark:text-cyan-400">{formatDate(note.date)}</div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{note.text}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
          )}
        </div>
      </Card>

      {/* Client History */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Jobs ({clientJobs.length})</h3>
          {clientJobs.length === 0 ? (
            <p className="text-xs text-slate-500">No jobs recorded.</p>
          ) : (
            <div className="space-y-2">
              {clientJobs.map(j => (
                <div
                  key={j.id}
                  onClick={() => navigate('job_detail', { id: j.id })}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 cursor-pointer text-xs flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{j.jobType}</div>
                    <div className="text-slate-500">{formatDate(j.date)}</div>
                  </div>
                  <StatusBadge status={j.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Quotes ({clientQuotes.length})</h3>
          {clientQuotes.length === 0 ? (
            <p className="text-xs text-slate-500">No quotes issued.</p>
          ) : (
            <div className="space-y-2">
              {clientQuotes.map(q => (
                <div
                  key={q.id}
                  onClick={() => navigate('quote_detail', { id: q.id })}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 cursor-pointer text-xs flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{q.number}</div>
                    <div className="text-slate-500">{formatZAR(q.total)}</div>
                  </div>
                  <StatusBadge status={q.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Invoices ({clientInvoices.length})</h3>
          {clientInvoices.length === 0 ? (
            <p className="text-xs text-slate-500">No invoices issued.</p>
          ) : (
            <div className="space-y-2">
              {clientInvoices.map(i => (
                <div
                  key={i.id}
                  onClick={() => navigate('invoice_detail', { id: i.id })}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 cursor-pointer text-xs flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{i.number}</div>
                    <div className="text-slate-500">{formatZAR(i.total)}</div>
                  </div>
                  <StatusBadge status={i.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const ClientForm = ({ params, data, updateCollection, navigate }) => {
  const isEditing = !!params?.id;
  const existing = isEditing ? data.clients.find(c => c.id === params.id) : null;

  const [formData, setFormData] = useState(
    existing || {
      id: generateId('cl'),
      name: '',
      company: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      archived: false,
      units: [],
      activityNotes: []
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;
    updateCollection('clients', formData);
    if (params?.returnTo) {
      navigate(params.returnTo, { clientId: formData.id });
    } else {
      navigate('client_detail', { id: formData.id });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(isEditing ? 'client_detail' : 'clients', isEditing ? { id: existing.id } : {})}>
          Back
        </Button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{isEditing ? 'Edit Client' : 'New Client'}</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name / Contact Person *"
              required
              placeholder="e.g. Sarah Jenkins"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Company / Complex Name (Optional)"
              placeholder="e.g. Lighthouse Cafe"
              value={formData.company || ''}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone / WhatsApp Number *"
              required
              placeholder="e.g. 082 123 4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="client@example.co.za"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <Input
            label="Street Address (Durban / KZN) *"
            required
            placeholder="e.g. 45 Marine Drive, Umhlanga"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Site Access Notes (Gate codes, dogs, parking)
            </label>
            <textarea
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Gate code #1234, ask at security..."
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate('clients')}>Cancel</Button>
            <Button type="submit" variant="primary">Save Client</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const UnitForm = ({ params, data, updateCollection, navigate }) => {
  const today = getTodayISO();
  const client = data.clients.find(c => c.id === params?.clientId);

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 mb-4">Client not found.</p>
        <Button onClick={() => navigate('clients')}>Back to Clients</Button>
      </div>
    );
  }

  const isEditing = !!params?.id;
  const initialUnit = isEditing
    ? (client.units || []).find(u => u.id === params.id)
    : {
        id: generateId('unit'),
        brand: '',
        model: '',
        serialNumber: '',
        capacity: '12000',
        type: 'Split (Inverter)',
        location: '',
        installDate: today,
        nextService: addDaysISO(today, 365)
      };

  const [formData, setFormData] = useState(initialUnit);

  const handleSubmit = (e) => {
    e.preventDefault();
    const existingUnits = client.units || [];
    const updatedUnits = isEditing
      ? existingUnits.map(u => (u.id === formData.id ? formData : u))
      : [...existingUnits, formData];

    updateCollection('clients', { ...client, units: updatedUnits });
    navigate('client_detail', { id: client.id });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('client_detail', { id: client.id })}>
          Back to {client.name}
        </Button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{isEditing ? 'Edit Aircon Unit' : 'Register Aircon Unit'}</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Brand *"
              required
              placeholder="e.g. Samsung, Daikin, LG"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
            <Input
              label="Model Number *"
              required
              placeholder="e.g. AR12TXHQ"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Serial Number"
              placeholder="e.g. SN-SAM-88412"
              value={formData.serialNumber || ''}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            />
            <Input
              label="Room / Location *"
              required
              placeholder="e.g. Main Bedroom, Server Room"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Capacity (BTU / kW) *"
              required
              placeholder="e.g. 12000"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            />
            <Select
              label="Unit Type *"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={['Split (Inverter)', 'Split (Non-Inverter)', 'Cassette', 'Ducted', 'Under-Ceiling', 'Portable', 'Window']}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Installation Date"
              type="date"
              value={formData.installDate}
              onChange={(e) => setFormData({ ...formData, installDate: e.target.value })}
            />
            <Input
              label="Next Service Due Date"
              type="date"
              value={formData.nextService}
              onChange={(e) => setFormData({ ...formData, nextService: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate('client_detail', { id: client.id })}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">Save Unit</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// ============================================================================
// 3 & 4. QUOTES AND INVOICES MODULE
// ============================================================================

const DocumentList = ({ type, data, navigate, onQuickMarkInvoicePaid, onQuickMarkSent }) => {
  const isInvoice = type === 'invoice';
  const items = isInvoice ? data.invoices : data.quotes;
  const [search, setSearch] = useState('');

  const [openSections, setOpenSections] = useState({
    draft: true,
    active: true,
    closed: false
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getClientName = (id) => {
    const c = data.clients.find(cl => cl.id === id);
    return c ? (c.company ? `${c.name} (${c.company})` : c.name) : 'Unknown Client';
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(doc => {
      if (!q) return true;
      const cName = getClientName(doc.clientId).toLowerCase();
      return doc.number.toLowerCase().includes(q) || cName.includes(q);
    });
  }, [items, search, data.clients]);

  const sections = isInvoice
    ? [
        {
          key: 'draft',
          title: 'Draft Invoices',
          docs: filtered.filter(d => d.status === 'Draft')
        },
        {
          key: 'active',
          title: 'Sent / Unpaid & Overdue',
          docs: filtered.filter(d => ['Sent', 'Unpaid', 'Partially paid', 'Overdue'].includes(d.status))
        },
        {
          key: 'closed',
          title: 'Paid & Tax Archive',
          docs: filtered.filter(d => ['Paid', 'Cancelled'].includes(d.status))
        }
      ]
    : [
        {
          key: 'draft',
          title: 'Draft Quotes',
          docs: filtered.filter(d => d.status === 'Draft')
        },
        {
          key: 'active',
          title: 'Sent Quotes (Awaiting Response)',
          docs: filtered.filter(d => d.status === 'Sent')
        },
        {
          key: 'closed',
          title: 'Accepted / Declined / Expired',
          docs: filtered.filter(d => ['Accepted', 'Declined', 'Expired'].includes(d.status))
        }
      ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{isInvoice ? 'Invoices' : 'Quotes'}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isInvoice ? 'Click any category bar below to expand or collapse invoices' : 'Manage estimates and convert accepted quotes'}
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate(isInvoice ? 'invoice_form' : 'quote_form')}
        >
          New {isInvoice ? 'Invoice' : 'Quote'}
        </Button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${isInvoice ? 'invoices' : 'quotes'} by number or client...`}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div className="space-y-3">
        {sections.map(sec => {
          const isOpen = openSections[sec.key];
          const secTotal = sec.docs.reduce((sum, d) => sum + (Number(d.total) || 0), 0);
          return (
            <div key={sec.key} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
              <button
                type="button"
                onClick={() => toggleSection(sec.key)}
                className="w-full px-5 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-white flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm sm:text-base tracking-wide">{sec.title}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-600 text-white">
                    {sec.docs.length}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs sm:text-sm font-semibold text-cyan-300">{formatZAR(secTotal)}</span>
                  <ChevronDown
                    size={20}
                    className={`text-cyan-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="bg-white dark:bg-slate-950 divide-y divide-slate-100 dark:divide-slate-800">
                  {sec.docs.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">
                      No {isInvoice ? 'invoices' : 'quotes'} in this category.
                    </div>
                  ) : (
                    sec.docs.map(doc => (
                      <div
                        key={doc.id}
                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div
                          className="space-y-1 cursor-pointer flex-1"
                          onClick={() => navigate(isInvoice ? 'invoice_detail' : 'quote_detail', { id: doc.id })}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{doc.number}</span>
                            <StatusBadge status={doc.status} />
                            <span className="text-xs text-slate-500">
                              {formatDate(isInvoice ? doc.issueDate : doc.date)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {getClientName(doc.clientId)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <div className="text-right">
                            <div className="font-bold text-slate-900 dark:text-white">{formatZAR(doc.total)}</div>
                            {isInvoice && doc.status !== 'Paid' && (
                              <div className="text-xs text-red-600 dark:text-red-400">
                                Due: {formatZAR(doc.balance ?? doc.total)}
                              </div>
                            )}
                          </div>

                          {doc.status === 'Draft' && (
                            <Button
                              size="sm"
                              variant="accent"
                              onClick={() => onQuickMarkSent(type, doc.id)}
                            >
                              Mark Sent
                            </Button>
                          )}

                          {isInvoice && doc.status !== 'Paid' && doc.status !== 'Cancelled' && (
                            <Button
                              size="sm"
                              variant="success"
                              icon={CheckCircle}
                              onClick={() => onQuickMarkInvoicePaid(doc.id)}
                            >
                              Mark Paid
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(isInvoice ? 'invoice_detail' : 'quote_detail', { id: doc.id })}
                          >
                            <ChevronRight size={18} />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DocumentForm = ({ type, params, data, updateCollection, navigate }) => {
  const isInvoice = type === 'invoice';
  const today = getTodayISO();
  const collectionName = isInvoice ? 'invoices' : 'quotes';
  const existing = params?.id ? data[collectionName].find(d => d.id === params.id) : null;

  const nextNumber = useMemo(() => {
    const prefix = isInvoice ? 'INV-' : 'QUO-';
    const startNum = isInvoice ? 2001 : 1001;
    const nums = data[collectionName]
      .map(d => parseInt((d.number || '').replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : startNum - 1;
    return `${prefix}${max + 1}`;
  }, [data, collectionName, isInvoice]);

  const initialItems = useMemo(() => {
    if (existing) {
      return existing.items.map(it => ({ ...it, qty: String(it.qty) }));
    }
    if (params?.fromQuote) {
      return params.fromQuote.items.map(it => ({ ...it, id: generateId('li'), qty: String(it.qty) }));
    }
    if (params?.fromJob) {
      return [
        {
          id: generateId('li'),
          description: `${params.fromJob.jobType} - ${params.fromJob.instructions || 'Field service work'}`,
          qty: '1',
          unitPrice: 650
        }
      ];
    }
    return [{ id: generateId('li'), description: '', qty: '1', unitPrice: 0 }];
  }, [existing, params]);

  const [clientId, setClientId] = useState(
    existing?.clientId || params?.clientId || params?.fromQuote?.clientId || params?.fromJob?.clientId || ''
  );
  const [docNumber, setDocNumber] = useState(existing?.number || nextNumber);
  const [date, setDate] = useState(
    existing ? (isInvoice ? existing.issueDate : existing.date) : today
  );
  const [secondDate, setSecondDate] = useState(
    existing
      ? (isInvoice ? existing.dueDate : existing.expiryDate)
      : addDaysISO(today, isInvoice ? data.settings.invoiceDueDays : data.settings.quoteExpiryDays)
  );
  const [items, setItems] = useState(initialItems);
  const [discount, setDiscount] = useState(
    existing?.discount ?? params?.fromQuote?.discount ?? 0
  );
  const [notes, setNotes] = useState(
    existing?.notes ?? params?.fromQuote?.notes ?? params?.fromJob?.instructions ?? data.settings.defaultTerms
  );
  const [selectedCatItem, setSelectedCatItem] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const calculations = useMemo(() => {
    const rawSub = items.reduce((sum, item) => {
      const q = parseFloat(item.qty);
      const p = parseFloat(item.unitPrice);
      return sum + ((isNaN(q) ? 0 : q) * (isNaN(p) ? 0 : p));
    }, 0);
    const disc = parseFloat(discount) || 0;
    const subtotal = Math.max(0, rawSub - disc);
    const vatRate = Number(data.settings.vatRate) || 15;
    const vat = subtotal * (vatRate / 100);
    const total = subtotal + vat;
    return { subtotal, vat, total };
  }, [items, discount, data.settings.vatRate]);

  const handleAddCatalogueItem = (catId) => {
    setSelectedCatItem(catId);
    if (!catId) return;
    const found = data.catalogue.find(c => c.id === catId);
    if (!found) return;
    setItems(prev => [
      ...prev,
      {
        id: generateId('li'),
        description: found.name,
        qty: '1',
        unitPrice: found.sellPrice
      }
    ]);
    setSelectedCatItem('');
  };

  const updateLineItem = (id, field, value) => {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const removeLineItem = (id) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(it => it.id !== id));
  };

  const handleSave = (e, targetStatus) => {
    e.preventDefault();
    if (!clientId) {
      setErrorMsg('Please select or quick-create a client first.');
      return;
    }
    const validItems = items.filter(it => it.description.trim());
    if (validItems.length === 0) {
      setErrorMsg('Please add at least one line item with a description.');
      return;
    }

    const cleanItems = validItems.map(it => ({
      ...it,
      qty: String(it.qty).trim() === '' ? '0' : String(it.qty).trim(),
      unitPrice: parseFloat(it.unitPrice) || 0
    }));

    if (isInvoice) {
      const amountPaid = existing ? Number(existing.amountPaid || 0) : 0;
      const balance = Math.max(0, calculations.total - amountPaid);
      const payload = {
        id: existing?.id || generateId('inv'),
        number: docNumber,
        clientId,
        quoteId: existing?.quoteId || params?.fromQuote?.id || '',
        issueDate: date,
        dueDate: secondDate,
        status: targetStatus || existing?.status || 'Draft',
        discount: parseFloat(discount) || 0,
        notes,
        items: cleanItems,
        subtotal: calculations.subtotal,
        vat: calculations.vat,
        total: calculations.total,
        amountPaid,
        balance,
        paymentDate: existing?.paymentDate || '',
        payments: existing?.payments || []
      };
      updateCollection('invoices', payload);
      navigate('invoice_detail', { id: payload.id });
    } else {
      const payload = {
        id: existing?.id || generateId('quo'),
        number: docNumber,
        clientId,
        date,
        expiryDate: secondDate,
        status: targetStatus || existing?.status || 'Draft',
        discount: parseFloat(discount) || 0,
        notes,
        items: cleanItems,
        subtotal: calculations.subtotal,
        vat: calculations.vat,
        total: calculations.total
      };
      updateCollection('quotes', payload);
      navigate('quote_detail', { id: payload.id });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(isInvoice ? 'invoices' : 'quotes')}>
          Back
        </Button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {existing ? `Edit ${docNumber}` : `New ${isInvoice ? 'Invoice' : 'Quote'}`}
        </h1>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ClientAutocomplete
            clients={data.clients}
            selectedClientId={clientId}
            onSelectClient={(id) => {
              setClientId(id);
              setErrorMsg('');
            }}
            onQuickAddClient={() => navigate('client_form', { returnTo: isInvoice ? 'invoice_form' : 'quote_form' })}
          />

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Number"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
            />
            <Input
              label={isInvoice ? 'Issue Date' : 'Quote Date'}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label={isInvoice ? 'Due Date' : 'Valid Until'}
              type="date"
              value={secondDate}
              onChange={(e) => setSecondDate(e.target.value)}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 mb-1.5">
            Quick-Add from Price Catalogue
          </label>
          <select
            value={selectedCatItem}
            onChange={(e) => handleAddCatalogueItem(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="">+ Select a service, unit, part, or refrigerant...</option>
            {data.catalogue.map(item => (
              <option key={item.id} value={item.id}>
                [{item.category}] {item.name} — {formatZAR(item.sellPrice)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Line Items</span>
            <span className="text-xs text-slate-400">Tip: Enter decimals like 0.2 for gas refills</span>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => {
              const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);
              return (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <div className="col-span-12 sm:col-span-6">
                    <input
                      type="text"
                      placeholder={`Item #${idx + 1} description...`}
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Qty (e.g. 0.2)"
                      value={item.qty}
                      onChange={(e) => {
                        const raw = e.target.value.replace(',', '.');
                        if (/^[0-9]*\.?[0-9]*$/.test(raw)) {
                          updateLineItem(item.id, 'qty', raw);
                        }
                      }}
                      className="w-full px-3 py-2 text-sm text-right bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price (R)"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                      className="w-full px-3 py-2 text-sm text-right bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-1.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                      {formatZAR(lineTotal)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setItems(prev => [...prev, { id: generateId('li'), description: '', qty: '1', unitPrice: 0 }])}
          >
            Add Custom Line
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Notes / Terms</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Discount (R):</span>
              <input
                type="number"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-28 px-2.5 py-1 text-right text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Subtotal (Excl. VAT):</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatZAR(calculations.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">VAT ({data.settings.vatRate}%):</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatZAR(calculations.vat)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-cyan-400">
              <span>Total (Incl. VAT):</span>
              <span>{formatZAR(calculations.total)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={(e) => handleSave(e, 'Draft')}>
            Save as Draft
          </Button>
          <Button type="button" variant="primary" onClick={(e) => handleSave(e, 'Sent')}>
            Save & Mark Sent
          </Button>
        </div>
      </Card>
    </div>
  );
};

const DocumentDetail = ({ type, params, data, updateCollection, navigate, onQuickMarkInvoicePaid, onQuickMarkSent }) => {
  const isInvoice = type === 'invoice';
  const collectionName = isInvoice ? 'invoices' : 'quotes';
  const doc = data[collectionName].find(d => d.id === params?.id);

  if (!doc) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 mb-4">{isInvoice ? 'Invoice' : 'Quote'} not found.</p>
        <Button onClick={() => navigate(isInvoice ? 'invoices' : 'quotes')}>Back</Button>
      </div>
    );
  }

  const client = data.clients.find(c => c.id === doc.clientId);
  const waPhone = cleanPhoneForWhatsApp(client?.phone);

  const shareText = encodeURIComponent(
    `Hi ${client?.name || 'there'}, here is ${isInvoice ? 'Invoice' : 'Quote'} ${doc.number} from ${data.settings.companyName} for ${formatZAR(doc.total)}. Please let us know if you have any questions!`
  );

  const handleDuplicateQuote = () => {
    const newId = generateId('quo');
    const nums = data.quotes.map(q => parseInt(q.number.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    const nextNum = `QUO-${(nums.length ? Math.max(...nums) : 1000) + 1}`;
    const copy = {
      ...doc,
      id: newId,
      number: nextNum,
      date: getTodayISO(),
      expiryDate: addDaysISO(getTodayISO(), data.settings.quoteExpiryDays),
      status: 'Draft'
    };
    updateCollection('quotes', copy);
    navigate('quote_detail', { id: newId });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(isInvoice ? 'invoices' : 'quotes')}>
            Back
          </Button>
          <StatusBadge status={doc.status} />
        </div>

        <div className="flex flex-wrap gap-2">
          {doc.status === 'Draft' && (
            <Button size="sm" variant="accent" onClick={() => onQuickMarkSent(type, doc.id)}>
              Mark Sent
            </Button>
          )}

          {isInvoice && doc.status !== 'Paid' && (
            <Button size="sm" variant="success" icon={CheckCircle} onClick={() => onQuickMarkInvoicePaid(doc.id)}>
              Mark Paid
            </Button>
          )}

          {!isInvoice && doc.status !== 'Accepted' && (
            <Button
              size="sm"
              variant="success"
              icon={CheckCircle}
              onClick={() => updateCollection('quotes', { ...doc, status: 'Accepted' })}
            >
              Accept Quote
            </Button>
          )}

          {!isInvoice && (
            <>
              <Button
                size="sm"
                variant="primary"
                icon={Receipt}
                onClick={() => navigate('invoice_form', { fromQuote: doc })}
              >
                Convert to Invoice
              </Button>
              <Button
                size="sm"
                variant="secondary"
                icon={CalendarIcon}
                onClick={() => navigate('job_form', { clientId: doc.clientId, quoteId: doc.id })}
              >
                Book Job
              </Button>
              <Button size="sm" variant="secondary" icon={Copy} onClick={handleDuplicateQuote}>
                Duplicate
              </Button>
            </>
          )}

          <Button size="sm" variant="secondary" icon={Edit} onClick={() => navigate(isInvoice ? 'invoice_form' : 'quote_form', { id: doc.id })}>
            Edit
          </Button>
          <Button size="sm" variant="secondary" icon={Printer} onClick={() => window.print()}>
            Print / PDF
          </Button>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs print:hidden">
        <span className="text-cyan-900 dark:text-cyan-200">
          <strong>Tip:</strong> Click "Print / PDF" to save the PDF first, then attach it when opening WhatsApp or Email below.
        </span>
        <div className="flex gap-2 shrink-0">
          {waPhone && (
            <a
              href={`https://wa.me/${waPhone}?text=${shareText}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <MessageSquare size={14} /> WhatsApp
            </a>
          )}
          {client?.email && (
            <a
              href={`mailto:${client.email}?subject=${encodeURIComponent(`${data.settings.companyName} - ${doc.number}`)}&body=${shareText}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold"
            >
              <Mail size={14} /> Email
            </a>
          )}
        </div>
      </div>

      <Card className="p-6 sm:p-10 space-y-6 bg-white text-slate-900">
        <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">{data.settings.companyName}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{data.settings.tagline}</p>
            <p className="text-xs text-slate-600 mt-2">{data.settings.address}</p>
            <p className="text-xs text-slate-600">Tel: {data.settings.phone} • {data.settings.email}</p>
            {data.settings.vatNumber && <p className="text-xs text-slate-600">VAT Reg No: {data.settings.vatNumber}</p>}
          </div>
          <div className="sm:text-right">
            <span className="inline-block px-3 py-1 rounded-lg bg-slate-900 text-white text-sm font-bold uppercase tracking-wider">
              {isInvoice ? (doc.status === 'Paid' ? 'TAX INVOICE / RECEIPT' : 'TAX INVOICE') : 'QUOTATION'}
            </span>
            <p className="text-xl font-bold text-slate-900 mt-2">{doc.number}</p>
            <p className="text-xs text-slate-500 mt-1">
              Date: <strong>{formatDate(isInvoice ? doc.issueDate : doc.date)}</strong>
            </p>
            <p className="text-xs text-slate-500">
              {isInvoice ? 'Due Date' : 'Valid Until'}: <strong>{formatDate(isInvoice ? doc.dueDate : doc.expiryDate)}</strong>
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Prepared For</p>
          <p className="font-bold text-base text-slate-900 mt-1">{client?.name}</p>
          {client?.company && <p className="text-sm font-medium text-slate-700">{client.company}</p>}
          <p className="text-sm text-slate-600">{client?.address}</p>
          <p className="text-sm text-slate-600">{client?.phone} {client?.email ? `• ${client.email}` : ''}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-xs font-bold uppercase text-slate-600">
                <th className="py-2.5">Description</th>
                <th className="py-2.5 text-right w-20">Qty</th>
                <th className="py-2.5 text-right w-32">Unit Price</th>
                <th className="py-2.5 text-right w-32">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {doc.items.map(item => {
                const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);
                return (
                  <tr key={item.id}>
                    <td className="py-3 text-slate-800">{item.description}</td>
                    <td className="py-3 text-right text-slate-700">{item.qty}</td>
                    <td className="py-3 text-right text-slate-700">{formatZAR(item.unitPrice)}</td>
                    <td className="py-3 text-right font-semibold text-slate-900">{formatZAR(lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          <div className="space-y-3 text-xs text-slate-600">
            {isInvoice && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-800 uppercase mb-1">Banking Details</p>
                <pre className="whitespace-pre-wrap font-sans">{data.settings.bankingDetails}</pre>
              </div>
            )}
            {doc.notes && (
              <div>
                <p className="font-bold text-slate-800 uppercase mb-1">Terms & Notes</p>
                <p className="whitespace-pre-wrap">{doc.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm">
            {Number(doc.discount) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Discount:</span>
                <span>- {formatZAR(doc.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Subtotal (Excl. VAT):</span>
              <span>{formatZAR(doc.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>VAT ({data.settings.vatRate}%):</span>
              <span>{formatZAR(doc.vat)}</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold text-slate-900 pt-2 border-t border-slate-300">
              <span>Total:</span>
              <span>{formatZAR(doc.total)}</span>
            </div>
            {isInvoice && (
              <>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Amount Paid:</span>
                  <span>{formatZAR(doc.amountPaid || 0)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900">
                  <span>Balance Due:</span>
                  <span>{formatZAR(doc.balance ?? doc.total)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// 5. SCHEDULING & JOBS MODULE
// ============================================================================

const JobsView = ({ data, navigate }) => {
  const today = getTodayISO();
  const [selectedDate, setSelectedDate] = useState('');
  const [techFilter, setTechFilter] = useState('All');

  const initialDateObj = new Date(today);
  const [calYear, setCalYear] = useState(initialDateObj.getFullYear());
  const [calMonth, setCalMonth] = useState(initialDateObj.getMonth());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(y => y - 1);
    } else {
      setCalMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(y => y + 1);
    } else {
      setCalMonth(m => m + 1);
    }
  };

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(calMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      cells.push(`${calYear}-${mm}-${dd}`);
    }
    return cells;
  }, [calYear, calMonth]);

  const jobsByDate = useMemo(() => {
    const map = {};
    data.jobs.forEach(job => {
      if (job.status === 'Cancelled') return;
      if (techFilter !== 'All' && job.technician !== techFilter) return;
      if (!map[job.date]) map[job.date] = [];
      map[job.date].push(job);
    });
    return map;
  }, [data.jobs, techFilter]);

  const filteredJobs = useMemo(() => {
    return data.jobs
      .filter(job => {
        if (techFilter !== 'All' && job.technician !== techFilter) return false;
        if (selectedDate && job.date !== selectedDate) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''));
  }, [data.jobs, techFilter, selectedDate]);

  const getClientName = (id) => {
    const c = data.clients.find(cl => cl.id === id);
    return c ? (c.company ? `${c.name} (${c.company})` : c.name) : 'Unknown Client';
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Scheduling & Jobs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tap any date on the calendar to filter jobs or book a technician</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="All">All Technicians</option>
            {data.settings.technicians.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('job_form', selectedDate ? { date: selectedDate } : {})}
          >
            Book Job
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              {monthNames[calMonth]} {calYear}
            </h2>
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Filtering: {formatDate(selectedDate)} (Clear filter)
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-bold uppercase text-slate-400 pb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {calendarDays.map((isoDate, idx) => {
            if (!isoDate) {
              return <div key={`empty-${idx}`} className="h-12 sm:h-14 rounded-lg bg-slate-50/40 dark:bg-slate-950/30" />;
            }
            const dayNum = parseInt(isoDate.split('-')[2], 10);
            const dayJobs = jobsByDate[isoDate] || [];
            const isToday = isoDate === today;
            const isSelected = isoDate === selectedDate;

            return (
              <button
                key={isoDate}
                type="button"
                onClick={() => setSelectedDate(isSelected ? '' : isoDate)}
                className={`h-12 sm:h-14 rounded-lg border p-1 flex flex-col items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-cyan-600 dark:border-cyan-500 shadow-sm'
                    : isToday
                    ? 'bg-cyan-50/80 dark:bg-cyan-950/40 border-cyan-400 dark:border-cyan-700 text-slate-900 dark:text-white'
                    : dayJobs.length > 0
                    ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-cyan-500 text-slate-900 dark:text-white'
                    : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800/80 hover:border-slate-300 text-slate-500'
                }`}
              >
                <span className={`text-xs sm:text-sm font-bold ${isToday && !isSelected ? 'text-cyan-700 dark:text-cyan-300' : ''}`}>
                  {dayNum}
                </span>

                {dayJobs.length > 0 && (
                  <div className="flex items-center gap-1">
                    {dayJobs.slice(0, 3).map(j => (
                      <span
                        key={j.id}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isSelected ? 'bg-white' : (JOB_DOT_COLORS[j.jobType] || 'bg-cyan-500')}`}
                      />
                    ))}
                    {dayJobs.length > 3 && (
                      <span className="text-[9px] font-bold">+{dayJobs.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 dark:text-white">
            {selectedDate ? `Jobs Queued for ${formatDate(selectedDate)}` : 'All Scheduled Jobs'} ({filteredJobs.length})
          </h2>
          {selectedDate && (
            <Button size="sm" variant="accent" icon={Plus} onClick={() => navigate('job_form', { date: selectedDate })}>
              Book on {formatDate(selectedDate)}
            </Button>
          )}
        </div>

        {filteredJobs.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-sm">
            No jobs scheduled for this selection.
          </Card>
        ) : (
          <div className="space-y-2.5">
            {filteredJobs.map(job => {
              const client = data.clients.find(c => c.id === job.clientId);
              return (
                <Card
                  key={job.id}
                  onClick={() => navigate('job_detail', { id: job.id })}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {formatDate(job.date)} • {job.startTime}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${JOB_TYPE_COLORS[job.jobType] || ''}`}>
                        {job.jobType}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{getClientName(job.clientId)}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {client?.address} • Tech: <strong>{job.technician}</strong> ({job.duration})
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <StatusBadge status={job.status} />
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const JobForm = ({ params, data, updateCollection, navigate }) => {
  const today = getTodayISO();
  const isEditing = !!params?.id;
  const existing = isEditing ? data.jobs.find(j => j.id === params.id) : null;

  const [formData, setFormData] = useState(
    existing || {
      id: generateId('job'),
      clientId: params?.clientId || '',
      quoteId: params?.quoteId || '',
      unitIds: [],
      jobType: 'Service/Maintenance',
      date: params?.date || today,
      startTime: '08:30',
      duration: '1.5 hrs',
      technician: data.settings.technicians[0] || 'Thabo Mkhize',
      status: 'Scheduled',
      instructions: ''
    }
  );

  const selectedClient = data.clients.find(c => c.id === formData.clientId);

  const conflict = useMemo(() => {
    return data.jobs.find(
      j =>
        j.id !== formData.id &&
        j.status !== 'Cancelled' &&
        j.date === formData.date &&
        j.startTime === formData.startTime &&
        j.technician === formData.technician
    );
  }, [data.jobs, formData]);

  const toggleUnitSelection = (unitId) => {
    const current = formData.unitIds || [];
    const next = current.includes(unitId) ? current.filter(id => id !== unitId) : [...current, unitId];
    setFormData({ ...formData, unitIds: next });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientId) return;
    updateCollection('jobs', formData);
    navigate('job_detail', { id: formData.id });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('jobs')}>Back</Button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{isEditing ? 'Edit Job' : 'Book Field Job'}</h1>
      </div>

      {conflict && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium">
          <strong>Schedule Warning:</strong> {formData.technician} already has a job booked on {formatDate(formData.date)} at {formData.startTime}.
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <ClientAutocomplete
            clients={data.clients}
            selectedClientId={formData.clientId}
            onSelectClient={(id) => setFormData({ ...formData, clientId: id, unitIds: [] })}
            onQuickAddClient={() => navigate('client_form', { returnTo: 'job_form' })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Job Type *"
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
              options={['Installation', 'Service/Maintenance', 'Repair', 'Diagnostics', 'Quote visit', 'Warranty callout']}
            />
            <Select
              label="Assigned Technician *"
              value={formData.technician}
              onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
              options={data.settings.technicians}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Date *"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Input
              label="Start Time *"
              type="time"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            <Input
              label="Est. Duration"
              placeholder="e.g. 2 hrs"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>

          {selectedClient && (selectedClient.units || []).length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Select Aircon Units for this Job
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedClient.units.map(u => {
                  const checked = (formData.unitIds || []).includes(u.id);
                  return (
                    <label
                      key={u.id}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center gap-2 ${
                        checked
                          ? 'bg-cyan-50 border-cyan-500 text-cyan-950 dark:bg-cyan-950/40 dark:text-cyan-200'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleUnitSelection(u.id)}
                        className="rounded text-cyan-600"
                      />
                      <div>
                        <div className="font-bold">{u.brand} {u.model} ({u.location})</div>
                        {u.serialNumber && <div className="text-[11px] opacity-80">S/N: {u.serialNumber}</div>}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Job Instructions</label>
            <textarea
              rows={3}
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Scope of work, parts to bring, client instructions..."
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate('jobs')}>Cancel</Button>
            <Button type="submit" variant="primary">Save Job</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const JobDetail = ({ params, data, updateCollection, navigate }) => {
  const today = getTodayISO();
  const job = data.jobs.find(j => j.id === params?.id);

  if (!job) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 mb-4">Job not found.</p>
        <Button onClick={() => navigate('jobs')}>Back to Jobs</Button>
      </div>
    );
  }

  const client = data.clients.find(c => c.id === job.clientId);
  const linkedUnits = (client?.units || []).filter(u => (job.unitIds || []).includes(u.id));
  const unitsToShow = linkedUnits.length > 0 ? linkedUnits : (client?.units || []);

  const handleStatusChange = (newStatus) => {
    updateCollection('jobs', { ...job, status: newStatus });

    if (newStatus === 'Completed' && client) {
      const updatedUnits = (client.units || []).map(u => {
        if ((job.unitIds || []).includes(u.id)) {
          return { ...u, nextService: addDaysISO(today, 365) };
        }
        return u;
      });
      const autoNote = {
        id: generateId('note'),
        date: today,
        text: `Completed ${job.jobType} (${job.technician}): ${job.instructions || 'Routine service/work completed.'}`
      };
      updateCollection('clients', {
        ...client,
        units: updatedUnits,
        activityNotes: [autoNote, ...(client.activityNotes || [])]
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('jobs')}>Jobs</Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{job.jobType}</h1>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-xs text-slate-500">{formatDate(job.date)} at {job.startTime} • {job.technician}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" icon={Edit} onClick={() => navigate('job_form', { id: job.id })}>
            Edit Job
          </Button>
          <Button size="sm" variant="accent" icon={Receipt} onClick={() => navigate('invoice_form', { fromJob: job })}>
            Create Invoice
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Update Field Status</p>
        <div className="flex flex-wrap gap-2">
          {['Scheduled', 'On the way', 'In progress', 'Awaiting parts', 'Completed', 'Cancelled'].map(st => (
            <Button
              key={st}
              size="sm"
              variant={job.status === st ? 'primary' : 'secondary'}
              onClick={() => handleStatusChange(st)}
            >
              {st}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 dark:text-white">Client & Site Info</h2>
          {client && (
            <Button size="sm" variant="ghost" onClick={() => navigate('client_detail', { id: client.id })}>
              Open Client Profile →
            </Button>
          )}
        </div>
        <div className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
          <p className="font-bold text-base text-slate-900 dark:text-white">{client?.name} {client?.company ? `(${client.company})` : ''}</p>
          <p className="flex items-center gap-2"><MapPin size={15} className="text-cyan-600" /> {client?.address}</p>
          <p className="flex items-center gap-2"><Phone size={15} className="text-cyan-600" /> {client?.phone}</p>
        </div>
        {client?.notes && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
            <strong>Access Instructions:</strong> {client.notes}
          </div>
        )}
        {job.instructions && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-800 dark:text-slate-200">
            <strong>Job Scope:</strong> {job.instructions}
          </div>
        )}
      </Card>

      {unitsToShow.length > 0 && (
        <Card>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-slate-900 dark:text-white">Equipment on Site</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {unitsToShow.map(unit => (
              <div key={unit.id} className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">{unit.brand} {unit.model}</span>
                  <span className="text-slate-500 ml-2">• {unit.capacity} BTU • {unit.type}</span>
                  {unit.serialNumber && <span className="text-cyan-700 dark:text-cyan-400 font-mono ml-2">• S/N: {unit.serialNumber}</span>}
                </div>
                <div className="text-xs text-slate-500">
                  Location: <strong className="text-slate-700 dark:text-slate-300">{unit.location}</strong>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// ============================================================================
// 6. COMPANY-WIDE NOTICES BOARD (Protected with password: Legacy@Notice2026)
// ============================================================================

const NoticesView = ({ data, updateCollection, deleteItem }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passError, setPassError] = useState('');

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [author, setAuthor] = useState('Management');

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passwordInput === 'Legacy@Notice2026') {
      setIsUnlocked(true);
      setPassError('');
      setPasswordInput('');
    } else {
      setPassError('Incorrect password. Posting notices requires the Notice Admin password.');
    }
  };

  const handlePostNotice = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const newNotice = {
      id: generateId('not'),
      title: title.trim(),
      body: body.trim(),
      author: author.trim() || 'Management',
      date: getTodayISO()
    };
    updateCollection('notices', newNotice);
    setTitle('');
    setBody('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="text-cyan-600" size={24} /> Company Notices
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Team announcements, stock updates, and operational news for all Legacy Cooling staff
          </p>
        </div>
        {isUnlocked && (
          <Button size="sm" variant="secondary" icon={Lock} onClick={() => setIsUnlocked(false)}>
            Lock Posting
          </Button>
        )}
      </div>

      {!isUnlocked ? (
        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70">
          <form onSubmit={handleUnlock} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <Lock size={16} className="text-cyan-600 shrink-0" />
              <span>Want to post or remove a company notice? Unlock with notice password:</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
              <Button type="submit" size="sm" variant="primary" icon={Unlock}>Unlock</Button>
            </div>
          </form>
          {passError && <p className="text-xs text-red-600 font-medium mt-2">{passError}</p>}
        </Card>
      ) : (
        <Card className="p-5 border-cyan-500/50">
          <h2 className="font-bold text-slate-900 dark:text-white mb-3">Post New Company Notice</h2>
          <form onSubmit={handlePostNotice} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Notice Headline *"
                  required
                  placeholder="e.g. Weekend Standby Roster"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <Input
                label="Posted By"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Message *</label>
              <textarea
                rows={3}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your announcement for the team..."
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="primary" icon={Plus}>Publish Notice</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {(data.notices || []).length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-sm">No notices posted yet.</Card>
        ) : (
          data.notices.map(notice => (
            <Card key={notice.id} className="p-5 border-l-4 border-l-cyan-600">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{notice.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {formatDate(notice.date)} • {notice.author}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {notice.body}
                  </p>
                </div>
                {isUnlocked && (
                  <button
                    type="button"
                    onClick={() => deleteItem('notices', notice.id)}
                    className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg"
                    title="Delete notice"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 7. SETTINGS MODULE (Password Protected: Legacy@Admin2026)
//    Includes: Monthly Revenue Tab, Categories & Catalogue CRUD with search,
//    Company Info, Google Sheets Cloud Sync setup, and JSON Backup/Restore
// ============================================================================

const SettingsView = ({
  data,
  setData,
  updateCollection,
  deleteItem,
  onResetSampleData,
  sheetsUrl,
  onUpdateSheetsUrl,
  syncStatus,
  lastSyncedAt,
  onSyncNow,
  onForcePushToSheets
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('revenue');

  const currentMonthPrefix = getTodayISO().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthPrefix);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [catalogueSearch, setCatalogueSearch] = useState('');
  const [newItem, setNewItem] = useState({
    category: data.categories[0] || 'Units',
    name: '',
    description: '',
    costPrice: '',
    sellPrice: ''
  });

  const [companyForm, setCompanyForm] = useState(data.settings);
  const [sheetsUrlInput, setSheetsUrlInput] = useState(sheetsUrl || '');
  const [newTechName, setNewTechName] = useState('');
  const [statusBanner, setStatusBanner] = useState('');

  useEffect(() => {
    setCompanyForm(data.settings);
  }, [data.settings]);

  const monthlyRevenueStats = useMemo(() => {
    const paidInvoicesInMonth = data.invoices.filter(inv => {
      if (inv.status !== 'Paid') return false;
      const effectiveDate = inv.paymentDate || inv.issueDate || '';
      return effectiveDate.startsWith(selectedMonth);
    });
    const totalRevenue = paidInvoicesInMonth.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
    return { paidInvoicesInMonth, totalRevenue };
  }, [data.invoices, selectedMonth]);

  const filteredCatalogue = useMemo(() => {
    const q = catalogueSearch.trim().toLowerCase();
    if (!q) return data.catalogue;
    return data.catalogue.filter(item =>
      item.name.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  }, [data.catalogue, catalogueSearch]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passwordInput === 'Legacy@Admin2026') {
      setIsUnlocked(true);
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError('Invalid admin password. Please try again.');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-cyan-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Lock size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Settings Locked</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter the Legacy Cooling administrator password to access Monthly Revenue, Price Catalogue, and Company Settings.
            </p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-3 text-left">
            <Input
              label="Administrator Password"
              type="password"
              required
              placeholder="Enter password..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            {authError && <p className="text-xs font-semibold text-red-600">{authError}</p>}
            <Button type="submit" variant="primary" icon={Unlock} className="w-full">
              Unlock Settings
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const handleAddCategory = (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (data.categories.includes(trimmed)) return;
    const updatedCats = [...data.categories, trimmed];
    setData(prev => ({ ...prev, categories: updatedCats }));
    setNewItem(prev => ({ ...prev, category: trimmed }));
    setNewCategoryName('');
  };

  const handleDeleteCategory = (catName) => {
    const updatedCats = data.categories.filter(c => c !== catName);
    setData(prev => ({ ...prev, categories: updatedCats }));
  };

  const handleAddCatalogueItem = (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    const payload = {
      id: generateId('cat'),
      category: newItem.category || data.categories[0] || 'General',
      name: newItem.name.trim(),
      description: newItem.description.trim(),
      costPrice: parseFloat(newItem.costPrice) || 0,
      sellPrice: parseFloat(newItem.sellPrice) || 0
    };
    updateCollection('catalogue', payload);
    setNewItem({
      category: newItem.category,
      name: '',
      description: '',
      costPrice: '',
      sellPrice: ''
    });
  };

  const handleSaveCompanySettings = (e) => {
    e.preventDefault();
    setData(prev => ({ ...prev, settings: companyForm }));
    setStatusBanner('Company settings saved successfully.');
    setTimeout(() => setStatusBanner(''), 3000);
  };

  const handleConnectSheets = async (e) => {
    e.preventDefault();
    const trimmed = sheetsUrlInput.trim();
    onUpdateSheetsUrl(trimmed);
    if (trimmed) {
      setStatusBanner('Connecting to Google Sheets...');
      await onSyncNow(trimmed);
      setStatusBanner('Google Sheets URL saved and synced!');
    } else {
      setStatusBanner('Disconnected from Google Sheets (Local Storage mode).');
    }
    setTimeout(() => setStatusBanner(''), 3500);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legacy-cooling-backup-${getTodayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (imported && imported.clients && imported.settings) {
          setData(imported);
          setCompanyForm(imported.settings);
          setStatusBanner('Backup restored successfully!');
          setTimeout(() => setStatusBanner(''), 3000);
        }
      } catch (err) {
        setStatusBanner('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const getClientName = (id) => {
    const c = data.clients.find(cl => cl.id === id);
    return c ? (c.company ? `${c.name} (${c.company})` : c.name) : 'Unknown Client';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monthly revenue reporting, price catalogue & Google Sheets sync</p>
        </div>
        <Button size="sm" variant="secondary" icon={Lock} onClick={() => setIsUnlocked(false)}>
          Lock Settings
        </Button>
      </div>

      {statusBanner && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">
          {statusBanner}
        </div>
      )}

      {/* Settings Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Button
          size="sm"
          variant={activeTab === 'revenue' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('revenue')}
        >
          Monthly Revenue
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'catalogue' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('catalogue')}
        >
          Categories & Price Catalogue
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'company' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('company')}
        >
          Company, Google Sheets & Backup
        </Button>
      </div>

      {/* TAB 1: MONTHLY REVENUE */}
      {activeTab === 'revenue' && (
        <div className="space-y-4">
          <Card className="p-6 border-l-4 border-l-emerald-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Paid Invoice Revenue ({selectedMonth})
                </p>
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-emerald-400 mt-1">
                  {formatZAR(monthlyRevenueStats.totalRevenue)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Counted from {monthlyRevenueStats.paidInvoicesInMonth.length} paid {monthlyRevenueStats.paidInvoicesInMonth.length === 1 ? 'invoice' : 'invoices'} in this month
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Select Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-white">Paid Invoices Included in {selectedMonth}</h2>
            </div>
            {monthlyRevenueStats.paidInvoicesInMonth.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No paid invoices recorded for {selectedMonth}.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {monthlyRevenueStats.paidInvoicesInMonth.map(inv => (
                  <div key={inv.id} className="p-4 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{inv.number}</span>
                      <span className="text-slate-500 ml-2">• {getClientName(inv.clientId)}</span>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Paid on: {formatDate(inv.paymentDate || inv.issueDate)}
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatZAR(inv.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: CATEGORIES & PRICE CATALOGUE CRUD */}
      {activeTab === 'catalogue' && (
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag size={18} className="text-cyan-600" /> Catalogue Categories
              </h2>
              <p className="text-xs text-slate-500">Add or remove categories for organizing your parts, units, and services</p>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
              <input
                type="text"
                placeholder="New category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
              <Button type="submit" size="sm" variant="primary" icon={Plus}>Add Category</Button>
            </form>

            <div className="flex flex-wrap gap-2">
              {data.categories.map(cat => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  {cat}
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat)}
                    className="text-slate-400 hover:text-red-500"
                    title="Delete category"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Add Price Catalogue Item</h2>
            <form onSubmit={handleAddCatalogueItem} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-3">
                <Select
                  label="Category"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  options={data.categories}
                />
              </div>
              <div className="sm:col-span-4">
                <Input
                  label="Item / Service Name *"
                  required
                  placeholder="e.g. 18,000 BTU Inverter Split"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Cost (R)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newItem.costPrice}
                  onChange={(e) => setNewItem({ ...newItem, costPrice: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Sell Price (R) *"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newItem.sellPrice}
                  onChange={(e) => setNewItem({ ...newItem, sellPrice: e.target.value })}
                />
              </div>
              <div className="sm:col-span-1">
                <Button type="submit" variant="primary" className="w-full" icon={Plus}>Add</Button>
              </div>
            </form>
          </Card>

          <Card>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-bold text-slate-900 dark:text-white">
                Active Price Catalogue ({filteredCatalogue.length}{catalogueSearch.trim() ? ` of ${data.catalogue.length}` : ''} items)
              </h2>
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={catalogueSearch}
                  onChange={(e) => setCatalogueSearch(e.target.value)}
                  placeholder="Search items or categories..."
                  className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {catalogueSearch && (
                  <button
                    type="button"
                    onClick={() => setCatalogueSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCatalogue.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No catalogue items match "{catalogueSearch}".
                </div>
              ) : (
                filteredCatalogue.map(item => {
                  const margin = item.sellPrice > 0 ? Math.round(((item.sellPrice - item.costPrice) / item.sellPrice) * 100) : 0;
                  return (
                    <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                            {item.category}
                          </span>
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Cost: {formatZAR(item.costPrice)} • Sell: <strong className="text-slate-800 dark:text-slate-200">{formatZAR(item.sellPrice)}</strong> • Margin: <span className="text-emerald-600 font-semibold">{margin}%</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => deleteItem('catalogue', item.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: COMPANY SETTINGS, GOOGLE SHEETS SYNC & JSON BACKUP */}
      {activeTab === 'company' && (
        <div className="space-y-6">
          {/* Google Sheets Cloud Sync Panel */}
          <Card className="p-6 border-l-4 border-l-cyan-500 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cloud size={18} className="text-cyan-600" /> Google Sheets Live Cloud Sync (Free)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Paste your Google Apps Script Web App URL to sync clients, quotes, invoices, and jobs across all phones and laptops.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 self-start">
                Status: {sheetsUrl ? (syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'error' ? 'Sync Error' : 'Connected') : 'Local Storage Only'}
              </span>
            </div>

            <form onSubmit={handleConnectSheets} className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={sheetsUrlInput}
                onChange={(e) => setSheetsUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
              <Button type="submit" variant="primary" icon={Cloud}>
                Connect & Sync
              </Button>
            </form>

            {sheetsUrl && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
                <span>{lastSyncedAt ? `Last synced: ${lastSyncedAt}` : 'Connected to Google Sheets'}</span>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="secondary" icon={RefreshCw} onClick={() => onSyncNow(sheetsUrl)}>
                    Pull Latest from Sheet
                  </Button>
                  <Button type="button" size="sm" variant="secondary" icon={Upload} onClick={() => onForcePushToSheets(sheetsUrl)}>
                    Push Local Data to Sheet
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-bold text-slate-900 dark:text-white mb-4">Company Details & Defaults</h2>
            <form onSubmit={handleSaveCompanySettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  value={companyForm.companyName}
                  onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                />
                <Input
                  label="VAT Number"
                  value={companyForm.vatNumber}
                  onChange={(e) => setCompanyForm({ ...companyForm, vatNumber: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Phone"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                />
                <Input
                  label="Email"
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                />
                <Input
                  label="VAT Rate (%)"
                  type="number"
                  value={companyForm.vatRate}
                  onChange={(e) => setCompanyForm({ ...companyForm, vatRate: Number(e.target.value) })}
                />
              </div>
              <Input
                label="Physical Address"
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Banking Details (Shown on Invoices)</label>
                  <textarea
                    rows={4}
                    value={companyForm.bankingDetails}
                    onChange={(e) => setCompanyForm({ ...companyForm, bankingDetails: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Default Quote/Invoice Terms</label>
                  <textarea
                    rows={4}
                    value={companyForm.defaultTerms}
                    onChange={(e) => setCompanyForm({ ...companyForm, defaultTerms: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Field Technicians</label>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    placeholder="Technician name..."
                    value={newTechName}
                    onChange={(e) => setNewTechName(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (!newTechName.trim()) return;
                      setCompanyForm({ ...companyForm, technicians: [...companyForm.technicians, newTechName.trim()] });
                      setNewTechName('');
                    }}
                  >
                    Add Tech
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {companyForm.technicians.map(tech => (
                    <span key={tech} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                      {tech}
                      <button
                        type="button"
                        onClick={() => setCompanyForm({ ...companyForm, technicians: companyForm.technicians.filter(t => t !== tech) })}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary">Save Settings</Button>
              </div>
            </form>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Data Backup & Sample Data</h2>
            <p className="text-xs text-slate-500">
              Export all clients, units, quotes, invoices, jobs, and notices to a JSON backup file, or restore from a previous backup.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" icon={Download} onClick={handleExportJSON}>
                Export JSON Backup
              </Button>
              <label className="inline-flex items-center justify-center font-semibold rounded-lg px-4 py-2.5 text-sm gap-2 min-h-[42px] bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700 cursor-pointer">
                <Upload size={18} /> Import JSON Backup
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
              <Button variant="danger" icon={RotateCcw} onClick={onResetSampleData}>
                Reset Sample Data
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN APP SHELL (Responsive Sidebar + Bottom Mobile Nav + Google Sheets Sync)
// ============================================================================

export default function App() {
  const [data, setData] = useState(() => StorageService.loadLocal());
  const [sheetsUrl, setSheetsUrl] = useState(() => StorageService.getSheetsUrl());
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'
  const [lastSyncedAt, setLastSyncedAt] = useState('');
  const [route, setRoute] = useState({ view: 'dashboard', params: {} });
  const [darkMode, setDarkMode] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const skipNextPushRef = useRef(false);
  const pushTimeoutRef = useRef(null);

  const syncFromCloud = useCallback(async (targetUrl) => {
    const activeUrl = targetUrl !== undefined ? targetUrl : sheetsUrl;
    if (!activeUrl) return;
    setSyncStatus('syncing');
    try {
      const result = await StorageService.pullFromGoogleSheets(activeUrl);
      if (result && result.empty) {
        // First-time connection to an empty sheet: seed it with our current local data
        await StorageService.pushToGoogleSheets(activeUrl, data);
      } else if (result) {
        skipNextPushRef.current = true;
        StorageService.saveLocal(result);
        setData(result);
      }
      setSyncStatus('synced');
      setLastSyncedAt(new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Google Sheets pull failed:', err);
      setSyncStatus('error');
    }
  }, [sheetsUrl, data]);

  const forcePushToSheets = useCallback(async (targetUrl) => {
    const activeUrl = targetUrl || sheetsUrl;
    if (!activeUrl) return;
    setSyncStatus('syncing');
    try {
      await StorageService.pushToGoogleSheets(activeUrl, data);
      setSyncStatus('synced');
      setLastSyncedAt(new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Google Sheets push failed:', err);
      setSyncStatus('error');
    }
  }, [sheetsUrl, data]);

  // Initial cloud sync on app boot if Google Sheets URL is configured
  useEffect(() => {
    if (sheetsUrl) {
      syncFromCloud(sheetsUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage immediately & debounce push to Google Sheets whenever data changes
  useEffect(() => {
    StorageService.saveLocal(data);

    if (skipNextPushRef.current) {
      skipNextPushRef.current = false;
      return;
    }

    if (!sheetsUrl) return;

    if (pushTimeoutRef.current) {
      clearTimeout(pushTimeoutRef.current);
    }

    setSyncStatus('syncing');
    pushTimeoutRef.current = setTimeout(async () => {
      try {
        await StorageService.pushToGoogleSheets(sheetsUrl, data);
        setSyncStatus('synced');
        setLastSyncedAt(new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.error('Google Sheets background sync error:', err);
        setSyncStatus('error');
      }
    }, 800);

    return () => {
      if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
    };
  }, [data, sheetsUrl]);

  // Apply dark class to document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [darkMode]);

  const handleUpdateSheetsUrl = (newUrl) => {
    StorageService.setSheetsUrl(newUrl);
    setSheetsUrl(newUrl);
    if (!newUrl) {
      setSyncStatus('idle');
      setLastSyncedAt('');
    }
  };

  const navigate = (view, params = {}) => {
    setRoute({ view, params });
    setGlobalSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateCollection = (collectionName, item) => {
    setData(prev => {
      const list = Array.isArray(prev[collectionName]) ? prev[collectionName] : [];
      const exists = list.some(x => x.id === item.id);
      const updated = exists ? list.map(x => (x.id === item.id ? item : x)) : [item, ...list];
      return { ...prev, [collectionName]: updated };
    });
  };

  const deleteItem = (collectionName, id) => {
    setData(prev => {
      const list = Array.isArray(prev[collectionName]) ? prev[collectionName] : [];
      return { ...prev, [collectionName]: list.filter(x => x.id !== id) };
    });
  };

  const handleQuickMarkInvoicePaid = (invoiceId) => {
    const today = getTodayISO();
    setData(prev => ({
      ...prev,
      invoices: prev.invoices.map(inv => {
        if (inv.id !== invoiceId) return inv;
        const total = Number(inv.total) || 0;
        return {
          ...inv,
          status: 'Paid',
          amountPaid: total,
          balance: 0,
          paymentDate: today,
          payments: [
            ...(inv.payments || []),
            { id: generateId('pay'), date: today, amount: total, method: 'Marked Paid' }
          ]
        };
      })
    }));
  };

  const handleQuickMarkSent = (type, id) => {
    const collectionName = type === 'invoice' ? 'invoices' : 'quotes';
    setData(prev => ({
      ...prev,
      [collectionName]: prev[collectionName].map(doc =>
        doc.id === id ? { ...doc, status: 'Sent' } : doc
      )
    }));
  };

  const handleResetSampleData = () => {
    const fresh = StorageService.resetLocal();
    setData(fresh);
    navigate('dashboard');
  };

  const globalResults = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return null;
    return {
      clients: data.clients.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.address && c.address.toLowerCase().includes(q))
      ).slice(0, 4),
      quotes: data.quotes.filter(quo => quo.number.toLowerCase().includes(q)).slice(0, 3),
      invoices: data.invoices.filter(inv => inv.number.toLowerCase().includes(q)).slice(0, 3)
    };
  }, [globalSearch, data]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'jobs', label: 'Jobs', icon: CalendarIcon },
    { id: 'notices', label: 'Notices', icon: Megaphone },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderActiveView = () => {
    switch (route.view) {
      case 'dashboard':
        return (
          <DashboardView
            data={data}
            navigate={navigate}
            onQuickMarkInvoicePaid={handleQuickMarkInvoicePaid}
            onQuickMarkQuoteSent={(id) => handleQuickMarkSent('quote', id)}
          />
        );
      case 'clients':
        return <ClientsList data={data} navigate={navigate} />;
      case 'client_detail':
        return <ClientDetail params={route.params} data={data} navigate={navigate} updateCollection={updateCollection} />;
      case 'client_form':
        return <ClientForm params={route.params} data={data} updateCollection={updateCollection} navigate={navigate} />;
      case 'unit_form':
        return <UnitForm params={route.params} data={data} updateCollection={updateCollection} navigate={navigate} />;
      case 'quotes':
        return (
          <DocumentList
            type="quote"
            data={data}
            navigate={navigate}
            onQuickMarkInvoicePaid={handleQuickMarkInvoicePaid}
            onQuickMarkSent={handleQuickMarkSent}
          />
        );
      case 'quote_form':
        return <DocumentForm type="quote" params={route.params} data={data} updateCollection={updateCollection} navigate={navigate} />;
      case 'quote_detail':
        return (
          <DocumentDetail
            type="quote"
            params={route.params}
            data={data}
            updateCollection={updateCollection}
            navigate={navigate}
            onQuickMarkInvoicePaid={handleQuickMarkInvoicePaid}
            onQuickMarkSent={handleQuickMarkSent}
          />
        );
      case 'invoices':
        return (
          <DocumentList
            type="invoice"
            data={data}
            navigate={navigate}
            onQuickMarkInvoicePaid={handleQuickMarkInvoicePaid}
            onQuickMarkSent={handleQuickMarkSent}
          />
        );
      case 'invoice_form':
        return <DocumentForm type="invoice" params={route.params} data={data} updateCollection={updateCollection} navigate={navigate} />;
      case 'invoice_detail':
        return (
          <DocumentDetail
            type="invoice"
            params={route.params}
            data={data}
            updateCollection={updateCollection}
            navigate={navigate}
            onQuickMarkInvoicePaid={handleQuickMarkInvoicePaid}
            onQuickMarkSent={handleQuickMarkSent}
          />
        );
      case 'jobs':
        return <JobsView data={data} navigate={navigate} />;
      case 'job_form':
        return <JobForm params={route.params} data={data} updateCollection={updateCollection} navigate={navigate} />;
      case 'job_detail':
        return <JobDetail params={route.params} data={data} updateCollection={updateCollection} navigate={navigate} />;
      case 'notices':
        return <NoticesView data={data} updateCollection={updateCollection} deleteItem={deleteItem} />;
      case 'settings':
        return (
          <SettingsView
            data={data}
            setData={setData}
            updateCollection={updateCollection}
            deleteItem={deleteItem}
            onResetSampleData={handleResetSampleData}
            sheetsUrl={sheetsUrl}
            onUpdateSheetsUrl={handleUpdateSheetsUrl}
            syncStatus={syncStatus}
            lastSyncedAt={lastSyncedAt}
            onSyncNow={syncFromCloud}
            onForcePushToSheets={forcePushToSheets}
          />
        );
      default:
        return (
          <DashboardView
            data={data}
            navigate={navigate}
            onQuickMarkInvoicePaid={handleQuickMarkInvoicePaid}
            onQuickMarkQuoteSent={(id) => handleQuickMarkSent('quote', id)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-slate-900 text-white border-r border-slate-800 print:hidden">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-extrabold text-lg">
              LC
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight leading-tight">Legacy Cooling</h1>
              <p className="text-[11px] text-cyan-400 font-medium">Durban Field Service</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive =
              route.view === item.id ||
              (item.id === 'clients' && ['client_detail', 'client_form', 'unit_form'].includes(route.view)) ||
              (item.id === 'quotes' && ['quote_detail', 'quote_form'].includes(route.view)) ||
              (item.id === 'invoices' && ['invoice_detail', 'invoice_form'].includes(route.view)) ||
              (item.id === 'jobs' && ['job_detail', 'job_form'].includes(route.view));

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
          >
            {darkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-cyan-400" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen pb-20 md:pb-8">
        {/* TOP HEADER, GLOBAL SEARCH & CLOUD SYNC INDICATOR */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3 print:hidden">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            {/* Mobile Brand */}
            <div className="flex items-center gap-2 md:hidden shrink-0" onClick={() => navigate('dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-cyan-600 text-white flex items-center justify-center font-extrabold text-sm">
                LC
              </div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white hidden sm:inline">Legacy Cooling</span>
            </div>

            {/* Global Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Global search: client, address, QUO-..., INV-..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-950 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />

              {globalResults && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-2 space-y-2 max-h-80 overflow-y-auto">
                  {globalResults.clients.length === 0 &&
                  globalResults.quotes.length === 0 &&
                  globalResults.invoices.length === 0 ? (
                    <p className="p-3 text-xs text-slate-500 text-center">No matching records found.</p>
                  ) : (
                    <>
                      {globalResults.clients.map(c => (
                        <button
                          key={c.id}
                          onClick={() => navigate('client_detail', { id: c.id })}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                        >
                          <span className="font-bold text-cyan-600 mr-2">CLIENT</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{c.name}</span>
                          <span className="text-slate-500 ml-2">{c.address}</span>
                        </button>
                      ))}
                      {globalResults.quotes.map(q => (
                        <button
                          key={q.id}
                          onClick={() => navigate('quote_detail', { id: q.id })}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                        >
                          <span className="font-bold text-amber-600 mr-2">QUOTE</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{q.number}</span>
                          <span className="text-slate-500 ml-2">{formatZAR(q.total)}</span>
                        </button>
                      ))}
                      {globalResults.invoices.map(i => (
                        <button
                          key={i.id}
                          onClick={() => navigate('invoice_detail', { id: i.id })}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                        >
                          <span className="font-bold text-emerald-600 mr-2">INVOICE</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{i.number}</span>
                          <span className="text-slate-500 ml-2">{formatZAR(i.total)}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right Controls: Google Sheets Sync Status + Theme Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              {sheetsUrl ? (
                <button
                  type="button"
                  onClick={() => syncFromCloud(sheetsUrl)}
                  title={lastSyncedAt ? `Last synced at ${lastSyncedAt}. Click to refresh from Google Sheets.` : 'Click to sync with Google Sheets'}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    syncStatus === 'error'
                      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900'
                  }`}
                >
                  <RefreshCw size={13} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                  <span className="hidden sm:inline">
                    {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'error' ? 'Sync Retry' : 'Sheet Synced'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('settings')}
                  title="Local device storage only. Click to connect Google Sheets in Settings."
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-cyan-600"
                >
                  <CloudOff size={13} />
                  <span>Local Only</span>
                </button>
              )}

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
          {renderActiveView()}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900 text-white border-t border-slate-800 grid grid-cols-7 py-1.5 px-1 print:hidden">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive =
            route.view === item.id ||
            (item.id === 'clients' && ['client_detail', 'client_form', 'unit_form'].includes(route.view)) ||
            (item.id === 'quotes' && ['quote_detail', 'quote_form'].includes(route.view)) ||
            (item.id === 'invoices' && ['invoice_detail', 'invoice_form'].includes(route.view)) ||
            (item.id === 'jobs' && ['job_detail', 'job_form'].includes(route.view));

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-medium ${
                isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span className="mt-0.5 truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}