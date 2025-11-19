import React from 'react';

interface Wish {
  id: number;
  title: string;
  currentDonations: number;
  requiredDonations: number;
  charityName: string;
}

interface WishesTableProps {
  wishes: Wish[];
}

const WishesTable: React.FC<WishesTableProps> = ({ wishes }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">S/N</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Title</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Progress</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Charity</th>
          </tr>
        </thead>
        <tbody>
          {wishes.map((wish, index) => {
            const progress = (wish.currentDonations / wish.requiredDonations) * 100;
            return (
              <tr key={wish.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 text-sm text-gray-900">{index + 1}</td>
                <td className="py-4 px-4 text-sm text-gray-900 font-medium">{wish.title}</td>
                <td className="py-4 px-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                    <div className="text-xs text-gray-600 mt-1">${wish.currentDonations} / ${wish.requiredDonations}</div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-900">{wish.charityName}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
export default WishesTable;