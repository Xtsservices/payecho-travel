import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export default function StatCard({
  label,
  value,
  change,
  icon: Icon,
  color,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-xl transition-shadow cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change && (
          <span className="text-xs font-semibold text-green-600">
            {change}
          </span>
        )}
      </div>
      <h3 className="text-xl sm:text-2xl font-black mb-0.5">{value}</h3>
      <p className="text-gray-600 text-xs">{label}</p>
    </motion.div>
  );
}
