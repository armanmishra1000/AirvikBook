# Shadcn/ui Integration Guide

## Overview
Shadcn/ui has been successfully integrated into the AirVikBook Hotel Management System frontend. This document provides guidance on using Shadcn components and maintains consistency across the project.

## ✅ Integration Status: COMPLETE

### What Was Installed
- **Shadcn/ui CLI**: Latest version
- **Style**: New York (Recommended)
- **Base Color**: Neutral
- **Icon Library**: Lucide React
- **CSS Variables**: Enabled for theming

### Components Available
The following Shadcn components have been installed and are ready to use:

#### Core Components
- `Button` - Various button styles and sizes
- `Input` - Text input fields
- `Card` - Content containers with header/content sections
- `Form` - Form components with validation
- `Label` - Accessible form labels

#### Data Display
- `Table` - Data tables with sorting/filtering
- `Badge` - Status and category indicators
- `Alert` - Important messages and notifications
- `Calendar` - Date selection and scheduling

#### Interactive Components
- `Dialog` - Modal dialogs and popups
- `Popover` - Contextual content overlays
- `Dropdown Menu` - Action menus and selections
- `Select` - Dropdown selection inputs
- `Checkbox` - Boolean selection inputs
- `Textarea` - Multi-line text inputs
- `Sheet` - Slide-out panels and drawers
- `Tooltip` - Hover information displays

## 🎨 Usage Patterns

### Basic Import Pattern
```typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
```

### Utility Function Usage
```typescript
import { cn } from "@/lib/utils"

// Combine classes conditionally
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes"
)}>
```

### Component Variants
```typescript
// Button variants
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

### Form Components
```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  guestName: z.string().min(2),
  roomType: z.string()
})

// In component
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema)
})

<Form {...form}>
  <FormField
    control={form.control}
    name="guestName"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Guest Name</FormLabel>
        <FormControl>
          <Input placeholder="Enter guest name" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

## 🏨 Hotel Management Specific Use Cases

### Room Status Badges
```typescript
<Badge variant="default">Available</Badge>
<Badge variant="secondary">Occupied</Badge>
<Badge variant="destructive">Out of Order</Badge>
<Badge className="bg-green-500">Confirmed</Badge>
```

### Booking Cards
```typescript
<Card>
  <CardHeader>
    <CardTitle>Room 101 - Deluxe Suite</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Guest: John Doe</p>
    <p>Check-in: Today</p>
    <div className="flex gap-2 mt-4">
      <Button size="sm">Check In</Button>
      <Button variant="outline" size="sm">View Details</Button>
    </div>
  </CardContent>
</Card>
```

### Calendar Integration
```typescript
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"

const [date, setDate] = useState<Date | undefined>(new Date())

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  disabled={(date) => date < new Date()} // Disable past dates
  className="rounded-md border"
/>
```

### Data Tables
```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Room</TableHead>
      <TableHead>Guest</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>101</TableCell>
      <TableCell>John Doe</TableCell>
      <TableCell><Badge>Occupied</Badge></TableCell>
      <TableCell>
        <Button variant="outline" size="sm">Details</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## 🎯 Best Practices

### 1. Consistent Spacing
Use Tailwind spacing classes consistently:
```typescript
// Good
<div className="space-y-4">
  <Card className="p-6">
    <div className="space-y-2">

// Avoid custom spacing
<div style={{ marginBottom: '16px' }}>
```

### 2. Responsive Design
```typescript
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <Card>...</Card>
  <Card>...</Card>
</div>
```

### 3. Accessibility
```typescript
// Always include proper labels
<FormItem>
  <FormLabel htmlFor="guestName">Guest Name</FormLabel>
  <FormControl>
    <Input id="guestName" {...field} />
  </FormControl>
</FormItem>

// Use semantic HTML
<Button type="submit" disabled={loading}>
  {loading ? "Saving..." : "Save Booking"}
</Button>
```

### 4. Error Handling
```typescript
<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Failed to save booking. Please try again.
  </AlertDescription>
</Alert>
```

## 🔧 Customization

### Theme Customization
CSS variables in `src/app/globals.css` can be modified for custom theming:
```css
:root {
  --primary: 220 100% 50%; /* Custom primary color */
  --radius: 0.75rem; /* Custom border radius */
}
```

### Adding New Components
To add more Shadcn components:
```bash
npx shadcn@latest add [component-name]
```

Available components can be found at: https://ui.shadcn.com/docs/components

## 📁 File Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # Shadcn components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   └── demo/         # Demo components
│   ├── lib/
│   │   └── utils.ts      # cn utility function
│   └── app/
│       └── globals.css   # CSS variables and base styles
├── components.json       # Shadcn configuration
└── tailwind.config.js    # Updated with Shadcn tokens
```

## 🚀 Next Steps

1. **Replace existing UI elements** with Shadcn components
2. **Create hotel-specific components** using Shadcn primitives
3. **Implement dark mode** using the built-in theme system
4. **Add more components** as needed for specific features

## 📚 Resources

- **Shadcn/ui Documentation**: https://ui.shadcn.com/docs
- **Radix UI Primitives**: https://www.radix-ui.com/primitives
- **Lucide Icons**: https://lucide.dev/icons/
- **Tailwind CSS**: https://tailwindcss.com/docs

## 🧪 Demo Component

A demo component has been created at `src/components/demo/ShadcnDemo.tsx` showcasing various Shadcn components. This serves as a reference for developers and can be used to test the integration.

---

**Note**: This integration follows the project's established patterns and maintains compatibility with existing code. All components are TypeScript-ready and follow accessibility best practices.