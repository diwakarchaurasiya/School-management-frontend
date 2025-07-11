import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form"; // If not already imported
import { useTable, useSortBy, useGlobalFilter } from "react-table";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Promotion = () => {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [nextSession, setNextSession] = useState(null);
  const [schoolId, setSchoolId] = useState(null);
  const [classFilter, setClassFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState(""); // NEW
  const [promotionStatus, setPromotionStatus] = useState({});
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [classList, setClassList] = useState([]); // Add this state
  const [promotionHistory, setPromotionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [reloading, setReloading] = useState(false);

  // Get unique class options from classList (for filter dropdown)
  const classOptions = classList.map((cls) => cls.name);

  // Filter students by selected class
  const filteredStudents = classFilter
    ? students.filter((s) => s.class_ === classFilter && s.isActive)
    : students.filter((s) => s.isActive);

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const schools = user?.user?.schools || user?.schools || [];
    const schoolId = schools[0]?.id || null;
    setSchoolId(schoolId);
  }, []);
  useEffect(() => {
    // Set default zoom to 80% for this page
    const prevZoom = document.body.style.zoom;
    document.body.style.zoom = "85%";
    return () => {
      document.body.style.zoom = prevZoom || "";
    };
  }, []);

  useEffect(() => {
    if (!schoolId) return;
    const fetchAll = async () => {
      await fetchSessions();
    };
    fetchAll();
  }, [schoolId]);

  // Fetch sessions and set default session filter
  const fetchSessions = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5002/api/sessions/schools/${schoolId}/sessions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("principal_token")}`,
          },
        }
      );
      setSessions(res.data.sessions || []);
      if (res.data.sessions && res.data.sessions.length > 0) {
        // Fetch active session info
        const activeRes = await axios.get(
          `http://localhost:5002/api/sessions/sessions/active?schoolId=${schoolId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "principal_token"
              )}`,
            },
          }
        );
        const active = activeRes.data.session;
        if (active) {
          setActiveSession(active);
          setSessionFilter(active.id); // Set default to active session
          fetchStudents(active.id); // Fetch students for active session
          fetchActiveSession(res.data.sessions);
        } else {
          // fallback to first session if no active session
          setSessionFilter(res.data.sessions[0].id);
          fetchStudents(res.data.sessions[0].id);
          fetchActiveSession(res.data.sessions);
        }
      }
    } catch (err) {
      toast.error("Failed to fetch sessions");
    }
  };

  // Fetch students for a session
  const fetchStudents = async (sessionId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5002/api/admission/students/by-school/${schoolId}?sessionId=${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("principal_token")}`,
          },
        }
      );
      setStudents(res.data.students || []);
    } catch (err) {
      toast.error("Failed to fetch students");
    }
    setLoading(false);
  };

  // Accept allSessions as parameter
  const fetchActiveSession = async (allSessionsParam) => {
    if (!schoolId) return;
    try {
      const res = await axios.get(
        `http://localhost:5002/api/sessions/sessions/active?schoolId=${schoolId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("principal_token")}`,
          },
        }
      );
      setActiveSession(res.data.session || null);

      let allSessions = allSessionsParam || sessions;
      // Sort sessions by startDate or year
      allSessions = allSessions.sort(
        (a, b) =>
          new Date(a.startDate || a.year) - new Date(b.startDate || b.year)
      );
      if (res.data.session) {
        const idx = allSessions.findIndex((s) => s.id === res.data.session.id);
        setNextSession(allSessions[idx + 1] || null);
      }
    } catch (err) {
      toast.error("Failed to fetch active session");
    }
  };

  // Fetch class list when schoolId is set
  useEffect(() => {
    if (!schoolId) return;
    const fetchClasses = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5002/api/classes/${schoolId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "principal_token"
              )}`,
            },
          }
        );
        // Sort classes by order or id if needed
        setClassList(res.data.classes || []);
      } catch (err) {
        toast.error("Failed to fetch class list");
      }
    };
    fetchClasses();
  }, [schoolId]);

  // Fetch promotion history
  const fetchPromotionHistory = async () => {
    if (!schoolId) return;
    try {
      const res = await axios.get(
        `http://localhost:5002/api/sessions/studentsessions/by-school/${schoolId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("principal_token")}`,
          },
        }
      );
      setPromotionHistory(res.data.studentSessions || []);
    } catch (err) {
      toast.error("Failed to fetch promotion history");
    }
  };

  // Handle session filter change
  const handleSessionFilter = (e) => {
    setSessionFilter(e.target.value);
    fetchStudents(e.target.value);
  };

  // Handle checkbox selection
  const handleSelect = (studentId) => {
    setSelected((prev) => {
      if (prev.includes(studentId)) {
        // Deselect: remove from selected and promotionStatus
        setPromotionStatus((status) => {
          const newStatus = { ...status };
          delete newStatus[studentId];
          return newStatus;
        });
        return prev.filter((id) => id !== studentId);
      } else {
        // Select: add to selected and set default status
        setPromotionStatus((status) => ({
          ...status,
          [studentId]: status[studentId] || "Promoted",
        }));
        return [...prev, studentId];
      }
    });
  };

  // Handle status change for a student
  const handleStatusChange = (studentId, status) => {
    setPromotionStatus((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Handle promotion
  const handlePromote = async () => {
    if (selected.length === 0) {
      toast.error("Select at least one student");
      return;
    }

    if (!activeSession || !nextSession) {
      toast.error("Session information not loaded. Please try again later.");
      return;
    }

    // Prepare promotions array
    const promotions = students
      .filter((s) => selected.includes(s.id))
      .map((student) => {
        const currentClassIndex = classList.findIndex(
          (cls) => cls.name === student.class_
        );
        const nextClassObj =
          promotionStatus[student.id] === "Promoted"
            ? classList[currentClassIndex + 1] || classList[currentClassIndex]
            : classList[currentClassIndex];

        return {
          studentId: student.id,
          fromClassId: classList[currentClassIndex]?.id,
          toClassId:
            promotionStatus[student.id] === "Drop Out"
              ? classList[currentClassIndex]?.id
              : nextClassObj?.id,
          section: student.sectionclass || "A",
          status: promotionStatus[student.id] || "Promoted",
        };
      });

    // Split into promoted and dropped
    const promoted = promotions.filter((p) => p.status === "Promoted");
    const dropped = promotions.filter((p) => p.status === "Drop Out");

    try {
      // Promote students
      if (promoted.length > 0) {
        await axios.post(
          "http://localhost:5002/api/sessions/students/promote",
          {
            fromSessionId: activeSession.id,
            toSessionId: nextSession.id,
            promotions: promoted,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "principal_token"
              )}`,
            },
          }
        );
      }

      // Drop students
      if (dropped.length > 0) {
        await axios.post(
          "http://localhost:5002/api/sessions/students/drop",
          {
            fromSessionId: activeSession.id,
            toSessionId: nextSession.id,
            drops: dropped,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "principal_token"
              )}`,
            },
          }
        );
      }

      toast.success("Promotion/Drop successful!");
      setSelected([]);
      setPromotionStatus((prev) => {
        const newStatus = { ...prev };
        selected.forEach((id) => delete newStatus[id]);
        return newStatus;
      });

      // Show spinner and reload after short delay
      setReloading(true);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      toast.error("Promotion or Drop failed");
      console.error(err);
    }
  };

  // Create new session
  const onCreateSession = async (data) => {
    try {
      const res = await axios.post(
        `http://localhost:5002/api/sessions/schools/${schoolId}/sessions`,
        {
          year: data.year,
          startDate: data.startDate,
          endDate: data.endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("principal_token")}`,
          },
        }
      );
      toast.success("Session created!");
      setShowSessionModal(false);
      reset();
      fetchSessions(); // Refresh session list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create session");
    }
  };

  // Activate a session
  const handleActivateSession = async (sessionId) => {
    try {
      await axios.patch(
        `http://localhost:5002/api/sessions/sessions/${sessionId}`,
        { isActive: true },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("principal_token")}`,
          },
        }
      );
      toast.success("Session activated!");
      fetchSessions();
    } catch (err) {
      toast.error("Failed to activate session");
    }
  };

  const columns = useMemo(
    () => [
      { Header: "#", accessor: (row, i) => i + 1, id: "row" },
      {
        Header: "Student Name",
        accessor: (row) => row.student?.studentName || "-",
      },
      {
        Header: "Admission No.",
        accessor: (row) => row.student?.Admission_Number || "-",
      },
      {
        Header: "Father Name",
        accessor: (row) => row.student?.fatherName || "-",
      },
      { Header: "Status", accessor: "status" },
      {
        Header: "Session Start Date",
        accessor: (row) =>
          row.status === "Drop Out"
            ? "-"
            : row.session?.startDate
            ? new Date(row.session.startDate).toLocaleDateString()
            : "-",
      },
      {
        Header: "Date",
        accessor: (row) =>
          row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
      },
      { Header: "Remark", accessor: "remarks" },
    ],
    []
  );

  const data = useMemo(() => promotionHistory, [promotionHistory]);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter,
    state,
  } = useTable({ columns, data }, useGlobalFilter, useSortBy);

  const [search, setSearch] = useState("");

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = promotionHistory.map((row, i) => ({
      "#": i + 1,
      "Student Name": row.student?.studentName || "-",
      "Admission No.": row.student?.Admission_Number || "-",
      "Father Name": row.student?.fatherName || "-",
      Status: row.status,
      "Session Start Date":
        row.status === "Drop Out"
          ? "-"
          : row.session?.startDate
          ? new Date(row.session.startDate).toLocaleDateString()
          : "-",
      Date: row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
      Remark: row.remarks || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Promotion History");
    XLSX.writeFile(workbook, "promotion_history.xlsx");
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "#",
      "Student Name",
      "Admission No.",
      "Father Name",
      "Status",
      "Session Start Date",
      "Date",
      "Remark",
    ];
    const tableRows = promotionHistory.map((row, i) => [
      i + 1,
      row.student?.studentName || "-",
      row.student?.Admission_Number || "-",
      row.student?.fatherName || "-",
      row.status,
      row.status === "Drop Out"
        ? "-"
        : row.session?.startDate
        ? new Date(row.session.startDate).toLocaleDateString()
        : "-",
      row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
      row.remarks || "-",
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });
    doc.save("promotion_history.pdf");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Student Promotion</h2>

      {/* Create Session Button */}
      <button
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => setShowSessionModal(true)}
      >
        Create New Session
      </button>

      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Create New Session</h3>
            <form onSubmit={handleSubmit(onCreateSession)}>
              <div className="mb-2">
                <label className="block mb-1">Year</label>
                <input
                  className="border px-2 py-1 rounded w-full"
                  {...register("year", { required: "Year is required" })}
                  placeholder="2026-27"
                />
                {errors.year && (
                  <p className="text-red-600 text-sm">{errors.year.message}</p>
                )}
              </div>
              <div className="mb-2">
                <label className="block mb-1">Start Date</label>
                <input
                  type="date"
                  className="border px-2 py-1 rounded w-full"
                  {...register("startDate", {
                    required: "Start date is required",
                  })}
                />
                {errors.startDate && (
                  <p className="text-red-600 text-sm">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="mb-2">
                <label className="block mb-1">End Date</label>
                <input
                  type="date"
                  className="border px-2 py-1 rounded w-full"
                  {...register("endDate", { required: "End date is required" })}
                />
                {errors.endDate && (
                  <p className="text-red-600 text-sm">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Create
                </button>
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded"
                  onClick={() => setShowSessionModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Filter */}
      <div className="flex items-center mb-4">
        <label className="mr-2 font-semibold">Filter by Session:</label>
        <select
          className="border px-2 py-1 rounded"
          value={sessionFilter}
          onChange={handleSessionFilter}
        >
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.year}
            </option>
          ))}
        </select>
        {/* Activate session button for each session */}
        <div className="ml-4 flex gap-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              className={`px-2 py-1 rounded text-xs ${
                session.isActive
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              disabled={session.isActive}
              onClick={() => handleActivateSession(session.id)}
            >
              {session.isActive ? "Active" : "Set Active"}
            </button>
          ))}
        </div>
      </div>
      {/* Class Filter */}
      <div className="flex items-center mb-4">
        <label className="mr-2 font-semibold">Filter by Class:</label>
        <select
          className="border px-2 py-1 rounded"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        >
          <option value="">All</option>
          {classOptions.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div>Loading students...</div>
      ) : (
        <>
          <div className="mb-6 bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">All Students</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Select</th>
                    <th className="border px-2 py-1">#</th>
                    <th className="border px-2 py-1">Admission NO.</th>
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">Roll No</th>
                    <th className="border px-2 py-1">Class</th>
                    <th className="border px-2 py-1">Section</th>
                    <th className="border px-2 py-1">Father</th>
                    <th className="border px-2 py-1">Phone</th>
                    <th className="border px-2 py-1">Transfer Certificate</th>
                    <th className="border px-2 py-1">Status</th>
                    <th className="border px-2 py-1">Action</th> {/* NEW */}
                    <th className="border px-2 py-1">Promotion Status</th>{" "}
                    {/* NEW: Action column for promotion status */}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="text-center py-2">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {filteredStudents.map((student, idx) => (
                        <tr key={student.id || idx}>
                          <td className="border px-2 py-1">
                            <input
                              type="checkbox"
                              checked={selected.includes(student.id)}
                              onChange={() => handleSelect(student.id)}
                            />
                          </td>
                          <td className="border px-2 py-1">{idx + 1}</td>
                          <td className="border px-2 py-1">
                            {student.Admission_Number}
                          </td>
                          <td className="border px-2 py-1">
                            {student.studentName}
                          </td>
                          <td className="border px-2 py-1">
                            {student.rollNumber}
                          </td>
                          <td className="border px-2 py-1">{student.class_}</td>
                          <td className="border px-2 py-1">
                            {student.sectionclass}
                          </td>
                          <td className="border px-2 py-1">
                            {student.fatherName}
                          </td>
                          <td className="border px-2 py-1">{student.phone}</td>
                          <td className="border px-2 py-1">
                            {student.isTransferCertIssued ? (
                              <span className="text-green-600 font-semibold">
                                Issued
                              </span>
                            ) : (
                              <span className="text-gray-500">Not Issued</span>
                            )}
                          </td>
                          <td className="border px-2 py-1">
                            {student.promotionStatus}
                          </td>
                          <td className="border px-2 py-1">
                            {student.isActive ? (
                              <span className="text-green-600 font-semibold">
                                Active
                              </span>
                            ) : (
                              <span className="text-red-600 font-semibold">
                                Inactive
                              </span>
                            )}
                          </td>
                          {/* NEW: Promotion status dropdown */}
                          <td className="border px-2 py-1">
                            {selected.includes(student.id) && (
                              <select
                                value={
                                  promotionStatus[student.id] || "Promoted"
                                }
                                onChange={(e) =>
                                  handleStatusChange(student.id, e.target.value)
                                }
                                className="border px-1 py-0.5 rounded"
                              >
                                <option value="Promoted">Promoted</option>
                                <option value="Drop Out">Drop Out</option>
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Show session info error if not loaded */}
          {(!activeSession || !nextSession) && (
            <div className="text-red-600 mb-2">
              {!activeSession
                ? "Active session not found. Please contact admin."
                : "Next session not found. Please create the next session in the system before promoting students."}
            </div>
          )}
          <div className="flex gap-4 mb-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={handlePromote}
              disabled={selected.length === 0 || !activeSession || !nextSession}
            >
              Promote Selected Students
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => {
                if (!showHistory) fetchPromotionHistory();
                setShowHistory((prev) => !prev);
              }}
            >
              {showHistory
                ? "Hide Promotion History"
                : "Show Promotion History"}
            </button>
          </div>

          {/* Promotion History Table */}
          {showHistory && promotionHistory.length > 0 && (
            <div className="mt-4 bg-white p-4 rounded shadow">
              <h3 className="font-bold mb-2">Promotion History</h3>
              <div className="flex gap-2 mb-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded"
                  onClick={handleExportExcel}
                >
                  Download Excel
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded"
                  onClick={handleExportPDF}
                >
                  Download PDF
                </button>
              </div>
              <input
                className="mb-2 border px-2 py-1 rounded w-full max-w-xs"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setGlobalFilter(e.target.value);
                }}
              />
              <div className="overflow-x-auto">
                <table
                  {...getTableProps()}
                  className="min-w-full border text-sm"
                >
                  <thead>
                    {headerGroups.map((headerGroup) => (
                      <tr
                        {...headerGroup.getHeaderGroupProps()}
                        className="bg-gray-100"
                      >
                        {headerGroup.headers.map((column) => (
                          <th
                            {...column.getHeaderProps(
                              column.getSortByToggleProps()
                            )}
                            className="border px-2 py-1 cursor-pointer"
                          >
                            {column.render("Header")}
                            <span>
                              {column.isSorted
                                ? column.isSortedDesc
                                  ? " 🔽"
                                  : " 🔼"
                                : ""}
                            </span>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody {...getTableBodyProps()}>
                    {rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="text-center py-2"
                        >
                          No records found.
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => {
                        prepareRow(row);
                        return (
                          <tr {...row.getRowProps()}>
                            {row.cells.map((cell) => (
                              <td
                                className="border px-2 py-1"
                                {...cell.getCellProps()}
                              >
                                {cell.render("Cell")}
                              </td>
                            ))}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
      {reloading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-10 w-10 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            <span className="mt-2 text-blue-700 font-semibold">
              Reloading...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotion;
