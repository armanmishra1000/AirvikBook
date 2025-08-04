# React Icons Integration

## Overview
React Icons has been integrated into the AirVikBook Hotel Management System to provide a comprehensive icon system. This document outlines the implementation, usage patterns, and best practices for using icons throughout the application.

Based on [React Icons](https://react-icons.github.io/react-icons/) - a popular icon library that includes icons from multiple icon sets.

## Installation
React Icons is installed as a dependency in the frontend:
```bash
npm install react-icons --save
```

## Icon Libraries Included

### Primary Icon Sets
1. **Feather Icons (Fi)** - Clean, minimal icons for general UI
2. **Material Design Icons (Md)** - Hotel-specific amenities and services
3. **Bootstrap Icons (Bs)** - Additional UI elements and business icons
4. **Lucide React** - Already integrated, maintained for consistency

### Available Icon Sets
The library includes 40+ icon sets with 20,000+ icons:
- Ant Design Icons (831 icons)
- Bootstrap Icons (2716 icons)
- Feather (287 icons)
- Material Design (4341 icons)
- Lucide (1541 icons)
- Font Awesome 6 (2048 icons)
- And many more...

## Implementation

### Icon Utilities (`/src/lib/icons.ts`)
A comprehensive icon utility system has been created with:

#### Organized Icon Exports
```typescript
// Feather Icons - Primary UI icons
export { FiHome, FiBed, FiUsers, FiCalendar } from 'react-icons/fi'

// Material Design - Hotel-specific icons
export { MdHotel, MdRoomService, MdWifi } from 'react-icons/md'

// Bootstrap Icons - Additional UI elements
export { BsBuilding, BsPerson, BsCreditCard } from 'react-icons/bs'
```

#### Icon Constants and Utilities
```typescript
// Size constants
export const iconSizes = {
  xs: 12, sm: 16, md: 20, lg: 24, xl: 32, '2xl': 40, '3xl': 48
}

// Color classes
export const iconColors = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-green-600',
  // ... more colors
}

// Utility function
export function getIconProps(size = 'md', color = 'primary', className) {
  return {
    size: iconSizes[size],
    className: `${iconColors[color]} ${className || ''}`.trim()
  }
}
```

#### Contextual Icon Sets
```typescript
// Hotel-specific icon mappings
export const hotelIcons = {
  standardRoom: FiBed,
  suite: MdHotel,
  wifi: FiWifi,
  parking: MdLocalParking,
  // ... more mappings
}

// Navigation icons
export const navigationIcons = {
  dashboard: FiHome,
  rooms: FiBed,
  bookings: FiCalendar,
  // ... more navigation
}
```

## Usage Patterns

### 1. Basic Icon Usage
```typescript
import { FiHome, MdHotel } from "@/lib/icons"

// Basic usage
<FiHome size={20} className="text-primary" />

// With utility function
<MdHotel {...getIconProps('lg', 'success')} />
```

### 2. Contextual Icons
```typescript
import { hotelIcons, navigationIcons } from "@/lib/icons"

// Using contextual mappings
<hotelIcons.wifi {...getIconProps('md', 'info')} />
<navigationIcons.dashboard {...getIconProps('sm')} />
```

### 3. Icon Sets for Dynamic Content
```typescript
import { iconSets } from "@/lib/icons"

// Render amenities dynamically
{iconSets.roomAmenities.map((amenity, index) => (
  <div key={index} className="flex items-center gap-2">
    <amenity.icon {...getIconProps('sm', 'muted')} />
    <span>{amenity.label}</span>
  </div>
))}
```

### 4. Status Icons with Dynamic Rendering
```typescript
import { statusIcons } from "@/lib/icons"

// Dynamic status rendering
{React.createElement(statusIcons.success, getIconProps('sm', 'success'))}
```

## Icon Categories

### Navigation Icons
- Dashboard: `FiHome`
- Rooms: `FiBed`
- Bookings: `FiCalendar`
- Guests: `FiUsers`
- Payments: `FiCreditCard`
- Reports: `FiBarChart3`
- Settings: `FiSettings`

### Hotel Operations
- Room Types: `FiBed`, `MdHotel`, `BsBuilding`
- Amenities: `FiWifi`, `MdAc`, `MdTv`, `MdPool`
- Services: `MdRoomService`, `MdConciergeServices`, `MdLocalLaundryService`
- Status: `FiCheckCircle`, `FiAlertTriangle`, `FiXCircle`

### User Interface
- Actions: `FiPlus`, `FiEdit2`, `FiTrash2`, `FiSave`
- Communication: `FiMail`, `FiPhone`, `FiMessageSquare`
- Financial: `FiDollarSign`, `FiCreditCard`, `FiTrendingUp`

### Status Indicators
- Success: `FiCheckCircle` (green)
- Warning: `FiAlertTriangle` (yellow)
- Error: `FiXCircle` (red)
- Info: `FiInfo` (blue)
- Loading: `FiLoader`

## Sizing Guidelines

### Standard Sizes
- `xs` (12px) - Small indicators, badges
- `sm` (16px) - Form inputs, small buttons
- `md` (20px) - Default size, most UI elements
- `lg` (24px) - Navigation, prominent buttons
- `xl` (32px) - Large buttons, headers
- `2xl` (40px) - Hero sections, major features
- `3xl` (48px) - Landing pages, showcase

### Responsive Sizing
```typescript
// Responsive icon sizing
<FiHome 
  size={window.innerWidth > 768 ? 24 : 16} 
  className="text-primary" 
/>

// Using utility with responsive classes
<MdHotel {...getIconProps('lg', 'primary', 'md:w-8 md:h-8 w-6 h-6')} />
```

## Color System

### Semantic Colors
- `primary` - Main brand color
- `secondary` - Secondary brand color
- `success` - Green for positive states
- `warning` - Yellow for caution
- `destructive` - Red for errors/danger
- `info` - Blue for information
- `muted` - Gray for secondary content

### Usage Examples
```typescript
// Status-based coloring
<FiCheckCircle {...getIconProps('md', 'success')} /> // Available room
<FiAlertTriangle {...getIconProps('md', 'warning')} /> // Maintenance
<FiXCircle {...getIconProps('md', 'destructive')} /> // Unavailable
```

## Best Practices

### 1. Consistency
- Use the icon utility functions for consistent sizing and coloring
- Stick to the predefined icon mappings for hotel features
- Use semantic colors that match the context

### 2. Performance
- Import only the icons you need
- Use the centralized icon exports from `/lib/icons.ts`
- Avoid importing entire icon sets

### 3. Accessibility
- Always provide meaningful alt text or aria-labels
- Ensure sufficient color contrast
- Use icons alongside text labels when possible

### 4. Responsive Design
- Test icon visibility at different screen sizes
- Use appropriate sizes for mobile vs desktop
- Consider touch target sizes for interactive icons

### 5. Hotel Context
- Use hotel-specific icons for amenities and services
- Maintain consistent iconography across similar features
- Group related icons logically

## Component Integration

### With Pure Tailwind CSS Components
```typescript
import { FiPlus } from "@/lib/icons"

<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2">
  <FiPlus {...getIconProps('sm')} />
  Add Room
</Button>
```

### With Cards and Lists
```typescript
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { MdHotel } from "@/lib/icons"

<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <MdHotel {...getIconProps('md', 'primary')} />
      Room Details
    </CardTitle>
  </CardHeader>
</Card>
```

## Testing
The icon integration can be tested by:
1. Running the development server
2. Visiting the demo page at `/`
3. Checking the "React Icons Integration" section
4. Verifying different icon sets, sizes, and colors
5. Testing responsive behavior

## Troubleshooting

### Icons Not Displaying
1. Check that react-icons is installed: `npm list react-icons`
2. Verify import paths are correct
3. Ensure icon names match the library exports
4. Check for TypeScript errors in icon usage

### Performance Issues
1. Avoid importing entire icon sets
2. Use tree-shaking with ES6 imports
3. Monitor bundle size with icon additions
4. Consider lazy loading for large icon sets

### Styling Issues
1. Verify Tailwind classes are applied correctly
2. Check color contrast for accessibility
3. Test icon sizes across different screen sizes
4. Ensure icons align properly with text

## Future Enhancements
- Custom icon set for hotel-specific needs
- Icon animation utilities
- Dark mode icon variants
- Advanced icon composition patterns
- Performance optimization strategies

## Resources
- [React Icons Documentation](https://react-icons.github.io/react-icons/)
- [Icon Search and Browse](https://react-icons.github.io/react-icons/search)
- [Feather Icons](https://feathericons.com/)
- [Material Design Icons](https://fonts.google.com/icons)
- [Bootstrap Icons](https://icons.getbootstrap.com/)