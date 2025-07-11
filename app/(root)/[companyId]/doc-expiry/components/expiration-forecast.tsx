import React from "react"

const forecastData = [
  { year: 2024, months: ["-", "-", "-", "-", 7, 4, 7, 15, 4, 5, 3, 3] },
  { year: 2025, months: [4, 11, 8, 3, 6, 5, 17, 7, 3, 2, 3, 6] },
]

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

export default function ExpirationForecast() {
  return (
    <div className="rounded-lg p-4">
      <div className="mb-2 font-semibold">Expiration Forecast</div>
      <table className="w-full text-center text-xs">
        <thead>
          <tr>
            <th className="text-left"> </th>
            {monthLabels.map((m) => (
              <th key={m}>{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {forecastData.map((row) => (
            <tr key={row.year}>
              <td className="text-left font-semibold">{row.year}</td>
              {row.months.map((val, i) => (
                <td key={i}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
