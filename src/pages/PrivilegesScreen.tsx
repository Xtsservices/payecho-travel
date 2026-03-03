import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../api/api";
import { Button, Input } from "../components/ui";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from 'react-toastify';

export default function PrivilegesScreen() {
  const [privileges, setPrivileges] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    status: 1,
  });
  const [privilegeErrors, setPrivilegeErrors] = useState<{ name?: string }>({});

  // Fetch Privileges
  const fetchPrivileges = async () => {
    try {
      const res = await apiGet("/privileges");
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setPrivileges(data);
    } catch (err) {
      console.error("Privilege fetch failed", err);
    }
  };

  useEffect(() => {
    fetchPrivileges();
  }, []);

  // Create Privilege
  const handleCreate = async () => {
    // client-side validation
    const errors: { name?: string } = {};
    if (!form.name || !form.name.trim()) errors.name = 'Name is required';
    setPrivilegeErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      await apiPost("/privileges", form);
      toast.success("Privilege created");
      setShowModal(false);
      fetchPrivileges();
      setPrivilegeErrors({});
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.errors) {
        const parsed: any = {};
        Object.keys(data.errors).forEach(k => { parsed[k] = Array.isArray(data.errors[k]) ? data.errors[k][0] : data.errors[k]; });
        setPrivilegeErrors(parsed);
        toast.error(Object.values(parsed).join('. '));
      } else {
        toast.error(data?.message || "Failed to create privilege");
      }
    }
  };

  // Update Privilege
  const handleUpdate = async () => {
    // client-side validation
    const errors: { name?: string } = {};
    if (!form.name || !form.name.trim()) errors.name = 'Name is required';
    setPrivilegeErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      await apiPut(`/privileges/${editingId}`, form);
      toast.success("Privilege updated");
      setShowModal(false);
      setEditingId(null);
      fetchPrivileges();
      setPrivilegeErrors({});
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.errors) {
        const parsed: any = {};
        Object.keys(data.errors).forEach(k => { parsed[k] = Array.isArray(data.errors[k]) ? data.errors[k][0] : data.errors[k]; });
        setPrivilegeErrors(parsed);
        toast.error(Object.values(parsed).join('. '));
      } else {
        toast.error(data?.message || "Failed to update privilege");
      }
    }
  };

  // Delete Privilege
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    try {
      await apiDelete(`/privileges/${id}`);
      alert("Privilege deleted");
      fetchPrivileges();
    } catch (err) {
      alert("Failed to delete privilege");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black">Privilege Management</h2>

        <Button
          className="bg-orange-500 text-white hover:bg-orange-600"
          onClick={() => {
            setForm({ name: "", status: 1 });
            setEditingId(null);
            setShowModal(true);
          }}
        >
          + Add Privilege
        </Button>
      </div>

      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left font-bold">Name</th>
            {/* <th className="p-3 text-left font-bold">Code</th> */}
            <th className="p-3 text-left font-bold">Status</th>
            <th className="p-3 text-left font-bold">Actions</th>
          </tr>
        </thead>

        <tbody>
          {privileges.map((p: any) => (
            <tr key={p.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{p.name}</td>
              {/* <td className="p-3">{p.code}</td> */}
              <td className="p-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    p.status === 1
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {p.status === 1 ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button
                    className="p-2 rounded-lg bg-yellow-100"
                    onClick={() => {
                      setForm({
                        name: p.name,
                        status: p.status,
                      });
                      setEditingId(p.id);
                      setShowModal(true);
                    }}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="p-2 rounded-lg bg-red-100"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-black mb-4">
              {editingId ? "Edit Privilege" : "Create Privilege"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., Manage Users"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') });
                    setPrivilegeErrors({ ...privilegeErrors, name: undefined });
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                />
                {privilegeErrors.name && <p className="text-sm text-red-600 mt-1">{privilegeErrors.name}</p>}
              </div>

              {false && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Code <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g., F001"
                    value={form.code}
                    onChange={(e) => {
                      setForm({ ...form, code: e.target.value });
                      setPrivilegeErrors({ ...privilegeErrors, code: undefined });
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  {privilegeErrors.code && <p className="text-sm text-red-600 mt-1">{privilegeErrors.code}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Status <span className="text-red-500">*</span>
                </label>

                <select
                  className="w-full px-4 py-2 border rounded-xl"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: Number(e.target.value) })
                  }
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  fullWidth
                  className="bg-orange-500 text-white hover:bg-orange-600"
                  onClick={editingId ? handleUpdate : handleCreate}
                >
                  {editingId ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
