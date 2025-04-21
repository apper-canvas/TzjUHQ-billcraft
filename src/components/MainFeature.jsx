import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Download, Send, Save, FileText, 
  DollarSign, Percent, Calendar, User, Building, 
  Hash, CreditCard, Check, Printer, Eye, Edit,
  AlertTriangle
} from 'lucide-react';
import InvoicePreview from './InvoicePreview';
import PrintButton from './PrintButton';

const MainFeature = ({ currentDraft, onDraftSaved }) => {
  // Invoice state
  const [invoice, setInvoice] = useState({
    id: crypto.randomUUID(), // Unique ID for the invoice/draft
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
    lastEdited: new Date().toISOString(),
  });
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // Preview mode
  const [previewMode, setPreviewMode] = useState(false);
  
  // Success message
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Show draft saved message
  const [showDraftSaved, setShowDraftSaved] = useState(false);
  
  // Load draft if one is selected
  useEffect(() => {
    if (currentDraft) {
      setInvoice({
        ...currentDraft,
        lastEdited: new Date().toISOString() // Update last edited date
      });
    }
  }, [currentDraft]);

  // Calculate totals whenever items, tax rate, or discount changes
  useEffect(() => {
    // Calculate item totals
    const updatedItems = invoice.items.map(item => ({
      ...item,
      total: item.quantity * item.price
    }));
    
    // Check if item totals have changed
    const itemsChanged = updatedItems.some((item, index) => 
      item.total !== invoice.items[index].total
    );
    
    if (!itemsChanged && 
        invoice.subtotal === calculateSubtotal(updatedItems) && 
        invoice.taxAmount === calculateTaxAmount(invoice.subtotal, invoice.taxRate) && 
        invoice.total === calculateTotal(invoice.subtotal, invoice.taxAmount, invoice.discount)) {
      // No changes needed, avoid updating state
      return;
    }
    
    // Calculate new values
    const newSubtotal = calculateSubtotal(updatedItems);
    const newTaxAmount = calculateTaxAmount(newSubtotal, invoice.taxRate);
    const newTotal = calculateTotal(newSubtotal, newTaxAmount, invoice.discount);
    
    // Update state only if values have changed
    setInvoice(prev => ({
      ...prev,
      items: updatedItems,
      subtotal: newSubtotal,
      taxAmount: newTaxAmount,
      total: newTotal,
      lastEdited: new Date().toISOString()
    }));
  }, [invoice.items, invoice.taxRate, invoice.discount]);
  
  // Helper functions for calculations
  function calculateSubtotal(items) {
    return items.reduce((sum, item) => sum + item.total, 0);
  }
  
  function calculateTaxAmount(subtotal, taxRate) {
    return subtotal * (taxRate / 100);
  }
  
  function calculateTotal(subtotal, taxAmount, discount) {
    return subtotal + taxAmount - discount;
  }
  
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
        },
        lastEdited: new Date().toISOString()
      }));
    } else {
      setInvoice(prev => ({
        ...prev,
        [name]: value,
        lastEdited: new Date().toISOString()
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
      [name]: numericValue,
      lastEdited: new Date().toISOString()
    }));
  };
  
  // Handle item changes
  const handleItemChange = (id, field, value) => {
    setInvoice(prev => {
      const updatedItems = prev.items.map(item => 
        item.id === id 
          ? { 
              ...item, 
              [field]: field === 'price' || field === 'quantity' 
                ? (parseFloat(value) || 0) 
                : value 
            } 
          : item
      );
      
      return {
        ...prev,
        items: updatedItems,
        lastEdited: new Date().toISOString()
      };
    });
  };
  
  // Add new item
  const addItem = () => {
    const newId = Math.max(0, ...invoice.items.map(item => item.id)) + 1;
    
    setInvoice(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: newId, description: '', quantity: 1, price: 0, total: 0 }
      ],
      lastEdited: new Date().toISOString()
    }));
  };
  
  // Remove item
  const removeItem = (id) => {
    if (invoice.items.length === 1) {
      return; // Keep at least one item
    }
    
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
      lastEdited: new Date().toISOString()
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
  
  // Save draft
  const saveDraft = () => {
    try {
      // Get existing drafts from localStorage
      const existingDraftsString = localStorage.getItem('invoiceDrafts');
      const existingDrafts = existingDraftsString ? JSON.parse(existingDraftsString) : [];
      
      // Check if this draft already exists
      const draftIndex = existingDrafts.findIndex(draft => draft.id === invoice.id);
      
      // Update or add the current draft
      if (draftIndex >= 0) {
        existingDrafts[draftIndex] = invoice;
      } else {
        existingDrafts.push(invoice);
      }
      
      // Save back to localStorage
      localStorage.setItem('invoiceDrafts', JSON.stringify(existingDrafts));
      
      // Show saved message
      setShowDraftSaved(true);
      setTimeout(() => setShowDraftSaved(false), 3000);
      
      // Notify parent component
      if (onDraftSaved) {
        onDraftSaved();
      }
      
      // Trigger storage event to update other components
      window.dispatchEvent(new Event('storage'));
      
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };
  
  // Start a new invoice
  const startNewInvoice = () => {
    // Generate a new invoice number
    const nextInvoiceNumber = `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Create a fresh invoice
    setInvoice({
      id: crypto.randomUUID(),
      invoiceNumber: nextInvoiceNumber,
      date: formatDate(new Date()),
      dueDate: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
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
      lastEdited: new Date().toISOString(),
    });
    
    // Clear any errors
    setErrors({});
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
      
      // Remove from drafts if it was saved
      try {
        const existingDraftsString = localStorage.getItem('invoiceDrafts');
        if (existingDraftsString) {
          const existingDrafts = JSON.parse(existingDraftsString);
          const updatedDrafts = existingDrafts.filter(draft => draft.id !== invoice.id);
          localStorage.setItem('invoiceDrafts', JSON.stringify(updatedDrafts));
          
          // Trigger storage event to update other components
          window.dispatchEvent(new Event('storage'));
        }
      } catch (error) {
        console.error('Error removing draft after submission:', error);
      }
      
      // Start a new invoice
      startNewInvoice();
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
        
        {showDraftSaved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 p-4 rounded-lg flex items-center justify-center"
          >
            <Save size={20} className="mr-2" />
            Draft saved successfully!
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
            className={`btn ${previewMode ? 'btn-outline' : 'btn-secondary'} flex items-center`}
          >
            {previewMode ? (
              <>
                <Edit size={18} className="mr-2" /> Edit Invoice
              </>
            ) : (
              <>
                <Eye size={18} className="mr-2" /> Preview
              </>
            )}
          </button>
          {previewMode && (
            <div className="flex gap-2">
              <PrintButton target="invoice-preview" className="btn btn-outline flex items-center">
                <Printer size={18} className="mr-2" /> Print
              </PrintButton>
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
          >
            <InvoicePreview invoice={invoice} />
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
              <button
                type="button"
                onClick={startNewInvoice}
                className="btn btn-outline flex items-center"
              >
                <Plus size={18} className="mr-2" /> New Invoice
              </button>
              <button 
                type="button" 
                onClick={saveDraft} 
                className="btn btn-outline flex items-center"
              >
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