"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, Filter, RefreshCw } from "lucide-react";

// Report types and reasons aligned with your API
const reportTypes = ["review", "business", "user", "service", "other"];
const reasons = ["Spam", "Harassment", "Misleading", "Other"];

// Interface for report data structure
interface Report {
  id: string;
  type: string;
  target_id: string;
  reason: string;
  description: string | null;
  submitted_by: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export default function UserPage() {
  const [type, setType] = useState<string>("");
  const [target_id, setTargetId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [submitted_by, setSubmittedBy] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showReports, setShowReports] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("all"); // "all", "pending", "resolved"
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Fetch user ID based on email from localStorage
  useEffect(() => {
    const email = localStorage.getItem("userEmail");

    if (email) {
      const fetchUserId = async () => {
        try {
          const response = await fetch(`/api/users/getUserByEmail?email=${email}`);
          const data = await response.json();

          if (response.ok && data.success) {
            setSubmittedBy(data.data.id); // Set the ID from the response
            // After getting user ID, fetch all reports
            fetchAllReports();
          } else {
            toast.error(data.error || "Failed to fetch user data.");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("An error occurred while fetching user data.");
        }
      };

      fetchUserId();
    } else {
      toast.error("No email found in localStorage.");
    }
  }, []);

  // Fetch all reports
  const fetchAllReports = async () => {
    setLoadingReports(true);
    try {
      const response = await fetch('/api/reports');
      const data = await response.json();

      if (response.ok && data.success) {
        setAllReports(data.data);
      } else {
        toast.error(data.error || "Failed to fetch reports.");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("An error occurred while fetching reports.");
    } finally {
      setLoadingReports(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting report...");
    setLoading(true);
    setSuccessMessage(""); // Reset success message on new submission

    if (!type || !target_id || !reason || !submitted_by) {
      toast.error("Please fill all required fields.");
      setLoading(false);
      return;
    }

    // Preparing data to match the API's expected format
    const reportData = {
      type,                         // Should be one of: "review", "business", "user", "service", "other"
      target_id: parseInt(target_id), // Convert string to integer
      reason,                       // Should be one of: "Spam", "Harassment", "Misleading", "Other"
      description,                  // Optional description text
      submitted_by: parseInt(submitted_by), // Convert user ID string to integer
    };

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      // Log raw response for debugging
      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        toast.success("Report submitted successfully!");
        setSuccessMessage("Report submitted successfully! ✅");

        // Clear form
        setType("");
        setTargetId("");
        setReason("");
        setDescription("");
        
        // Refresh reports to include the new one
        fetchAllReports();
        
        // Show reports section after successful submission
        setShowReports(true);
        
        // Hide success message after 4 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 4000);
      } else {
        // More detailed error message
        const errorMsg = data.error || data.message || "Unknown error";
        toast.error(`Failed to submit report: ${errorMsg} (Status: ${response.status})`);
      }
    } catch (error) {
      console.error("Report submission error:", error);
      toast.error("An error occurred while submitting your report.");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Filter reports to show only user's reports and apply other filters
  const filteredAndSortedReports = [...allReports]
  .filter(report => {
    // Filter by user ID
    const isUserReport = report.submitted_by === submitted_by;

    // Apply status filter
    const matchesStatusFilter =
      statusFilter === "all" ? true :
        statusFilter === "pending" ? !report.resolved_at :
          statusFilter === "resolved" ? !!report.resolved_at :
            true;

    return isUserReport && matchesStatusFilter;
  })
  .sort((a, b) => {
    // Ensure the types are correct based on the field you're sorting by
    let compareA: string | null = a[sortField as keyof Report];
    let compareB: string | null = b[sortField as keyof Report];

    // Handle nulls
    if (compareA === null) compareA = sortDirection === "asc" ? "\uffff" : "";
    if (compareB === null) compareB = sortDirection === "asc" ? "\uffff" : "";

    // Date comparison for 'created_at' or 'resolved_at'
    if (sortField === "created_at" || sortField === "resolved_at") {
      const dateA = compareA ? new Date(compareA).getTime() : 0;
      const dateB = compareB ? new Date(compareB).getTime() : 0;
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }

    // String comparison for string fields
    if (typeof compareA === "string" && typeof compareB === "string") {
      return sortDirection === "asc"
        ? compareA.localeCompare(compareB)
        : compareB.localeCompare(compareA);
    }

    // Default comparison (if the field is not a Date or string)
    return sortDirection === "asc"
      ? (compareA > compareB ? 1 : -1)
      : (compareA < compareB ? 1 : -1);
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-indigo-700 py-6 px-8 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <line x1="10" y1="9" x2="8" y2="9"></line>
            </svg>
            <h1 className="text-2xl font-bold text-white">ServiHub Reports</h1>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("userEmail"); // Clear user session
              router.push("/"); // Redirect to home
            }}
            className="text-white text-sm bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          {/* Submit Report Section */}
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Submit a Report</h2>
              <p className="text-gray-500 mt-2">Fill out the details below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Report Type Selection */}
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium text-gray-700">Report Type</label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select report type</option>
                  {reportTypes.map((type) => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Target ID Input */}
              <div className="space-y-2">
                <label htmlFor="target_id" className="text-sm font-medium text-gray-700">Target ID</label>
                <Input
                  id="target_id"
                  type="number"
                  placeholder="Enter target ID"
                  value={target_id}
                  onChange={(e) => setTargetId(e.target.value)}
                  required
                  className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Reason Selection */}
              <div className="space-y-2">
                <label htmlFor="reason" className="text-sm font-medium text-gray-700">Reason</label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select reason</option>
                  {reasons.map((reasonOption) => (
                    <option key={reasonOption} value={reasonOption}>{reasonOption}</option>
                  ))}
                </select>
              </div>

              {/* Description (Optional) */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Provide additional details (optional)"
                  className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Submit Button */}
<div className="mt-4">
  <Button
    type="submit"
    disabled={loading}
    className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
  >
    {loading ? "Submitting..." : "Submit Report"}
  </Button>
</div>
{successMessage && (
  <p className="text-green-600 font-semibold text-center mt-4">{successMessage}</p>
)}
            </form>
          </div>

          {/* View My Reports Section */}
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-1">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">My Reports</h2>
                <p className="text-gray-500 mt-1">View the status of all your submitted reports</p>
              </div>
              <div className="flex gap-2">
                {showReports && (
                  <Button 
                    onClick={fetchAllReports}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                    disabled={loadingReports}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingReports ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    setShowReports(!showReports);
                    if (!showReports) {
                      fetchAllReports();
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {showReports ? "Hide Reports" : "Show Reports"}
                </Button>
              </div>
            </div>

            {showReports && (
              <>
                {/* Filter controls */}
                <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700 font-medium">Filter:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="p-2 rounded-md border border-gray-300 text-sm"
                    >
                      <option value="all">All Reports</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-medium">Sort by:</span>
                    <select
                      value={sortField}
                      onChange={(e) => {
                        setSortField(e.target.value);
                        setSortDirection("desc"); // Default to desc on change
                      }}
                      className="p-2 rounded-md border border-gray-300 text-sm"
                    >
                      <option value="created_at">Date Submitted</option>
                      <option value="type">Type</option>
                      <option value="reason">Reason</option>
                      <option value="resolved_at">Resolution Date</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                      className="flex items-center gap-1"
                    >
                      {sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {loadingReports ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : filteredAndSortedReports.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    {statusFilter === "all" 
                      ? "You haven't submitted any reports yet." 
                      : `No ${statusFilter} reports found.`}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAndSortedReports.map((report) => (
                      <div key={report.id} className={`border rounded-lg p-4 ${report.resolved_at ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                        <div className="flex flex-wrap justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Report #{report.id}</span>
                            <Badge variant={
                              report.type === "review" ? "default" :
                              report.type === "user" ? "destructive" :
                              report.type === "business" ? "secondary" : 
                              "outline"
                            }>
                              {report.type}
                            </Badge>
                            <Badge variant={report.resolved_at ? "success" : "destructive"} className="ml-2">
                              {report.resolved_at ? "Resolved" : "Pending"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            Submitted {formatDate(report.created_at)}
                          </div>
                        </div>
                        
                        {/* Report details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Target ID</p>
                            <p className="text-gray-800">{report.target_id}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Reason</p>
                            <p className="text-gray-800">{report.reason}</p>
                          </div>
                        </div>
                        
                        {/* Description */}
                        {report.description && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-600">Description</p>
                            <p className="text-gray-800 bg-white p-2 rounded border border-gray-200 mt-1">
                              {report.description}
                            </p>
                          </div>
                        )}
                        
                        {/* Resolution info */}
                        {report.resolved_at && (
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Resolved {formatDate(report.resolved_at)}</span>
                              {report.resolved_by && (
                                <span className="text-xs text-gray-500">by Admin User</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}