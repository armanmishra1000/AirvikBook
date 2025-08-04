# AirVikBook Component Library

## 🎨 Pre-Built Brand Components

### Overview
This library provides ready-to-use component patterns that strictly follow AirVikBook brand guidelines. Copy these patterns directly into your implementations.

## 🔘 Buttons

### Primary Button
```typescript
// Usage: Main actions like "Book Now", "Confirm", "Save"
export const PrimaryButton = ({ children, onClick, disabled, loading, size = 'md' }) => {
  const sizes = {
    sm: 'px-space-4 py-space-2 text-sm',
    md: 'px-space-6 py-space-3 text-button',
    lg: 'px-space-8 py-space-4 text-base'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        // Base
        "relative inline-flex items-center justify-center",
        "font-primary font-medium uppercase tracking-wider",
        "rounded-radius-md",
        "transition-all duration-normal ease-out",
        
        // Size
        sizes[size],
        
        // Colors
        "bg-airvik-blue text-airvik-white",
        "hover:bg-airvik-purple hover:shadow-md hover:-translate-y-0.5",
        "active:translate-y-0 active:shadow-sm",
        
        // States
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-airvik-blue focus-visible:ring-offset-2"
      )}
    >
      {loading && (
        <Loader className="absolute left-space-3 animate-spin" size={16} />
      )}
      <span className={loading ? "ml-space-6" : ""}>{children}</span>
    </button>
  )
}
```

### Secondary Button
```typescript
// Usage: Secondary actions like "Cancel", "Back", "View Details"
export const SecondaryButton = ({ children, onClick, disabled, size = 'md' }) => {
  const sizes = {
    sm: 'px-space-4 py-space-2 text-sm',
    md: 'px-space-6 py-space-3 text-button',
    lg: 'px-space-8 py-space-4 text-base'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base
        "relative inline-flex items-center justify-center",
        "font-primary font-medium uppercase tracking-wider",
        "rounded-radius-md",
        "transition-all duration-normal ease-out",
        "border-2",
        
        // Size
        sizes[size],
        
        // Colors
        "bg-transparent border-airvik-blue text-airvik-blue",
        "hover:bg-airvik-blue hover:text-airvik-white hover:shadow-md",
        "dark:border-airvik-cyan dark:text-airvik-cyan",
        "dark:hover:bg-airvik-cyan dark:hover:text-airvik-midnight",
        
        // States
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-airvik-blue focus-visible:ring-offset-2"
      )}
    >
      {children}
    </button>
  )
}
```

### Ghost Button
```typescript
// Usage: Tertiary actions, icon buttons
export const GhostButton = ({ children, onClick, disabled, size = 'md' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base
        "relative inline-flex items-center justify-center",
        "font-primary font-medium",
        "rounded-radius-md",
        "transition-all duration-normal ease-out",
        
        // Padding based on size
        size === 'sm' && "p-space-2",
        size === 'md' && "p-space-3",
        size === 'lg' && "p-space-4",
        
        // Colors
        "bg-transparent text-gray-700 dark:text-gray-300",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "hover:text-airvik-blue dark:hover:text-airvik-cyan",
        
        // States
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-airvik-blue focus-visible:ring-offset-2"
      )}
    >
      {children}
    </button>
  )
}
```

### Gradient Button
```typescript
// Usage: Special CTAs, premium features
export const GradientButton = ({ children, onClick, disabled, loading }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        // Base
        "relative inline-flex items-center justify-center",
        "px-space-8 py-space-4",
        "font-primary font-semibold text-button uppercase tracking-wider",
        "rounded-radius-lg",
        "transition-all duration-normal ease-out",
        "overflow-hidden",
        
        // Gradient Background
        "bg-gradient-mid text-airvik-white",
        "hover:shadow-lg hover:-translate-y-0.5",
        "active:translate-y-0 active:shadow-md",
        
        // Glow Effect
        "hover:shadow-glow-primary",
        
        // States
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-airvik-purple focus-visible:ring-offset-2"
      )}
    >
      {/* Shimmer Effect */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] hover:translate-x-[200%] transition-transform duration-slower" />
      
      <span className="relative flex items-center gap-space-2">
        {loading && <Loader className="animate-spin" size={16} />}
        {children}
      </span>
    </button>
  )
}
```

## 📇 Cards

