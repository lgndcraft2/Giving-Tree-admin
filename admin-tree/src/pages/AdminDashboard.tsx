import React, { useState, useEffect } from "react";
import { Heart, BarChart3, TrendingUp, LogOut } from "lucide-react";
import StatCard from "../components/StatCard";
import TabButton from "../components/TabButton";
import CharitiesTable from "../components/CharityTable";
import WishesTable from "../components/WishTable";
import DonationsTable from "../components/DonationTable";
import type { CharityForm } from "../components/AddCharity";
import AddCharityForm from "../components/AddCharity";
import EditCharityModal from "../components/EditCharity";
import EmptyPlaceholder from "../components/EmptyPlaceholder";

interface Charity {
  id: number;
  name: string;
  description?: string;
  website?: string;
  logo_url?: string;
  image_url?: string;
  wish_length: number;
  status: boolean;
}

interface Wish {
  id: number;
  title: string;
  description: string;
  unitPrice: number;
  quantity: number;
  currentDonations: number;
  requiredDonations: number;
  charityName: string;
  fulfilled: boolean;
}

interface Donation {
  id: number;
  accountNumber: string;
  charityName: string;
  wishName: string;
  amount: number;
  quantity: number;
  date: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "charities" | "wishes" | "donations" | "add-charity"
  >("charities");
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null); // To disable a specific button

  useEffect(() => {
    // Fetch charities from backend API
    const fetchCharities = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/getters/charities-admin', {
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
        const response = await fetch('http://127.0.0.1:5000/getters/wishes', {
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
      }
    };

    fetchCharities();
    fetchWishes();
  }, []);

  const donations: Donation[] = [
    {
      id: 1,
      accountNumber: "ACC-10234",
      charityName: "Hope Foundation",
      wishName: "Winter Clothing Drive",
      amount: 500,
      quantity: 2,
      date: "2025-11-15",
    },
    {
      id: 2,
      accountNumber: "ACC-10567",
      charityName: "Education For All",
      wishName: "School Supplies for 100 Students",
      amount: 1500,
      quantity: 5,
      date: "2025-11-14",
    },
    {
      id: 3,
      accountNumber: "ACC-10892",
      charityName: "Medical Aid Society",
      wishName: "Medical Equipment Fund",
      amount: 2000,
      quantity: 1,
      date: "2025-11-13",
    },
    {
      id: 4,
      accountNumber: "ACC-10123",
      charityName: "Children's Relief Fund",
      wishName: "Food Security Program",
      amount: 750,
      quantity: 3,
      date: "2025-11-12",
    },
  ];

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
        const response = await fetch(`http://127.0.0.1:5000/changers/charity/${id}/toggle-status`, {
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
        setIsLoading(false);
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
              logo_url: data.logo_url,
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
          wishes={wishes}
          onClose={() => setEditingCharity(null)}
          onSave={handleSaveCharity}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
