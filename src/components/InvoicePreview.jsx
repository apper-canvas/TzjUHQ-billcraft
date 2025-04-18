import { Calendar, Hash, Building, CreditCard } from 'lucide-react';

const InvoicePreview = ({ invoice }) => {
  return (
    <div id="invoice-preview" className="card p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">YBP</span>
            </div>
            <span className="text-xl font-bold">Your Billing Partner</span>
          </div>
          <div className="text-surface-600 dark:text-surface-400">
            <p>123 Business Avenue</p>
            <p>Finance District, NY 10001</p>
            <p>contact@yourbillingpartner.com</p>
            <p>+1 (555) 123-4567</p>
          </div>
        </div>
        
        <div className="md:text-right">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">INVOICE</h1>
          <p className="flex items-center md:justify-end text-surface-600 dark:text-surface-400 mb-2">
            <Hash size={16} className="mr-2" /> {invoice.invoiceNumber || 'INV-0000'}
          </p>
          <p className="flex items-center md:justify-end text-surface-600 dark:text-surface-400 mb-2">
            <Calendar size={16} className="mr-2" /> Issue Date: {invoice.date}
          </p>
          <p className="flex items-center md:justify-end text-surface-600 dark:text-surface-400">
            <Calendar size={16} className="mr-2" /> Due Date: {invoice.dueDate}
          </p>
        </div>
      </div>
      
      {/* Client and Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
          <h3 className="text-sm font-semibold text-surface-500 dark:text-surface-400 mb-3 flex items-center">
            <Building size={16} className="mr-2" /> BILL TO
          </h3>
          <p className="font-semibold mb-2">{invoice.client.name || 'Client Name'}</p>
          {invoice.client.email && <p className="text-surface-600 dark:text-surface-400 mb-2">{invoice.client.email}</p>}
          {invoice.client.address && (
            <p className="text-surface-600 dark:text-surface-400 whitespace-pre-line">{invoice.client.address}</p>
          )}
          {!invoice.client.email && !invoice.client.address && (
            <p className="text-surface-600 dark:text-surface-400">No address provided</p>
          )}
        </div>
        
        <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
          <h3 className="text-sm font-semibold text-surface-500 dark:text-surface-400 mb-3 flex items-center">
            <CreditCard size={16} className="mr-2" /> PAYMENT DETAILS
          </h3>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="text-surface-600 dark:text-surface-400">Payment Method:</span>
              <span>Bank Transfer</span>
            </p>
            <p className="flex justify-between">
              <span className="text-surface-600 dark:text-surface-400">Account Number:</span>
              <span>XXXX-XXXX-XXXX-1234</span>
            </p>
            <p className="flex justify-between">
              <span className="text-surface-600 dark:text-surface-400">Payment Terms:</span>
              <span>Net 30</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Invoice Items */}
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-surface-100 dark:bg-surface-800">
              <th className="py-3 px-4 text-left border-b border-surface-200 dark:border-surface-700">Description</th>
              <th className="py-3 px-4 text-right border-b border-surface-200 dark:border-surface-700">Quantity</th>
              <th className="py-3 px-4 text-right border-b border-surface-200 dark:border-surface-700">Unit Price</th>
              <th className="py-3 px-4 text-right border-b border-surface-200 dark:border-surface-700">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-surface-200 dark:border-surface-700">
                <td className="py-3 px-4">{item.description || 'Item description'}</td>
                <td className="py-3 px-4 text-right">{item.quantity}</td>
                <td className="py-3 px-4 text-right">${item.price.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-medium">${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-full md:w-64 p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
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
          <div className="flex justify-between py-2 border-t border-surface-200 dark:border-surface-700 mt-1 pt-2 font-bold">
            <span>Total:</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Notes */}
      {invoice.notes && (
        <div className="mb-8 p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-surface-600 dark:text-surface-400 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}
      
      {/* Footer */}
      <div className="text-center text-surface-500 dark:text-surface-400 text-sm border-t border-surface-200 dark:border-surface-700 pt-4">
        <p>Thank you for your business!</p>
        <p className="mt-2">
          This invoice was created using <span className="font-semibold">Your Billing Partner</span>
        </p>
      </div>
    </div>
  );
};

export default InvoicePreview;