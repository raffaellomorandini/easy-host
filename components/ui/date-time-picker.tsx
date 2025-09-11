"use client"

import * as React from "react"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Seleziona data e ora",
  className
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [isOpen, setIsOpen] = React.useState(false)
  const [hour, setHour] = React.useState(value ? value.getHours().toString().padStart(2, '0') : '09')
  const [minute, setMinute] = React.useState(value ? value.getMinutes().toString().padStart(2, '0') : '00')

  React.useEffect(() => {
    if (value) {
      setDate(value)
      setHour(value.getHours().toString().padStart(2, '0'))
      setMinute(value.getMinutes().toString().padStart(2, '0'))
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(parseInt(hour), parseInt(minute))
      setDate(newDateTime)
      onChange?.(newDateTime)
    } else {
      setDate(undefined)
      onChange?.(undefined)
    }
  }

  const handleTimeChange = (newHour?: string, newMinute?: string) => {
    const currentHour = newHour || hour
    const currentMinute = newMinute || minute
    
    if (newHour) setHour(newHour)
    if (newMinute) setMinute(newMinute)

    if (date) {
      const newDateTime = new Date(date)
      newDateTime.setHours(parseInt(currentHour), parseInt(currentMinute))
      setDate(newDateTime)
      onChange?.(newDateTime)
    }
  }

  // Generate hours (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  )

  // Generate minutes (00, 15, 30, 45)
  const minutes = ['00', '15', '30', '45']

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, "PPP 'alle' HH:mm", { locale: it })
            ) : (
              placeholder
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              locale={it}
              initialFocus
            />
          </div>
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Orario</span>
            </div>
            <div className="flex gap-2">
              <Select value={hour} onValueChange={(value) => handleTimeChange(value, undefined)}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="self-center">:</span>
              <Select value={minute} onValueChange={(value) => handleTimeChange(undefined, value)}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              size="sm" 
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              Conferma
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