### Room Card
```typescript
export const RoomCard = ({ room, onBook, onViewDetails }) => {
  const statusColors = {
    available: 'bg-status-available/10 text-status-available border-status-available',
    occupied: 'bg-status-occupied/10 text-status-occupied border-status-occupied',
    maintenance: 'bg-status-maintenance/10 text-status-maintenance border-status-maintenance',
    unavailable: 'bg-status-unavailable/10 text-status-unavailable border-status-unavailable'
  }
  
  return (
    <div className={cn(
      // Base
      "group relative overflow-hidden",
      "bg-airvik-white dark:bg-gray-900",
      "rounded-radius-lg",
      "shadow-sm hover:shadow-lg",
      "transition-all duration-normal",
      "hover:-translate-y-1",
      "border border-gray-200 dark:border-gray-800"
    )}>
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={room.image} 
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-slower group-hover:scale-110"
        />
        
        {/* Status Badge */}
        <div className={cn(
          "absolute top-space-3 right-space-3",
          "px-space-3 py-space-1 rounded-radius-full",
          "text-caption font-medium border",
          statusColors[room.status]
        )}>
          {room.status}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-space-6">
        {/* Header */}
        <div className="mb-space-4">
          <h3 className="text-h4 text-airvik-black dark:text-airvik-white mb-space-2">
            {room.name}
          </h3>
          <p className="text-body-sm text-gray-600 dark:text-gray-400">
            {room.type} • {room.capacity} Guests
          </p>
        </div>
        
        {/* Amenities */}
        <div className="flex flex-wrap gap-space-2 mb-space-4">
          {room.amenities.slice(0, 3).map(amenity => (
            <span
              key={amenity}
              className="inline-flex items-center gap-space-1 px-space-2 py-space-1 bg-gray-100 dark:bg-gray-800 rounded-radius-sm text-caption text-gray-700 dark:text-gray-300"
            >
              <FiCheck size={12} />
              {amenity}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="text-caption text-gray-500">
              +{room.amenities.length - 3} more
            </span>
          )}
        </div>
        
        {/* Price */}
        <div className="flex items-baseline gap-space-2 mb-space-6">
          <span className="text-h3 font-bold text-airvik-black dark:text-airvik-white">
            ${room.price}
          </span>
          <span className="text-body-sm text-gray-500">
            per night
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex gap-space-3">
          <PrimaryButton 
            onClick={() => onBook(room)}
            disabled={room.status !== 'available'}
            size="sm"
            className="flex-1"
          >
            Book Now
          </PrimaryButton>
          <SecondaryButton
            onClick={() => onViewDetails(room)}
            size="sm"
          >
            Details
          </SecondaryButton>
        </div>
      </div>
    </div>
  )
}
```

### Booking Summary Card
```typescript
export const BookingSummaryCard = ({ booking }) => {
  return (
    <div className={cn(
      // Base
      "bg-gradient-to-br from-airvik-midnight to-airvik-purple",
      "rounded-radius-xl p-space-8",
      "shadow-xl",
      "text-airvik-white",
      "relative overflow-hidden"
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-airvik-cyan rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-airvik-violet rounded-full blur-3xl" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-space-6">
          <div>
            <h3 className="text-h3 font-bold mb-space-2">
              Booking Confirmation
            </h3>
            <p className="text-body-sm opacity-80">
              Reference: {booking.reference}
            </p>
          </div>
          <div className="text-right">
            <p className="text-caption opacity-60">Total Amount</p>
            <p className="text-h2 font-bold">
              ${booking.totalAmount}
            </p>
          </div>
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-space-6 mb-space-6">
          <div>
            <p className="text-caption opacity-60 mb-space-1">Check-in</p>
            <p className="text-body font-medium">
              {formatDate(booking.checkIn)}
            </p>
          </div>
          <div>
            <p className="text-caption opacity-60 mb-space-1">Check-out</p>
            <p className="text-body font-medium">
              {formatDate(booking.checkOut)}
            </p>
          </div>
          <div>
            <p className="text-caption opacity-60 mb-space-1">Room</p>
            <p className="text-body font-medium">
              {booking.roomName}
            </p>
          </div>
          <div>
            <p className="text-caption opacity-60 mb-space-1">Guests</p>
            <p className="text-body font-medium">
              {booking.guestCount} Adults
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-space-3">
          <button className={cn(
            "flex-1 px-space-4 py-space-3",
            "bg-airvik-white/20 backdrop-blur",
            "hover:bg-airvik-white/30",
            "rounded-radius-md",
            "text-button font-medium",
            "transition-all duration-normal"
          )}>
            View Details
          </button>
          <button className={cn(
            "flex-1 px-space-4 py-space-3",
            "bg-airvik-cyan text-airvik-midnight",
            "hover:bg-airvik-white",
            "rounded-radius-md",
            "text-button font-medium",
            "transition-all duration-normal"
          )}>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  )
}
```

