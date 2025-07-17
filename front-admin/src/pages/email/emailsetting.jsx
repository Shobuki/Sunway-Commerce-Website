'use client';
import React, { useEffect, useState, useRef } from 'react';

import axios from "@/utils/axios";

function hasFeatureAccess(menuAccess, feature) {
    return (
        menuAccess?.Features?.some(
            (f) => f.Feature === feature && f.Access === "WRITE"
        ) ?? false
    );
}

const TEMPLATE_VARIABLES = {
    SALES_ORDER: [
        { label: "{{user}}", desc: "Nama admin/sales" },
        { label: "{{dealer}}", desc: "Nama dealer" },
        { label: "{{sales}}", desc: "sales" },
        { label: "{{sales_order_number}}", desc: "Nomor sales order" },
        { label: "{{created_date}}", desc: "Tanggal order" },
        { label: "{{JDE}}", desc: "nomor jde sales order" },
        // dst... (tambahkan sesuai backend parser)
    ],
    ADMIN_NOTIFICATION_SALESORDER: [
        { label: "{{dealer}}", desc: "Nama dealer" },
        { label: "{{sales}}", desc: "Nama sales" },
        { label: "{{sales_order_number}}", desc: "Nomor sales order" },
        { label: "{{created_date}}", desc: "Tanggal order" },
        { label: "{{path}}", desc: "Link detail approval" }
    ],
    FORGOT_PASSWORD_USER: [
        { label: "{{user}}", desc: "Nama user" },
        { label: "{{link}}", desc: "Link reset password" }
    ],
    FORGOT_PASSWORD_ADMIN: [
        { label: "{{user}}", desc: "Nama admin" },
        { label: "{{link}}", desc: "Link reset password" }
    ]
    // Tambah tipe lain jika perlu
};

const API_TEMPLATE = '/api/admin/admin/email/template';
const API_CONFIG = '/api/admin/admin/email/config';

