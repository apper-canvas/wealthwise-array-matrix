import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import transactionService from '../services/api/transactionService'
import accountService from '../services/api/accountService'

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editTransaction, setEditTransaction] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense',
    accountId: '',
    date: new Date().toISOString().split('T')[0]
  })

  const categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Travel', 'Education',
    'Investment', 'Savings', 'Other'
  ]

  useEffect(() => {
    const loadData = async () => {
      try {
        const [transactionData, accountData] = await Promise.all([
          transactionService.getAll(),
          accountService.getAll()
        ])
        setTransactions(transactionData || [])
        setAccounts(accountData || [])
      } catch (error) {
        toast.error('Failed to load transactions')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.description || !formData.amount) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const transaction = {
        ...formData,
        amount: parseFloat(formData.amount),
        accountId: formData.accountId || accounts[0]?.id || 'default'
      }
      
      if (editTransaction) {
        await transactionService.update(editTransaction.id, transaction)
        toast.success("Transaction updated successfully!")
        setTransactions(prev => prev.map(t => t.id === editTransaction.id ? { ...t, ...transaction } : t))
      } else {
        const newTransaction = await transactionService.create(transaction)
        toast.success("Transaction added successfully!")
        setTransactions(prev => [newTransaction, ...prev])
      }
      
      setFormData({
        description: '',
        amount: '',
        category: '',
        type: 'expense',
        accountId: '',
        date: new Date().toISOString().split('T')[0]
      })
      setShowAddModal(false)
      setEditTransaction(null)
    } catch (error) {
      toast.error(editTransaction ? "Failed to update transaction" : "Failed to add transaction")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return
    
    try {
      await transactionService.delete(id)
      toast.success("Transaction deleted successfully!")
      setTransactions(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      toast.error("Failed to delete transaction")
    }
  }

  const handleEdit = (transaction) => {
    setEditTransaction(transaction)
    setFormData({
      description: transaction.description || '',
      amount: Math.abs(transaction.amount).toString() || '',
      category: transaction.category || '',
      type: transaction.type || 'expense',
      accountId: transaction.accountId || '',
      date: transaction.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0]
    })
    setShowAddModal(true)
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 flex items-center space-x-4">
          <div className="animate-spin">
            <ApperIcon name="Loader2" className="h-6 w-6 text-primary" />
          </div>
          <span className="text-surface-700">Loading transactions...</span>
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
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
            >
              <ApperIcon name="Plus" className="h-4 w-4" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Page Title & Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-surface-900 mb-6">Transactions</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {['all', 'income', 'expense'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === type 
                      ? 'bg-primary text-white' 
                      : 'bg-white/50 text-surface-700 hover:bg-white/70'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-lg focus:bg-white focus:border-primary transition-all duration-200"
              />
            </div>
          </div>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-morphism rounded-2xl p-6"
        >
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.05 * index }}
                className="flex items-center justify-between p-4 hover:bg-white/50 rounded-xl transition-colors group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    transaction.type === 'income' 
                      ? 'bg-secondary/10 text-secondary' 
                      : 'bg-error/10 text-error'
                  }`}>
                    <ApperIcon 
                      name={transaction.type === 'income' ? 'ArrowDownLeft' : 'ArrowUpRight'} 
                      className="h-6 w-6" 
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-surface-900">{transaction.description}</p>
                    <p className="text-sm text-surface-600">{transaction.category}</p>
                    <p className="text-xs text-surface-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.type === 'income' ? 'text-secondary' : 'text-error'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Edit" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <ApperIcon name="Inbox" className="h-16 w-16 text-surface-300 mx-auto mb-4" />
                <p className="text-surface-500">No transactions found</p>
              </div>
            )}
          </div>
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
              setEditTransaction(null)
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
                {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
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

                <div>
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

                <div>
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

                <div>
                  <label className="text-sm font-medium text-surface-700">Type</label>
                  <div className="flex space-x-3 mt-2">
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
                        <span className="text-sm font-medium capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-surface-700">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:bg-white focus:border-primary transition-all duration-200"
                    required
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditTransaction(null)
                    }}
                    className="flex-1 py-3 bg-surface-200 text-surface-700 rounded-xl font-medium hover:bg-surface-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
                  >
                    {editTransaction ? 'Update' : 'Add'} Transaction
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

export default Transactions