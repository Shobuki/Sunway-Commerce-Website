import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiX, FiPlus } from "react-icons/fi";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const WarehouseManagerModal = ({ isOpen, onClose, dealerId }) => {
  const [assigned, setAssigned] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dealerId) {
      fetchData(); // ✅ cukup dealerId
    }
  }, [dealerId]);
  // ← ini cukup


  const fetchData = async () => {
    setLoading(true);
    try {
      // Ambil semua warehouse (tidak hanya yang ter-assign)
      const allWarehouseRes = await axios.get("/api/admin/admin/dealers/warehouses/all");
      const allWarehouses = allWarehouseRes.data.data;

      // Ambil warehouse yang sudah assign ke dealer
      const assignedRes = await axios.post("/api/admin/admin/dealers/warehouses", {
        DealerId: dealerId,
      });
      const assignedList = assignedRes.data.data;

      const assignedIds = new Set(assignedList.map(w => w.Id));
      const unassignedList = allWarehouses.filter(w => !assignedIds.has(w.Id));

      setAssigned(assignedList.sort((a, b) => a.Priority - b.Priority));
      setUnassigned(unassignedList);
    } catch (err) {
      console.error("Fetch warehouse error:", err);
    } finally {
      setLoading(false);
    }
  };


  const assignWarehouse = async (warehouseId) => {
    try {
      await axios.post("/api/admin/admin/dealers/assign-warehouse", {
        DealerId: dealerId,
        WarehouseId: warehouseId,
      });

      // ✅ Manual update state (tanpa fetchData full)
      const newlyAssigned = unassigned.find(w => w.Id === warehouseId);
      if (newlyAssigned) {
        setUnassigned(prev => prev.filter(w => w.Id !== warehouseId));
        setAssigned(prev => [...prev, newlyAssigned]);
      }

    } catch (err) {
      console.error("Assign warehouse error:", err);
    }
  };



  const unassignWarehouse = async (warehouseId) => {
    try {
      await axios.post("/api/admin/admin/dealers/unassign-warehouse", {
        DealerId: dealerId,
        WarehouseId: warehouseId
      });
      await fetchData();
    } catch (err) {
      console.error("Unassign warehouse error:", err);
    }
  };
  

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reordered = Array.from(assigned);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setAssigned(reordered);

    // Save new order
    const WarehouseOrder = reordered.map(w => w.Id);
    await axios.post("/api/admin/admin/dealers/reorder-warehouses", {
      DealerId: dealerId,
      WarehouseOrder,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          <FiX size={20} />
        </button>


        <h2 className="text-xl font-bold mb-4">🧭 Assign Warehouse to Dealer</h2>

        {loading ? (
          <p>Loading warehouses...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unassigned */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Available Warehouses</h3>
              <ul className="space-y-2">
                {unassigned.map(w => (
                  <li key={w.Id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <div>
                      <p className="font-medium">{w.BusinessUnit}</p>
                      <p className="text-xs text-gray-500">{w.Name || "No Name"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => assignWarehouse(w.Id)}
                      className="text-green-600 hover:text-green-800"
                      title="Assign"
                    >
                      <FiPlus size={18} />
                    </button>

                  </li>
                ))}
              </ul>
            </div>

            {/* Assigned with drag */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Assigned & Prioritized</h3>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="assigned">
                  {(provided) => (
                    <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {assigned.map((w, index) => (
                        <Draggable key={w.Id} draggableId={w.Id.toString()} index={index}>
                          {(provided) => (
                            <li
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                              className="flex justify-between items-center p-2 bg-indigo-100 rounded"
                            >
                              <div>
                                <p className="font-medium">{w.BusinessUnit}</p>
                                <p className="text-xs text-gray-500">{w.Name || "No Name"}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => unassignWarehouse(w.Id)}
                                className="text-red-600 hover:text-red-800"
                                title="Remove"
                              >
                                <FiTrash2 size={18} />
                              </button>

                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseManagerModal;
