import React from 'react';
import { Trash, Edit, Check, X } from 'lucide-react';


interface Charity {
  id: number;
  name: string;
  wish_length: number;
  active: boolean;
}

interface CharitiesTableProps {
  charities: Charity[];
  onToggleStatus: (id: number) => void;
  onEdit: (charity: Charity) => void;
  onDelete: (id: number) => void;
  isToggling?: boolean; // Add a loading/toggling state
  togglingId?: number | null; // Add the ID of the item currently being toggled
}

const CharitiesTable: React.FC<CharitiesTableProps> = ({ charities, onToggleStatus, onEdit, onDelete, isToggling, togglingId }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">S/N</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">No. of Wishes</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {charities.map((charity, index) => (
            <tr key={charity.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 px-4 text-sm text-gray-900">{index + 1}</td>
              <td className="py-4 px-4 text-sm text-gray-900 font-medium">{charity.name}</td>
              <td className="py-4 px-4 text-sm text-gray-900">{charity.wish_length}</td>
              <td className="py-4 px-4">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-medium ${
                  charity.active
                    ? 'text-green-700' 
                    : 'text-red-700'
                }`}>
                  {charity.active  ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(charity)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                      onClick={() => onToggleStatus(charity.id)}
                      // ⬇️ Disable the button if the overall component is loading OR if THIS specific item is loading
                      disabled={isToggling || togglingId === charity.id} 
                      className="px-3 py-2 text-sm font-medium text-white bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                      {/* Optional: Show a spinner if the specific item is loading */}
                      {togglingId === charity.id 
                          ? <span className='animate-spin'>⚙️</span> 
                          : (charity.active ? <X className='text-red-600 w-4 h-4' /> : <Check className='text-green-600 w-4 h-4' />)
                      }
                  </button>
                  <button
                    onClick={() => onDelete(charity.id)}
                    className="px-3 py-2 text-sm font-medium text-white bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Trash className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default CharitiesTable;