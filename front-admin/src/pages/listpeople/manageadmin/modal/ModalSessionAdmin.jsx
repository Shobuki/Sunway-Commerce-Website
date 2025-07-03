import React, { useEffect, useState } from "react";
import axios from "@/utils/axios";

const API_GET_SESSION = "/api/admin/admin/admins/sessions";
const API_REVOKE_SESSION = "/api/admin/admin/admins/sessions/revoke";
const API_REVOKE_ADMIN = "/api/admin/admin/admins/sessions/admin/revoke";

const ModalSessionAdmin = ({ adminId, onClose }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [revokeAllLoading, setRevokeAllLoading] = useState(false);
    const [error, setError] = useState("");

    // Ambil daftar session
    const fetchSessions = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.post(API_GET_SESSION, { adminId });
            setSessions(res.data.sessions || []);
        } catch (err) {
            setError("Failed to fetch sessions");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminId) fetchSessions();
        // eslint-disable-next-line
    }, [adminId]);

    // Revoke per session
    const handleRevokeSession = async (index) => {
        const session = sessions[index];
        if (!session || !window.confirm("Revoke this session?")) return;

        try {
            await axios.post(API_REVOKE_SESSION, { sessionId: session.sessionId ?? session.id ?? session.Id ?? session._id });
            // Refresh semua session (langsung ambil ulang dari backend)
            await fetchSessions();
        } catch (err) {
            alert("Failed to revoke session");
        }
    };

    // Revoke all session by admin
    const handleRevokeAll = async () => {
        if (!window.confirm("Revoke ALL sessions for this admin?")) return;
        setRevokeAllLoading(true);
        try {
            await axios.post(API_REVOKE_ADMIN, { adminId });
            fetchSessions();
        } catch (err) {
            alert("Failed to revoke all sessions");
        }
        setRevokeAllLoading(false);
    };

    // Formatting time
    const formatTime = (iso) =>
        iso ? new Date(iso).toLocaleString("en-GB") : "-";

    return (
        <div className="modal-overlay z-[9999]">
            <div className="modal-content w-full h-full bg-white p-0 m-0 flex flex-col rounded-none shadow-none overflow-auto">
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-xl font-bold">Session List for Admin ID {adminId}</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-red-500 text-2xl font-bold">&times;</button>
                </div>

                {error && <div className="text-red-600 mb-2 px-6">{error}</div>}
                {loading ? (
                    <div className="px-6 py-4">Loading sessions...</div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <div className="w-full overflow-x-auto">
                                <table className="min-w-[900px] w-full border bg-white text-xs md:text-sm">
                                    <thead>
                                        <tr>
                                            <th className="border px-2 py-1 whitespace-nowrap">#</th>
                                            <th className="border px-2 py-1 whitespace-nowrap">Login Time</th>
                                            <th className="border px-2 py-1 whitespace-nowrap">Logout Time</th>
                                            <th className="border px-2 py-1 whitespace-nowrap">Status</th>
                                            <th className="border px-2 py-1 whitespace-nowrap">Device Info</th>
                                            <th className="border px-2 py-1 whitespace-nowrap">User Agent</th>
                                            <th className="border px-2 py-1 whitespace-nowrap">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sessions.length > 0 ? (
                                            sessions.map((s, idx) => (
                                                <tr key={idx}>
                                                    <td className="border px-2 py-1">{idx + 1}</td>
                                                    <td className="border px-2 py-1">{formatTime(s.logintime)}</td>
                                                    <td className="border px-2 py-1">{s.logouttime ? formatTime(s.logouttime) : "-"}</td>
                                                    <td className={`border px-2 py-1 font-semibold ${s.status === "active" ? "text-green-600" : "text-gray-400"}`}>{s.status}</td>
                                                    <td className="border px-2 py-1 max-w-[160px] md:max-w-xs truncate" title={s.device || ""}>{s.device || <span className="text-gray-400 italic">-</span>}</td>
                                                    <td className="border px-2 py-1 max-w-[260px] md:max-w-md overflow-x-auto">
                                                        {s.useragent ? (
                                                            <pre
                                                                className="whitespace-pre-wrap break-words text-xs font-mono"
                                                                style={{ maxWidth: 320, overflowX: "auto", margin: 0 }}
                                                                title={s.useragent}
                                                            >{s.useragent}</pre>
                                                        ) : (
                                                            <span className="text-gray-400 italic">-</span>
                                                        )}
                                                    </td>

                                                    <td className="border px-2 py-1">
                                                        {s.status === "active" && (
                                                            <button
                                                                className="bg-red-600 hover:bg-red-800 text-white rounded px-2 py-1"
                                                                onClick={() => handleRevokeSession(idx)}
                                                            >
                                                                Revoke
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="text-center py-3">No sessions found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t">
                            <button
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 rounded px-4 py-1 w-full sm:w-auto"
                                onClick={onClose}
                            >
                                Close
                            </button>
                            <button
                                className="bg-red-700 hover:bg-red-900 text-white rounded px-4 py-1 w-full sm:w-auto"
                                onClick={handleRevokeAll}
                                disabled={revokeAllLoading}
                            >
                                {revokeAllLoading ? "Revoking..." : "Revoke All Sessions"}
                            </button>
                        </div>
                    </>
                )}
            </div>
            {/* Responsive Fullscreen Modal */}
            <style jsx>{`
        .modal-overlay {
          position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.3); z-index: 9999;
          display: flex; align-items: center; justify-content: center;
        }
        .modal-content {
          width: 100vw;
          height: 100vh;
          max-width: 100vw;
          max-height: 100vh;
          border-radius: 0;
        }
        @media (max-width: 640px) {
          .modal-content {
            padding: 0 !important;
            font-size: 12px !important;
          }
          th, td {
            font-size: 11px !important;
            padding-left: 4px !important;
            padding-right: 4px !important;
          }
        }
      `}</style>
        </div>
    );
};

export default ModalSessionAdmin;
