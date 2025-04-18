import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Download, Send, Save, FileText, 
  DollarSign, Percent, Calendar, User, Building, 
  Hash, CreditCard, Check
} from 'lucide-react';

const MainFeature = () => {
  // Invoice state
  const [invoice, setInvoice] = useState({
    invoiceNumber: '',
    date: formatDate(new Date()),
    dueDate: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
    client: {
      name: '',
      email: '',
      address: '',
    },
    items: [
      { id: 1, description: '', quantity: 1, price: 0, total: 0 }
    ],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    total: 0,
    notes: '',
  });
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // Preview mode
  const [previewMode, setPreviewMode] = useState(false);
  
  // Success message
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Calculate totals whenever items, tax rate, or discount changes
  useEffect(() => {
    const items = invoice.items.map(item => ({
      ...item,
      total: item.quantity * item.price
    }));
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (invoice.taxRate / 100);
    const total = subtotal + taxAmount - invoice.discount;
    
    setInvoice(prev => ({
      ...prev,
      items,
      subtotal,
      taxAmount,
      total
    }));
  }, [invoice.items, invoice.taxRate, invoice.discount]);
  
  // Format date to YYYY-MM-DD
  function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    
    return [year, month, day].join('-');
  }
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setInvoice(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setInvoice(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle numeric input changes
  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    
    setInvoice(prev => ({
      ...prev,
      [name]: numericValue
    }));
  };
  
  // Handle item changes
  const handleItemChange = (id, field, value) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id 
          ? { 
              ...item, 
              [field]: field === 'price' || field === 'quantity' 
                ? (parseFloat(value) || 0) 
                : value 
            } 
          : item
      )
    }));
  };
  
  // Add new item
  const addItem = () => {
    const newId = Math.max(0, ...invoice.items.map(item => item.id)) + 1;
    
    setInvoice(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: newId, description: '', quantity: 1, price: 0, total: 0 }
      ]
    }));
  };
  
  // Remove item
  const removeItem = (id) => {
    if (invoice.items.length === 1) {
      return; // Keep at least one item
    }
    
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!invoice.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'Invoice number is required';
    }
    
    if (!invoice.client.name.trim()) {
      newErrors['client.name'] = 'Client name is required';
    }
    
    invoice.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`items[${index}].description`] = 'Description is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real app, this would save the invoice to a database
      console.log('Invoice submitted:', invoice);
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Generate a new invoice number for the next invoice
      const nextInvoiceNumber = `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Reset form with a new invoice number and keeping the same client
      setInvoice(prev => ({
        ...prev,
        invoiceNumber: nextInvoiceNumber,
        items: [{ id: 1, description: '', quantity: 1, price: 0, total: 0 }],
        subtotal: 0,
        taxAmount: 0,
        total: 0,
        notes: ''
      }));
    }
  };
  
  // Toggle preview mode
  const togglePreview = () => {
    if (!previewMode && !validateForm()) {
      return;
    }
    
    setPreviewMode(!previewMode);
  };
  
  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 p-4 rounded-lg flex items-center justify-center"
          >
            <Check size={20} className="mr-2" />
            Invoice created successfully!
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {previewMode ? 'Invoice Preview' : 'Create New Invoice'}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={togglePreview}
            className={`btn ${previewMode ? 'btn-outline' : 'btn-secondary'}`}
          >
            {previewMode ? 'Edit Invoice' : 'Preview'}
          </button>
          {previewMode && (
            <div className="flex gap-2">
              <button type="button" className="btn btn-outline flex items-center">
                <Download size={18} className="mr-2" /> Download
              </button>
              <button type="button" className="btn btn-primary flex items-center">
                <Send size={18} className="mr-2" /> Send
              </button>
            </div>
          )}
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {previewMode ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="card p-8"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">B</span>
                  </div>
                  <span className="text-xl font-bold">BillCraft</span>
                </div>
                <p className="text-surface-600 dark:text-surface-400">123 Business Street</p>
                <p className="text-surface-600 dark:text-surface-400">City, State 12345</p>
                <p className="text-surface-600 dark:text-surface-400">contact@billcraft.com</p>
              </div>
              
              <div className="text-right">
                <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
                <p className="flex items-center justify-end text-surface-600 dark:text-surface-400 mb-1">
                  <Hash size={16} className="mr-1" /> {invoice.invoiceNumber}
                </p>
                <p className="flex items-center justify-end text-surface-600 dark:text-surface-400 mb-1">
                  <Calendar size={16} className="mr-1" /> Issue Date: {invoice.date}
                </p>
                <p className="flex items-center justify-end text-surface-600 dark:text-surface-400">
                  <Calendar size={16} className="mr-1" /> Due Date: {invoice.dueDate}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between mb-8 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-surface-500 dark:text-surface-400 mb-2 flex items-center">
                  <Building size={16} className="mr-1" /> BILL TO
                </h3>
                <p className="font-semibold">{invoice.client.name}</p>
                <p className="text-surface-600 dark:text-surface-400">{invoice.client.email}</p>
                <p className="text-surface-600 dark:text-surface-400 whitespace-pre-line">{invoice.client.address}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-surface-500 dark:text-surface-400 mb-2 flex items-center">
                  <CreditCard size={16} className="mr-1" /> PAYMENT DETAILS
                </h3>
                <p className="text-surface-600 dark:text-surface-400">Bank Transfer</p>
                <p className="text-surface-600 dark:text-surface-400">Account: XXXX-XXXX-XXXX-1234</p>
              </div>
            </div>
            
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-700">
                    <th className="py-3 px-4 text-left">Description</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-surface-200 dark:border-surface-700">
                      <td className="py-3 px-4">{item.description}</td>
                      <td className="py-3 px-4 text-right">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">${item.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end">
              <div className="w-full md:w-64">
                <div className="flex justify-between py-2">
                  <span className="text-surface-600 dark:text-surface-400">Subtotal:</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-surface-600 dark:text-surface-400">Tax ({invoice.taxRate}%):</span>
                  <span>${invoice.taxAmount.toFixed(2)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-surface-600 dark:text-surface-400">Discount:</span>
                    <span>-${invoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t border-surface-200 dark:border-surface-700 font-bold">
                  <span>Total:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {invoice.notes && (
              <div className="mt-8 p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-surface-600 dark:text-surface-400 whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="card p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-medium mb-4 flex items-center">
                  <FileText size={18} className="mr-2" /> Invoice Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="invoiceNumber" className="block text-sm font-medium mb-1">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      id="invoiceNumber"
                      name="invoiceNumber"
                      value={invoice.invoiceNumber}
                      onChange={handleChange}
                      placeholder="INV-0001"
                      className={`input-field ${errors.invoiceNumber ? 'border-red-500 dark:border-red-500' : ''}`}
                    />
                    {errors.invoiceNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.invoiceNumber}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium mb-1">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={invoice.date}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      value={invoice.dueDate}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4 flex items-center">
                  <User size={18} className="mr-2" /> Client Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="clientName" className="block text-sm font-medium mb-1">
                      Client Name
                    </label>
                    <input
                      type="text"
                      id="clientName"
                      name="client.name"
                      value={invoice.client.name}
                      onChange={handleChange}
                      placeholder="Client or Company Name"
                      className={`input-field ${errors['client.name'] ? 'border-red-500 dark:border-red-500' : ''}`}
                    />
                    {errors['client.name'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['client.name']}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="clientEmail" className="block text-sm font-medium mb-1">
                      Client Email
                    </label>
                    <input
                      type="email"
                      id="clientEmail"
                      name="client.email"
                      value={invoice.client.email}
                      onChange={handleChange}
                      placeholder="client@example.com"
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="clientAddress" className="block text-sm font-medium mb-1">
                      Client Address
                    </label>
                    <textarea
                      id="clientAddress"
                      name="client.address"
                      value={invoice.client.address}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Street, City, State, ZIP"
                      className="input-field"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            
            <h3 className="font-medium mb-4">Invoice Items</h3>
            
            <div className="mb-6 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-700">
                    <th className="py-3 px-4 text-left">Description</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-right">Price ($)</th>
                    <th className="py-3 px-4 text-right">Total ($)</th>
                    <th className="py-3 px-4 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={item.id} className="border-b border-surface-200 dark:border-surface-700">
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder="Item description"
                          className={`input-field ${errors[`items[${index}].description`] ? 'border-red-500 dark:border-red-500' : ''}`}
                        />
                        {errors[`items[${index}].description`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`items[${index}].description`]}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          className="input-field text-right"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                          className="input-field text-right"
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ${item.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-surface-500 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mb-8">
              <button
                type="button"
                onClick={addItem}
                className="btn btn-outline flex items-center"
              >
                <Plus size={18} className="mr-2" /> Add Item
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-medium mb-4">Additional Information</h3>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={invoice.notes}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Additional notes or payment instructions..."
                    className="input-field"
                  ></textarea>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Summary</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="taxRate" className="block text-sm font-medium mb-1 flex items-center">
                      <Percent size={16} className="mr-1" /> Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      id="taxRate"
                      name="taxRate"
                      min="0"
                      max="100"
                      step="0.01"
                      value={invoice.taxRate}
                      onChange={handleNumericChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="discount" className="block text-sm font-medium mb-1 flex items-center">
                      <DollarSign size={16} className="mr-1" /> Discount Amount
                    </label>
                    <input
                      type="number"
                      id="discount"
                      name="discount"
                      min="0"
                      step="0.01"
                      value={invoice.discount}
                      onChange={handleNumericChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
                    <div className="flex justify-between py-1">
                      <span className="text-surface-600 dark:text-surface-400">Subtotal:</span>
                      <span>${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-surface-600 dark:text-surface-400">Tax ({invoice.taxRate}%):</span>
                      <span>${invoice.taxAmount.toFixed(2)}</span>
                    </div>
                    {invoice.discount > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-surface-600 dark:text-surface-400">Discount:</span>
                        <span>-${invoice.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-t border-surface-200 dark:border-surface-700 mt-1 pt-2 font-bold">
                      <span>Total:</span>
                      <span>${invoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button type="button" className="btn btn-outline flex items-center">
                <Save size={18} className="mr-2" /> Save Draft
              </button>
              <button type="submit" className="btn btn-primary flex items-center">
                <FileText size={18} className="mr-2" /> Create Invoice
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainFeature;