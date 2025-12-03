import React, { useState, useEffect } from "react";
import { Heart, BarChart3, TrendingUp, LogOut, Loader2, AlertTriangle } from "lucide-react";
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
  const [togglingId, setTogglingId] = useState<number | null>(null); // To disable a specific button

  useEffect(() => {
    setIsLoading(true);
    // Fetch charities from backend API
    const fetchCharities = async () => {
      try {
        const response = await fetch('https://giving-tree-admin.onrender.com/getters/charities-admin', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success) {
          setCharities(data.charities);
        }
      } catch (error) {
        console.error('Error fetching charities:', error);
      }
    };

    // Fetch wishes from backend API
    const fetchWishes = async () => {
      try {
        const response = await fetch('https://giving-tree-admin.onrender.com/getters/wishes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success) {
          setWishes(data.wishes);
        }
      } catch (error) {
        console.error('Error fetching wishes:', error);
        setError('Error fetching wishes');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDonations = async () => {
      try {
        const response = await fetch('https://giving-tree-admin.onrender.com/getters/payments', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success) {
          setDonations(data.payments);
          console.log(data.payments);
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
        setError('Error fetching donations');
      }
    };

    fetchCharities();
    fetchWishes();
    fetchDonations();
  }, []);


  const activeCharitiesCount = charities.filter(
    (c) => c.active
  ).length;
  const totalCharitiesCount = charities.length;
  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);

  const toggleCharityStatus = async (id: number) => {
    setError(null);
    setTogglingId(id); // Disable the specific button
    
    // 1. Find the charity in local state
    const charityToToggle = charities.find(c => c.id === id);
    if (!charityToToggle) {
        setError("Charity not found in local state.");
        setTogglingId(null); // Re-enable the button
        return;
    }

    // const token = getAuthToken();
    // if (!token) {
    //     setError("Authentication token missing.");
    //     setIsLoading(false);
    //     return;
    // }

    try {
        // 2. Perform the API call (PUT request)
        const response = await fetch(`https://giving-tree-admin.onrender.com/changers/charity/${id}/toggle-status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                //'Authorization': `Bearer ${token}`, // Pass the JWT token
            },
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
            // Handle HTTP errors or backend application errors
            throw new Error(data.message || `Failed to update charity status. Status: ${response.status}`);
        }

        // 3. Local State Update (ONLY if API call succeeded)
        setCharities(
            charities.map((charity) =>
                charity.id === id
                    ? {
                        ...charity,
                        // Toggle the 'active' boolean property to its new state
                        active: !charity.active, 
                      }
                    : charity
            )
        );

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during API call.';
        setError(errorMessage);
        console.error("Toggle Error:", err);
    } finally {
        setTogglingId(null); // Re-enable the button
    }
  };

  const handleCharitySubmit = (charityData: CharityForm) => {
    console.log("New charity submitted:", charityData);
    // Add logic to save charity
    alert("Charity created successfully!");
    setActiveTab("charities");
  };

  const handleEditCharity = (charity: Charity) => {
    setEditingCharity(charity);
  };

  const handleSaveCharity = (id: number, data: CharityForm) => {
    setCharities(
      charities.map((charity) =>
        charity.id === id
          ? {
              ...charity,
              name: data.name,
              description: data.description,
              website: data.website,
              image_url: data.image_url,
            }
          : charity
      )
    );

    setEditingCharity(null);
    alert("Charity updated successfully!");
  };

  const handleDeleteCharity = (id: number) => {
    setCharities(charities.filter((charity) => charity.id !== id));
    alert("Charity deleted successfully!");
  };

  const handleLogout = () => {
    // Add logout logic here
    alert("Logged out successfully!");
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <h2 className="text-xl text-gray-700 flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin"/> Loading Dashboard Data...
            </h2>
        </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your charities, wishes, and donations
            </p>
          </div>
          <LogOut
            onClick={handleLogout}
            className="w-6 h-6 text-gray-600 cursor-pointer mt-5"
          />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        {/* Display Global Error */}
        {error && (
            <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                <AlertTriangle className="w-5 h-5 mr-3"/>
                <p className="font-medium">Critical Error: {error}</p>
            </div>
        )}

        {/* Tabbed Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex justify-center">
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

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "charities" &&
              (charities.length > 0 ? (
                <CharitiesTable
                  charities={charities}
                  onToggleStatus={toggleCharityStatus}
                  onEdit={handleEditCharity}
                  onDelete={handleDeleteCharity}
                  isToggling={isLoading}
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
