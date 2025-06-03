import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="glass-morphism rounded-2xl p-8 shadow-elevated">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <ApperIcon name="Search" className="h-8 w-8 text-white" />
          </motion.div>
          
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-surface-900 mb-3">Page Not Found</h2>
          <p className="text-surface-600 mb-8">
            The financial page you're looking for seems to have gone missing from your portfolio.
          </p>
          
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-medium hover-lift active-scale transition-all duration-200"
          >
            <ApperIcon name="Home" className="h-5 w-5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound