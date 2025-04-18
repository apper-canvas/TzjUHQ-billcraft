import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, ChevronRight } from 'lucide-react';
import MainFeature from '../components/MainFeature';

const Home = () => {
  const [activeTab, setActiveTab] = useState('create');
  
  // Sample recent invoices data
  const recentInvoices = [
    { id: 'INV-2023-001', client: 'Acme Corp', amount: 1250.00, date: '2023-11-15', status: 'paid' },
    { id: 'INV-2023-002', client: 'Globex Inc', amount: 3450.75, date: '2023-11-20', status: 'pending' },
    { id: 'INV-2023-003', client: 'Stark Industries', amount: 7800.50, date: '2023-11-25', status: 'overdue' },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-3/4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to BillDealer</h1>
            <p className="text-surface-600 dark:text-surface-400">
              Create professional, customized invoices in minutes
            </p>
          </div>
          
          <div className="mb-8">
            <div className="flex border-b border-surface-200 dark:border-surface-700 mb-6">
              <button
                className={`px-4 py-3 font-medium transition-colors relative ${
                  activeTab === 'create' 
                    ? 'text-primary' 
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
                }`}
                onClick={() => setActiveTab('create')}
              >
                Create Invoice
                {activeTab === 'create' && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    initial={false}
                  />
                )}
              </button>
              <button
                className={`px-4 py-3 font-medium transition-colors relative ${
                  activeTab === 'templates' 
                    ? 'text-primary' 
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
                }`}
                onClick={() => setActiveTab('templates')}
              >
                Templates
                {activeTab === 'templates' && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    initial={false}
                  />
                )}
              </button>
            </div>
            
            <div className="min-h-[500px]">
              {activeTab === 'create' && <MainFeature />}
              
              {activeTab === 'templates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {['Professional', 'Minimal', 'Creative'].map((template) => (
                    <motion.div
                      key={template}
                      whileHover={{ y: -5 }}
                      className="card p-6 cursor-pointer group"
                    >
                      <div className="aspect-[4/5] mb-4 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                        <FileText size={48} className="text-surface-400 dark:text-surface-500" />
                      </div>
                      <h3 className="font-medium mb-1">{template} Template</h3>
                      <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
                        Perfect for {template.toLowerCase()} business invoices
                      </p>
                      <button className="text-primary flex items-center text-sm font-medium group-hover:underline">
                        Use template <ChevronRight size={16} className="ml-1" />
                      </button>
                    </motion.div>
                  ))}
                  
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="card p-6 cursor-pointer border-dashed"
                  >
                    <div className="aspect-[4/5] mb-4 rounded-lg bg-surface-50 dark:bg-surface-800 flex items-center justify-center border border-dashed border-surface-300 dark:border-surface-700">
                      <Plus size={48} className="text-surface-400 dark:text-surface-500" />
                    </div>
                    <h3 className="font-medium mb-1">Create Custom Template</h3>
                    <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
                      Design your own invoice template from scratch
                    </p>
                    <button className="text-primary flex items-center text-sm font-medium hover:underline">
                      Start designing <ChevronRight size={16} className="ml-1" />
                    </button>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-1/4">
          <div className="card p-6 mb-6">
            <h3 className="font-medium mb-4">Recent Invoices</h3>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-surface-600 dark:text-surface-400">{invoice.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      invoice.status === 'paid' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-center text-primary text-sm font-medium hover:underline">
              View all invoices
            </button>
          </div>
          
          <div className="neu-card">
            <h3 className="font-medium mb-3">Quick Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-surface-600 dark:text-surface-400">Total Invoices</p>
                <p className="text-2xl font-semibold">24</p>
              </div>
              <div>
                <p className="text-sm text-surface-600 dark:text-surface-400">Outstanding</p>
                <p className="text-2xl font-semibold">$12,450.75</p>
              </div>
              <div>
                <p className="text-sm text-surface-600 dark:text-surface-400">Paid this month</p>
                <p className="text-2xl font-semibold">$8,320.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;