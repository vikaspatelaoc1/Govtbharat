import { saveColumnConfigsToFirestore } from '../services/firestoreService';

export interface SingleColumnConfig {
  id: string;
  title: string;
  hindiTitle?: string;
  icon: string;
  tagline?: string;
  badgeText?: string;
  enabled: boolean;
}

export type ColumnConfigsMap = Record<string, SingleColumnConfig>;

export const DEFAULT_COLUMN_CONFIGS: ColumnConfigsMap = {
  'results': {
    id: 'results',
    title: 'RESULTS',
    hindiTitle: 'परीक्षा परिणाम (Results)',
    icon: '🏆',
    tagline: 'Check Official Merit Lists & Cut-Off Marks',
    badgeText: 'LIVE',
    enabled: true
  },
  'admit-cards': {
    id: 'admit-cards',
    title: 'ADMIT CARD',
    hindiTitle: 'प्रवेश पत्र (Admit Card)',
    icon: '📄',
    tagline: 'Download Exam Hall Tickets & Call Letters',
    badgeText: 'ACTIVE',
    enabled: true
  },
  'latest-jobs': {
    id: 'latest-jobs',
    title: 'LATEST JOBS',
    hindiTitle: 'सरकारी नौकरियां (Latest Jobs)',
    icon: '⭐',
    tagline: 'Online Application Forms & Vacancy Alerts',
    badgeText: 'HOT',
    enabled: true
  },
  'answer-key': {
    id: 'answer-key',
    title: 'ANSWER KEY',
    hindiTitle: 'उत्तर कुंजी (Answer Key)',
    icon: '🔑',
    tagline: 'Official Exam Solution & Objection Links',
    badgeText: 'RELEASED',
    enabled: true
  },
  'syllabus': {
    id: 'syllabus',
    title: 'SYLLABUS',
    hindiTitle: 'परीक्षा पाठ्यक्रम (Syllabus)',
    icon: '📚',
    tagline: 'Exam Pattern, Syllabus & Previous Papers',
    badgeText: 'PDF',
    enabled: true
  },
  'admission': {
    id: 'admission',
    title: 'ADMISSION',
    hindiTitle: 'प्रवेश सूचना (Admission)',
    icon: '🎓',
    tagline: 'University, Board & College Admission Forms',
    badgeText: 'OPEN',
    enabled: true
  },
  'documents': {
    id: 'documents',
    title: 'CERTIFICATE & SERVICES',
    hindiTitle: 'प्रमाण पत्र एवं सेवाएं',
    icon: '📜',
    tagline: 'Certificate Verification, E-Services & Forms',
    badgeText: 'DESK',
    enabled: true
  },
  'important': {
    id: 'important',
    title: 'IMPORTANT',
    hindiTitle: 'महत्वपूर्ण (Important)',
    icon: '⚠️',
    tagline: 'Important Links & Registrations',
    badgeText: 'IMP',
    enabled: true
  }
};

export const loadColumnConfigs = (): ColumnConfigsMap => {
  if (typeof window === 'undefined') return DEFAULT_COLUMN_CONFIGS;
  try {
    const saved = localStorage.getItem('GovtBharat_column_configs');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_COLUMN_CONFIGS, ...parsed };
    }
  } catch (err) {
    console.error('Failed to load column configs:', err);
  }
  return DEFAULT_COLUMN_CONFIGS;
};

export const saveColumnConfigs = (configs: ColumnConfigsMap) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('GovtBharat_column_configs', JSON.stringify(configs));
    // Trigger custom event so all active components re-render immediately
    window.dispatchEvent(new CustomEvent('GovtBharat_columns_updated', { detail: configs }));
    
    // Asynchronously sync to Firestore database
    saveColumnConfigsToFirestore(configs).catch(err => {
      console.warn('Firestore column config sync error:', err);
    });
  } catch (err) {
    console.error('Failed to save column configs:', err);
  }
};