## 📝 Forms

### Input Field
```typescript
export const Input = React.forwardRef(({ 
  label, 
  error, 
  required, 
  icon: Icon,
  ...props 
}, ref) => {
  return (
    <div className="space-y-space-2">
      {label && (
        <label className={cn(
          "text-label text-gray-700 dark:text-gray-300",
          "flex items-center gap-space-1"
        )}>
          {label}
          {required && <span className="text-error">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-space-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        )}
        
        <input
          ref={ref}
          className={cn(
            // Base
            "w-full",
            "text-body",
            "rounded-radius-md",
            "transition-all duration-fast",
            
            // Padding
            Icon ? "pl-space-10 pr-space-4" : "px-space-4",
            "py-space-3",
            
            // Colors
            "bg-airvik-white dark:bg-gray-900",
            "text-airvik-black dark:text-airvik-white",
            "placeholder:text-gray-400 dark:placeholder:text-gray-600",
            
            // Border
            "border-2",
            error 
              ? "border-error focus:border-error" 
              : "border-gray-300 dark:border-gray-700 focus:border-airvik-blue dark:focus:border-airvik-cyan",
            
            // Focus
            "focus:outline-none focus:ring-2",
            error
              ? "focus:ring-error/20"
              : "focus:ring-airvik-blue/20 dark:focus:ring-airvik-cyan/20",
            
            // Disabled
            "disabled:bg-gray-100 dark:disabled:bg-gray-800",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-caption text-error flex items-center gap-space-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
})
```

### Select Field
```typescript
export const Select = React.forwardRef(({ 
  label, 
  error, 
  required,
  options,
  placeholder = "Select an option",
  ...props 
}, ref) => {
  return (
    <div className="space-y-space-2">
      {label && (
        <label className={cn(
          "text-label text-gray-700 dark:text-gray-300",
          "flex items-center gap-space-1"
        )}>
          {label}
          {required && <span className="text-error">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            // Base
            "w-full appearance-none",
            "text-body",
            "rounded-radius-md",
            "transition-all duration-fast",
            
            // Padding
            "px-space-4 py-space-3 pr-space-10",
            
            // Colors
            "bg-airvik-white dark:bg-gray-900",
            "text-airvik-black dark:text-airvik-white",
            
            // Border
            "border-2",
            error 
              ? "border-error focus:border-error" 
              : "border-gray-300 dark:border-gray-700 focus:border-airvik-blue dark:focus:border-airvik-cyan",
            
            // Focus
            "focus:outline-none focus:ring-2",
            error
              ? "focus:ring-error/20"
              : "focus:ring-airvik-blue/20 dark:focus:ring-airvik-cyan/20",
            
            // Disabled
            "disabled:bg-gray-100 dark:disabled:bg-gray-800",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Chevron Icon */}
        <ChevronDown 
          className="absolute right-space-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
          size={20} 
        />
      </div>
      
      {error && (
        <p className="text-caption text-error flex items-center gap-space-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
})
```

### Checkbox
```typescript
export const Checkbox = ({ label, checked, onChange, disabled }) => {
  return (
    <label className={cn(
      "flex items-center gap-space-3 cursor-pointer",
      disabled && "cursor-not-allowed opacity-60"
    )}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <div className={cn(
          // Base
          "w-5 h-5 rounded-radius-sm",
          "border-2 transition-all duration-fast",
          
          // Colors
          checked
            ? "bg-airvik-blue border-airvik-blue"
            : "bg-airvik-white dark:bg-gray-900 border-gray-300 dark:border-gray-700",
          
          // Hover
          !disabled && !checked && "hover:border-airvik-blue dark:hover:border-airvik-cyan",
          
          // Focus
          "peer-focus-visible:ring-2 peer-focus-visible:ring-airvik-blue/20"
        )}>
          {checked && (
            <Check 
              className="w-3 h-3 text-airvik-white absolute top-0.5 left-0.5" 
              strokeWidth={3}
            />
          )}
        </div>
      </div>
      
      {label && (
        <span className="text-body text-gray-700 dark:text-gray-300 select-none">
          {label}
        </span>
      )}
    </label>
  )
}
```

