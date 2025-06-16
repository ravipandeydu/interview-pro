"use client";

import { useState } from "react";
import { useCandidate } from "../../hooks/useCandidate";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Search, Plus, Users } from "lucide-react";
import Link from "next/link";

export default function CandidateList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { getCandidates } = useCandidate();
  const { data, isLoading, isError } = getCandidates(
    page,
    limit,
    status,
    searchQuery
  );

  const handleSearch = () => {
    setSearchQuery(search);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === "ALL" ? undefined : value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "NEW":
        return "default";
      case "CONTACTED":
        return "secondary";
      case "INTERVIEW_SCHEDULED":
        return "outline";
      case "IN_PROCESS":
        return "secondary";
      case "OFFER_SENT":
        return "destructive";
      case "HIRED":
        return "default";
      case "REJECTED":
        return "destructive";
      case "ON_HOLD":
        return "outline";
      default:
        return "default";
    }
  };

  // Status color mappings for modern UI
  const getStatusColors = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30";
      case "CONTACTED":
        return "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30";
      case "INTERVIEW_SCHEDULED":
        return "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30";
      case "IN_PROCESS":
        return "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/30";
      case "OFFER_SENT":
        return "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30";
      case "HIRED":
        return "bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/30";
      case "REJECTED":
        return "bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30";
      case "ON_HOLD":
        return "bg-gray-500/20 text-gray-600 dark:text-gray-300 border-gray-500/30";
      default:
        return "bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ");
  };

  if (isError) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card className="backdrop-blur-md bg-background/40 border border-rose-500/20 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-xl font-semibold text-rose-950 dark:text-rose-100">
              Error
            </CardTitle>
            <CardDescription className="text-rose-700/70 dark:text-rose-300/70">
              There was a problem loading the candidates
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <p>Error loading candidates. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/10 via-background to-violet-900/10 dark:from-indigo-950/30 dark:via-background dark:to-violet-950/20 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl animate-blob animation-delay-4000" />

      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 rounded-xl backdrop-blur-sm border border-indigo-500/30">
                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
                Candidates
              </h1>
            </div>
            <Button
              variant="default"
              className="backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 border-0 transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href="/candidates/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Candidate
              </Link>
            </Button>
          </div>

          <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-xl font-semibold text-indigo-950 dark:text-indigo-100">
                Search Candidates
              </CardTitle>
              <CardDescription className="text-indigo-700/70 dark:text-indigo-300/70">
                Filter and find candidates based on status and keywords
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pt-2">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Search candidates..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 backdrop-blur-sm bg-background/50 border-indigo-500/30 focus:border-indigo-500/50 focus:ring-indigo-500/30"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-500/70" />
                </div>
                <div className="w-full md:w-[200px]">
                  <Select
                    value={status || "ALL"}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="backdrop-blur-sm bg-background/50 border-indigo-500/30 focus:ring-indigo-500/30">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="CONTACTED">Contacted</SelectItem>
                      <SelectItem value="INTERVIEW_SCHEDULED">
                        Interview Scheduled
                      </SelectItem>
                      <SelectItem value="IN_PROCESS">In Process</SelectItem>
                      <SelectItem value="OFFER_SENT">Offer Sent</SelectItem>
                      <SelectItem value="HIRED">Hired</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleSearch}
                  className="backdrop-blur-sm bg-background/50 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
                >
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card
                  key={i}
                  className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
                  <CardHeader className="relative z-10 pb-2">
                    <Skeleton className="h-5 w-3/4 bg-indigo-500/10" />
                    <Skeleton className="h-4 w-1/2 mt-2 bg-indigo-500/10" />
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full bg-indigo-500/10" />
                      <div className="flex flex-wrap gap-1">
                        <Skeleton className="h-6 w-16 rounded-full bg-indigo-500/10" />
                        <Skeleton className="h-6 w-16 rounded-full bg-indigo-500/10" />
                        <Skeleton className="h-6 w-16 rounded-full bg-indigo-500/10" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="relative z-10 flex justify-between">
                    <Skeleton className="h-6 w-20 rounded-full bg-indigo-500/10" />
                    <Skeleton className="h-9 w-16 rounded-md bg-indigo-500/10" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {data?.candidates && data.candidates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.candidates.map((candidate) => (
                    <Card
                      key={candidate.id}
                      className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
                      <CardHeader className="relative z-10 pb-2">
                        <CardTitle className="text-lg font-semibold text-indigo-950 dark:text-indigo-100">
                          {candidate.fullName}
                        </CardTitle>
                        <CardDescription className="text-indigo-700/70 dark:text-indigo-300/70">
                          {candidate.email}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="space-y-3">
                          {candidate.currentPosition && (
                            <p className="text-sm text-foreground/80">
                              {candidate.currentPosition}
                              {candidate.currentCompany &&
                                ` at ${candidate.currentCompany}`}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.skills.slice(0, 3).map((skill, i) => (
                              <Badge
                                key={i}
                                className="px-2 py-0.5 backdrop-blur-sm bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30 text-xs font-medium"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills.length > 3 && (
                              <Badge className="px-2 py-0.5 backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-medium">
                                +{candidate.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="relative z-10 flex justify-between items-center">
                        <Badge
                          className={`px-2.5 py-0.5 backdrop-blur-sm ${getStatusColors(
                            candidate.status
                          )}`}
                        >
                          {formatStatus(candidate.status)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
                          asChild
                        >
                          <a href={`/candidates/${candidate.id}`}>View</a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl overflow-hidden text-center py-12">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
                  <CardContent className="relative z-10">
                    <div className="p-4 rounded-full bg-indigo-500/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-8 w-8 text-indigo-500/70" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-indigo-950 dark:text-indigo-100">
                      No candidates found
                    </h3>
                    <p className="text-indigo-700/70 dark:text-indigo-300/70 max-w-md mx-auto">
                      Try adjusting your search or filter criteria, or add a new
                      candidate to get started.
                    </p>
                  </CardContent>
                </Card>
              )}

              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) handlePageChange(page - 1);
                          }}
                          className={`${
                            page <= 1 ? "pointer-events-none opacity-50" : ""
                          } backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300`}
                        />
                      </PaginationItem>
                      {Array.from(
                        { length: data.pagination.totalPages },
                        (_, i) => i + 1
                      ).map((p) => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(p);
                            }}
                            isActive={page === p}
                            className={`${
                              page === p
                                ? "bg-indigo-500 text-white"
                                : "backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20"
                            } transition-all duration-300`}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < data.pagination.totalPages)
                              handlePageChange(page + 1);
                          }}
                          className={`${
                            page >= data.pagination.totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          } backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
