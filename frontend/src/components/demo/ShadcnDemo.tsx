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
import { CalendarIcon, CheckIcon } from "lucide-react"
import { useState } from "react"

export default function ShadcnDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isSelected, setIsSelected] = useState(false)

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Shadcn/ui Components Demo</h1>
        <p className="text-muted-foreground">
          AirVikBook Hotel Management System - UI Component Showcase
        </p>
      </div>

      {/* Alert */}
      <Alert>
        <CheckIcon className="h-4 w-4" />
        <AlertDescription>
          Shadcn/ui has been successfully integrated into the project!
        </AlertDescription>
      </Alert>

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