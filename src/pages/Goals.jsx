import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import goalService from '../services/api/goalService'

const Goals = () => {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editGoal, setEditGoal] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'savings'
  })

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const data = await goalService.getAll()
        setGoals(data || [])
      } catch (error) {
        toast.error('Failed to load goals')
      } finally {
        setLoading(false)
      }
    }
    loadGoals()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.targetAmount) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const goal = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        userId: 'current-user'
      }
      
      if (editGoal) {
        await goalService.update(editGoal.id, goal)
        toast.success("Goal updated successfully!")
        setGoals(prev => prev.map(g => g.id === editGoal.id ? { ...g, ...goal } : g))
      } else {
        const newGoal = await goalService.create(goal)
        toast.success("Goal created successfully!")
        setGoals(prev => [...prev, newGoal])
      }
      
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '',
        deadline: '',
        category: 'savings'
      })
      setShowAddModal(false)
      setEditGoal(null)
    } catch (error) {
      toast.error(editGoal ? "Failed to update goal" : "Failed to create goal")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return
    
    try {
      await goalService.delete(id)
      toast.success("Goal deleted successfully!")
      setGoals(prev => prev.filter(g => g.id !== id))
    } catch (error) {
      toast.error("Failed to delete goal")
    }
  }

  const handleEdit = (goal) => {
    setEditGoal(goal)
    setFormData({
      name: goal.name || '',
      targetAmount: goal.targetAmount?.toString() || '',
      currentAmount: goal.currentAmount?.toString() || '',
      deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
      category: goal.category || 'savings'
    })
    setShowAddModal(true)
  }

  const calculateProgress = (current, target) => {
    if (!target || target <= 0) return 0
    return Math.min(100, (current / target) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 flex items-center space-x-4">
          <div className="animate-spin">
            <ApperIcon name="Loader2" className="h-6 w-6 text-primary" />
          </div>
          <span className="text-surface-700">Loading goals...</span>
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
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors flex items-center space-x-2"
            >
              <ApperIcon name="Plus" className="h-4 w-4" />
              <span>Set Goal</span>
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
          <h1 className="text-3xl font-bold text-surface-900 mb-2">Goals</h1>
          <p className="text-surface-600">Track your financial goals and milestones</p>
        </motion.div>

        {/* Goals Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {goals.map((goal, index) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount)
            const isCompleted = progress >= 100
            
            return (
              <motion.div
                key={goal.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                className="glass-morphism rounded-2xl p-6 hover-lift group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-secondary to-secondary-dark' 
                      : 'bg-gradient-to-br from-accent to-accent-dark'
                  }`}>
                    <ApperIcon 
                      name={isCompleted ? "CheckCircle" : "Target"} 
                      className="h-6 w-6 text-white" 
                    />
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Edit" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-surface-900 text-lg">{goal.name}</h3>
                    <p className="text-sm text-surface-600 capitalize">{goal.category} Goal</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-600">Progress</span>
                      <span className="font-semibold text-surface-900">{progress.toFixed(1)}%</span>
                    </div>
                    
                    <div className="w-full bg-surface-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-secondary to-secondary-dark' 
                            : 'bg-gradient-to-r from-accent to-accent-dark'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-600">${(goal.currentAmount || 0).toLocaleString()}</span>
                      <span className="font-semibold text-surface-900">${(goal.targetAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {goal.deadline && (
                    <div className="pt-2 border-t border-surface-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-surface-600">Deadline</span>
                        <span className="text-surface-500">
                          {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {isCompleted && (
                    <div className="bg-secondary/10 text-secondary px-3 py-2 rounded-lg text-center text-sm font-medium">
                      🎉 Goal Completed!
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
          
          {goals.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="glass-morphism rounded-2xl p-12">
                <ApperIcon name="Target" className="h-16 w-16 text-surface-300 mx-auto mb-4" />
                <p className="text-surface-500">No goals set yet</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-dark transition-colors"
                >
                  Set Your First Goal
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
              setEditGoal(null)
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
                {editGoal ? 'Edit Goal' : 'Set Goal'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-surface-700">Goal Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
                    placeholder="Emergency Fund"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-surface-700">Target Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-surface-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                      className="w-full pl-8 pr-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
                      placeholder="10000.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-surface-700">Current Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-surface-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.currentAmount}
                      onChange={(e) => setFormData({...formData, currentAmount: e.target.value})}
                      className="w-full pl-8 pr-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-surface-700">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-surface-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
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

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditGoal(null)
                    }}
                    className="flex-1 py-3 bg-surface-200 text-surface-700 rounded-xl font-medium hover:bg-surface-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-dark transition-colors"
                  >
                    {editGoal ? 'Update' : 'Set'} Goal
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

export default Goals