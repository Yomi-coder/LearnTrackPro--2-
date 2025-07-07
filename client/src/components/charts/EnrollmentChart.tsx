import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { month: "Jan", enrollments: 400 },
  { month: "Feb", enrollments: 300 },
  { month: "Mar", enrollments: 600 },
  { month: "Apr", enrollments: 800 },
  { month: "May", enrollments: 500 },
  { month: "Jun", enrollments: 700 },
]

export function EnrollmentChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="enrollments" 
          stroke="hsl(207, 90%, 54%)" 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
