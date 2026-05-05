import { 
  Heart, 
  Droplets, 
  Moon, 
  Footprints, 
  Activity, 
  Pill, 
  AlertTriangle, 
  CheckCircle2,
  TrendingUp,
  User,
  Settings,
  Bell,
  Home,
  LogOut,
  Plus,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  Trash2,
  Download,
  Flame,
  Calendar,
  Sun
} from 'lucide-react';

export const ICONS = {
  Home,
  Heart,
  Droplets,
  Moon,
  Footprints,
  Activity,
  Pill,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  User,
  Settings,
  Bell,
  LogOut,
  Plus,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  Trash2,
  Download,
  Flame,
  Calendar,
  Sun
};

export const HEALTH_CATEGORIES = {
  EXCELLENT: { label: 'Excellent', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10', icon: '✅' },
  AVERAGE: { label: 'Average', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10', icon: '⚠️' },
  POOR: { label: 'Poor', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', icon: '🚨' },
};

export const ROUTES = [
  { name: 'Dashboard', icon: Home, path: '/' },
  { name: 'Vitals', icon: Activity, path: '/vitals' },
  { name: 'Lifestyle', icon: TrendingUp, path: '/lifestyle' },
  { name: 'Medications', icon: Pill, path: '/medications' },
  { name: 'History', icon: Calendar, path: '/history' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];
