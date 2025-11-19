import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { CharityForm, WishItem } from './AddCharity';

interface Charity {
  id: number;
  name: string;
  description?: string;
  website?: string;
  logo_url?: string;
  image_url?: string;
  wishes: number;
  status: 'active' | 'inactive';
}

interface EditCharityModalProps {
  charity: Charity;
  onClose: () => void;
  onSave: (id: number, data: CharityForm) => void;
}

const EditCharityModal: React.FC<EditCharityModalProps> = ({ charity, onClose, onSave }) => {
  const [formData, setFormData] = useState<CharityForm>({
    name: charity.name,
    description: charity.description || '',
    website: charity.website || '',
    logo_url: charity.logo_url || '',
    image_url: charity.image_url || '',
    wishes: [{ title: '', description: '', quantity: 0, unit_price: 0, total_price: 0 }]
  });

  const handleInputChange = (field: keyof Omit<CharityForm, 'wishes'>, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleWishChange = (index: number, field: keyof WishItem, value: string | number) => {
    const updatedWishes = [...formData.wishes];
    updatedWishes[index] = { ...updatedWishes[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? Number(value) : updatedWishes[index].quantity;
      const unitPrice = field === 'unit_price' ? Number(value) : updatedWishes[index].unit_price;
      updatedWishes[index].total_price = quantity * unitPrice;
    }
    
    setFormData({ ...formData, wishes: updatedWishes });
  };

  const addWishItem = () => {
    setFormData({
      ...formData,
      wishes: [...formData.wishes, { title: '', description: '', quantity: 0, unit_price: 0, total_price: 0 }]
    });
  };

  const removeWishItem = (index: number) => {
    if (formData.wishes.length > 1) {
      const updatedWishes = formData.wishes.filter((_, i) => i !== index);
      setFormData({ ...formData, wishes: updatedWishes });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(charity.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Charity</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Charity Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter charity name"
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
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Wishes</h3>
              <button
                type="button"
                onClick={addWishItem}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Wish
              </button>
            </div>

            {formData.wishes.map((wish, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">Wish {index + 1}</h4>
                  {formData.wishes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWishItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      required
                      value={wish.title}
                      onChange={(e) => handleWishChange(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter wish title"
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={wish.quantity}
                      onChange={(e) => handleWishChange(index, 'quantity', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={wish.unit_price}
                      onChange={(e) => handleWishChange(index, 'unit_price', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Price ($)</label>
                    <input
                      type="number"
                      required
                      value={wish.total_price}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EditCharityModal;