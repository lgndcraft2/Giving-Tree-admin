import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import type { CharityForm } from './AddCharity';
import type { Wish } from "./WishTable";
import ImageUpload from './ImageUpload';

// --- Interfaces (Kept consistent with your logic) ---
interface Charity {
  id: number;
  name: string;
  description?: string;
  website?: string;
  image_url?: string;
  wish_length: number;
  active: boolean;
}

interface EditCharityModalProps {
  charity: Charity;
  wishes: Wish[];
  onClose: () => void;
  onSave: (id: number, data: CharityForm) => void;
}

// Extract URL to a constant or Environment Variable
const API_URL = 'https://giving-tree-admin.onrender.com';

const EditCharityModal: React.FC<EditCharityModalProps> = ({ charity, wishes, onClose, onSave }) => {
  const MIN_WISHES = 1; 
  const MAX_WISHES = 5;

  const [error, setError] = useState<string | null>(null); 
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form state
  const [formData, setFormData] = useState<CharityForm>({
    name: charity.name,
    description: charity.description || '',
    website: charity.website || '',
    image_url: charity.image_url || '',
    wishes: wishes.map((wish) => ({
        id: wish.id, 
        name: wish.name,
        description: wish.description,
        quantity: wish.quantity,
        unit_price: wish.unit_price,
        total_price: wish.quantity * wish.unit_price, 
    })),
  });

  // Close on Escape Key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleInputChange = (field: keyof Omit<CharityForm, 'wishes'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWishChange = (index: number, field: keyof Wish | 'name' | 'description', value: string | number) => {
    setFormData(prev => {
        const updatedWishes = [...prev.wishes];
        const currentWish = { ...updatedWishes[index] };

        // Handle Numeric Fields
        if (field === 'quantity' || field === 'unit_price') {
            const numValue = value === '' ? 0 : Number(value);
            
            // Prevent NaN updates
            if (isNaN(numValue)) return prev;

            // Update the specific field
            (currentWish as any)[field] = numValue;

            // Recalculate Total Price specifically
            const q = field === 'quantity' ? numValue : currentWish.quantity;
            const p = field === 'unit_price' ? numValue : currentWish.unit_price;
            currentWish.total_price = Number((q * p).toFixed(2));
        } else {
            // Handle String Fields
            (currentWish as any)[field] = value;
        }

        updatedWishes[index] = currentWish;
        return { ...prev, wishes: updatedWishes };
    });
  };

  const addWishItem = () => {
    setError(null);
    if (formData.wishes.length >= MAX_WISHES) {
        setError(`Maximum of ${MAX_WISHES} wishes allowed.`);
        return;
    }
    setFormData(prev => ({
        ...prev,
        // Note: New wishes don't have an ID yet, ensure your backend handles this (usually by omitting ID or sending null)
        wishes: [...prev.wishes, { name: '', description: '', quantity: 0, unit_price: 0, total_price: 0 }]
    }));
  };

  const removeWishItem = (index: number) => {
    setError(null);
    if (formData.wishes.length <= MIN_WISHES) {
        setError(`Minimum of ${MIN_WISHES} wishes required.`);
        return;
    }
    setFormData(prev => ({
        ...prev,
        wishes: prev.wishes.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    setError(null);
    const wishCount = formData.wishes.length;

    if (wishCount < MIN_WISHES || wishCount > MAX_WISHES) {
        setError(`A charity must have between ${MIN_WISHES} and ${MAX_WISHES} wishes.`);
        return false;
    }

    for (let i = 0; i < formData.wishes.length; i++) {
        const wish = formData.wishes[i];
        if (!wish.name.trim() || !wish.description.trim()) {
            setError(`Wish ${i + 1}: Title and description are required.`);
            return false;
        }
        // Strict check: Must be greater than 0
        if (Number(wish.quantity) <= 0 || Number(wish.unit_price) <= 0) {
            setError(`Wish ${i + 1}: Quantity and Unit Price must be greater than 0.`);
            return false;
        }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setError(null);

    try {
        const response = await fetch(`${API_URL}/adders/edit-charity`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: charity.id, ...formData }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to update charity');
        }

        // Success flow
        onSave(charity.id, formData);
        onClose();

    } catch (err) {
        // Safer Error Handling
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    // Backdrop with click-to-close handler
    <div 
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}
    >
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Edit Charity
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Main Charity Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Charity Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        placeholder="Charity Name"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                        type="url"
                        required
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                </div>

                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Charity Logo</label>
                     <div className="flex gap-4 items-start">
                        {formData.image_url && (
                            <img 
                                src={formData.image_url} 
                                alt="Preview" 
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm" 
                            />
                        )}
                        <div className="flex-1">
                            <ImageUpload onUploadSuccess={(url) => handleInputChange('image_url', url)} />
                        </div>
                     </div>
                </div>
            </div>
          </div>

          {/* Wishes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Wish List</h3>
              <button
                type="button"
                onClick={addWishItem}
                disabled={formData.wishes.length >= MAX_WISHES}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    formData.wishes.length >= MAX_WISHES 
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'
                }`}
            >
                <Plus className="w-4 h-4" />
                Add Item
            </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
            
            <div className="space-y-4">
                {formData.wishes.map((wish, index) => (
                <div key={index} className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors relative group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Item {index + 1}</span>
                        {formData.wishes.length > MIN_WISHES && (
                        <button
                            type="button"
                            onClick={() => removeWishItem(index)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Remove wish"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Title & Description */}
                    <div className="md:col-span-12 lg:col-span-6 space-y-3">
                        <input
                            type="text"
                            required
                            value={wish.name}
                            onChange={(e) => handleWishChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 text-sm"
                            placeholder="Item Name (e.g. Textbooks)"
                        />
                        <textarea
                            required
                            value={wish.description}
                            onChange={(e) => handleWishChange(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 text-sm resize-none"
                            placeholder="Description and details..."
                        />
                    </div>

                    {/* Numeric Fields */}
                    <div className="md:col-span-12 lg:col-span-6 grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={wish.quantity || ''}
                                onChange={(e) => handleWishChange(index, 'quantity', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Unit ($)</label>
                            <input
                                type="number"
                                required
                                min="0.01"
                                step="0.01"
                                value={wish.unit_price || ''}
                                onChange={(e) => handleWishChange(index, 'unit_price', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Total ($)</label>
                            <div className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg text-sm text-gray-600 font-mono">
                                {Number(wish.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
                ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-all shadow-sm ${
                  isSaving
                      ? 'bg-green-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 hover:shadow-md'
              }`}
            >
              {isSaving ? (
                  <>Saving...</>
              ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCharityModal;