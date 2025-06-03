import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Goals from './pages/Goals'
import SpendingInsights from './pages/SpendingInsights'
import NotFound from './pages/NotFound'
import ApperIcon from './components/ApperIcon'

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { name: 'Transactions', path: '/transactions', icon: 'CreditCard' },
    { name: 'Budgets', path: '/budgets', icon: 'PieChart' },
    { name: 'Goals', path: '/goals', icon: 'Target' },
    { name: 'Insights', path: '/insights', icon: 'TrendingUp' }
  ]

  const isActivePath = (path) => location.pathname === path

  return (
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActivePath(item.path)
                    ? 'bg-white/20 text-primary shadow-sm'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-white/10'
                }`}
              >
                <ApperIcon name={item.icon} className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-surface-600 hover:text-surface-900 hover:bg-white/50 rounded-lg transition-colors">
            <ApperIcon name="Bell" className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
          </button>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-surface-600 hover:text-surface-900 hover:bg-white/50 rounded-lg transition-colors"
          >
            <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} className="h-5 w-5" />
          </button>
          
          <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
            <ApperIcon name="User" className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-white/20"
          >
            <nav className="px-4 py-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePath(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-surface-700 hover:bg-surface-50'
                  }`}
                >
                  <ApperIcon name={item.icon} className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
const AppContent = () => {
  const location = useLocation()
  const showNavigation = location.pathname !== '/'

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100">
      {showNavigation && <Navigation />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/insights" element={<SpendingInsights />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16"
        toastClassName="backdrop-blur-glass bg-white/80 border border-white/20 rounded-xl shadow-glass text-surface-800"
      />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App