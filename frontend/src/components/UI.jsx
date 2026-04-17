import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ children, className = '', title, subtitle, glass = false }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className={`${glass ? 'glass' : 'card-premium p-6'} ${className}`}
  >
    {(title || subtitle) && (
      <div className="mb-6">
        {title && <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>}
        {subtitle && <p className="text-sm text-slate-500 font-medium">{subtitle}</p>}
      </div>
    )}
    {children}
  </motion.div>
);

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
    danger: 'bg-rose-500 text-white shadow-lg shadow-rose-100 hover:bg-rose-600',
    success: 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-600',
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`btn-premium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${colors[color]}`}>
      {children}
    </span>
  );
};

export const Input = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="block text-sm font-semibold text-slate-700 ml-1">{label}</label>}
    <div className="relative group">
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
      )}
      <input
        className={`
          w-full ${Icon ? 'pl-11' : 'px-4'} pr-4 py-3 bg-white border border-slate-200 
          rounded-xl outline-none transition-all duration-200
          placeholder:text-slate-400 font-medium text-slate-700
          focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10
          ${error ? 'border-rose-500 focus:ring-rose-500/10' : ''}
        `}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-rose-500 font-medium ml-1">{error}</p>}
  </div>
);

export const LoadingSkeleton = ({ rows = 3 }) => (
  <div className="space-y-4">
    {[...Array(rows)].map((_, i) => (
      <motion.div 
        key={i} 
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="h-14 bg-slate-100 rounded-xl w-full border border-slate-200/50"
      />
    ))}
  </div>
);
