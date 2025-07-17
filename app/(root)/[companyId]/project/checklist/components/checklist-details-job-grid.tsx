import { IDecimal } from "@/interfaces/auth"
import { IJobOrderHd } from "@/interfaces/checklist"
import { format } from "date-fns/format"
import {
  Anchor,
  Banknote,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Compass,
  FileDigit,
  MapPin,
  Navigation,
  Ship,
  UserRound,
} from "lucide-react"

interface JobDetailsGridProps {
  jobData: IJobOrderHd
  decimals: IDecimal[]
}

export function JobDetailsGrid({ jobData, decimals }: JobDetailsGridProps) {
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm"
  const gridItems = [
    {
      label: "Job Order No",
      value: jobData.jobOrderNo,
      icon: <FileDigit className="h-4 w-4" />,
      color: "bg-blue-50 text-blue-600",
      valueColor: "text-blue-800",
    },
    {
      label: "Job Date",
      value: jobData.jobOrderDate
        ? format(jobData.jobOrderDate, dateFormat)
        : "-",
      icon: <CalendarDays className="h-4 w-4" />,
      color: "bg-green-50 text-green-600",
      valueColor: "text-green-800",
    },
    {
      label: "Customer",
      value: jobData.customerName,
      icon: <UserRound className="h-4 w-4" />,
      color: "bg-purple-50 text-purple-600",
      valueColor: "text-purple-800",
    },
    {
      label: "Currency",
      value: jobData.currencyName,
      icon: <Banknote className="h-4 w-4" />,
      color: "bg-yellow-50 text-yellow-600",
      valueColor: "text-yellow-800",
    },
    {
      label: "Vessel",
      value: jobData.vesselName || "N/A",
      icon: <Ship className="h-4 w-4" />,
      color: "bg-indigo-50 text-indigo-600",
      valueColor: "text-indigo-800",
    },
    {
      label: "IMO Number",
      value: jobData.imoCode || "N/A",
      icon: <Anchor className="h-4 w-4" />,
      color: "bg-cyan-50 text-cyan-600",
      valueColor: "text-cyan-800",
    },
    {
      label: "Port",
      value: jobData.portName,
      icon: <MapPin className="h-4 w-4" />,
      color: "bg-red-50 text-red-600",
      valueColor: "text-red-800",
    },
    {
      label: "Previous Port",
      value: jobData.lastPortName || "N/A",
      icon: <Navigation className="h-4 w-4" />,
      color: "bg-emerald-50 text-emerald-600",
      valueColor: "text-emerald-800",
    },
    {
      label: "Next Port",
      value: jobData.nextPortName || "N/A",
      icon: <Navigation className="h-4 w-4" />,
      color: "bg-amber-50 text-amber-600",
      valueColor: "text-amber-800",
    },
    {
      label: "Owner Name",
      value: jobData.ownerName || "N/A",
      icon: <Building2 className="h-4 w-4" />,
      color: "bg-slate-50 text-slate-600",
      valueColor: "text-slate-800",
    },
    {
      label: "ETA Date",
      value: jobData.etaDate ? format(jobData.etaDate, datetimeFormat) : "N/A",
      icon: <CalendarClock className="h-4 w-4" />,
      color: "bg-orange-50 text-orange-600",
      valueColor: "text-orange-800",
    },
    {
      label: "ETD Date",
      value: jobData.etdDate ? format(jobData.etdDate, datetimeFormat) : "N/A",
      icon: <CalendarCheck className="h-4 w-4" />,
      color: "bg-teal-50 text-teal-600",
      valueColor: "text-teal-800",
    },
    {
      label: "Vessel Distance",
      value: `${jobData.vesselDistance} NM` || "N/A",
      icon: <Compass className="h-4 w-4" />,
      color: "bg-pink-50 text-pink-600",
      valueColor: "text-pink-800",
    },
  ]

  return (
    <>
      {/* Grid Section - Compact Table Style */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="divide-border grid grid-cols-1 divide-y md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {gridItems.map((item, index) => (
            <div
              key={index}
              className="group hover:bg-muted/50 relative flex items-center gap-3 p-3 transition-colors duration-200"
            >
              {/* Icon */}
              <div
                className={`flex-shrink-0 rounded-md p-1.5 ${item.color} transition-all duration-200 group-hover:scale-110`}
              >
                {item.icon}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h3 className="text-muted-foreground group-hover:text-foreground text-xs font-medium transition-colors duration-200">
                  {item.label}
                </h3>
                <p
                  className={`text-sm font-semibold ${item.valueColor} group-hover:text-foreground transition-colors duration-200`}
                >
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
