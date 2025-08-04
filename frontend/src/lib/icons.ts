/**
 * Icon utilities and constants for react-icons
 * Provides consistent icon usage throughout the application
 * 
 * Based on react-icons library: https://react-icons.github.io/react-icons/
 */

// Core Hotel Management Icons - Feather Icons
export {
  // Navigation & UI
  FiHome,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiChevronRight,
  FiMoreHorizontal,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiPrinter,
  FiShare2,
  FiExternalLink,
  
  // Hotel Operations
  FiCalendar,
  FiClock,
  FiMapPin,
  FiKey,
  FiWifi,
  FiCoffee,
  FiShield,
  FiTruck,
  
  // User & Account
  FiUser,
  FiUsers,
  FiUserPlus,
  FiUserMinus,
  FiUserCheck,
  FiSettings,
  FiLogIn,
  FiLogOut,
  FiLock,
  FiUnlock,
  
  // Communication
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiSend,
  FiBell,
  FiBellOff,
  
  // Financial
  FiDollarSign,
  FiCreditCard,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiBarChart,
  
  // Actions
  FiPlus,
  FiMinus,
  FiEdit,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
  FiHelpCircle,
  
  // File & Data
  FiFile,
  FiFileText,
  FiFolder,
  FiImage,
  FiPaperclip,
  FiDatabase,
  FiHardDrive,
  
  // Status & Indicators
  FiCircle,
  FiXCircle,
  FiLoader,
  FiActivity,
  FiZap,
  FiStar,
  FiHeart,
  
} from 'react-icons/fi' // Feather Icons - Clean and modern

// Material Design Icons for specific hotel features
export {
  // Hotel Specific
  MdHotel,
  MdRoom,
  MdRoomService,
  MdLocalLaundryService,
  MdRestaurant,
  MdPool,
  MdFitnessCenter,
  MdSpa,
  MdBusinessCenter,
  MdLocalParking,
  MdAirportShuttle,
  
  // Amenities
  MdTv,
  MdLocalBar,
  MdKitchen,
  MdBalcony,
  MdBathtub,
  MdShower,
  MdIron,
  
  // Services
  MdDeliveryDining,
  MdLocalTaxi,
  MdDirectionsCar,
  
} from 'react-icons/md' // Material Design Icons

// Bootstrap Icons for additional UI elements
export {
  BsBuilding,
  BsBuildings,
  BsKey,
  BsKeyFill,
  BsPerson,
  BsPersonFill,
  BsPeople,
  BsPeopleFill,
  BsCalendar,
  BsCalendarCheck,
  BsCalendarEvent,
  BsClock,
  BsClockFill,
  BsCreditCard,
  BsCash,
  BsReceipt,
  BsGraphUp,
  BsGraphDown,
  BsPieChart,
  BsBarChart,
  BsGear,
  BsGearFill,
  BsBell,
  BsBellFill,
  BsEnvelope,
  BsEnvelopeFill,
  BsTelephone,
  BsTelephoneFill,
  BsWifi,
  BsShield,
  BsShieldCheck,
  BsShieldFill,
  BsShieldFillCheck,
} from 'react-icons/bs' // Bootstrap Icons

// Lucide Icons (already in use, keeping for consistency)
export {
  CalendarIcon,
  CheckIcon,
  TypeIcon,
  UserIcon,
  SettingsIcon,
  BellIcon,
  SearchIcon,
  MenuIcon,
  HomeIcon,
  BuildingIcon,
  KeyIcon,
  UsersIcon,
  CreditCardIcon,
  MailIcon,
  PhoneIcon,
  WifiIcon,
  CarIcon,
  CoffeeIcon,
  ShieldIcon,
  TruckIcon,
} from 'lucide-react'

/**
 * Icon size constants for consistent sizing
 */
export const iconSizes = {
  xs: 12,    // 12px
  sm: 16,    // 16px  
  md: 20,    // 20px (default)
  lg: 24,    // 24px
  xl: 32,    // 32px
  '2xl': 40, // 40px
  '3xl': 48, // 48px
} as const

/**
 * Icon color classes for consistent theming
 */
export const iconColors = {
  primary: 'text-primary',
  secondary: 'text-secondary', 
  muted: 'text-muted-foreground',
  destructive: 'text-destructive',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
  white: 'text-white',
  black: 'text-black',
  gray: 'text-gray-500',
} as const

/**
 * Get icon size in pixels
 */
export function getIconSize(size: keyof typeof iconSizes = 'md'): number {
  return iconSizes[size]
}

/**
 * Get icon color class
 */
export function getIconColor(color: keyof typeof iconColors = 'primary'): string {
  return iconColors[color]
}

/**
 * Common icon props for consistent styling
 */
export function getIconProps(
  size: keyof typeof iconSizes = 'md',
  color: keyof typeof iconColors = 'primary',
  className?: string
) {
  return {
    size: getIconSize(size),
    className: `${getIconColor(color)} ${className || ''}`.trim(),
  }
}