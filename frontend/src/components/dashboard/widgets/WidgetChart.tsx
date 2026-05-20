import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { chartDataForSource } from '../dashboardData'
import type { WidgetInstance } from '../types'

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1']

type Props = { widget: WidgetInstance }

export function WidgetChart({ widget }: Props) {
  const chartType = widget.settings.chartType ?? 'line'
  const dataSource = widget.settings.dataSource ?? 'monthlyProduction'
  const data = chartDataForSource(dataSource)

  if (chartType === 'pie' || chartType === 'donut') {
    const inner = chartType === 'donut' ? 52 : 0
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={inner} outerRadius="78%" paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--glass-panel-bg, rgba(15,23,42,0.92))',
              border: '1px solid rgba(148,163,184,0.25)',
              borderRadius: 12,
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (chartType === 'radial') {
    const radialData = data.map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }))
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="28%" outerRadius="90%" data={radialData}>
          <RadialBar dataKey="value" background cornerRadius={6} />
          <Tooltip />
        </RadialBarChart>
      </ResponsiveContainer>
    )
  }

  if (chartType === 'sparkline') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <Area type="monotone" dataKey="value" stroke="#0ea5e9" fill="#0ea5e933" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  if (chartType === 'bar' || chartType === 'stackedBar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="var(--glass-text-muted)" />
          <YAxis tick={{ fontSize: 10 }} stroke="var(--glass-text-muted)" />
          <Tooltip />
          <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} stackId={chartType === 'stackedBar' ? 'a' : undefined} />
          {data.some((d) => d.value2 != null) ? (
            <Bar dataKey="value2" fill="#8b5cf6" radius={[4, 4, 0, 0]} stackId={chartType === 'stackedBar' ? 'a' : undefined} />
          ) : null}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (chartType === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="#0ea5e9" fill="#0ea5e944" />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
        {data.some((d) => d.value2 != null) ? (
          <Line type="monotone" dataKey="value2" stroke="#8b5cf6" strokeWidth={2} dot={false} />
        ) : null}
      </LineChart>
    </ResponsiveContainer>
  )
}
