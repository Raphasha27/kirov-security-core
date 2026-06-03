'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface TrendPoint {
  date: string
  threats: number
  scans: number
}

interface ThreatChartProps {
  data: TrendPoint[]
}

export function ThreatChart({ data }: ThreatChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3e" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#1a1a3e' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#1a1a3e' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#12122a',
              border: '1px solid #252550',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
            }}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Line
            type="monotone"
            dataKey="threats"
            stroke="#ff3355"
            strokeWidth={2}
            dot={{ fill: '#ff3355', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="scans"
            stroke="#33aaff"
            strokeWidth={2}
            dot={{ fill: '#33aaff', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
