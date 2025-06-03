import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ApperIcon from '../components/ApperIcon'
import transactionService from '../services/api/transactionService'
import accountService from '../services/api/accountService'
import budgetService from '../services/api/budgetService'
import goalService from '../services/api/goalService'

const Dashboard = () => {
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
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
      } catch (error) {
        console.error('Error loading dashboard data:', error)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 flex items-center space-x-4">
          <div className="animate-spin">
            <ApperIcon name="Loader2" className="h-6 w-6 text-primary" />
          </div>
          <span className="text-surface-700">Loading dashboard...</span>
        </div>
      </div>
    )
  }

return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary/5 to-secondary/5">
      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Page Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-surface-900 mb-2">Dashboard</h1>
          <p className="text-surface-600">Your complete financial overview</p>
        </motion.div>

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

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Link to="/transactions" className="glass-morphism rounded-2xl p-6 hover-lift transition-all duration-200 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ApperIcon name="CreditCard" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">Transactions</h3>
                <p className="text-sm text-surface-600">Manage your transactions</p>
              </div>
            </div>
          </Link>

          <Link to="/budgets" className="glass-morphism rounded-2xl p-6 hover-lift transition-all duration-200 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ApperIcon name="PieChart" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">Budgets</h3>
                <p className="text-sm text-surface-600">Track your budgets</p>
              </div>
            </div>
          </Link>

          <Link to="/goals" className="glass-morphism rounded-2xl p-6 hover-lift transition-all duration-200 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ApperIcon name="Target" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">Goals</h3>
                <p className="text-sm text-surface-600">Track your goals</p>
              </div>
            </div>
          </Link>

          <Link to="/insights" className="glass-morphism rounded-2xl p-6 hover-lift transition-all duration-200 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ApperIcon name="TrendingUp" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">Insights</h3>
                <p className="text-sm text-surface-600">View spending insights</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-morphism rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-surface-900">Recent Activity</h3>
            <Link to="/transactions" className="text-primary hover:text-primary-dark text-sm font-medium">
              View All
            </Link>
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
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default Dashboard