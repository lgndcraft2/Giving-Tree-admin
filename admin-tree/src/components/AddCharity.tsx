import React, { useState } from 'react';
import { Plus, Trash2, Loader2, AlertTriangle, Save } from 'lucide-react';
import type { Wish } from './WishTable';
import ImageUpload from './ImageUpload';

// --- Types ---
type WishInput = Omit<Wish, 'id' | 'charity_name' | 'fulfilled' | 'current_price'>;

export interface CharityForm {
  name: string;
  description: string;
  website: string;
  image_url: string;
  wishes: WishInput[];
}

interface AddCharityFormProps {
  onSubmit: (charity: CharityForm) => void;
}

// --- Constants ---
const MIN_WISHES = 1;
const MAX_WISHES = 5;
const API_URL = 'https://giving-tree-admin.onrender.com';

const AddCharityForm: React.FC<AddCharityFormProps> = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initial State Factory
  const getInitialState = (): CharityForm => ({
    name: '',
    description: '',
    website: '',
    image_url: '',
    wishes: [
      { name: '', description: '', quantity: 0, unit_price: 0, total_price: 0 },
      { name: '', description: '', quantity: 0, unit_price: 0, total_price: 0 },
      { name: '', description: '', quantity: 0, unit_price: 0, total_price: 0 },
    ]
  });

  const [formData, setFormData] = useState<CharityForm>(getInitialState());

  const resetForm = () => {
    setFormData(getInitialState());
  };

  const handleInputChange = (field: keyof Omit<CharityForm, 'wishes'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleWishChange = (index: number, field: keyof WishInput, value: string | number) => {
    setFormData(prev => {
        const updatedWishes = [...prev.wishes];
        const currentWish = { ...updatedWishes[index] };

        // Handle Numeric Fields safely
        if (field === 'quantity' || field === 'unit_price') {
            const numValue = value === '' ? 0 : Number(value);
            
            if (isNaN(numValue)) return prev; // Stop update if invalid

            (currentWish as any)[field] = numValue;

            // Auto-calculate total_price
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
    setError(null);
  };

  const addWishItem = () => {
    if (formData.wishes.length >= MAX_WISHES) {
      setError(`Maximum of ${MAX_WISHES} wishes allowed`);
      return;
    }
    setFormData(prev => ({
      ...prev,
      wishes: [...prev.wishes, { name: '', description: '', quantity: 0, unit_price: 0, total_price: 0 }]
    }));
    setError(null);
  };

  const removeWishItem = (index: number) => {
    if (formData.wishes.length <= MIN_WISHES) {
      setError(`Minimum of ${MIN_WISHES} wishes required`);
      return;
    }
    setFormData(prev => ({
        ...prev,
        wishes: prev.wishes.filter((_, i) => i !== index)
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    // Check primary charity fields
    if (!formData.name.trim() || !formData.description.trim() || !formData.website.trim() || !formData.image_url.trim()) {
      setError('All Charity Details (Name, Desc, Website, Image) are required.');
      return false;
    }

    // Check wishes count
    if (formData.wishes.length < MIN_WISHES || formData.wishes.length > MAX_WISHES) {
      setError(`A charity must have between ${MIN_WISHES} and ${MAX_WISHES} wishes.`);
      return false;
    }

    // Validate each wish
    for (let i = 0; i < formData.wishes.length; i++) {
      const wish = formData.wishes[i];
      if (!wish.name.trim() || !wish.description.trim()) {
        setError(`Wish ${i + 1}: Title and description are required.`);
        return false;
      }
      if (Number(wish.quantity) <= 0 || Number(wish.unit_price) <= 0) {
        setError(`Wish ${i + 1}: Quantity and Unit Price must be greater than 0.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Clean Payload
      const payload: CharityForm = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        website: formData.website.trim(),
        image_url: formData.image_url.trim(),
        wishes: formData.wishes.map(wish => ({
          name: wish.name.trim(),
          description: wish.description.trim(),
          quantity: Number(wish.quantity),
          unit_price: Number(wish.unit_price),
          total_price: Number(wish.total_price),
        })),
      };

      const response = await fetch(`${API_URL}/adders/charity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create charity (HTTP ${response.status})`);
      }

      // Success
      onSubmit(payload);
      resetForm();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected network error occurred.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAddWish = formData.wishes.length < MAX_WISHES;
  const canRemoveWish = formData.wishes.length > MIN_WISHES;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Add New Charity</h2>
        <p className="text-sm text-gray-500 mt-1">Fill in the details below to onboard a new organization.</p>
      </div>

      {/* Global Error Message */}
      {error && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5 mr-3 text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Charity Details Section */}
      <div className="space-y-5 border-b border-gray-100 pb-8">
        <h3 className="text-lg font-semibold text-gray-800">Organization Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Charity Name</label>
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Local Food Bank"
                    disabled={isSubmitting}
                />
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="What does this charity do?"
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                <input
                    type="url"
                    required
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="https://example.org"
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Charity Logo</label>
                <div className="flex gap-4 items-start">
                    {formData.image_url && (
                        <img 
                            src={formData.image_url} 
                            alt="Preview" 
                            className="w-10 h-10 object-cover rounded-full border border-gray-200" 
                        />
                    )}
                    <div className="flex-1">
                        <ImageUpload 
                            currentImage={formData.image_url}
                            onUploadSuccess={(url) => handleInputChange('image_url', url)} 
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Wishes Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Wish List Items</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Add {MIN_WISHES}-{MAX_WISHES} items. Total: {formData.wishes.length}
            </p>
          </div>
          <button
            type="button"
            onClick={addWishItem}
            disabled={!canAddWish || isSubmitting}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              canAddWish && !isSubmitting
                ? 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'
                : 'text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
            {formData.wishes.map((wish, index) => (
            <div key={index} className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors relative group">
                {/* Header of Card */}
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Item {index + 1}</span>
                    <button
                        type="button"
                        onClick={() => removeWishItem(index)}
                        disabled={!canRemoveWish || isSubmitting}
                        className={`p-1 transition-colors ${
                            canRemoveWish && !isSubmitting
                                ? 'text-gray-400 hover:text-red-600'
                                : 'text-gray-300 cursor-not-allowed'
                        }`}
                        title="Remove wish"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Text Inputs */}
                    <div className="md:col-span-12 lg:col-span-6 space-y-3">
                        <input
                            type="text"
                            required
                            value={wish.name}
                            onChange={(e) => handleWishChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 text-sm"
                            placeholder="Item Name (e.g. School Bags)"
                            disabled={isSubmitting}
                        />
                        <textarea
                            required
                            value={wish.description}
                            onChange={(e) => handleWishChange(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 text-sm resize-none"
                            placeholder="Brief description..."
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Numeric Inputs */}
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
                                placeholder="0"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Unit (₦)</label>
                            <input
                                type="number"
                                required
                                min="0.01"
                                step="0.01"
                                value={wish.unit_price || ''}
                                onChange={(e) => handleWishChange(index, 'unit_price', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 text-sm"
                                placeholder="0.00"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Total (₦)</label>
                            <div className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg text-sm text-gray-600 font-mono">
                                {Number(wish.total_price || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ))}
        </div>
      </div>

      {/* Footer / Submit */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-lg transition-all shadow-sm ${
            isSubmitting
              ? 'bg-green-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 hover:shadow-md'
          }`}
        >
          {isSubmitting ? (
             <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
             <Save className="w-4 h-4" />
          )}
          {isSubmitting ? 'Creating Charity...' : 'Create Charity'}
        </button>
      </div>
    </form>
  );
};

export default AddCharityForm;