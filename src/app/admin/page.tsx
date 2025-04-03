"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

// Types for our data
interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

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
  submitter: User | null;
  resolver: User | null;
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("all"); // all, resolved, unresolved
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const router = useRouter();

  // Fetch current user ID based on email from localStorage
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    console.log("User email from localStorage:", email);

    if (email) {
      const fetchUserId = async () => {
        try {
          const response = await fetch(`/api/users/getUserByEmail?email=${email}`);
          const data = await response.json();
          console.log("User data response:", data);

          if (response.ok && data.success) {
            setCurrentUserId(data.data.id);
            setCurrentUser(data.data);
            // Also check if user is admin
            if (data.data.role !== "admin") {
              toast.error("You don't have permission to access this page");
              router.push("/user");
            }
          } else {
            toast.error(data.error || "Failed to fetch user data.");
            router.push("/");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          toast.error("An error occurred while fetching user data.");
          router.push("/");
        }
      };

      fetchUserId();
    } else {
      toast.error("Please log in to access this page.");
      router.push("/");
    }
  }, [router]);

  // Fetch reports and users data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch reports
        console.log("Fetching reports data...");
        const reportsResponse = await fetch("/api/reports");
        const reportsData = await reportsResponse.json();
        console.log("Reports API Response:", reportsData);
        
        // Fetch users
        const usersResponse = await fetch("/api/users");
        const usersData = await usersResponse.json();
        
        if (reportsResponse.ok && reportsData.success) {
          console.log("Setting reports:", reportsData.data.length, "items");
          setReports(reportsData.data);
        } else {
          console.error("Failed to fetch reports:", reportsData);
          toast.error("Failed to fetch reports data");
        }
        
        if (usersResponse.ok && usersData.success) {
          setUsers(usersData.data);
        } else {
          console.error("Failed to fetch users:", usersData);
          toast.error("Failed to fetch users data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchData();
    }
  }, [currentUserId]);

  // Handle marking a report as resolved
  const handleResolve = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resolved_by: currentUserId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Report marked as resolved");
        // Update the report in the local state
        setReports(reports.map(report => 
          report.id === reportId 
            ? { 
                ...report, 
                resolved_by: currentUserId, 
                resolved_at: new Date().toISOString(),
                resolver: currentUser  // Add current user as resolver
              }
            : report
        ));
      } else {
        toast.error(data.error || "Failed to resolve report");
      }
    } catch (error) {
      console.error("Error resolving report:", error);
      toast.error("An error occurred while resolving the report");
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filter and sort reports with debug logs
  const processedReports = reports
    .filter(report => {
      // Debug logging
      console.log(`Filtering report ${report.id}, status: ${report.resolved_at ? 'resolved' : 'unresolved'}, type: ${report.type}`);
      
      // Status filter
      if (filter === "resolved" && !report.resolved_at) return false;
      if (filter === "unresolved" && report.resolved_at) return false;
      
      // Type filter
      if (typeFilter !== "all" && report.type !== typeFilter) return false;
      
      return true;
    })
    .sort((a, b) => {
      // Sorting logic
      /* eslint-disable @typescript-eslint/no-explicit-any */
      let compareA: any = a[sortField as keyof Report];
      let compareB: any = b[sortField as keyof Report];
      /* eslint-enable @typescript-eslint/no-explicit-any */
      
      // Handle nulls
      if (compareA === null) compareA = sortDirection === "asc" ? "\uffff" : "";
      if (compareB === null) compareB = sortDirection === "asc" ? "\uffff" : "";
      
      // String comparison
      if (typeof compareA === "string" && typeof compareB === "string") {
        return sortDirection === "asc" 
          ? compareA.localeCompare(compareB)
          : compareB.localeCompare(compareA);
      }
      
      // Date comparison
      if (sortField === "created_at" || sortField === "resolved_at") {
        const dateA = compareA ? new Date(compareA).getTime() : 0;
        const dateB = compareB ? new Date(compareB).getTime() : 0;
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      // Default comparison
      return sortDirection === "asc" 
        ? (compareA > compareB ? 1 : -1)
        : (compareA < compareB ? 1 : -1);
    });

  // Get unique report types for the dropdown - make sure to include all types from the data
  const reportTypes = ["all", ...Array.from(new Set(reports.map(report => report.type)))];

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Pagination
  const totalPages = Math.ceil(processedReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = processedReports.slice(startIndex, startIndex + itemsPerPage);

  // Sort icon component
  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />;
  };

  // Debug logging for reports data
  console.log("Filter:", filter);
  console.log("Type filter:", typeFilter);
  console.log("Total reports:", reports.length);
  console.log("Processed reports:", processedReports.length);
  console.log("Paginated reports:", paginatedReports.length);

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
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                localStorage.removeItem("userEmail");
                router.push("/");
              }}
              className="text-white text-sm bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Report Management</h2>
              <div className="flex gap-4">
                <div className="min-w-32">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reports</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="unresolved">Unresolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-32">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No reports found. Please check API connection.
              </div>
            ) : processedReports.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No reports found matching your filters.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('id')}
                        >
                          ID <SortIcon field="id" />
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('type')}
                        >
                          Type <SortIcon field="type" />
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('target_id')}
                        >
                          Target ID <SortIcon field="target_id" />
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('reason')}
                        >
                          Reason <SortIcon field="reason" />
                        </TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('submitted_by')}
                        >
                          Submitted By <SortIcon field="submitted_by" />
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('created_at')}
                        >
                          Created <SortIcon field="created_at" />
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('resolved_at')}
                        >
                          Status <SortIcon field="resolved_at" />
                        </TableHead>
                        <TableHead>Resolved By</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.id}</TableCell>
                          <TableCell>
                            <Badge variant={
                              report.type === "review" ? "default" :
                              report.type === "user" ? "destructive" :
                              report.type === "business" ? "secondary" : 
                              "outline"
                            }>
                              {report.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{report.target_id}</TableCell>
                          <TableCell>{report.reason}</TableCell>
                          <TableCell className="max-w-xs truncate" title={report.description || ""}>
                            {report.description || "No description provided"}
                          </TableCell>
                          <TableCell>
                            {report.submitter ? report.submitter.name || report.submitter.email : 'Anonymous'}
                          </TableCell>
                          <TableCell>{formatDate(report.created_at)}</TableCell>
                          <TableCell>
                            <Badge variant={report.resolved_at ? "success" : "destructive"}>
                              {report.resolved_at ? "Resolved" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {report.resolver 
                              ? report.resolver.name || report.resolver.email 
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {!report.resolved_at ? (
                              <Button 
                                size="sm"
                                onClick={() => handleResolve(report.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Mark Resolved
                              </Button>
                            ) : (
                              <span className="text-sm text-gray-500">
                                {formatDate(report.resolved_at)}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(startIndex + itemsPerPage, processedReports.length)}
                    </span>{" "}
                    of <span className="font-medium">{processedReports.length}</span> results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous page</span>
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Create a small window of pages around the current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else {
                        const offset = Math.max(0, Math.min(currentPage - 3, totalPages - 5));
                        pageNum = i + 1 + offset;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={currentPage === pageNum ? "default" : "outline"}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next page</span>
                    </Button>
                  </div>
                  <div>
                    <Select value={itemsPerPage.toString()} onValueChange={(v) => {
                      setItemsPerPage(parseInt(v));
                      setCurrentPage(1); // Reset to first page when changing items per page
                    }}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Per page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 per page</SelectItem>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="25">25 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}