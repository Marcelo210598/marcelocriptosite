import React, { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { useAnimation, useScrollAnimation } from '../hooks/useAnimation'

interface AnimatedChartProps {
  data: any[]
  type: 'area' | 'line' | 'bar' | 'pie'
  height?: number
  className?: string
  animationDuration?: number
  colors?: string[]
  dataKey?: string
  xAxisKey?: string
  title?: string
  showGrid?: boolean
  showTooltip?: boolean
}

export const AnimatedChart: React.FC<AnimatedChartProps> = ({
  data,
  type,
  height = 300,
  className = '',
  animationDuration = 1000,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
  dataKey = 'value',
  xAxisKey = 'name',
  title,
  showGrid = true,
  showTooltip = true
}) => {
  const scrollAnimation = useScrollAnimation({
    type: 'fadeIn',
    duration: 600
  })

  const [animatedData, setAnimatedData] = useState<any[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (data && data.length > 0) {
      setIsAnimating(true)
      
      // Animate data entry
      const animateData = () => {
        const steps = 20
        const stepDuration = animationDuration / steps
        
        for (let i = 0; i <= steps; i++) {
          setTimeout(() => {
            const progress = i / steps
            const currentData = data.map((item, index) => ({
              ...item,
              [dataKey]: item[dataKey] * progress,
              animatedProgress: progress
            }))
            
            setAnimatedData(currentData)
            
            if (i === steps) {
              setIsAnimating(false)
            }
          }, i * stepDuration)
        }
      }

      animateData()
    }
  }, [data, dataKey, animationDuration])

  const renderChart = () => {
    const commonProps = {
      data: animatedData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            {showTooltip && (
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Preço']}
              />
            )}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.3}
              strokeWidth={2}
              animationDuration={animationDuration}
              animationEasing="ease-out"
            />
          </AreaChart>
        )

      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            {showTooltip && (
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Preço']}
              />
            )}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              strokeWidth={3}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
              animationDuration={animationDuration}
              animationEasing="ease-out"
            />
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            {showTooltip && (
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Volume']}
              />
            )}
            <Bar
              dataKey={dataKey}
              fill={colors[0]}
              radius={[4, 4, 0, 0]}
              animationDuration={animationDuration}
              animationEasing="ease-out"
              animationBegin={0}
            />
          </BarChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={animatedData}
              cx="50%"
              cy="50%"
              outerRadius={Math.min(height / 3, 120)}
              fill="#8884d8"
              dataKey={dataKey}
              animationDuration={animationDuration}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {showTooltip && (
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
                formatter={(value: any) => [`${value.toFixed(2)}%`, 'Participação']}
              />
            )}
          </PieChart>
        )

      default:
        return null
    }
  }

  return (
    <div 
      ref={scrollAnimation.ref}
      className={`animated-chart ${className}`}
      style={scrollAnimation.getAnimationStyle()}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {isAnimating && (
            <div className="text-sm text-zinc-400 animate-pulse">Carregando gráfico...</div>
          )}
        </div>
      )}
      
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
        
        {isAnimating && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  )
}

interface AnimatedChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  animationType?: 'fadeIn' | 'slideUp' | 'scale'
  duration?: number
  className?: string
}

export const AnimatedChartCard: React.FC<AnimatedChartCardProps> = ({
  title,
  subtitle,
  children,
  animationType = 'slideUp',
  duration = 500,
  className = ''
}) => {
  const scrollAnimation = useScrollAnimation({
    type: animationType,
    duration
  })

  return (
    <div
      ref={scrollAnimation.ref}
      className={`animated-chart-card bg-gray-800 rounded-xl p-6 border border-gray-700 ${className}`}
      style={scrollAnimation.getAnimationStyle()}
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        {subtitle && (
          <p className="text-zinc-400 text-sm">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  )
}

interface AnimatedChartSeriesProps {
  data: any[]
  series: Array<{
    dataKey: string
    name: string
    color: string
    type: 'line' | 'area'
  }>
  height?: number
  className?: string
  title?: string
}

export const AnimatedChartSeries: React.FC<AnimatedChartSeriesProps> = ({
  data,
  series,
  height = 300,
  className = '',
  title
}) => {
  const scrollAnimation = useScrollAnimation({
    type: 'fadeIn',
    duration: 800
  })

  const [animatedData, setAnimatedData] = useState<any[]>([])

  useEffect(() => {
    if (data && data.length > 0) {
      // Animate data entry
      const steps = 30
      const stepDuration = 50
      
      for (let i = 0; i <= steps; i++) {
        setTimeout(() => {
          const progress = i / steps
          const currentData = data.map((item) => {
            const animatedItem = { ...item }
            series.forEach(s => {
              animatedItem[s.dataKey] = item[s.dataKey] * progress
            })
            return animatedItem
          })
          
          setAnimatedData(currentData)
        }, i * stepDuration)
      }
    }
  }, [data, series])

  return (
    <div
      ref={scrollAnimation.ref}
      className={`animated-chart-series ${className}`}
      style={scrollAnimation.getAnimationStyle()}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={animatedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
          />
          {series.map((s, index) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              stroke={s.color}
              strokeWidth={3}
              dot={{ fill: s.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: s.color, strokeWidth: 2 }}
              name={s.name}
              animationDuration={800}
              animationEasing="ease-out"
              animationBegin={index * 200}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AnimatedChart