## 🔔 Notifications

### Toast
```typescript
export const Toast = ({ 
  type = 'info', 
  title, 
  message, 
  action,
  onClose 
}) => {
  const config = {
    success: {
      icon: CheckCircle,
      borderColor: 'border-l-success',
      iconColor: 'text-success'
    },
    error: {
      icon: XCircle,
      borderColor: 'border-l-error',
      iconColor: 'text-error'
    },
    warning: {
      icon: AlertTriangle,
      borderColor: 'border-l-warning',
      iconColor: 'text-warning'
    },
    info: {
      icon: Info,
      borderColor: 'border-l-airvik-blue',
      iconColor: 'text-airvik-blue'
    }
  }
  
  const { icon: Icon, borderColor, iconColor } = config[type]
  
  return (
    <div className={cn(
      // Base
      "min-w-[320px] max-w-[500px]",
      "bg-airvik-white dark:bg-gray-900",
      "rounded-radius-lg",
      "shadow-xl dark:shadow-2xl",
      "border-l-4",
      borderColor,
      
      // Animation
      "animate-slide-in-right",
      
      // Layout
      "p-space-4"
    )}>
      <div className="flex items-start gap-space-3">
        {/* Icon */}
        <Icon className={cn("mt-0.5 flex-shrink-0", iconColor)} size={20} />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-label font-medium text-airvik-black dark:text-airvik-white">
            {title}
          </h4>
          {message && (
            <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-space-1">
              {message}
            </p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-space-3 text-sm font-medium text-airvik-blue hover:text-airvik-purple transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={cn(
            "flex-shrink-0 p-space-1 rounded-radius-sm",
            "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "transition-all duration-fast"
          )}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
```

### Alert Banner
```typescript
export const AlertBanner = ({ type = 'info', title, children, dismissible }) => {
  const [isVisible, setIsVisible] = useState(true)
  
  const config = {
    success: {
      bg: 'bg-success/10 dark:bg-success/20',
      border: 'border-success/20',
      icon: CheckCircle,
      iconColor: 'text-success'
    },
    error: {
      bg: 'bg-error/10 dark:bg-error/20',
      border: 'border-error/20',
      icon: XCircle,
      iconColor: 'text-error'
    },
    warning: {
      bg: 'bg-warning/10 dark:bg-warning/20',
      border: 'border-warning/20',
      icon: AlertTriangle,
      iconColor: 'text-warning'
    },
    info: {
      bg: 'bg-airvik-blue/10 dark:bg-airvik-blue/20',
      border: 'border-airvik-blue/20',
      icon: Info,
      iconColor: 'text-airvik-blue'
    }
  }
  
  const { bg, border, icon: Icon, iconColor } = config[type]
  
  if (!isVisible) return null
  
  return (
    <div className={cn(
      // Base
      "relative",
      "rounded-radius-lg",
      "border",
      
      // Colors
      bg,
      border,
      
      // Layout
      "p-space-4"
    )}>
      <div className="flex gap-space-3">
        {/* Icon */}
        <Icon className={cn("flex-shrink-0 mt-0.5", iconColor)} size={20} />
        
        {/* Content */}
        <div className="flex-1">
          {title && (
            <h4 className="text-label font-medium text-airvik-black dark:text-airvik-white mb-space-1">
              {title}
            </h4>
          )}
          <div className="text-body-sm text-gray-700 dark:text-gray-300">
            {children}
          </div>
        </div>
        
        {/* Dismiss Button */}
        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className={cn(
              "flex-shrink-0 p-space-1 rounded-radius-sm",
              "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
              "hover:bg-gray-200/50 dark:hover:bg-gray-700/50",
              "transition-all duration-fast"
            )}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
```

## 🏷️ Badges & Tags