const EmailSettings = () => {

    const [loadingAccess, setLoadingAccess] = useState(true);
    const [menuAccess, setMenuAccess] = useState(null);

    const bodyRef = useRef(null);
    const [templates, setTemplates] = useState([]);
    const [configs, setConfigs] = useState([]);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [templateForm, setTemplateForm] = useState({ Id: null, Name: '', Subject: '', Body: '', TemplateType: '' });
    const [configForm, setConfigForm] = useState({
        Id: null,
        Email: '',
        Password: '',
        Host: '',
        Port: '',
        Secure: true
    });
    const EMAIL_PROVIDERS = {
        Gmailsecuretrue: { Host: "smtp.gmail.com", Port: 465 },
        Gmailsecurefalse: { Host: "smtp.gmail.com", Port: 587 },
        Outlook: { Host: "smtp.office365.com", Port: 587 },
        Yahoo: { Host: "smtp.mail.yahoo.com", Port: 465 },
        Zoho: { Host: "smtp.zoho.com", Port: 465 },
    };



    useEffect(() => {
        fetchTemplates();
        fetchConfigs();
    }, []);

    // --- Proteksi menu access: akses menu 'emailsetting' ---
    useEffect(() => {
        axios.get("/api/admin/admin/access/my-menu")
            .then(res => {
                const access = (res.data || []).find(
                    m => m.Name?.toLowerCase() === "emailsetting"
                );
                setMenuAccess(access || null);
                setLoadingAccess(false);
                if (!access) setTimeout(() => window.location.href = "/access-denied", 0);
            })
            .catch(() => {
                setMenuAccess(null);
                setLoadingAccess(false);
                setTimeout(() => window.location.href = "/access-denied", 0);
            });
    }, []);



    const fetchTemplates = async () => {
        const res = await axios.get(API_TEMPLATE);
        setTemplates(res.data || []);
    };

    const fetchConfigs = async () => {
        const res = await axios.get(API_CONFIG);
        setConfigs(res.data || []);
    };

    const handleTemplateSubmit = async () => {
        try {
            if (templateForm.Id) {
                await axios.put(API_TEMPLATE, templateForm);
            } else {
                await axios.post(API_TEMPLATE, templateForm);
            }
            fetchTemplates();
            setShowTemplateModal(false);
        } catch (error) {
            console.error("Failed to submit template:", error?.response?.data || error);
            alert("Gagal menyimpan template: " + (error?.response?.data?.error || "Unknown error"));
        }
    };


    const handleConfigSubmit = async () => {
        try {
            await axios.put(API_CONFIG, configForm); // hanya pakai PUT, karena sudah upsert
            fetchConfigs();
            setShowConfigModal(false);
        } catch (err) {
            alert("Failed to verify email config. Make sure credentials are valid.");
            console.error(err);
        }
    };

    const insertAtCursor = (text) => {
        const textarea = bodyRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = templateForm.Body;

        const updatedValue = value.slice(0, start) + text + value.slice(end);

        setTemplateForm({ ...templateForm, Body: updatedValue });

        // Setelah update, fokuskan kembali dan tempatkan kursor setelah teks yang disisipkan
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + text.length;
        }, 0);
    };

    const canCreateTemplate = menuAccess && hasFeatureAccess(menuAccess, "createtemplate");
    const canEditTemplate = menuAccess && hasFeatureAccess(menuAccess, "editemplate");
    const canDeleteTemplate = menuAccess && hasFeatureAccess(menuAccess, "deletetemplate");
    const canSetConfig = menuAccess && hasFeatureAccess(menuAccess, "setconfig");


    if (loadingAccess) return <div>Loading Access...</div>;
    if (!menuAccess) return null;

    return (
        <div className="px-8 py-6 bg-gray-50 min-h-screen ml-60">
            <h1 className="text-2xl font-bold mb-6">Email Settings</h1>


            <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Email Configuration</h2>
                    {canSetConfig && (
                        <button
                            onClick={() => {
                                const config = configs[0] || {
                                    Id: null, Email: '', Password: '', Host: '', Port: '', Secure: true,
                                };
                                setConfigForm(config);
                                setShowConfigModal(true);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            {configs.length > 0 ? "Edit Config" : "Set Config"}
                        </button>
                    )}
                </div>
            </div>
            {/* Email Template Table */}
            <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Email Templates</h2>
                    {canCreateTemplate && (
                        <button
                            onClick={() => { setTemplateForm({ Id: null, Name: '', Subject: '', Body: '', TemplateType: '' }); setShowTemplateModal(true); }}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Create Template
                        </button>
                    )}
                </div>
                <table className="w-full bg-white rounded shadow-sm">
                    <thead className="bg-gray-100 text-sm">
                        <tr>
                            <th className="text-left p-3">Name</th>
                            <th className="text-left p-3">Subject</th>
                            <th className="text-left p-3">Type</th>
                            <th className="text-center p-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {templates.map((t) => (
                            <tr key={t.Id} className="border-t">
                                <td className="p-3">{t.Name}</td>
                                <td className="p-3">{t.Subject}</td>
                                <td className="p-3">{t.TemplateType}</td>
                                <td className="text-center p-3">
                                    {canEditTemplate && (
                                        <button onClick={() => { setTemplateForm(t); setShowTemplateModal(true); }} className="text-blue-600 hover:underline">Edit</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>





            {/* Template Modal */}
            {/* Email Template Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="bg-white w-full max-w-lg p-6 rounded shadow-lg">
                        <h3 className="text-xl font-semibold mb-4">Email Template</h3>
                        <div className="flex flex-col gap-3">
                            <input
                                className="border rounded p-2"
                                placeholder="Name"
                                value={templateForm.Name}
                                onChange={(e) => setTemplateForm({ ...templateForm, Name: e.target.value })}
                                maxLength={100}
                            />
                            <input
                                className="border rounded p-2"
                                placeholder="Subject"
                                value={templateForm.Subject}
                                onChange={(e) => setTemplateForm({ ...templateForm, Subject: e.target.value })}
                                maxLength={255}
                            />

                            {/* Tombol insert binding */}
                            <div className="flex gap-2 flex-wrap mb-2">
                                {(TEMPLATE_VARIABLES[templateForm.TemplateType] || []).map(v => (
                                    <button
                                        key={v.label}
                                        className="px-2 py-1 border rounded text-xs hover:bg-gray-100"
                                        type="button"
                                        title={v.desc}
                                        onClick={() => insertAtCursor(v.label)}
                                    >
                                        Insert {v.label}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                ref={bodyRef}
                                className="border rounded p-2"
                                rows={4}
                                placeholder="Body (HTML allowed)"
                                value={templateForm.Body}
                                onChange={(e) => setTemplateForm({ ...templateForm, Body: e.target.value })}
                            />


                            <select
                                className="border rounded p-2"
                                value={templateForm.TemplateType}
                                onChange={(e) => setTemplateForm({ ...templateForm, TemplateType: e.target.value })}
                            >
                                <option value="">Select Type</option>
                                <option value="SALES_ORDER">SALES_ORDER</option>
                                <option value="FORGOT_PASSWORD_USER">FORGOT_PASSWORD_USER</option>
                                <option value="FORGOT_PASSWORD_ADMIN">FORGOT_PASSWORD_ADMIN</option>
                                <option value="ADMIN_NOTIFICATION_SALESORDER">ADMIN_NOTIFICATION_SALESORDER</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTemplateSubmit}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Config Modal */}
            {showConfigModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="bg-white w-full max-w-lg p-6 rounded shadow-lg">
                        <h3 className="text-xl font-semibold mb-4">Email Configuration</h3>
                        <div className="flex flex-col gap-3">
                            <input className="border rounded p-2" placeholder="Email" value={configForm.Email} onChange={(e) => setConfigForm({ ...configForm, Email: e.target.value })} maxLength={255} />
                            <input className="border rounded p-2" placeholder="Password" type="password" value={configForm.Password} onChange={(e) => setConfigForm({ ...configForm, Password: e.target.value })} maxLength={255} />
                            <select
                                className="border p-2 rounded"
                                value=""
                                onChange={(e) => {
                                    const selected = e.target.value;
                                    const provider = EMAIL_PROVIDERS[selected];
                                    if (provider) {
                                        setConfigForm((prev) => ({
                                            ...prev,
                                            Host: provider.Host,
                                            Port: provider.Port,
                                            Secure: provider.Port === 465,
                                        }));
                                    }
                                }}
                            >
                                <option value="">Pilih Layanan Email (otomatis isi host & port)</option>
                                {Object.entries(EMAIL_PROVIDERS).map(([name, { Host, Port }]) => (
                                    <option key={name} value={name}>
                                        {name} ({Host}:{Port})
                                    </option>
                                ))}
                            </select>


                            <input className="border rounded p-2" placeholder="Host" value={configForm.Host} onChange={(e) => setConfigForm({ ...configForm, Host: e.target.value })} maxLength={255} />
                            <input className="border rounded p-2" placeholder="Port" type="number" value={configForm.Port} onChange={(e) => setConfigForm({ ...configForm, Port: e.target.value })} maxLength={5} />
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={configForm.Secure} onChange={(e) => setConfigForm({ ...configForm, Secure: e.target.checked })} />
                                <span>Use SSL (Secure)</span>
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setShowConfigModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                            <button onClick={handleConfigSubmit} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailSettings;
