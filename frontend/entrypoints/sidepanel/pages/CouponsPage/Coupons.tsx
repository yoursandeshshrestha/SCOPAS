import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { couponService } from "../../services/coupon.service";
import { ArrowLeft } from "lucide-react";
import CouponCard, { CouponCardData } from "../../components/coupon/CouponCard";
import CouponCardSkeleton from "../../components/coupon/CouponCardSkeleton";

const CouponsPage: React.FC = () => {
  const navigate = useNavigate();
  const { storeName } = useParams();
  const [loading, setLoading] = useState(true);
  const [couponsByPlatform, setCouponsByPlatform] = useState<
    Record<string, string[]>
  >({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!storeName) return;
      setLoading(true);
      try {
        const res = await couponService.getCouponsByStoreName(storeName);
        setCouponsByPlatform(res.data || {});
      } catch (e) {
        setCouponsByPlatform({});
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, [storeName]);

  const handleCopied = (code: string) => setCopiedCode(code);

  return (
    <div className="h-screen w-full bg-[var(--bg-dark)] flex flex-col">
      <Navbar />

      {/* Opaque background under navbar + title to prevent content bleed-through */}
      <div className="fixed top-0 left-0 right-0 h-[9.5rem] bg-[var(--bg-dark)] z-30" />

      {/* Back + Title bar */}
      <div className="fixed top-24 left-0 right-0 z-40 px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-3 h-10 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white flex items-center gap-2 hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="px-3 h-10 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white flex items-center">
            {storeName}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pt-38 pb-6 px-6">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <div className="space-y-0">
              {Array.from({ length: 16 }).map((_, i) => (
                <CouponCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && (
            <div className="space-y-2">
              {(() => {
                const allCodes = Object.values(couponsByPlatform).flat();
                if (allCodes.length === 0) {
                  return (
                    <div className="text-neutral-500">
                      No coupons available.
                    </div>
                  );
                }
                return allCodes.map((code, idx) => (
                  <CouponCard
                    key={`${code}-${idx}`}
                    coupon={{ code, description: null } as CouponCardData}
                    index={idx}
                    copiedCode={copiedCode}
                    onCopyCode={handleCopied}
                  />
                ));
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponsPage;