### Status Badge
```typescript
export const StatusBadge = ({ status, size = 'md' }) => {
  const sizes = {
    sm: 'px-space-2 py-0.5 text-xs',
    md: 'px-space-3 py-space-1 text-caption',
    lg: 'px-space-4 py-space-2 text-sm'
  }
  
  const variants = {
    available: {
      bg: 'bg-status-available/10',
      text: 'text-status-available',
      border: 'border-status-available/20'
    },
    occupied: {
      bg: 'bg-status-occupied/10',
      text: 'text-status-occupied', 
      border: 'border-status-occupied/20'
    },
    maintenance: {
      bg: 'bg-status-maintenance/10',
      text: 'text-status-maintenance',
      border: 'border-status-maintenance/20'
    },
    unavailable: {
      bg: 'bg-status-unavailable/10',
      text: 'text-status-unavailable',
      border: 'border-status-unavailable/20'
    }
  }
  
  const variant = variants[status] || variants.unavailable
  
  return (
    <span className={cn(
      // Base
      "inline-flex items-center",
      "font-medium",
      "rounded-radius-full",
      "border",
      
      // Size
      sizes[size],
      
      // Variant
      variant.bg,
      variant.text,
      variant.border
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-space-2" />
      {status}
    </span>
  )
}
```

### Amenity Tag
```typescript
export const AmenityTag = ({ icon: Icon, label, selected = false }) => {
  return (
    <span className={cn(
      // Base
      "inline-flex items-center gap-space-2",
      "px-space-3 py-space-2",
      "rounded-radius-md",
      "text-caption font-medium",
      "border transition-all duration-fast cursor-pointer",
      
      // Colors
      selected
        ? "bg-airvik-blue/10 text-airvik-blue border-airvik-blue/30"
        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-transparent",
      
      // Hover
      !selected && "hover:bg-gray-200 dark:hover:bg-gray-700"
    )}>
      <Icon size={14} />
      {label}
    </span>
  )
}
```

## 🖼️ Empty States

### No Data State
```typescript
export const EmptyState = ({ 
  icon: Icon = Inbox,
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-space-16 px-space-6 text-center">
      {/* Icon */}
      <div className={cn(
        "w-20 h-20 rounded-radius-full",
        "bg-gray-100 dark:bg-gray-800",
        "flex items-center justify-center",
        "mb-space-6"
      )}>
        <Icon className="text-gray-400" size={32} />
      </div>
      
      {/* Content */}
      <h3 className="text-h4 font-semibold text-gray-900 dark:text-gray-100 mb-space-2">
        {title}
      </h3>
      <p className="text-body text-gray-600 dark:text-gray-400 max-w-md mb-space-8">
        {description}
      </p>
      
      {/* Action */}
      {action && (
        <PrimaryButton onClick={action.onClick}>
          {action.label}
        </PrimaryButton>
      )}
    </div>
  )
}
```

## 🔄 Loading States

### Skeleton Loader
```typescript
export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse",
        "bg-gray-200 dark:bg-gray-800",
        "rounded-radius-md",
        className
      )}
      {...props}
    />
  )
}

// Room Card Skeleton
export const RoomCardSkeleton = () => {
  return (
    <div className="bg-airvik-white dark:bg-gray-900 rounded-radius-lg overflow-hidden">
      <Skeleton className="h-48 rounded-none" />
      <div className="p-space-6 space-y-space-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-space-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-8 w-24" />
        <div className="flex gap-space-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  )
}
```

### Spinner
```typescript
export const Spinner = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <div className={cn(sizes[size], className)}>
      <svg
        className="animate-spin text-airvik-blue"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}
```

## 🎭 Modals & Dialogs

### Modal
```typescript
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md',
  showClose = true
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-space-4'
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-airvik-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-space-4">
        <div className={cn(
          // Base
          "relative w-full",
          "bg-airvik-white dark:bg-gray-900",
          "rounded-radius-xl",
          "shadow-2xl",
          
          // Size
          sizes[size],
          
          // Animation
          "animate-modal-in"
        )}>
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-center justify-between p-space-6 border-b border-gray-200 dark:border-gray-800">
              {title && (
                <h2 className="text-h3 font-semibold text-airvik-black dark:text-airvik-white">
                  {title}
                </h2>
              )}
              {showClose && (
                <button
                  onClick={onClose}
                  className={cn(
                    "p-space-2 rounded-radius-md",
                    "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    "transition-all duration-fast"
                  )}
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-space-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
```

## 📊 Data Display

