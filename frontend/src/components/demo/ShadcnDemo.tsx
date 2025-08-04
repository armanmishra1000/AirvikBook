/**
 * Shadcn Demo Component
 * 
 * This component demonstrates the integration of Shadcn/ui components
 * and serves as a reference for developers working on the hotel management system.
 */

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getTypographyClass, getFontClass } from "@/lib/fonts"
import { 
  CalendarIcon, 
  CheckIcon, 
  TypeIcon,
  getIconProps,
  FiHome,
  FiUser,
  FiUsers,
  FiCreditCard,
  FiWifi,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiInfo,
  FiCoffee,
  FiBell,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiCalendar,
  FiBarChart,
  MdHotel,
  MdRoomService,
  MdTv,
  MdKitchen,
  MdBalcony,
  MdBathtub,
  MdLocalLaundryService,
  MdAirportShuttle,
  MdLocalParking,
  MdBusinessCenter,
  BsBuilding
} from "@/lib/icons"
import React, { useState } from "react"

export default function ShadcnDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isSelected, setIsSelected] = useState(false)

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className={getTypographyClass('hero', 'mb-2')}>
          AirVikBook
        </h1>
        <h2 className={getTypographyClass('h2', 'mb-4')}>
          Shadcn/ui Components Demo
        </h2>
        <p className={getTypographyClass('subtitle')}>
          Hotel Management System - UI Component Showcase with SF Pro Display
        </p>
      </div>

      {/* Font Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TypeIcon className="h-5 w-5" />
            SF Pro Display Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className={getTypographyClass('display')}>Display Text</div>
            <div className={getTypographyClass('h1')}>Heading 1</div>
            <div className={getTypographyClass('h2')}>Heading 2</div>
            <div className={getTypographyClass('h3')}>Heading 3</div>
            <div className={getTypographyClass('body')}>Body text with SF Pro Display</div>
            <div className={getTypographyClass('bodySmall')}>Small body text</div>
            <div className={getTypographyClass('caption')}>Caption text</div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className={getFontClass('thin', 'base')}>Thin</span>
            <span className={getFontClass('light', 'base')}>Light</span>
            <span className={getFontClass('normal', 'base')}>Regular</span>
            <span className={getFontClass('medium', 'base')}>Medium</span>
            <span className={getFontClass('semibold', 'base')}>Semibold</span>
            <span className={getFontClass('bold', 'base')}>Bold</span>
            <span className={getFontClass('black', 'base')}>Black</span>
          </div>
        </CardContent>
      </Card>

      {/* Alert */}
      <Alert>
        <CheckIcon className="h-4 w-4" />
        <AlertDescription>
          SF Pro Display font, react-icons, and Shadcn/ui have been successfully integrated into the project!
        </AlertDescription>
      </Alert>

      {/* React Icons Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdHotel {...getIconProps('md', 'primary')} />
            React Icons Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Icons */}
          <div>
            <h4 className={getTypographyClass('h4', 'mb-3')}>Navigation Icons</h4>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <FiHome {...getIconProps('md', 'primary')} />
                <span className={getTypographyClass('bodySmall')}>Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <FiUser {...getIconProps('md', 'primary')} />
                <span className={getTypographyClass('bodySmall')}>Rooms</span>
              </div>
              <div className="flex items-center gap-2">
                <FiUsers {...getIconProps('md', 'primary')} />
                <span className={getTypographyClass('bodySmall')}>Guests</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCreditCard {...getIconProps('md', 'primary')} />
                <span className={getTypographyClass('bodySmall')}>Payments</span>
              </div>
            </div>
          </div>

          {/* Hotel Amenities */}
          <div>
            <h4 className={getTypographyClass('h4', 'mb-3')}>Hotel Amenities</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <FiWifi {...getIconProps('sm', 'muted')} />
                <span className={getTypographyClass('bodySmall')}>WiFi</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <FiCoffee {...getIconProps('sm', 'muted')} />
                <span className={getTypographyClass('bodySmall')}>Coffee</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <MdTv {...getIconProps('sm', 'muted')} />
                <span className={getTypographyClass('bodySmall')}>Television</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <MdKitchen {...getIconProps('sm', 'muted')} />
                <span className={getTypographyClass('bodySmall')}>Kitchenette</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <MdBalcony {...getIconProps('sm', 'muted')} />
                <span className={getTypographyClass('bodySmall')}>Balcony</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <MdBathtub {...getIconProps('sm', 'muted')} />
                <span className={getTypographyClass('bodySmall')}>Bathtub</span>
              </div>
            </div>
          </div>

          {/* Hotel Services */}
          <div>
            <h4 className={getTypographyClass('h4', 'mb-3')}>Hotel Services</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <MdRoomService {...getIconProps('sm', 'info')} />
                <span className={getTypographyClass('bodySmall')}>Room Service</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <MdLocalLaundryService {...getIconProps('sm', 'info')} />
                <span className={getTypographyClass('bodySmall')}>Laundry</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <MdAirportShuttle {...getIconProps('sm', 'info')} />
                <span className={getTypographyClass('bodySmall')}>Airport Shuttle</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <MdLocalParking {...getIconProps('sm', 'info')} />
                <span className={getTypographyClass('bodySmall')}>Parking</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <MdBusinessCenter {...getIconProps('sm', 'info')} />
                <span className={getTypographyClass('bodySmall')}>Business Center</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <FiBell {...getIconProps('sm', 'info')} />
                <span className={getTypographyClass('bodySmall')}>Concierge</span>
              </div>
            </div>
          </div>

          {/* Status Icons */}
          <div>
            <h4 className={getTypographyClass('h4', 'mb-3')}>Status Icons</h4>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <FiCheckCircle {...getIconProps('sm', 'success')} />
                <span className={getTypographyClass('bodySmall')}>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <FiAlertTriangle {...getIconProps('sm', 'warning')} />
                <span className={getTypographyClass('bodySmall')}>Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <FiXCircle {...getIconProps('sm', 'destructive')} />
                <span className={getTypographyClass('bodySmall')}>Unavailable</span>
              </div>
              <div className="flex items-center gap-2">
                <FiInfo {...getIconProps('sm', 'info')} />
                <span className={getTypographyClass('bodySmall')}>Information</span>
              </div>
            </div>
          </div>

          {/* Icon Sizes */}
          <div>
            <h4 className={getTypographyClass('h4', 'mb-3')}>Icon Sizes</h4>
            <div className="flex items-center gap-4">
              <BsBuilding {...getIconProps('xs', 'muted')} />
              <BsBuilding {...getIconProps('sm', 'muted')} />
              <BsBuilding {...getIconProps('md', 'muted')} />
              <BsBuilding {...getIconProps('lg', 'muted')} />
              <BsBuilding {...getIconProps('xl', 'muted')} />
              <BsBuilding {...getIconProps('2xl', 'muted')} />
            </div>
            <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
              <span>xs</span>
              <span>sm</span>
              <span>md</span>
              <span>lg</span>
              <span>xl</span>
              <span>2xl</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Buttons Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Buttons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="default" className="w-full">
              Primary Button
            </Button>
            <Button variant="secondary" className="w-full">
              Secondary Button
            </Button>
            <Button variant="outline" className="w-full">
              Outline Button
            </Button>
            <Button variant="destructive" size="sm" className="w-full">
              Delete Booking
            </Button>
          </CardContent>
        </Card>

        {/* Form Inputs Card */}
        <Card>
          <CardHeader>
            <CardTitle>Form Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Guest Name</label>
              <Input placeholder="Enter guest name" />
            </div>
            
            <div>
              <label className="text-sm font-medium">Room Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Room</SelectItem>
                  <SelectItem value="deluxe">Deluxe Room</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="wifi" 
                checked={isSelected}
                onCheckedChange={(checked) => setIsSelected(checked === true)}
              />
              <label htmlFor="wifi" className="text-sm">WiFi Required</label>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Card */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Room Status Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Available</Badge>
            <Badge variant="secondary">Occupied</Badge>
            <Badge variant="destructive">Out of Order</Badge>
            <Badge variant="outline">Cleaning</Badge>
            <Badge className={cn("bg-green-500 hover:bg-green-600")}>
              Confirmed
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Usage Note */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-semibold mb-2">🎨 Shadcn/ui Integration Complete!</p>
            <p>
              All components are now available for use in the hotel management system.
              <br />
              Import components from <code className="bg-muted px-1 py-0.5 rounded">@/components/ui/*</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}