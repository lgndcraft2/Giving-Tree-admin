import React, { useState, useEffect } from "react";
import { Heart, BarChart3, TrendingUp, LogOut, Loader2, AlertTriangle, Menu } from "lucide-react";
import StatCard from "../components/StatCard";
import TabButton from "../components/TabButton";
import CharitiesTable from "../components/CharityTable";
import WishesTable from "../components/WishTable";
import DonationsTable from "../components/DonationTable";
import type { CharityForm } from "../components/AddCharity";
import AddCharityForm from "../components/AddCharity";
import EditCharityModal from "../components/EditCharity";
import EmptyPlaceholder from "../components/EmptyPlaceholder";
import type { Wish } from "../components/WishTable";
import type { Donation } from "../components/DonationTable";

// ... [Interfaces remain the same] ...
interface Charity {
  id: number;
  name: string;
  description?: string;
  website?: string;
  logo_url?: string;
  image_url?: string;
  wish_length: number;
  active: boolean;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "charities" | "wishes" | "donations" | "add-charity"
  >("charities");
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // ... [useEffect and fetch logic remains exactly the same] ...
  useEffect(() => {
    setIsLoading(true);
    const fetchCharities = async () => {
      try {
        const response = await fetch('https://giving-tree-admin.onrender.com/getters/charities-admin');
        const data = await response.json();
        if (data.success) setCharities(data.charities);
      } catch (error) { console.error(error); }
    };
    const fetchWishes = async () => {
      try {
        const response = await fetch('https://giving-tree-admin.onrender.com/getters/wishes');
        const data = await response.json();
        if (data.success) setWishes(data.wishes);
      } catch (error) { setError('Error fetching wishes'); } finally { setIsLoading(false); }
    };
    const fetchDonations = async () => {
      try {
        const response = await fetch('https://giving-tree-admin.onrender.com/getters/payments');
        const data = await response.json();
        if (data.success) setDonations(data.payments);
      } catch (error) { setError('Error fetching donations'); }
    };
    fetchCharities();
    fetchWishes();
    fetchDonations();
  }, []);

  const activeCharitiesCount = charities.filter((c) => c.active).length;
  const totalCharitiesCount = charities.length;
  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);

  // ... [Handlers (toggleCharityStatus, handleEditCharity, etc.) remain the same] ...
  const toggleCharityStatus = async (id: number) => {
    setError(null);
    setTogglingId(id);
    const charityToToggle = charities.find(c => c.id === id);
    if (!charityToToggle) { setTogglingId(null); return; }

    try {
        const response = await fetch(`https://giving-tree-admin.onrender.com/changers/charity/${id}/toggle-status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (!response.ok || data.success === false) throw new Error(data.message);

        setCharities(charities.map((charity) =>
            charity.id === id ? { ...charity, active: !charity.active } : charity
        ));
    } catch (err: any) {
        setError(err.message || 'Error toggling status');
    } finally {
        setTogglingId(null);
    }
  };

  const handleCharitySubmit = (charityData: CharityForm) => {
    // In a real app, you would re-fetch or append to state here
    setActiveTab("charities");
  };

  const handleSaveCharity = (id: number, data: CharityForm) => {
    setCharities(charities.map((c) => c.id === id ? { ...c, ...data } : c));
    setEditingCharity(null);
  };

  const handleDeleteCharity = (id: number) => {
    setCharities(charities.filter((c) => c.id !== id));
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <h2 className="text-xl text-gray-700 flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin"/> Loading Dashboard...
            </h2>
        </div>
    );
  }

  return (
    // RESPONSIVE 1: Reduced outer padding on mobile (p-4) vs desktop (p-8)
    <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        
        {/* RESPONSIVE 2: Flex direction column on mobile, row on tablet+ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your charities, wishes, and donations
            </p>
          </div>
          
          <button 
            onClick={() => {/* Logout logic */}}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors self-end sm:self-auto px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <span className="text-sm font-medium">Logout</span>
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Statistics Cards - Grid handles response automatically via grid-cols-1 md:grid-cols-3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <StatCard
            icon={<Heart className="w-6 h-6 text-green-600" />}
            title="Active Charities"
            value={activeCharitiesCount}
          />
          <StatCard
            icon={<BarChart3 className="w-6 h-6 text-green-600" />}
            title="All Charities"
            value={totalCharitiesCount}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
            title="Donations Made"
            value={`₦${totalDonations.toLocaleString()}`}
          />
        </div>

        {error && (
            <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0"/>
                <p className="font-medium text-sm">{error}</p>
            </div>
        )}

        {/* Tabbed Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* RESPONSIVE 3: Scrollable Tab Container */}
          <div className="border-b border-gray-200 overflow-x-auto">
             {/* min-w-max ensures tabs don't squash on mobile */}
            <div className="flex sm:justify-center min-w-max px-4 sm:px-0">
              <TabButton
                active={activeTab === "charities"}
                onClick={() => setActiveTab("charities")}
              >
                Charities
              </TabButton>
              <TabButton
                active={activeTab === "wishes"}
                onClick={() => setActiveTab("wishes")}
              >
                Wishes
              </TabButton>
              <TabButton
                active={activeTab === "donations"}
                onClick={() => setActiveTab("donations")}
              >
                Donations
              </TabButton>
              <TabButton
                active={activeTab === "add-charity"}
                onClick={() => setActiveTab("add-charity")}
              >
                Add Charity
              </TabButton>
            </div>
          </div>

          {/* Tab Content - RESPONSIVE 4: Ensure internal tables scroll if needed */}
          <div className="p-4 sm:p-6 overflow-x-auto">
            {activeTab === "charities" &&
              (charities.length > 0 ? (
                <CharitiesTable
                  charities={charities}
                  onToggleStatus={toggleCharityStatus}
                  onEdit={(c) => setEditingCharity(c)}
                  onDelete={handleDeleteCharity}
                  isToggling={!!togglingId} // Simplified boolean
                  togglingId={togglingId}
                />
              ) : (
                <EmptyPlaceholder />
              ))}
            {activeTab === "wishes" && 
              (wishes.length > 0 ? (
                <WishesTable wishes={wishes} />
              ) : (
                <EmptyPlaceholder />
              ))}
            {activeTab === "donations" && 
              (donations.length > 0 ? (
                <DonationsTable donations={donations} />
              ) : (
              <EmptyPlaceholder />
            ))}
            {activeTab === "add-charity" && (
              <AddCharityForm onSubmit={handleCharitySubmit} />
            )}
          </div>
        </div>
      </div>
      
      {/* Edit Modal */}
      {editingCharity && (
        <EditCharityModal
          charity={editingCharity}
          wishes={wishes.filter(w => w.charity_name === editingCharity.name)}
          onClose={() => setEditingCharity(null)}
          onSave={handleSaveCharity}
        />
      )}
    </div>
  );
};

export default AdminDashboard;