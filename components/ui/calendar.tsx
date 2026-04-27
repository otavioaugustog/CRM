"use client"

import { DayPicker } from "react-day-picker"
import { ptBR } from "date-fns/locale"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ptBR}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-3",
        month_caption: "flex justify-center items-center relative h-8",
        caption_label: "text-sm font-semibold capitalize",
        nav: "flex items-center gap-1 absolute inset-x-0 top-0 justify-between px-1",
        button_previous: cn(
          "inline-flex size-7 items-center justify-center rounded-md border border-border bg-transparent",
          "text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        ),
        button_next: cn(
          "inline-flex size-7 items-center justify-center rounded-md border border-border bg-transparent",
          "text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-9 font-normal text-xs text-center",
        week: "flex w-full mt-1",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-accent/50",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
        ),
        day_button: cn(
          "inline-flex size-9 items-center justify-center rounded-md p-0 font-normal",
          "hover:bg-accent hover:text-accent-foreground transition-colors",
          "aria-selected:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        ),
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        today: "bg-accent text-accent-foreground rounded-md",
        outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left"
            ? <ChevronLeftIcon className="size-4" />
            : <ChevronRightIcon className="size-4" />,
      }}
      {...props}
    />
  )
}
