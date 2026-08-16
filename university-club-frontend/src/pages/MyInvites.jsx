import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage, toArray } from "../api/axios";
import clubPrivacyApi from "../api/clubPrivacy";
import Loader from "../components/Loader";
import InviteCard from "../components/ClubPrivacy/InviteCard";
import { Mail, Sparkles, Building2 } from "lucide-react";

export default function MyInvites() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
     
      const res = await clubPrivacyApi.getMyInvites();
      setInvites(toArray(res));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load your invites"));
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleResponded = (inviteId) => {
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
  };

  if (initialLoad && loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="page-hero p-6 sm:p-8 md:p-10 mb-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

          <div className="relative">
            <span className="hero-pill mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Pending Club Invites
            </span>
            <div className="flex items-center gap-3 mt-2 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">My Invites</h1>
            </div>
            <p className="text-white/90 text-base md:text-lg max-w-2xl leading-relaxed">
              Clubs that have invited you to join, waiting on your response.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="glass-card rounded-3xl shadow-xl p-16 text-center text-gray-400 dark:text-gray-500 text-sm font-medium">
            Loading invites...
          </div>
        ) : invites.length === 0 ? (
          <div className="glass-card rounded-3xl shadow-xl p-16 text-center">
            <div className="empty-state">
              <div className="icon">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No pending invites</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-5">
                When a club admin invites you to join, it will show up here.
              </p>
              <Link to="/clubs" className="btn-primary px-6 py-2.5 inline-flex">
                Browse Clubs
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {invites.map((inv) => (
              <InviteCard key={inv.id} invite={inv} mode="own" onResponded={handleResponded} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
