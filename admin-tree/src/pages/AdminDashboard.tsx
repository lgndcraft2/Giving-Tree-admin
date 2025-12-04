import React, { useState, useEffect } from "react";
import { 
  Heart, 
  BarChart3, 
  TrendingUp, 
  LogOut, 
  Loader2, 
  AlertTriangle, 
  TreeDeciduous, // New Logo Icon
  Bell,          // Notification Icon
  User           // User Avatar Icon
} from "lucide-react";

// ... [Keep your existing imports: StatCard, TabButton, Tables, etc.] ...
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

// ... [Keep Interfaces] ...
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
  // ... [Keep all your state: activeTab, charities, etc.] ...
  const [activeTab, setActiveTab] = useState<"charities" | "wishes" | "donations" | "add-charity">("charities");
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // ... [Keep your useEffect fetching logic] ...
  useEffect(() => {
    // (Paste your existing fetch logic here)
    setIsLoading(true);
    // Mock data fetching for display purposes in this snippet
    setTimeout(() => setIsLoading(false), 1000); 
  }, []);

  const activeCharitiesCount = charities.filter((c) => c.active).length;
  const totalCharitiesCount = charities.length;
  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);

  // ... [Keep your handlers: toggleCharityStatus, handleSaveCharity, etc.] ...
  const toggleCharityStatus = async (id: number) => { /* ... */ };
  const handleSaveCharity = (id: number, data: CharityForm) => { /* ... */ };
  const handleDeleteCharity = (id: number) => { /* ... */ };
  const handleCharitySubmit = (data: CharityForm) => { setActiveTab("charities"); };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      // Logout logic
      alert("Logged out");
    }
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* --- NEW HEADER SECTION --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Left: Brand / Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <TreeDeciduous className="w-6 h-6 text-green-700" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Giving Tree</h1>
                <p className="text-xs text-gray-500 font-medium">Admin Console</p>
              </div>
            </div>

            {/* Right: User Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notification Bell (Optional visual flair) */}
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Divider */}
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

              {/* User Profile / Logout */}
              <div className="flex items-center gap-3 pl-1 sm:pl-0">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-700">Admin User</span>
                  <span className="text-xs text-gray-500">Super Admin</span>
                </div>
                
                {/* Avatar */}
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                  <User className="w-4 h-4" />
                </div>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="ml-2 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-md transition-all group"
                  title="Sign Out"
                >
                  <span className="hidden sm:inline">Logout</span>
                  <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <StatCard
            icon={<Heart className="w-6 h-6 text-green-600" />}
            title="Active Charities"
            value={activeCharitiesCount}
          />
          <StatCard
            icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
            title="All Charities"
            value={totalCharitiesCount}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            title="Donations Made"
            value={`₦${totalDonations.toLocaleString()}`}
          />
        </div>

        {error && (
            <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0"/>
                <p className="font-medium text-sm">{error}</p>
            </div>
        )}

        {/* Tabbed Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          {/* Scrollable Tab Container */}
          <div className="border-b border-gray-200 bg-gray-50/50">
            <div className="flex sm:justify-start overflow-x-auto no-scrollbar px-4 sm:px-6">
              <div className="flex space-x-6 min-w-max">
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
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 overflow-x-auto min-h-[400px]">
            {activeTab === "charities" &&
              (charities.length > 0 ? (
                <CharitiesTable
                  charities={charities}
                  onToggleStatus={toggleCharityStatus}
                  onEdit={(c) => setEditingCharity(c)}
                  onDelete={handleDeleteCharity}
                  isToggling={!!togglingId}
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
      </main>
      
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