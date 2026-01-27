import { motion } from 'framer-motion'
import { pageVariants } from './animations'

export function PageAnimated({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  )
}
