import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  Upload, Download, Trash2, Search, File as FileIcon, X,
  BarChart3, RefreshCw, Edit2, Check,
} from "lucide-react";

const TABS = [
  { id: "all", label: "All Files", endpoint: "/file" },
  { id: "my", label: "My Files", endpoint: "/file/my" },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white mb-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative flex items-center gap-3 mb-2">
            <FileIcon className="w-8 h-8 sm:w-10 sm:h-10" />
            <h1 className="text-2xl sm:text-4xl font-bold">Files</h1>
          </div>
          <p className="text-white/90 text-sm sm:text-base">Upload, manage and download shared files.</p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1"><BarChart3 className="w-3.5 h-3.5" /> Total Files</div>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.totalFiles}</p>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-gray-500 text-xs mb-1">Total Size</div>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{formatSize(stats.totalSize)}</p>
            </div>
            {Object.entries(stats.fileCountByType || {}).slice(0, 2).map(([type, count]) => (
              <button key={type} onClick={() => filterByType(type)} className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-gray-700 text-left hover:border-red-300">
                <div className="text-gray-500 text-xs mb-1">{type}</div>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{count}</p>
              </button>
            ))}
          </div>
        )}

        <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-5 mb-6 border border-white/30 dark:border-gray-700/50">
          <label className="flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-red-400 transition-colors">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">{selectedFile ? selectedFile.name : "Click to choose a file to upload (max 10MB)"}</span>
            <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          </label>
          {selectedFile && (
            <button onClick={uploadFile} disabled={uploading} className="mt-3 w-full bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2.5 rounded-xl font-medium disabled:opacity-50">
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSearchTerm(""); setTypeFilter(""); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t.id ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
            >
              {t.label}
            </button>
          ))}
          {typeFilter && (
            <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-xl text-xs">
              Type: {typeFilter}
              <button onClick={() => { setTypeFilter(""); loadFiles(1); }}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button onClick={() => loadFiles(page, searchTerm, typeFilter)} className="ml-auto p-2 text-gray-500 hover:text-red-500">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-6 relative">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files by name..."
            className="w-full px-5 py-3 pl-12 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </form>

        {files.length === 0 ? (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-12 text-center border border-white/30">
            <FileIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No files found.</p>
          </div>
        ) : (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/50 divide-y divide-gray-100 dark:divide-gray-700">
            {files.map((f) => (
              <div key={f.id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <button onClick={() => viewFileDetails(f.id)} className="font-medium text-gray-800 dark:text-white truncate text-left hover:text-red-600 hover:underline">
                    {f.originalName || f.fileName}
                  </button>
                  <p className="text-xs text-gray-400">{f.fileType} • {formatSize(f.size)} • {new Date(f.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => downloadFile(f.id, f.originalName || f.fileName)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  {replacingId === f.id ? (
                    <label className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg cursor-pointer" title="Choose replacement">
                      <Check className="w-4 h-4" />
                      <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && replaceFile(f.id, e.target.files[0])} />
                    </label>
                  ) : (
                    <button onClick={() => setReplacingId(f.id)} className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg" title="Replace file">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteFile(f.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button disabled={page <= 1} onClick={() => loadFiles(page - 1, searchTerm, typeFilter)} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40">
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => loadFiles(page + 1, searchTerm, typeFilter)} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>

      {detailFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetailFile(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-white">File Details</h3>
              <button onClick={() => setDetailFile(null)} className="text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-2 text-sm">
              <p><span className="text-gray-500">Name:</span> {detailFile.originalName || detailFile.fileName}</p>
              <p><span className="text-gray-500">Type:</span> {detailFile.fileType}</p>
              <p><span className="text-gray-500">Size:</span> {formatSize(detailFile.size)}</p>
              <p><span className="text-gray-500">Uploaded:</span> {new Date(detailFile.uploadedAt).toLocaleString()}</p>
              {detailFile.uploadedByName && <p><span className="text-gray-500">By:</span> {detailFile.uploadedByName}</p>}
              <button
                onClick={() => downloadFile(detailFile.id, detailFile.originalName || detailFile.fileName)}
                className="w-full mt-3 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
