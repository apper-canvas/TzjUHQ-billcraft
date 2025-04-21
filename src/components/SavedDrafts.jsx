import { useState, useEffect } from 'react';
import { FileText, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const SavedDrafts = ({ onLoadDraft, onDeleteDraft }) => {
  const [drafts, setDrafts] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);

  // Load drafts from localStorage
  useEffect(() => {
    const loadDrafts = () => {
      try {
        const savedDrafts = localStorage.getItem('invoiceDrafts');
        if (savedDrafts) {
          setDrafts(JSON.parse(savedDrafts));
        }
      } catch (error) {
        console.error('Error loading drafts:', error);
      }
    };

    loadDrafts();
    
    // Add event listener to refresh drafts when storage changes
    window.addEventListener('storage', loadDrafts);
    
    return () => {
      window.removeEventListener('storage', loadDrafts);
    };
  }, []);

  // Handle draft deletion with confirmation
  const confirmDeleteDraft = (id) => {
    setShowConfirmDelete(id);
  };

  const deleteDraft = (id) => {
    try {
      const updatedDrafts = drafts.filter(draft => draft.id !== id);
      localStorage.setItem('invoiceDrafts', JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);
      
      // Trigger parent component callback if provided
      if (onDeleteDraft) {
        onDeleteDraft(id);
      }
      
      // Dispatch storage event to update other components
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error deleting draft:', error);
    } finally {
      setShowConfirmDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(null);
  };

  // Handle loading a draft
  const handleLoadDraft = (draft) => {
    if (onLoadDraft) {
      onLoadDraft(draft);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (drafts.length === 0) {
    return null;
  }

  return (
    <div className="card p-6 mb-6">
      <h3 className="font-medium mb-4">Saved Drafts</h3>
      <div className="space-y-4">
        <AnimatePresence>
          {drafts.map((draft) => (
            <motion.div
              key={draft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
              className="border-b border-surface-200 dark:border-surface-700 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-surface-100 dark:bg-surface-800 rounded-lg mr-3">
                    <FileText size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{draft.invoiceNumber || 'Unnamed Draft'}</p>
                    <p className="text-xs text-surface-600 dark:text-surface-400">
                      {draft.client?.name || 'No client'} • 
                      Last edited: {formatDate(draft.lastEdited || new Date())}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {showConfirmDelete === draft.id ? (
                    <>
                      <button 
                        onClick={() => deleteDraft(draft.id)}
                        className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={cancelDelete}
                        className="text-xs px-2 py-1 bg-surface-100 dark:bg-surface-800 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleLoadDraft(draft)}
                        className="p-1 text-surface-500 hover:text-primary transition-colors"
                        aria-label="Load draft"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button 
                        onClick={() => confirmDeleteDraft(draft.id)}
                        className="p-1 text-surface-500 hover:text-red-500 transition-colors"
                        aria-label="Delete draft"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-2 text-xs text-surface-600 dark:text-surface-400 flex justify-between">
                <span>
                  Items: {draft.items?.length || 0}
                </span>
                <span className="font-medium">
                  Total: ${draft.total?.toFixed(2) || '0.00'}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SavedDrafts;