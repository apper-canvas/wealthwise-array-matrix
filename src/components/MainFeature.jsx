import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import transactionService from '../services/api/transactionService'
import budgetService from '../services/api/budgetService'
import goalService from '../services/api/goalService'

const MainFeature = ({ transactions = [], accounts = [], budgets = [], goals = [], onDataUpdate }) => {
  const [activeFeature, setActiveFeature] = useState('addTransaction')
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense',
    accountId: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [budgetData, setBudgetData] = useState({
    name: '',
    totalAmount: '',
    period: 'monthly',
    categories: []
  })
  const [goalData, setGoalData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'savings'
  })
  const [loading, setLoading] = useState(false)

  const categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Travel', 'Education',
    'Investment', 'Savings', 'Other'
  ]

  const features = [
    { id: 'addTransaction', label: 'Add Transaction', icon: 'Plus', color: 'primary' },
    { id: 'createBudget', label: 'Create Budget', icon: 'PieChart', color: 'secondary' },
    { id: 'setGoal', label: 'Set Goal', icon: 'Target', color: 'accent' }
  ]

  const handleTransactionSubmit = async (e) => {
    e.preventDefault()
    if (!formData.description || !formData.amount) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const transaction = {
        ...formData,
        amount: parseFloat(formData.amount),
        accountId: formData.accountId || accounts[0]?.id || 'default'
      }
      
      await transactionService.create(transaction)
      toast.success("Transaction added successfully!")
      setFormData({
        description: '',
        amount: '',
        category: '',
        type: 'expense',
        accountId: '',
        date: new Date().toISOString().split('T')[0]
      })
      onDataUpdate?.()
    } catch (error) {
      toast.error("Failed to add transaction")
    } finally {
      setLoading(false)
    }
  }

  const handleBudgetSubmit = async (e) => {
    e.preventDefault()
    if (!budgetData.name || !budgetData.totalAmount) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const budget = {
        ...budgetData,
        totalAmount: parseFloat(budgetData.totalAmount),
        userId: 'current-user',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
      
      await budgetService.create(budget)
      toast.success("Budget created successfully!")
      setBudgetData({
        name: '',
        totalAmount: '',
        period: 'monthly',
        categories: []
      })
      onDataUpdate?.()
    } catch (error) {
      toast.error("Failed to create budget")
    } finally {
      setLoading(false)
    }
  }

  const handleGoalSubmit = async (e) => {
    e.preventDefault()
    if (!goalData.name || !goalData.targetAmount) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const goal = {
        ...goalData,
        targetAmount: parseFloat(goalData.targetAmount),
        currentAmount: parseFloat(goalData.currentAmount) || 0,
        userId: 'current-user'
      }
      
      await goalService.create(goal)
      toast.success("Goal set successfully!")
      setGoalData({
        name: '',
        targetAmount: '',
        currentAmount: '',
        deadline: '',
        category: 'savings'
      })
      onDataUpdate?.()
    } catch (error) {
      toast.error("Failed to set goal")
    } finally {
      setLoading(false)
    }
  }

  const renderTransactionForm = () => (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleTransactionSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-700">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
            placeholder="Coffee at Starbucks"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-700">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-surface-500">$</span>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full pl-8 pr-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-700">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
            required
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-700">Type</label>
          <div className="flex space-x-3">
            {['expense', 'income'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({...formData, type})}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.type === type
                    ? type === 'income' 
                      ? 'border-secondary bg-secondary/10 text-secondary' 
                      : 'border-error bg-error/10 text-error'
                    : 'border-white/20 bg-white/30 text-surface-600 hover:bg-white/50'
                }`}
              >
                <ApperIcon 
                  name={type === 'income' ? 'ArrowDownLeft' : 'ArrowUpRight'} 
                  className="h-5 w-5 mx-auto mb-1" 
                />
                <span className="text-sm font-medium capitalize">{type}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-700">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-700">Account</label>
          <select
            value={formData.accountId}
            onChange={(e) => setFormData({...formData, accountId: e.target.value})}
            className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
          >
            <option value="">Select account</option>
            {accounts.map(account => (
              <option key={account?.id} value={account?.id}>
                {account?.name || 'Unknown Account'} - ${(account?.balance || 0).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-xl font-semibold hover-lift active-scale transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <div className="animate-spin">
              <ApperIcon name="Loader2" className="h-5 w-5" />
            </div>
            <span>Adding Transaction...</span>
          </>
        ) : (
          <>
            <ApperIcon name="Plus" className="h-5 w-5" />
            <span>Add Transaction</span>
          </>
        )}
      </button>
    </motion.form>
  )

  const renderBudgetForm = () => (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleBudgetSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-700">Budget Name</label>
          <input
            type="text"
            value={budgetData.name}
            onChange={(e) => setBudgetData({...budgetData, name: e.target.value})}
            className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
            placeholder="Monthly Expenses"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-700">Total Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-surface-500">$</span>
            <input
              type="number"
              step="0.01"
              value={budgetData.totalAmount}
              onChange={(e) => setBudgetData({...budgetData, totalAmount: e.target.value})}
              className="w-full pl-8 pr-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
              placeholder="2000.00"
              required
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-surface-700">Period</label>
          <div className="grid grid-cols-3 gap-3">
            {['weekly', 'monthly', 'yearly'].map(period => (
              <button
                key={period}
                type="button"
                onClick={() => setBudgetData({...budgetData, period})}
                className={`py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                  budgetData.period === period
                    ? 'border-secondary bg-secondary/10 text-secondary'
                    : 'border-white/20 bg-white/30 text-surface-600 hover:bg-white/50'
                }`}
              >
                <span className="text-sm font-medium capitalize">{period}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-secondary to-secondary-dark text-white py-4 rounded-xl font-semibold hover-lift active-scale transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <div className="animate-spin">
              <ApperIcon name="Loader2" className="h-5 w-5" />
            </div>
            <span>Creating Budget...</span>
          </>
        ) : (
          <>
            <ApperIcon name="PieChart" className="h-5 w-5" />
            <span>Create Budget</span>
          </>
        )}
      </button>
    </motion.form>
  )

  const renderGoalForm = () => (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleGoalSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-700">Goal Name</label>
          <input
            type="text"
            value={goalData.name}
            onChange={(e) => setGoalData({...goalData, name: e.target.value})}
            className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
            placeholder="Emergency Fund"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-700">Target Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-surface-500">$</span>
            <input
              type="number"
              step="0.01"
              value={goalData.targetAmount}
              onChange={(e) => setGoalData({...goalData, targetAmount: e.target.value})}
              className="w-full pl-8 pr-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
              placeholder="10000.00"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-700">Current Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-surface-500">$</span>
            <input
              type="number"
              step="0.01"
              value={goalData.currentAmount}
              onChange={(e) => setGoalData({...goalData, currentAmount: e.target.value})}
              className="w-full pl-8 pr-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-700">Deadline</label>
          <input
            type="date"
            value={goalData.deadline}
            onChange={(e) => setGoalData({...goalData, deadline: e.target.value})}
            className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-surface-700">Category</label>
          <select
            value={goalData.category}
            onChange={(e) => setGoalData({...goalData, category: e.target.value})}
            className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
          >
            <option value="savings">Savings</option>
            <option value="investment">Investment</option>
            <option value="debt">Debt Repayment</option>
            <option value="purchase">Major Purchase</option>
            <option value="travel">Travel</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-accent to-accent-dark text-white py-4 rounded-xl font-semibold hover-lift active-scale transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <div className="animate-spin">
              <ApperIcon name="Loader2" className="h-5 w-5" />
            </div>
            <span>Setting Goal...</span>
          </>
        ) : (
          <>
            <ApperIcon name="Target" className="h-5 w-5" />
            <span>Set Goal</span>
          </>
        )}
      </button>
    </motion.form>
  )

  return (
    <div className="glass-morphism rounded-2xl p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-surface-900 mb-3">Financial Actions</h2>
        <p className="text-surface-600">Manage your finances with these powerful tools</p>
      </div>

      {/* Feature Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 p-1 bg-white/30 rounded-xl">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setActiveFeature(feature.id)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 flex-1 sm:flex-none ${
              activeFeature === feature.id
                ? `bg-${feature.color} text-white shadow-lg`
                : 'text-surface-700 hover:bg-white/50'
            }`}
          >
            <ApperIcon name={feature.icon} className="h-4 w-4" />
            <span className="text-sm font-medium">{feature.label}</span>
          </button>
        ))}
      </div>

      {/* Feature Content */}
      <AnimatePresence mode="wait">
        {activeFeature === 'addTransaction' && renderTransactionForm()}
        {activeFeature === 'createBudget' && renderBudgetForm()}
        {activeFeature === 'setGoal' && renderGoalForm()}
      </AnimatePresence>
    </div>
  )
}

export default MainFeature