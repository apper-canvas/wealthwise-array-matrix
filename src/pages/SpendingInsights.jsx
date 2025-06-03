import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Chart from 'react-apexcharts'
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, isWithinInterval } from 'date-fns'
import ApperIcon from '../components/ApperIcon'
import transactionService from '../services/api/transactionService'

const SpendingInsights = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('6months')

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true)
      try {
        const data = await transactionService.getAll()
        setTransactions(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadTransactions()
  }, [])

  // Process spending data based on selected time range
  const processedData = useMemo(() => {
    if (!transactions.length) return null

    const now = new Date()
    let startDate
    
    switch (timeRange) {
      case '3months':
        startDate = subMonths(now, 3)
        break
      case '6months':
        startDate = subMonths(now, 6)
        break
      case '12months':
        startDate = subMonths(now, 12)
        break
      default:
        startDate = subMonths(now, 6)
    }

    // Filter transactions within range and expenses only
    const filteredTransactions = transactions.filter(t => 
      t.type === 'expense' && 
      new Date(t.date) >= startDate &&
      new Date(t.date) <= now
    )

    // Generate monthly spending trends
    const months = eachMonthOfInterval({ start: startDate, end: now })
    const monthlySpending = months.map(month => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      const monthTransactions = filteredTransactions.filter(t =>
        isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
      )
      
      const total = monthTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      return {
        month: format(month, 'MMM yyyy'),
        amount: total,
        count: monthTransactions.length
      }
    })

    // Category breakdown
    const categoryTotals = filteredTransactions.reduce((acc, t) => {
      const category = t.category || 'Other'
      acc[category] = (acc[category] || 0) + Math.abs(t.amount)
      return acc
    }, {})

    const categoryData = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .map(([category, amount]) => ({ category, amount }))

    // Calculate insights
    const totalSpent = filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const avgMonthlySpending = totalSpent / months.length
    const currentMonthSpending = monthlySpending[monthlySpending.length - 1]?.amount || 0
    const previousMonthSpending = monthlySpending[monthlySpending.length - 2]?.amount || 0
    const spendingChange = previousMonthSpending > 0 
      ? ((currentMonthSpending - previousMonthSpending) / previousMonthSpending) * 100 
      : 0

    return {
      monthlySpending,
      categoryData,
      totalSpent,
      avgMonthlySpending,
      spendingChange,
      transactionCount: filteredTransactions.length
    }
  }, [transactions, timeRange])

  // Chart configurations
  const trendChartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      background: 'transparent'
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#2563EB'],
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 3
    },
    xaxis: {
      categories: processedData?.monthlySpending.map(item => item.month) || [],
      labels: {
        style: { colors: '#64748b' }
      }
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b' },
        formatter: (value) => `$${value.toLocaleString()}`
      }
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => `$${value.toLocaleString()}`
      }
    },
    markers: {
      size: 6,
      colors: ['#2563EB'],
      strokeColors: '#ffffff',
      strokeWidth: 2
    }
  }

  const categoryChartOptions = {
    chart: {
      type: 'pie',
      background: 'transparent'
    },
    colors: ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'],
    labels: processedData?.categoryData.map(item => item.category) || [],
    legend: {
      position: 'bottom',
      labels: { colors: '#64748b' }
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => `$${value.toLocaleString()}`
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '45%'
        }
      }
    }
  }

  const comparisonChartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: ['#10B981', '#EF4444'],
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 3
    },
    xaxis: {
      categories: processedData?.monthlySpending.slice(-6).map(item => item.month) || [],
      labels: {
        style: { colors: '#64748b' }
      }
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b' },
        formatter: (value) => `$${value.toLocaleString()}`
      }
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => `$${value.toLocaleString()}`
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%'
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-primary/5 to-secondary/5">
        <div className="glass-morphism rounded-2xl p-8 flex items-center space-x-4">
          <div className="animate-spin">
            <ApperIcon name="Loader2" className="h-6 w-6 text-primary" />
          </div>
          <span className="text-surface-700">Loading spending insights...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-surface-50 via-primary/5 to-secondary/5">
        <div className="glass-morphism rounded-2xl p-8 text-center max-w-md">
          <ApperIcon name="AlertTriangle" className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 mb-2">Unable to Load Insights</h2>
          <p className="text-surface-600 mb-4">{error}</p>
          <Link to="/" className="text-primary hover:text-primary-dark font-medium">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary/5 to-secondary/5">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 h-16 glass-morphism border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name="TrendingUp" className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-surface-900">WealthWise</span>
            </Link>
            
            <nav className="hidden lg:flex items-center space-x-1">
              <Link 
                to="/"
                className="px-4 py-2 rounded-lg flex items-center space-x-2 text-surface-700 hover:bg-white/50 hover:text-surface-900 transition-all duration-200"
              >
                <ApperIcon name="ArrowLeft" className="h-4 w-4" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link>
              <div className="px-4 py-2 rounded-lg flex items-center space-x-2 bg-primary text-white shadow-lg">
                <ApperIcon name="BarChart3" className="h-4 w-4" />
                <span className="text-sm font-medium">Spending Insights</span>
              </div>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 bg-white/50 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
            </select>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Key Metrics */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          <div className="glass-morphism rounded-2xl p-6 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                <ApperIcon name="DollarSign" className="h-5 w-5 text-white" />
              </div>
              <ApperIcon name="TrendingDown" className="h-4 w-4 text-error" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-surface-600">Total Spent</p>
              <p className="text-2xl font-bold text-surface-900 number-animate">
                ${(processedData?.totalSpent || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center">
                <ApperIcon name="Calendar" className="h-5 w-5 text-white" />
              </div>
              <ApperIcon name="BarChart" className="h-4 w-4 text-surface-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-surface-600">Avg Monthly</p>
              <p className="text-2xl font-bold text-surface-900 number-animate">
                ${(processedData?.avgMonthlySpending || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center">
                <ApperIcon name="Activity" className="h-5 w-5 text-white" />
              </div>
              <ApperIcon name={processedData?.spendingChange >= 0 ? "ArrowUp" : "ArrowDown"} 
                className={`h-4 w-4 ${processedData?.spendingChange >= 0 ? 'text-error' : 'text-secondary'}`} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-surface-600">Monthly Change</p>
              <p className={`text-2xl font-bold number-animate ${
                processedData?.spendingChange >= 0 ? 'text-error' : 'text-secondary'
              }`}>
                {processedData?.spendingChange >= 0 ? '+' : ''}{(processedData?.spendingChange || 0).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <ApperIcon name="Receipt" className="h-5 w-5 text-white" />
              </div>
              <ApperIcon name="Hash" className="h-4 w-4 text-surface-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-surface-600">Transactions</p>
              <p className="text-2xl font-bold text-surface-900 number-animate">
                {processedData?.transactionCount || 0}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Spending Trend Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900">Spending Trends</h3>
              <div className="flex items-center space-x-2 text-sm text-surface-600">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span>Monthly Spending</span>
              </div>
            </div>
            {processedData?.monthlySpending ? (
              <Chart
                options={trendChartOptions}
                series={[{
                  name: 'Spending',
                  data: processedData.monthlySpending.map(item => item.amount)
                }]}
                type="line"
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <ApperIcon name="BarChart" className="h-12 w-12 text-surface-300 mx-auto mb-3" />
                  <p className="text-surface-500">No spending data available</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Category Breakdown Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900">Category Breakdown</h3>
              <div className="text-sm text-surface-600">
                {processedData?.categoryData.length || 0} categories
              </div>
            </div>
            {processedData?.categoryData?.length ? (
              <Chart
                options={categoryChartOptions}
                series={processedData.categoryData.map(item => item.amount)}
                type="pie"
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <ApperIcon name="PieChart" className="h-12 w-12 text-surface-300 mx-auto mb-3" />
                  <p className="text-surface-500">No category data available</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Monthly Comparison */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-morphism rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-surface-900">Monthly Comparison</h3>
            <div className="text-sm text-surface-600">
              Last 6 months
            </div>
          </div>
          {processedData?.monthlySpending ? (
            <Chart
              options={comparisonChartOptions}
              series={[{
                name: 'Monthly Spending',
                data: processedData.monthlySpending.slice(-6).map(item => item.amount)
              }]}
              type="bar"
              height={350}
            />
          ) : (
            <div className="h-[350px] flex items-center justify-center">
              <div className="text-center">
                <ApperIcon name="BarChart3" className="h-12 w-12 text-surface-300 mx-auto mb-3" />
                <p className="text-surface-500">No comparison data available</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Category Details */}
        {processedData?.categoryData?.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-surface-900 mb-6">Category Details</h3>
            <div className="space-y-4">
              {processedData.categoryData.slice(0, 8).map((item, index) => {
                const percentage = (item.amount / processedData.totalSpent) * 100
                return (
                  <div key={item.category} className="flex items-center justify-between p-3 hover:bg-white/50 rounded-xl transition-colors">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: categoryChartOptions.colors[index % categoryChartOptions.colors.length] }}
                      ></div>
                      <span className="font-medium text-surface-900">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-surface-900">${item.amount.toLocaleString()}</p>
                      <p className="text-sm text-surface-600">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default SpendingInsights