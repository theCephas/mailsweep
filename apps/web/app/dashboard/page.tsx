"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useMutation } from "@tanstack/react-query";
import { gmailApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastContainer, useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Mail,
  LogOut,
  Search,
  Trash2,
  AlertTriangle,
  Home,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { EmailItem } from "@mailsweep/types";

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const [sender, setSender] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const EMAILS_PER_PAGE = 15;

  useEffect(() => {
    // Only redirect to home if not loading and explicitly not authenticated
    // This prevents redirecting authenticated users who want to access the home page
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  const searchMutation = useMutation({
    mutationFn: () =>
      gmailApi.searchEmails({ sender, from: fromDate, to: toDate }),
    onSuccess: (data) => {
      setEmails(data.emails);
      setSelectedIds(new Set());
      setCurrentPage(0);
      showToast(`Found ${data.total} email(s)`, "success");
    },
    onError: () => {
      showToast("Failed to search emails", "error");
    },
  });

  const trashMutation = useMutation({
    mutationFn: (ids: string[]) => gmailApi.trashEmails(ids),
    onSuccess: (data) => {
      setEmails((prev) => prev.filter((email) => !selectedIds.has(email.id)));
      setSelectedIds(new Set());
      showToast(data.message, "success");
    },
    onError: () => {
      showToast("Failed to trash emails", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => gmailApi.deleteEmails(ids),
    onSuccess: (data) => {
      setEmails((prev) => prev.filter((email) => !selectedIds.has(email.id)));
      setSelectedIds(new Set());
      setShowDeleteDialog(false);
      showToast(data.message, "success");
    },
    onError: () => {
      showToast("Failed to delete emails", "error");
      setShowDeleteDialog(false);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender || !fromDate || !toDate) {
      showToast("Please fill in all fields", "error");
      return;
    }
    searchMutation.mutate();
  };

  const handleSelectAllOnPage = () => {
    const newSet = new Set(selectedIds);
    const allPageSelected = paginatedEmails.every((email) =>
      selectedIds.has(email.id)
    );

    if (allPageSelected) {
      // Deselect all on current page
      paginatedEmails.forEach((email) => newSet.delete(email.id));
    } else {
      // Select all on current page
      paginatedEmails.forEach((email) => newSet.add(email.id));
    }
    setSelectedIds(newSet);
  };

  const handleSelectAllAcrossPages = () => {
    if (selectedIds.size === emails.length) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all emails across all pages
      setSelectedIds(new Set(emails.map((e) => e.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleTrash = () => {
    if (selectedIds.size === 0) return;
    trashMutation.mutate(Array.from(selectedIds));
  };

  const handleDelete = () => {
    if (selectedIds.size === 0) return;
    deleteMutation.mutate(Array.from(selectedIds));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-text text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const paginatedEmails = emails.slice(
    currentPage * EMAILS_PER_PAGE,
    (currentPage + 1) * EMAILS_PER_PAGE
  );
  const totalPages = Math.ceil(emails.length / EMAILS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <header className="bg-surface/80 border-b border-border backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-6 py-3.5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-primary-glow">
                <Mail className="text-background" size={18} />
              </div>
              <div>
                <h1 className="text-base font-display font-semibold text-text">
                  MailSweep
                </h1>
                <p className="text-xs text-muted">{user?.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                onClick={() => router.push("/")}
                variant="secondary"
                className="text-sm px-4"
              >
                <Home size={16} />
                Home
              </Button>
              <ThemeToggle />
              <Button
                onClick={logout}
                variant="secondary"
                className="text-sm px-4"
              >
                <LogOut size={16} />
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        {/* Search Panel */}
        <div className="card mb-6">
          <h2 className="text-lg font-display font-semibold text-text mb-1.5">
            Search with intent
          </h2>
          <p className="text-sm text-muted mb-5">
            Filter by sender and date window. Preview before you sweep.
          </p>
          <form onSubmit={handleSearch} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Sender email or domain
              </label>
              <Input
                type="text"
                placeholder="e.g. jumia or newsletters@company.com"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  From date
                </label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  To date
                </label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              isLoading={searchMutation.isPending}
              className="w-full md:w-auto text-sm px-5"
            >
              <Search size={16} />
              Search Emails
            </Button>
          </form>
        </div>

        {/* Results Panel */}
        {searchMutation.isPending && (
          <div className="card space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        )}

        {emails.length > 0 && !searchMutation.isPending && (
          <>
            <div className="card mb-3.5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3.5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-text font-medium">
                    {emails.length} email{emails.length !== 1 ? "s" : ""} found
                  </span>
                  {paginatedEmails.length > 0 && (
                    <>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            paginatedEmails.every((email) =>
                              selectedIds.has(email.id)
                            ) && paginatedEmails.length > 0
                          }
                          onChange={handleSelectAllOnPage}
                          className="w-3.5 h-3.5 accent-primary cursor-pointer"
                        />
                        <span className="text-xs text-muted">
                          Page ({paginatedEmails.length})
                        </span>
                      </label>
                      <div className="h-4 w-px bg-border" />
                      <button
                        onClick={handleSelectAllAcrossPages}
                        className="text-xs text-muted hover:text-text transition-colors underline decoration-dotted underline-offset-2"
                      >
                        {selectedIds.size === emails.length
                          ? "Deselect"
                          : "Select"}{" "}
                        all {emails.length}
                      </button>
                    </>
                  )}
                </div>
                {selectedIds.size > 0 && (
                  <span className="text-sm text-primary font-medium">
                    {selectedIds.size} selected
                  </span>
                )}
              </div>

              {/* Email List */}
              <div className="space-y-2">
                {paginatedEmails.map((email) => (
                  <div
                    key={email.id}
                    className={`border border-border rounded-xl p-3 transition-colors cursor-pointer ${
                      selectedIds.has(email.id)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-surface/60"
                    }`}
                    onClick={() => toggleSelect(email.id)}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(email.id)}
                        onChange={() => toggleSelect(email.id)}
                        className="mt-0.5 w-3.5 h-3.5 accent-primary cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-medium text-text truncate">
                            {email.sender}
                          </span>
                          <span className="text-xs text-muted ml-2">
                            {email.date}
                          </span>
                        </div>
                        <p className="text-sm text-text font-medium truncate mb-0.5">
                          {email.subject}
                        </p>
                        <p className="text-xs text-muted line-clamp-2">
                          {email.snippet}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-5 pt-5 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      variant="secondary"
                      className="text-xs px-3 py-2"
                    >
                      ← Previous
                    </Button>
                    <Button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      disabled={currentPage === totalPages - 1}
                      variant="secondary"
                      className="text-xs px-3 py-2"
                    >
                      Next →
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 7) {
                        pageNum = i;
                      } else if (currentPage < 3) {
                        pageNum = i;
                      } else if (currentPage > totalPages - 4) {
                        pageNum = totalPages - 7 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-primary text-background"
                              : "bg-surface/60 text-muted hover:bg-surface hover:text-text"
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-xs text-muted font-mono">
                    {currentPage * EMAILS_PER_PAGE + 1}-
                    {Math.min(
                      (currentPage + 1) * EMAILS_PER_PAGE,
                      emails.length
                    )}{" "}
                    of {emails.length}
                  </span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            {selectedIds.size > 0 && (
              <div className="card bg-surface/80 backdrop-blur-sm sticky bottom-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <span className="text-sm text-text font-medium">
                    {selectedIds.size} email{selectedIds.size !== 1 ? "s" : ""}{" "}
                    selected
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    <Button
                      onClick={handleTrash}
                      isLoading={trashMutation.isPending}
                      variant="secondary"
                      className="text-sm px-4"
                    >
                      <Trash2 size={16} />
                      Move to Trash
                    </Button>
                    <Button
                      onClick={() => setShowDeleteDialog(true)}
                      variant="danger"
                      className="text-sm px-4"
                    >
                      <AlertTriangle size={16} />
                      Delete Permanently
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {emails.length === 0 &&
          !searchMutation.isPending &&
          searchMutation.isSuccess && (
            <div className="card text-center py-10">
              <Mail className="text-muted mx-auto mb-3" size={48} />
              <h3 className="text-base font-display font-bold text-text mb-1.5">
                No emails found
              </h3>
              <p className="text-sm text-muted">
                Try adjusting your search criteria
              </p>
            </div>
          )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogHeader>
          <DialogTitle>Permanently Delete Emails?</DialogTitle>
          <DialogDescription>
            You are about to permanently delete {selectedIds.size} email
            {selectedIds.size !== 1 ? "s" : ""}. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2.5 mt-5">
          <Button
            onClick={() => setShowDeleteDialog(false)}
            variant="secondary"
            className="flex-1 text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            isLoading={deleteMutation.isPending}
            variant="danger"
            className="flex-1 text-sm"
          >
            Delete Permanently
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