### Table
```typescript
export const Table = ({ columns, data, onRowClick }) => {
  return (
    <div className="w-full overflow-hidden rounded-radius-lg border border-gray-200 dark:border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-space-6 py-space-3",
                    "text-left text-label font-medium",
                    "text-gray-700 dark:text-gray-300",
                    "uppercase tracking-wider",
                    index === 0 && "rounded-tl-radius-lg",
                    index === columns.length - 1 && "rounded-tr-radius-lg"
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Body */}
          <tbody className="bg-airvik-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {data.map((row, rowIndex) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  onRowClick && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50",
                  "transition-colors duration-fast"
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-space-6 py-space-4 text-body text-gray-900 dark:text-gray-100"
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

## 🎯 Navigation

### Tab Navigation
```typescript
export const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <nav className="flex space-x-space-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              // Base
              "py-space-3 px-space-1",
              "text-body font-medium",
              "border-b-2 transition-all duration-fast",
              "focus:outline-none",
              
              // Active
              activeTab === tab.key
                ? "border-airvik-blue text-airvik-blue dark:border-airvik-cyan dark:text-airvik-cyan"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            <span className="flex items-center gap-space-2">
              {tab.icon && <tab.icon size={16} />}
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn(
                  "ml-space-2 px-space-2 py-0.5",
                  "text-xs rounded-radius-full",
                  activeTab === tab.key
                    ? "bg-airvik-blue/10 text-airvik-blue dark:bg-airvik-cyan/10 dark:text-airvik-cyan"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                )}>
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </nav>
    </div>
  )
}
```

### Breadcrumb
```typescript
export const Breadcrumb = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center space-x-space-2">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="text-gray-400 mx-space-2" size={16} />
            )}
            
            {item.href ? (
              <a
                href={item.href}
                className={cn(
                  "text-body text-gray-600 hover:text-airvik-blue",
                  "dark:text-gray-400 dark:hover:text-airvik-cyan",
                  "transition-colors duration-fast"
                )}
              >
                {item.label}
              </a>
            ) : (
              <span className="text-body text-gray-900 dark:text-gray-100 font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

## 🎨 Advanced Patterns

### Gradient Text
```typescript
export const GradientText = ({ children, className }) => {
  return (
    <span className={cn(
      "bg-gradient-mid bg-clip-text text-transparent",
      "font-bold",
      className
    )}>
      {children}
    </span>
  )
}
```

### Glow Card
```typescript
export const GlowCard = ({ children, color = 'primary' }) => {
  const glows = {
    primary: 'hover:shadow-glow-primary',
    blue: 'hover:shadow-glow-blue',
    cyan: 'hover:shadow-glow-cyan'
  }
  
  return (
    <div className={cn(
      // Base
      "relative p-space-6",
      "bg-airvik-white dark:bg-gray-900",
      "rounded-radius-xl",
      "transition-all duration-normal",
      
      // Border gradient
      "before:absolute before:inset-0",
      "before:rounded-radius-xl",
      "before:p-[2px]",
      "before:bg-gradient-mid",
      "before:-z-10",
      
      // Glow effect
      glows[color]
    )}>
      {children}
    </div>
  )
}
```

## 📋 Usage Guidelines

1. **Always use these components** instead of creating new ones
2. **Maintain consistency** by using the same patterns across features
3. **Follow the color system** - never use colors outside the brand palette
4. **Respect spacing** - use only the defined spacing tokens
5. **Include all states** - hover, focus, active, disabled
6. **Support dark mode** from the start
7. **Test responsiveness** on all breakpoints
8. **Ensure accessibility** - keyboard navigation and screen readers

## 🚀 Component Creation Workflow

When creating new components:

```typescript
// 1. Import brand utilities
import { cn } from '@/lib/utils'
import { brandTokens } from '@/lib/brand/tokens'

// 2. Define component with all variants
const variants = {
  primary: "...",
  secondary: "...",
  ghost: "..."
}

// 3. Include all states
const states = {
  hover: "hover:...",
  focus: "focus-visible:...",
  active: "active:...",
  disabled: "disabled:..."
}

// 4. Support dark mode
const darkMode = {
  light: "bg-white text-black",
  dark: "dark:bg-gray-900 dark:text-white"
}

// 5. Export with proper TypeScript types
export const Component: React.FC<ComponentProps> = ({ ... }) => {
  // Implementation
}
```