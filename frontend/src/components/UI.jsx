import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ children, className = '', title, subtitle }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`card ${className}`}
  >
    {(title || subtitle) && (
      <div className="mb-6">
        {title && <h3 className="text-xl font-bold text-slate-800">{title}</h3>}
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    )}
    {children}
  </motion.div>
);

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600',
    ghost: 'text-slate-500 hover:bg-slate-100'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`btn ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
    slate: 'bg-slate-100 text-slate-600'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors[color]}`}>
      {children}
    </span>
  );
};

export const Input = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-2">
    {label && <label className="block text-sm font-semibold text-slate-700">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />}
      <input
        className={`w-full ${Icon ? 'pl-10' : 'px-4'} pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
        {...props}
      />
    </div>
  </div>
);

export const LoadingSkeleton = ({ rows = 3 }) => (
  <div className="space-y-4 animate-pulse">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="h-12 bg-slate-100 rounded-xl w-full"></div>
    ))}
  </div>
);
