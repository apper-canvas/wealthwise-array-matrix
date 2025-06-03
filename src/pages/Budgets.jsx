import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import budgetService from '../services/api/budgetService'

const Budgets = () => {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editBudget, setEditBudget] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    period: 'monthly'
  })

  useEffect(() => {
    const loadBudgets = async () => {
      try {
        const data = await budgetService.getAll()
        setBudgets(data || [])
      } catch (error) {
        toast.error('Failed to load budgets')
      } finally {
        setLoading(false)
      }
    }
    loadBudgets()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.totalAmount) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const budget = {
        ...formData,
        totalAmount: parseFloat(formData.totalAmount),
        userId: 'current-user',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
      
      if (editBudget) {
        await budgetService.update(editBudget.id, budget)
        toast.success("Budget updated successfully!")
        setBudgets(prev => prev.map(b => b.id === editBudget.id ? { ...b, ...budget } : b))
      } else {
        const newBudget = await budgetService.create(budget)
        toast.success("Budget created successfully!")
        setBudgets(prev => [...prev, newBudget])
      }
      
      setFormData({ name: '', totalAmount: '', period: 'monthly' })
      setShowAddModal(false)
      setEditBudget(null)
    } catch (error) {
      toast.error(editBudget ? "Failed to update budget" : "Failed to create budget")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return
    
    try {
      await budgetService.delete(id)
      toast.success("Budget deleted successfully!")
      setBudgets(prev => prev.filter(b => b.id !== id))
    } catch (error) {
      toast.error("Failed to delete budget")
    }
  }

  const handleEdit = (budget) => {
    setEditBudget(budget)
    setFormData({
      name: budget.name || '',
      totalAmount: budget.totalAmount?.toString() || '',
      period: budget.period || 'monthly'
    })
    setShowAddModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 flex items-center space-x-4">
          <div className="animate-spin">
            <ApperIcon name="Loader2" className="h-6 w-6 text-primary" />
          </div>
          <span className="text-surface-700">Loading budgets...</span>
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
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark transition-colors flex items-center space-x-2"
            >
              <ApperIcon name="Plus" className="h-4 w-4" />
              <span>Create Budget</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Page Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-surface-900 mb-2">Budgets</h1>
          <p className="text-surface-600">Track and manage your budgets</p>
        </motion.div>

        {/* Budgets Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {budgets.map((budget, index) => (
            <motion.div
              key={budget.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              className="glass-morphism rounded-2xl p-6 hover-lift group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center">
                  <ApperIcon name="PieChart" className="h-6 w-6 text-white" />
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <ApperIcon name="Edit" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                  >
                    <ApperIcon name="Trash2" className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-surface-900 text-lg">{budget.name}</h3>
                  <p className="text-sm text-surface-600 capitalize">{budget.period} Budget</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-600">Budget Amount</span>
                    <span className="font-semibold text-surface-900">${(budget.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  
                  <div className="w-full bg-surface-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-secondary to-secondary-dark h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.random() * 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-surface-500">
                    <span>Used: ${Math.floor(Math.random() * (budget.totalAmount || 1000)).toLocaleString()}</span>
                    <span>Remaining: ${Math.floor(Math.random() * (budget.totalAmount || 1000)).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-surface-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-600">Categories</span>
                    <span className="text-surface-500">{budget.categories?.length || 0} categories</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {budgets.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="glass-morphism rounded-2xl p-12">
                <ApperIcon name="PieChart" className="h-16 w-16 text-surface-300 mx-auto mb-4" />
                <p className="text-surface-500">No budgets created yet</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 bg-secondary text-white px-6 py-2 rounded-lg hover:bg-secondary-dark transition-colors"
                >
                  Create Your First Budget
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowAddModal(false)
              setEditBudget(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-morphism rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-surface-900 mb-6">
                {editBudget ? 'Edit Budget' : 'Create Budget'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-surface-700">Budget Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
                    placeholder="Monthly Expenses"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-surface-700">Total Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-surface-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                      className="w-full pl-8 pr-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
                      placeholder="2000.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-surface-700">Period</label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {['weekly', 'monthly', 'yearly'].map(period => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setFormData({...formData, period})}
                        className={`py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.period === period
                            ? 'border-secondary bg-secondary/10 text-secondary'
                            : 'border-white/20 bg-white/30 text-surface-600 hover:bg-white/50'
                        }`}
                      >
                        <span className="text-sm font-medium capitalize">{period}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditBudget(null)
                    }}
                    className="flex-1 py-3 bg-surface-200 text-surface-700 rounded-xl font-medium hover:bg-surface-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-secondary text-white rounded-xl font-medium hover:bg-secondary-dark transition-colors"
                  >
                    {editBudget ? 'Update' : 'Create'} Budget
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Budgets