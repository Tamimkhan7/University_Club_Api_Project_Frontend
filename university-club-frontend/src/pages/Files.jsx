import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  Upload,
  Download,
  Trash2,
  Search,
  File as FileIcon,
  X,
  BarChart3,
  RefreshCw,
  Edit2,
  Check,
  FolderOpen,
  Database,
  Cloud,
  HardDrive,
  Server,
  Share2,
  Link2,
  Copy,
  CheckCircle,
  AlertCircle,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  Archive,
  Zap,
  Sparkles,
  Rocket,
  Star,
  Award,
  User
} from "lucide-react";
const TABS = [
  { id: "all", label: "All Files", icon: FolderOpen },
  { id: "my", label: "My Files", icon: User },
];


export default function Files() {
  const [tab, setTab] = useState("all");
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [stats, setStats] = useState(null);
  const [replacingId, setReplacingId] = useState(null);
  const [detailFile, setDetailFile] = useState(null);

  const viewFileDetails = async (id) => {
    try {
      const res = await api.get(`/file/${id}`);
      setDetailFile(res.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load file details"));
    }
  };

  const currentEndpoint = TABS.find((t) => t.id === tab)?.endpoint || "/file";

  const loadFiles = async (targetPage = 1, query = "", type = "") => {
    setLoading(true);
    try {
      let endpoint = currentEndpoint;
      let params = { page: targetPage, pageSize: 15 };
      if (query) {
        endpoint = "/file/search";
        params = { keyword: query, page: targetPage, pageSize: 15 };
      } else if (type) {
        endpoint = `/file/type/${type}`;
      }
      const res = await api.get(endpoint, { params });
      const data = res.data || {};
      setFiles(data.items || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load files"));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get("/file/stats");
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadFiles(1);
    loadStats();
  }, [tab]);

  const handleSearch = (e) => {
    e.preventDefault();
    setTypeFilter("");
    loadFiles(1, searchTerm.trim());
  };

  const filterByType = (type) => {
    setSearchTerm("");
    setTypeFilter(type);
    loadFiles(1, "", type);
  };

  const uploadFile = async () => {
    if (!selectedFile) return toast.error("Choose a file first");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("File", selectedFile);
      await api.post("/file/upload", formData);
      toast.success("File uploaded!");
      setSelectedFile(null);
      loadFiles(1, searchTerm, typeFilter);
      loadStats();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to upload file"));
    } finally {
      setUploading(false);
    }
  };

  const replaceFile = async (id, file) => {
    try {
      const formData = new FormData();
      formData.append("File", file);
      await api.put(`/file/${id}`, formData);
      toast.success("File replaced!");
      setReplacingId(null);
      loadFiles(page, searchTerm, typeFilter);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to replace file"));
    }
  };

  const deleteFile = async (id) => {
    if (!confirm("Delete this file?")) return;
    try {
      await api.delete(`/file/${id}`);
      toast.success("File deleted");
      loadFiles(page, searchTerm, typeFilter);
      loadStats();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete file"));
    }
  };

  const downloadFile = async (id, name) => {
    try {
      const res = await api.get(`/file/download/${id}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = name || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to download file"));
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(1)} ${units[i]}`;
  };

  const getFileIcon = (type) => {
    if (!type) return <FileIcon className="w-5 h-5" />;
    const ext = type.toLowerCase();
    if (ext.includes('image')) return <FileImage className="w-5 h-5" />;
    if (ext.includes('video')) return <FileVideo className="w-5 h-5" />;
    if (ext.includes('audio')) return <FileAudio className="w-5 h-5" />;
    if (ext.includes('zip') || ext.includes('rar') || ext.includes('7z')) return <Archive className="w-5 h-5" />;
    if (ext.includes('pdf') || ext.includes('doc') || ext.includes('txt')) return <FileText className="w-5 h-5" />;
    return <FileIcon className="w-5 h-5" />;
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50/30 to-orange-50/30 dark:from-gray-900 dark:via-gray-800/80 dark:to-gray-900 pb-12 overflow-hidden">
      
      {/* Premium Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-500/3 to-rose-500/3 rounded-full blur-2xl animate-spin-slow" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Hero Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl blur-3xl opacity-20 animate-pulse-slow" />
          <div className="relative bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-8 md:p-10 text-white overflow-hidden shadow-2xl shadow-red-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-float-slow animation-delay-1000" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10">
                  <Database className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Files</h1>
                  <p className="text-white/80 text-sm mt-1">Upload, manage and download shared files</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                  <Cloud className="w-4 h-4" />
                  <span className="text-sm font-medium">{files.length} Files</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                  <HardDrive className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatSize(stats?.totalSize || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:-translate-y-1 p-4 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                <BarChart3 className="w-3.5 h-3.5" />
                Total Files
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {stats.totalFiles}
              </p>
            </div>
            <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:-translate-y-1 p-4 border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Total Size</div>
              <p className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {formatSize(stats.totalSize)}
              </p>
            </div>
            {Object.entries(stats.fileCountByType || {}).slice(0, 2).map(([type, count]) => (
              <button
                key={type}
                onClick={() => filterByType(type)}
                className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:-translate-y-1 p-4 border border-gray-200/50 dark:border-gray-700/50 hover:border-red-200/50 dark:hover:border-red-800/30 text-left"
              >
                <div className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FolderOpen className="w-3 h-3" />
                  {type}
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {count}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-red-500/10 p-5 mb-6 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 hover:shadow-3xl hover:shadow-red-500/15">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Upload File</span>
          </div>
          
          <label className="flex items-center justify-center gap-3 w-full px-6 py-5 border-2 border-dashed border-gray-300/80 dark:border-gray-600/80 rounded-2xl cursor-pointer hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all duration-300 group bg-white/40 dark:bg-gray-700/30 backdrop-blur-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-xl flex items-center justify-center group-hover:from-red-500/20 group-hover:to-rose-500/20 transition-all">
              <Cloud className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-red-500 transition-colors">
                {selectedFile ? selectedFile.name : "Click to choose a file"}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {selectedFile 
                  ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Click to change` 
                  : "Max 10MB • Drag & drop supported"}
              </div>
            </div>
            <input
              type="file"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            {selectedFile && (
              <div className="ml-auto bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold px-3 py-1.5 rounded-xl border border-green-500/20">
                ✓ Selected
              </div>
            )}
          </label>
          
          {selectedFile && (
            <button
              onClick={uploadFile}
              disabled={uploading}
              className="mt-3 w-full bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-3.5 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Upload File
                </>
              )}
            </button>
          )}
        </div>

        {/* Tabs and Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex flex-wrap gap-1.5 p-1 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setSearchTerm(""); setTypeFilter(""); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 hover:scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
          
          {typeFilter && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-medium border border-amber-200 dark:border-amber-800/30">
              Type: {typeFilter}
              <button
                onClick={() => { setTypeFilter(""); loadFiles(1); }}
                className="hover:bg-amber-200 dark:hover:bg-amber-800/30 rounded-lg p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          <button
            onClick={() => loadFiles(page, searchTerm, typeFilter)}
            className="ml-auto p-2.5 text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6 relative group">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files by name..."
              className="w-full px-5 py-3.5 pl-12 pr-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-red-400/20 focus:border-red-400 transition-all duration-300 outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(""); loadFiles(1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </form>

        {/* Files List */}
        {files.length === 0 ? (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-red-500/10 p-12 sm:p-16 text-center border border-gray-200/50 dark:border-gray-700/50">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FileIcon className="w-12 h-12 text-red-500" />
              </div>
              <div className="absolute -top-2 -right-6 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/50 animate-bounce-slow">
                <Star className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No files found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? "Try a different search term" : "Upload your first file to get started!"}
            </p>
          </div>
        ) : (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-red-500/10 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {files.map((f, index) => (
                <div
                  key={f.id}
                  className="flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/10 dark:hover:to-rose-900/10 transition-all duration-300 group"
                >
                  {/* File Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform duration-300">
                    {getFileIcon(f.fileType)}
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-lg shadow-green-500/50">
                      ✓
                    </span>
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => viewFileDetails(f.id)}
                      className="font-semibold text-gray-800 dark:text-white truncate text-left hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 flex items-center gap-2"
                    >
                      {f.originalName || f.fileName}
                      <span className="text-[10px] font-medium bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500 dark:text-gray-400">
                        {f.fileType}
                      </span>
                    </button>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                      <span>{formatSize(f.size)}</span>
                      <span className="w-px h-3 bg-gray-200 dark:bg-gray-600" />
                      <span>{new Date(f.uploadedAt).toLocaleDateString()}</span>
                      {f.uploadedByName && (
                        <>
                          <span className="w-px h-3 bg-gray-200 dark:bg-gray-600" />
                          <span>By {f.uploadedByName}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => downloadFile(f.id, f.originalName || f.fileName)}
                      className="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 hover:scale-110 group/action"
                      title="Download"
                    >
                      <Download className="w-4 h-4 group-hover/action:-translate-y-0.5 transition-transform" />
                    </button>
                    
                    {replacingId === f.id ? (
                      <label className="p-2.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer" title="Choose replacement">
                        <Check className="w-4 h-4" />
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && replaceFile(f.id, e.target.files[0])}
                        />
                      </label>
                    ) : (
                      <button
                        onClick={() => setReplacingId(f.id)}
                        className="p-2.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                        title="Replace file"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteFile(f.id)}
                      className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:scale-110 group/delete"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 group-hover/delete:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-3 mt-8">
            <button
              disabled={page <= 1}
              onClick={() => loadFiles(page - 1, searchTerm, typeFilter)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && page > 3) {
                  pageNum = page - 2 + i;
                  if (pageNum > totalPages) return null;
                }
                return (
                  <button
                    key={i}
                    onClick={() => loadFiles(pageNum, searchTerm, typeFilter)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                      page === pageNum
                        ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25"
                        : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500/30"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              disabled={page >= totalPages}
              onClick={() => loadFiles(page + 1, searchTerm, typeFilter)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
            >
              Next
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        )}
      </div>

      {/* File Details Modal */}
      {detailFile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setDetailFile(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4 flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
              <div className="relative flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileIcon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-white">File Details</h3>
              </div>
              <button
                onClick={() => setDetailFile(null)}
                className="relative p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                  {getFileIcon(detailFile.fileType)}
                  <span className="absolute text-white text-[10px]">✓</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-white truncate">
                    {detailFile.originalName || detailFile.fileName}
                  </p>
                  <p className="text-xs text-gray-400">{detailFile.fileType}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Size</span>
                  <span className="font-medium text-gray-800 dark:text-white">{formatSize(detailFile.size)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Uploaded</span>
                  <span className="font-medium text-gray-800 dark:text-white">{new Date(detailFile.uploadedAt).toLocaleString()}</span>
                </div>
                {detailFile.uploadedByName && (
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Uploaded By</span>
                    <span className="font-medium text-gray-800 dark:text-white">{detailFile.uploadedByName}</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => downloadFile(detailFile.id, detailFile.originalName || detailFile.fileName)}
                className="w-full mt-3 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}