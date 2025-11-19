import React, { useState } from "react";
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
  wishes: number;
  status: "active" | "inactive";
}

interface Wish {
  id: number;
  title: string;
  currentDonations: number;
  requiredDonations: number;
  charityName: string;
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

  // Mock data
  const [charities, setCharities] = useState<Charity[]>([
    { id: 1, name: "Hope Foundation", wishes: 12, status: "active" },
    { id: 2, name: "Children's Relief Fund", wishes: 8, status: "active" },
    { id: 3, name: "Education For All", wishes: 15, status: "inactive" },
    { id: 4, name: "Medical Aid Society", wishes: 6, status: "active" },
  ]);

  const wishes: Wish[] = [
    {
      id: 1,
      title: "School Supplies for 100 Students",
      currentDonations: 7500,
      requiredDonations: 10000,
      charityName: "Education For All",
    },
    {
      id: 2,
      title: "Winter Clothing Drive",
      currentDonations: 3200,
      requiredDonations: 5000,
      charityName: "Hope Foundation",
    },
    {
      id: 3,
      title: "Medical Equipment Fund",
      currentDonations: 15000,
      requiredDonations: 20000,
      charityName: "Medical Aid Society",
    },
    {
      id: 4,
      title: "Food Security Program",
      currentDonations: 4500,
      requiredDonations: 8000,
      charityName: "Children's Relief Fund",
    },
  ];

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
    (c) => c.status === "active"
  ).length;
  const totalCharitiesCount = charities.length;
  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);

  const toggleCharityStatus = (id: number) => {
    setCharities(
      charities.map((charity) =>
        charity.id === id
          ? {
              ...charity,
              status: charity.status === "active" ? "inactive" : "active",
            }
          : charity
      )
    );
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
          onClose={() => setEditingCharity(null)}
          onSave={handleSaveCharity}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
