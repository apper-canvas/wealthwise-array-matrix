import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'
import MainFeature from '../components/MainFeature'
import transactionService from '../services/api/transactionService'
import accountService from '../services/api/accountService'
import budgetService from '../services/api/budgetService'
import goalService from '../services/api/goalService'

const Home = () => {
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        const [accountData, transactionData, budgetData, goalData] = await Promise.all([
          accountService.getAll(),
          transactionService.getAll(),
          budgetService.getAll(),
          goalService.getAll()
        ])
        
        setAccounts(accountData || [])
        setTransactions(transactionData || [])
        setBudgets(budgetData || [])
        setGoals(goalData || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  const totalBalance = accounts.reduce((sum, account) => sum + (account?.balance || 0), 0)
  const monthlySpending = transactions
    .filter(t => t?.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + Math.abs(t?.amount || 0), 0)
  
  const completedGoals = goals.filter(goal => (goal?.currentAmount || 0) >= (goal?.targetAmount || 1)).length

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'transactions', label: 'Transactions', icon: 'CreditCard' },
    { id: 'budgets', label: 'Budgets', icon: 'PieChart' },
    { id: 'goals', label: 'Goals', icon: 'Target' },
    { id: 'insights', label: 'Insights', icon: 'TrendingUp' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 flex items-center space-x-4">
          <div className="animate-spin">
            <ApperIcon name="Loader2" className="h-6 w-6 text-primary" />
          </div>
          <span className="text-surface-700">Loading your financial data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-morphism rounded-2xl p-8 text-center max-w-md">
          <ApperIcon name="AlertTriangle" className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 mb-2">Unable to Load Data</h2>
          <p className="text-surface-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary/5 to-secondary/5">
      {/* Navigation Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 h-16 glass-morphism border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name="TrendingUp" className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-surface-900">WealthWise</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-surface-700 hover:bg-white/50 hover:text-surface-900'
                  }`}
                >
                  <ApperIcon name={item.icon} className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-surface-600 hover:text-surface-900 hover:bg-white/50 rounded-lg transition-colors">
              <ApperIcon name="Bell" className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
              <ApperIcon name="User" className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation */}
      <motion.nav 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-morphism border-t border-white/20"
      >
        <div className="grid grid-cols-5 h-16">
{navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'insights') {
                  window.location.href = '/insights'
                } else {
                  setActiveTab(item.id)
                }
              }}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                activeTab === item.id ? 'text-primary' : 'text-surface-500'
              }`}
            >
              <ApperIcon name={item.icon} className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="pt-20 pb-20 lg:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Financial Overview Cards */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          <div className="glass-morphism rounded-2xl p-6 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                <ApperIcon name="Wallet" className="h-5 w-5 text-white" />
              </div>
              <ApperIcon name="TrendingUp" className="h-4 w-4 text-secondary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-surface-600">Total Balance</p>
              <p className="text-2xl font-bold text-surface-900 number-animate">
                ${totalBalance.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-error to-accent rounded-xl flex items-center justify-center">
                <ApperIcon name="ShoppingCart" className="h-5 w-5 text-white" />
              </div>
              <ApperIcon name="Calendar" className="h-4 w-4 text-surface-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-surface-600">Monthly Spending</p>
              <p className="text-2xl font-bold text-surface-900 number-animate">
                ${monthlySpending.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center">
                <ApperIcon name="PiggyBank" className="h-5 w-5 text-white" />
              </div>
              <ApperIcon name="ArrowUp" className="h-4 w-4 text-secondary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-surface-600">Savings Rate</p>
              <p className="text-2xl font-bold text-surface-900 number-animate">
                {totalBalance > 0 ? Math.round(((totalBalance - monthlySpending) / totalBalance) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center">
                <ApperIcon name="Target" className="h-5 w-5 text-white" />
              </div>
              <ApperIcon name="Award" className="h-4 w-4 text-accent" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-surface-600">Goals Achieved</p>
              <p className="text-2xl font-bold text-surface-900 number-animate">
                {completedGoals}/{goals.length || 0}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Feature Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <MainFeature 
            transactions={transactions}
            accounts={accounts}
            budgets={budgets}
            goals={goals}
            onDataUpdate={() => {
              // Refresh data when updates occur
              window.location.reload()
            }}
          />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900">Recent Transactions</h3>
              <button className="text-primary hover:text-primary-dark text-sm font-medium">
                View All
              </button>
            </div>
            
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction, index) => (
                <motion.div
                  key={transaction?.id || index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 hover:bg-white/50 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      transaction?.type === 'income' 
                        ? 'bg-secondary/10 text-secondary' 
                        : 'bg-error/10 text-error'
                    }`}>
                      <ApperIcon 
                        name={transaction?.type === 'income' ? 'ArrowDownLeft' : 'ArrowUpRight'} 
                        className="h-5 w-5" 
                      />
                    </div>
                    <div>
                      <p className="font-medium text-surface-900">{transaction?.description || 'Unknown Transaction'}</p>
                      <p className="text-sm text-surface-600">{transaction?.category || 'Uncategorized'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction?.type === 'income' ? 'text-secondary' : 'text-error'
                    }`}>
                      {transaction?.type === 'income' ? '+' : '-'}${Math.abs(transaction?.amount || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-surface-600">
                      {transaction?.date ? new Date(transaction.date).toLocaleDateString() : 'Unknown Date'}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {(!transactions || transactions.length === 0) && (
                <div className="text-center py-8">
                  <ApperIcon name="Inbox" className="h-12 w-12 text-surface-300 mx-auto mb-3" />
                  <p className="text-surface-500">No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default Home