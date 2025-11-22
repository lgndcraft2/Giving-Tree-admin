import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react'; // Import icons for status

export interface Wish {
  id: number;
  name: string;
  description: string;
  unit_price: number;
  quantity: number;
  current_price: number;
  total_price: number;
  charity_name: string;
  fulfilled: boolean;
}

interface WishesTableProps {
  wishes: Wish[];
}

const WishesTable: React.FC<WishesTableProps> = ({ wishes }) => {
  return (
   <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-100">
     <table className="w-full min-w-[700px] divide-y divide-gray-200">
     <thead>
        <tr className="bg-gray-50">
          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-700">S/N</th>
          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-700">Title & Details</th>
          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-700">Quantity / Price</th>
          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-700">Progress</th>
          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-700">Charity</th>
          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-700">Status</th>
        </tr>
     </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {wishes.map((wish, id) => {
            // Ensure requiredDonations is not zero to avoid division by zero
            const progressRatio = wish.total_price > 0 ? (wish.current_price / wish.total_price) : 0;
            const progressPercentage = Math.min(progressRatio * 100, 100);
         return (
          <tr key={wish.id} className="hover:bg-gray-50">
            <td className="py-4 px-4 text-sm text-gray-500">{id + 1}</td>
        
            {/* Title & Description Column */}
              <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                {wish.name}
                <p className="text-xs text-gray-500 truncate max-w-xs mt-1">{wish.description}</p>
              </td>
        
            {/* Quantity / Price Column */}
            <td className="py-4 px-4 text-sm text-gray-900">
                <div className="font-semibold">{wish.quantity} pcs</div>
                <div className="text-xs text-gray-500">@ ₦{wish.unit_price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</div>
            </td>
        
            {/* Progress Column */}
                <td className="py-4 px-4">
                   <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${progressPercentage}%` }}>
                        </div>
                    </div>
           <div className="text-xs text-gray-600 mt-1 font-mono">
          ₦{wish.current_price.toLocaleString('en-NG')} / ₦{wish.total_price.toLocaleString('en-NG')} ({progressPercentage.toFixed(1)}%)
          </div>
                </td>   
          {/* Charity Column */}
          <td className="py-4 px-4 text-sm text-gray-900">{wish.charity_name}</td>
          {/* Status Column */}
          <td className="py-4 px-4">
          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
           wish.fulfilled || progressPercentage >= 100
            ? 'text-white bg-green-500' 
          : 'text-yellow-800 bg-yellow-100'
             }`}>
            {wish.fulfilled || progressPercentage >= 100
              ? <><CheckCircle className="w-3 h-3" /> Fulfilled</> 
              : <><XCircle className="w-3 h-3" /> In Progress</>
            }
              </span>
              </td>
          </tr>
          );
})}
</tbody>
</table>
</div>
  );
};
export default WishesTable;