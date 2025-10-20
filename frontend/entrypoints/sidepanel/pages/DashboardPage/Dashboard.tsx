import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, Store as StoreIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { signout } from "../../store/slices/authSlice";
import Navbar from "../../components/layout/Navbar";
import SearchInput from "../../components/search/SearchInput";
import FilterButtons from "../../components/search/FilterButtons";
import StoreCard from "../../components/store/StoreCard";
import StoreCardSkeleton from "../../components/store/StoreCardSkeleton";
import { storeService } from "../../services/store.service";
import { Store, PaginationMeta } from "../../types/store.types";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading: authLoading } = useAppSelector((state) => state.auth);

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    fetchStores(1, searchTerm || "", selectedLetter, false);
  }, [searchTerm, selectedLetter]);

  const fetchStores = async (
    page: number,
    search?: string,
    letter?: string | null,
    append: boolean = false
  ) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        // Clear existing list so skeletons show during non-append fetches (e.g., filter/search)
        setStores([]);
        setPagination(null);
      }
      setError(null);
      const response = await storeService.getAllStores({
        page,
        limit: 12,
        ...(search && { search }),
        ...(letter && { letter }),
      });

      if (append) {
        setStores((prevStores) => [...prevStores, ...response.data]);
      } else {
        setStores(response.data);
      }

      setPagination(response.meta);
    } catch (err) {
      setError("Failed to load stores. Please try again.");
      console.error("Error fetching stores:", err);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(signout()).unwrap();
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/signin");
    }
  };

  const handleLoadMore = () => {
    if (pagination?.hasNextPage && !loading && !loadingMore) {
      const nextPage = currentPage + 1;
      fetchStores(nextPage, searchTerm, selectedLetter, true);
      setCurrentPage(nextPage);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleFilterChange = (letter: string | null) => {
    setSelectedLetter(letter);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const openCoupons = (store: Store) => {
    const encoded = encodeURIComponent(store.name);
    navigate(`/coupons/${encoded}`);
  };

  return (
    <div className="h-screen w-full bg-[var(--bg-dark)] flex flex-col">
      {/* Fixed Floating Navbar */}
      <Navbar />

      {/* Opaque background under navbar + filters to prevent content bleed-through */}
      <div className="fixed top-0 left-0 right-0 h-48 bg-[var(--bg-dark)] z-30" />

      {/* Search and Filter under Navbar */}
      <div className="fixed top-24 left-0 right-0 z-40 px-6">
        <div className="flex items-center gap-3">
          <SearchInput
            onSearch={handleSearch}
            onExpandChange={setIsSearchExpanded}
            placeholder="Search stores..."
          />
          <AnimatePresence>
            {!isSearchExpanded && (
              <motion.div
                initial={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden flex-1"
              >
                <FilterButtons onFilterChange={handleFilterChange} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Store Count - Loading Skeleton (Fixed) */}
      {loading && (
        <div className="fixed top-[9.5rem] left-0 right-0 z-30 px-6 py-2 bg-[var(--bg-dark)]">
          <div className="h-4 w-56 bg-neutral-700 rounded animate-pulse" />
        </div>
      )}

      {/* Store Count - Fixed */}
      {!loading && stores.length > 0 && pagination && (
        <div className="fixed top-[9.5rem] left-0 right-0 z-30 px-6 py-2 bg-[var(--bg-dark)]">
          <div className="text-sm text-gray-400">
            Showing {stores.length} of {pagination.totalItems} stores
          </div>
        </div>
      )}

      {/* Main Content with padding for fixed navbar, search and store count */}
      <div className="flex-1 overflow-auto pt-48 pb-6 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {loading && stores.length === 0 && (
            <div className="space-y-0">
              {Array.from({ length: 8 }).map((_, idx) => (
                <StoreCardSkeleton key={idx} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Stores List */}
          {!loading && stores.length > 0 && (
            <>
              <div className="space-y-0">
                {stores.map((store, idx) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    index={idx}
                    onClick={openCoupons}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {pagination && pagination.hasNextPage && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full mt-2.5 relative rounded-lg bg-neutral-800 border border-neutral-700 transition-all duration-200 hover:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <div className="p-3.5 px-4 flex items-center justify-center gap-2 text-white font-medium">
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <span>Load More</span>
                    )}
                  </div>
                </button>
              )}
              {loadingMore && (
                <div className="mt-2.5 space-y-0">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <StoreCardSkeleton key={`more-${idx}`} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && stores.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <StoreIcon className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No stores found
              </h3>
              <p className="text-gray-400 text-center max-w-md">
                {searchTerm
                  ? `No stores match "${searchTerm}". Try a different search term.`
                  : "No stores available at the moment. Check back later!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
