import React, { useState } from 'react';
import { Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import type { Wish } from './WishTable';

export interface CharityForm {
  name: string;
  description: string;
  website: string;
  logo_url: string;
  image_url: string;
  wishes: Wish[];
}

interface AddCharityFormProps {
  onSubmit: (charity: CharityForm) => void;
}

const MIN_WISHES = 3;
const MAX_WISHES = 5;

const AddCharityForm: React.FC<AddCharityFormProps> = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CharityForm>({
    name: '',
    description: '',
    website: '',
    logo_url: '',
    image_url: '',
    wishes: [
      { name: '', description: '', quantity: 0, unit_price: 0, total_price: 0 },
      { name: '', description: '', quantity: 0, unit_price: 0, total_price: 0 },
      { name: '', description: '', quantity: 0, unit_price: 0, total_price: 0 },
    ]
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      website: '',
      logo_url: '',
      image_url: '',
      wishes: [
        { name: '', description: '', quantity: 0, unit_price: 0, total_price: 0 },
        { name: '', description: '', quantity: 0, unit_price: 0, total_price: 0 },
        { name: '', description: '', quantity: 0, unit_price: 0, total_price: 0 },
      ]
    });
  };

  const handleInputChange = (field: keyof Omit<CharityForm, 'wishes'>, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError(null);
  };

 
  const handleWishChange = (index: number, field: keyof Wish, value: string | number) => {
    const updatedWishes = [...formData.wishes];
    const rawValue = typeof value === 'string' ? value : value;
    let numericValue: number;

    if (field === 'quantity') {
        numericValue = Number(rawValue);
        updatedWishes[index] = { ...updatedWishes[index], quantity: numericValue };
    } else if (field === 'unit_price') {
        numericValue = Number(rawValue);
        updatedWishes[index] = { ...updatedWishes[index], unit_price: numericValue };
    } else {
        // Handle name and description (string values)
        updatedWishes[index] = { ...updatedWishes[index], [field]: rawValue };
    }
    
    // Auto-calculate total_price if quantity or unit_price changes
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = updatedWishes[index].quantity || 0;
      const unitPrice = updatedWishes[index].unit_price || 0;
      
      // Critical fix for floating point errors: 
      // Multiply by 100 before calculation and divide after, 
      // or simply use toFixed(2) on the final result for display/storage.
      
      // Use toFixed(2) for calculation robustness:
      const total = quantity * unitPrice;
      updatedWishes[index].total_price = Number(total.toFixed(2));
    }
    
    setFormData({ ...formData, wishes: updatedWishes });
    setError(null);
  };

  const addWishItem = () => {
    if (formData.wishes.length >= MAX_WISHES) {
      setError(`Maximum of ${MAX_WISHES} wishes allowed`);
      return;
    }
    setFormData({
      ...formData,
      wishes: [...formData.wishes, { name: '', description: '', quantity: 0, unit_price: 0, total_price: 0 }]
    });
    setError(null);
  };

  const removeWishItem = (index: number) => {
    if (formData.wishes.length <= MIN_WISHES) {
      setError(`Minimum of ${MIN_WISHES} wishes required`);
      return;
    }
    const updatedWishes = formData.wishes.filter((_, i) => i !== index);
    setFormData({ ...formData, wishes: updatedWishes });
    setError(null);
  };

  /**
   * Enhanced validation for Charity details and wishes.
   */
  const validateForm = (): boolean => {
    // Check primary charity fields
    if (!formData.name.trim() || !formData.description.trim() || !formData.website.trim() || !formData.logo_url.trim() || !formData.image_url.trim()) {
      setError('All Charity Details fields are required.');
      return false;
    }

    // Check wishes count
    if (formData.wishes.length < MIN_WISHES || formData.wishes.length > MAX_WISHES) {
      setError(`A charity must have between ${MIN_WISHES} and ${MAX_WISHES} wishes.`);
      return false;
    }

    // Validate each wish has required fields and correct values
    for (let i = 0; i < formData.wishes.length; i++) {
      const wish = formData.wishes[i];
      if (!wish.name.trim()) {
        setError(`Wish ${i + 1}: name is required.`);
        return false;
      }
      if (!wish.description.trim()) {
        setError(`Wish ${i + 1}: Description is required.`);
        return false;
      }
      // Use isNaN check for robustness
      if (isNaN(wish.quantity) || wish.quantity <= 0) {
        setError(`Wish ${i + 1}: Quantity must be a number greater than 0.`);
        return false;
      }
      // Use isNaN check for robustness
      if (isNaN(wish.unit_price) || wish.unit_price <= 0) {
        setError(`Wish ${i + 1}: Unit price must be a number greater than 0.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CharityForm = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        website: formData.website.trim(),
        logo_url: formData.logo_url.trim(),
        image_url: formData.image_url.trim(),
        wishes: formData.wishes.map(wish => ({
          name: wish.name.trim(),
          description: wish.description.trim(),
          quantity: Number(wish.quantity),
          unit_price: Number(wish.unit_price),
          total_price: Number(wish.total_price), // Ensure it's a number
        })),
      };

      // API call (using the endpoint provided in your original code)
      const response = await fetch('http://127.0.0.1:5000/adders/charity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization headers would go here
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Attempt to parse specific error message from the backend
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to create charity (HTTP ${response.status})`;
        throw new Error(errorMessage);
      }

      // const result = await response.json(); // You can handle the API response data here
      
      // Call the parent onSubmit callback with the clean payload
      onSubmit(payload); 

      // Reset form
      resetForm();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected network error occurred.';
      setError(errorMessage);
      console.error('Error creating charity:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAddWish = formData.wishes.length < MAX_WISHES;
  const canRemoveWish = formData.wishes.length > MIN_WISHES;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}

      {/* Charity Details Section (No changes needed here) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Charity Details</h3>
        
        {/* ... (Input fields for Name, Description, Website, Logo URL, Image URL) ... */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter charity name"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter charity description"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            required
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://example.com"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
          <input
            type="url"
            required
            value={formData.logo_url}
            onChange={(e) => handleInputChange('logo_url', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://example.com/logo.png"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
          <input
            type="url"
            required
            value={formData.image_url}
            onChange={(e) => handleInputChange('image_url', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Wishes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Wishes</h3>
            <p className="text-sm text-gray-500">
              {formData.wishes.length} of {MAX_WISHES} wishes (minimum {MIN_WISHES})
            </p>
          </div>
          <button
            type="button"
            onClick={addWishItem}
            disabled={!canAddWish || isSubmitting}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              canAddWish && !isSubmitting
                ? 'text-green-600 bg-green-50 hover:bg-green-100'
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Wish
          </button>
        </div>

        {formData.wishes.map((wish, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">Wish {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeWishItem(index)}
                disabled={!canRemoveWish || isSubmitting}
                className={`${
                  canRemoveWish && !isSubmitting
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">name</label>
                <input
                  type="text"
                  required
                  value={wish.name}
                  onChange={(e) => handleWishChange(index, 'name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter wish name"
                  disabled={isSubmitting}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  value={wish.description}
                  onChange={(e) => handleWishChange(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter wish description"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={wish.quantity || ''}
                  onChange={(e) => handleWishChange(index, 'quantity', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="1"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (₦)</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={wish.unit_price || ''}
                  onChange={(e) => handleWishChange(index, 'unit_price', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Price (₦)</label>
                <input
                  type="text"
                  // Display the calculated total_price formatted for currency
                  value={wish.total_price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-3 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${
            isSubmitting
              ? 'bg-green-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Creating...' : 'Create Charity'}
        </button>
      </div>
    </form>
  );
};

export default AddCharityForm;