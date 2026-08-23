import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage } from "../api/axios";
import clubPrivacyApi from "../api/clubPrivacy";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import BackgroundDecoration from "../components/BackgroundDecoration";
import EmptyState from "../components/EmptyState";
import InviteCard from "../components/ClubPrivacy/InviteCard";
import { ArrowLeft, Mail, Sparkles, ShieldAlert } from "lucide-react";

export default function InviteDetails() {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const { user: me } = useContext(AuthContext);

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
  
      const res = await clubPrivacyApi.getInviteById(inviteId);
      setInvite(res);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load invite"));
    } finally {
      setLoading(false);
    }
  }, [inviteId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRevoked = () => {
    toast.success("Invite revoked.");
    load();
  };

  const handleResponded = () => {
    load();
  };

  if (loading) return <Loader />;

  const mode = invite && me && invite.invitedUserId === me.id ? "own" : "manage";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/20 dark:from-gray-950 dark:via-gray-900/80 dark:to-gray-950 pb-12">
      <BackgroundDecoration blobs={2} />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-5 px-4 py-2.5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:translate-x-[-4px]"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="font-medium text-sm">Back</span>
        </button>

        <div className="page-hero p-6 sm:p-8 mb-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="relative">
            <span className="hero-pill mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Invite Details
            </span>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {invite?.clubName ? `Invite to ${invite.clubName}` : "Club Invite"}
              </h1>
            </div>
          </div>
        </div>

        {error ? (
          <EmptyState
            icon={ShieldAlert}
            iconClassName="w-12 h-12 text-gray-400"
            title="Can't show this invite"
            message={error}
            cardClassName="glass-card rounded-3xl shadow-xl p-16 text-center"
          >
            <Link to="/invites" className="btn-primary px-6 py-2.5 inline-flex mt-4">
              Go to My Invites
            </Link>
          </EmptyState>
        ) : invite ? (
          <InviteCard
            invite={invite}
            mode={mode}
            onRevoked={handleRevoked}
            onResponded={handleResponded}
            linkToDetails={false}
          />
        ) : null}
      </div>
    </div>
  );
}
