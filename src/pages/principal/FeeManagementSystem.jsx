import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  Filter,
  DollarSign,
  Users,
  BookOpen,
  Calendar,
  CheckCircle, // Added for success icon
  X, // Added for close icon in modal
  Printer, // Add this import at the top with other icons
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom"; // Assuming you are using react-router-dom
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { getImageUrl } from "../../utils/getImageUrl";

const FeeManagementSystem = () => {
  const [activeTab, setActiveTab] = useState("feecollection");
  const [schoolId, setSchoolId] = useState(null);
  const [classes, setSchoolClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fee Management State
  const [feeManagement, setFeeManagement] = useState([]);
  const [feeCollection, setFeeCollection] = useState([]);
  const [schoolFee, setSchoolFee] = useState([]);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create"); // create, edit, view
  const [selectedItem, setSelectedItem] = useState(null);

  // Form States
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");

  // Add these states for student search
  const [studentSearch, setStudentSearch] = useState("");
  const [studentSearchResults, setStudentSearchResults] = useState([]);
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);

  // Print Modal States
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [principalSignature, setPrincipalSignature] = useState(null);
  const [schoolName, setSchoolName] = useState("");

  // New state for success modal after fee collection
  const [showFeeCollectionSuccessModal, setShowFeeCollectionSuccessModal] =
    useState(false);
  const printReceiptRef = useRef();

  // Date range state for filtering
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Initialize school data
  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const schools = user?.user?.schools || user?.schools || [];
    setSchoolName(
      schools[0]?.Schoolname || schools[0]?.schoolName || "School Name"
    );
    const schoolId = schools[0]?.id || null;
    setSchoolId(schoolId);

    if (schoolId) {
      fetchClasses(schoolId);
      fetchStudents(schoolId);
      fetchAllFeeData(schoolId);
    }
  }, []);
   useEffect(() => {
      // Set default zoom to 80% for this page
      const prevZoom = document.body.style.zoom;
      document.body.style.zoom = "70%";
      return () => {
        document.body.style.zoom = prevZoom || "";
      };
    }, []);
  useEffect(() => {
    if (!schoolId) return;
    fetch(
      `https://api.jsic.in/api/newSchool/school-assets/by-school/${schoolId}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSchoolLogo(data.schoolLogo || null);
        setPrincipalSignature(data.principalSignature || null);
      });
  }, [schoolId]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("principal_token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  const fetchClasses = async (schoolId) => {
    try {
      const response = await fetch(
        `https://api.jsic.in/api/classes/${schoolId}`,
        getAuthHeaders()
      );
      const data = await response.json();
      if (data.success) {
        setSchoolClasses(data.classes);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Error fetching classes.");
    }
  };

  const fetchStudents = async (schoolId) => {
    try {
      const response = await fetch(
        `https://api.jsic.in/api/admission/students/by-school/${schoolId}`,
        getAuthHeaders()
      );
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Error fetching students.");
    }
  };

  const fetchAllFeeData = async (schoolId) => {
    setLoading(true);
    try {
      const [feeManagementRes, feeCollectionRes, schoolFeeRes] =
        await Promise.all([
          fetch(
            `https://api.jsic.in/api/fees/feemanagement?schoolId=${schoolId}`,
            getAuthHeaders()
          ),
          fetch(
            `https://api.jsic.in/api/fees/feecollection?schoolId=${schoolId}`,
            getAuthHeaders()
          ),
          fetch(
            `https://api.jsic.in/api/fees/schoolfee?schoolId=${schoolId}`,
            getAuthHeaders()
          ),
        ]);

      const [feeManagementData, feeCollectionData, schoolFeeData] =
        await Promise.all([
          feeManagementRes.json(),
          feeCollectionRes.json(),
          schoolFeeRes.json(),
        ]);

      if (feeManagementData.success)
        setFeeManagement(feeManagementData.fees || []);
      if (feeCollectionData.success)
        setFeeCollection(feeCollectionData.fees || []);
      if (schoolFeeData.success) setSchoolFee(schoolFeeData.fees || []);
    } catch (error) {
      console.error("Error fetching fee data:", error);
      toast.error("Error fetching fee data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalType("create");
    setSelectedItem(null);

    // Default today's date in yyyy-mm-dd format
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    setFormData({
      schoolId: schoolId,
      className: "",
      section: "",
      feeType: [],
      amount: "",
      paidAmount: "",
      pendingAmount: "",
      dueDate: "",
      paymentMode: "cash", // <-- Auto-select Cash
      description: "",
      ...(activeTab === "feecollection" && {
        paidDate: todayStr,
        receiptNumber: generateReceiptNumber(),
      }),
    });
    setShowModal(true);
  };

  const generateReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `REC-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
  };

  const [editFeeMode, setEditFeeMode] = useState("pending"); // "pending" or "new"

  const handleEdit = (item) => {
    setModalType("edit");
    setSelectedItem(item);
    setEditFeeMode("pending"); // default to pending

    // Ensure feeType is always an array for checkbox group
    let feeTypeArr = item.feeType;
    if (typeof feeTypeArr === "string") {
      try {
        const parsed = JSON.parse(feeTypeArr);
        if (Array.isArray(parsed)) feeTypeArr = parsed;
        else feeTypeArr = [feeTypeArr];
      } catch {
        feeTypeArr = feeTypeArr.split(',').map((v) => v.trim());
      }
    } else if (!Array.isArray(feeTypeArr)) {
      feeTypeArr = feeTypeArr ? [feeTypeArr] : [];
    }

    // Find the latest record for this student and feeType
    const matchRecord = feeCollection.find(
      (fc) =>
        fc.studentId === item.studentId &&
        JSON.stringify(
          Array.isArray(fc.feeType) ? fc.feeType.sort() : [fc.feeType].sort()
        ) === JSON.stringify(feeTypeArr.sort())
    );

    let total = matchRecord ? parseFloat(matchRecord.amount) : parseFloat(item.amount) || 0;
    let paid = matchRecord ? parseFloat(matchRecord.paidAmount) : parseFloat(item.pendingAmount) || 0;
    let pending = matchRecord ? parseFloat(matchRecord.pendingAmount) : Math.max(total - paid, 0);
    if (isNaN(total)) total = 0;

    setFormData({
      ...item,
      feeType: feeTypeArr,
      amount: total, // Total amount is sum of paid and pending
      paidAmount: parseFloat(item.pendingAmount), // Paid amount is the sum of paid and pending
      pendingAmount: paid,
      priviosPaidAmount: pending  // Store previous paid amount for comparison
    });
    setShowModal(true);
  };

  const handleView = (item) => {
    setModalType("view");
    setSelectedItem(item);
    setFormData(item);
    setShowModal(true);
  };

  // Toast-based delete confirmation
  const handleDelete = async (id) => {
    toast.info(
      <div>
        <span>Are you sure you want to delete this record?</span>
        <div className="mt-2 flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss();
              try {
                const response = await fetch(
                  `https://api.jsic.in/api/fees/${activeTab}/${id}`,
                  {
                    method: "DELETE",
                    ...getAuthHeaders(),
                  }
                );

                if (response.ok) {
                  fetchAllFeeData(schoolId);
                  toast.success("Record deleted successfully!");
                } else {
                  toast.error("Error deleting record.");
                }
              } catch (error) {
                console.error("Error deleting record:", error);
                toast.error("Error deleting record.");
              }
            }}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-gray-300 text-gray-800 px-3 py-1 rounded"
          >
            No
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false, position: 'top-center' }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = { ...formData };

    // For fee collection, auto-fill class and section from student
    if (activeTab === "feecollection") {
      const selectedStudent = students.find((s) => s.id === formData.studentId);
      if (selectedStudent) {
        payload.className =
          selectedStudent.class_ || selectedStudent.class || "";
        payload.section =
          selectedStudent.sectionclass || selectedStudent.section || "";
      }
      // Ensure feeType is an array for backend if it's a checkbox group
      payload.feeType = Array.isArray(payload.feeType)
        ? payload.feeType
        : [payload.feeType];
    }

    try {
      const url =
        modalType === "create"
          ? `https://api.jsic.in/api/fees/${activeTab}`
          : `https://api.jsic.in/api/fees/${activeTab}/${selectedItem.id}`;

      const method = modalType === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        ...getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchAllFeeData(schoolId);
        setShowModal(false);
        toast.success(
          `Record ${modalType === "create" ? "created" : "updated"
          } successfully!`

        );

        if (activeTab === "feecollection" && modalType === "create") {
          const responseData = await response.json();
          setPrintData({
            ...payload,
            id: responseData.id || new Date().getTime(),
          }); // Pass created item to print modal
          setShowFeeCollectionSuccessModal(true);
        }
      } else {
        toast.error(
          `Error ${modalType === "create" ? "creating" : "updating"} record.`
        );
      }
    } catch (error) {
      console.error("Error saving record:", error);
      toast.error("Error saving record.");
    }
  };

  const handlePrintReceipt = () => {
    if (printReceiptRef.current) {
      const printWindow = window.open("", "", "height=600,width=800");
      printWindow.document.write("<html><head><title>Print Receipt</title>");
      printWindow.document.write("<style>");
      printWindow.document.write(`
        body { font-family: sans-serif; margin: 20px; }
        .receipt-container { border: 1px solid #ccc; padding: 20px; max-width: 600px; margin: auto; }
        .header { text-align: center; margin-bottom: 20px; }
        .header img { max-height: 80px; margin-bottom: 10px; }
        .header h2 { margin: 0; font-size: 24px; }
        .header p { margin: 0; font-size: 14px; color: #555; }
        .details p { margin: 5px 0; }
        .details strong { width: 120px; display: inline-block; }
        .fee-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .fee-table th, .fee-table td { border: 1px solid #eee; padding: 8px; text-align: left; }
        .fee-table th { background-color: #f2f2f2; }
        .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
        .signature { margin-top: 40px; text-align: right; }
        .signature img { max-height: 60px; margin-top: 10px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #777; }
      `);
      printWindow.document.write("</style></head><body>");
      printWindow.document.write(printReceiptRef.current.innerHTML);
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "feemanagement":
        return feeManagement;
      case "feecollection":
        return feeCollection;
      case "schoolfee":
        return schoolFee;
      default:
        return [];
    }
  };

  const getFilteredData = () => {
    const data = getCurrentData();
    return data.filter((item) => {
      const matchesSearch = Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesClass = !filterClass || item.className === filterClass;
      return matchesSearch && matchesClass;
    });
  };

  const TabButton = ({ tabKey, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tabKey
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  const getFormFields = () => {
    const baseFields = [
      {
        name: "className",
        label: "Class",
        type: "select",
        options: classes.map((c) => ({ value: c.name, label: c.name })),
      },
      {
        name: "section",
        label: "Section",
        type: "select",
        options: [
          { value: "A", label: "A" },
          { value: "B", label: "B" },
          { value: "C", label: "C" },
          { value: "D", label: "D" },
        ],
      },
      { name: "amount", label: "Amount", type: "number" },
      { name: "dueDate", label: "Due Date", type: "date" },
      { name: "description", label: "Description", type: "textarea" },
    ];

    switch (activeTab) {
      case "feemanagement":
        return [
          {
            name: "feeType",
            label: "Fee Type",
            type: "select",
            options: [
              { value: "monthly", label: "Monthly" },
              { value: "quarterly", label: "Quarterly" },
              { value: "half-yearly", label: "Half Yearly" },
              { value: "annually", label: "Annually" },
              { value: "Q-exam", label: "Quarterly Exam Fee" },
              { value: "H-exam", label: "Half-Exam Fee" },
              { value: "annual-exam", label: "Annual Exam Fee" },
              { value: "tuition", label: "Tuition Fee" },
              { value: "old-admission", label: "Old Admission Fee" },
              { value: "New-admission", label: "New Admission Fee" },
              { value: "transport", label: "Transport Fee" },
              { value: "library", label: "Library Fee" },
              { value: "sports", label: "Sports Fee" },
              { value: "other", label: "Other" },
            ],
          },
          ...baseFields,
        ];
      case "feecollection":
        return [
          {
            name: "studentId",
            label: "Student",
            type: "studentSearch", // Custom type for student search
            options: students.map((s) => ({
              value: s.id,
              label: `${s.studentName} (${s.Admission_Number})`,
            })),
          },
          {
            name: "feeType",
            label: "Fee Type",
            type: "checkboxGroup",
            options: getAvailableFeeTypes(), // <-- use dynamic options here
          },
          {
            name: "paymentMode",
            label: "Payment Method",
            type: "select",
            options: [
              { value: "cash", label: "Cash" },
              { value: "card", label: "Card" },
              { value: "upi", label: "UPI" },
              { value: "bank_transfer", label: "Bank Transfer" },
              { value: "cheque", label: "Cheque" },
            ],
          },
          { name: "paidDate", label: "Payment Date", type: "date" },
          { name: "amount", label: "Total Amount", type: "number", readOnly: true },
          { name: "pendingAmount", label: "Pending Amount", type: "number", readOnly: true },
          {name: "paidAmount", label: "Paid Amount", type: "number"},
          {name: "priviosPaidAmount", label: "Previous Paid Amount", type: "number", readOnly: true}, // Show previous paid amount in fee collection
          { name: "description", label: "Description", type: "textarea" },
        ];
      case "schoolfee":
        return [
          { name: "academicYear", label: "Academic Year", type: "text" },
          { name: "feeStructure", label: "Fee Structure", type: "textarea" },
          {
            name: "installments",
            label: "Number of Installments",
            type: "number",
          },
          { name: "lateFeeCharge", label: "Late Fee Charge", type: "number" },
          ...baseFields,
        ];
      default:
        return baseFields;
    }
  };

  const renderFormField = (field) => {
    const commonProps = {
      value: formData[field.name] || "",
      onChange: (e) =>
        setFormData({ ...formData, [field.name]: e.target.value }),
      disabled: modalType === "view" || field.readOnly,
      className:
        "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
        (field.readOnly ? "bg-gray-100" : ""),
    };

    // Custom student search for Fee Collection
    if (activeTab === "feecollection" && field.name === "studentId") {
      const selectedStudent = students.find((s) => s.id === formData.studentId);
      return (
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Admission Number or Name"
            value={studentSearch}
            disabled={modalType === "view"}
            onChange={(e) => {
              const val = e.target.value;
              setStudentSearch(val);
              if (val.length > 0) {
                const filtered = students.filter(
                  (s) =>
                    s.Admission_Number?.toLowerCase().includes(
                      val.toLowerCase()
                    ) ||
                    s.studentName?.toLowerCase().includes(val.toLowerCase())
                );
                setStudentSearchResults(filtered);
                setStudentDropdownOpen(true);
              } else {
                setStudentSearchResults([]);
                setStudentDropdownOpen(false);
              }
            }}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {studentDropdownOpen && studentSearchResults.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-40 overflow-y-auto">
              {studentSearchResults.map((s) => (
                <li
                  key={s.id}
                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => {
                    setFormData({ ...formData, studentId: s.id });
                    setStudentSearch(
                      `${s.studentName} (${s.Admission_Number})`
                    );
                    setStudentDropdownOpen(false);
                  }}
                >
                  {s.studentName} ({s.Admission_Number})
                </li>
              ))}
            </ul>
          )}
          {selectedStudent && (
            <div className="mt-2 space-y-1">
              <div>
                <span className="text-xs text-gray-500">Class: </span>
                <span className="font-semibold">
                  {selectedStudent.class_ || selectedStudent.class || "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500">Section: </span>
                <span className="font-semibold">
                  {selectedStudent.sectionclass ||
                    selectedStudent.section ||
                    "-"}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (field.type === "checkboxGroup") {
      // Hide Fee Type if in edit mode and Pay Pending Amount is selected
      if (modalType === "edit" && editFeeMode === "pending") {
        return null;
      }
      // Ensure formData.feeType is always an array
      const selected = Array.isArray(formData.feeType) ? formData.feeType : [];
      return (
        <div className="flex flex-wrap gap-3">
          {field.options.map((option) => (
            <label key={option.value} className="flex items-center gap-1">
              <input
                type="checkbox"
                value={option.value}
                checked={selected.includes(option.value)}
                disabled={modalType === "view"}
                onChange={(e) => {
                  let updated;
                  if (e.target.checked) {
                    updated = [...selected, option.value];
                  } else {
                    updated = selected.filter((v) => v !== option.value);
                  }
                  setFormData({ ...formData, [field.name]: updated });
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
      );
    }

    switch (field.type) {
      case "select":
        // Fix: If value is an array, use the first element or empty string
        let selectValue = formData[field.name];
        if (Array.isArray(selectValue)) {
          selectValue = selectValue[0] || "";
        }
        return (
          <select
            {...commonProps}
            value={selectValue}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case "textarea":
        return <textarea {...commonProps} rows={3} />;
      case "date":
        return <input type="date" {...commonProps} />;
      case "number":
        return <input type="number" {...commonProps} />;
      default:
        return <input type="text" {...commonProps} />;
    }
  };

  const renderTableHeaders = () => {
    switch (activeTab) {
      case "feemanagement":
        return [
          "Sr. No.",
          "Fee Type",
          "Class",
          "Section",
          "Amount",
          "Due Date",
          "Description",
          "Actions",
        ];
      case "feecollection":
        return [
          "Sr. No.",
          "Student",
          "Admission Number",
          "className",
          "Section",
          "father Name",
          "mother Name",
          "Fee Type",
          "Amount",
          "pending Amount",
          "paid Amount",
          "Payment Method",
          "Payment Date",
          "Receipt No.",
          "Actions",
        ];
      case "schoolfee":
        return [
          "Sr. No.",
          "Academic Year",
          "Class",
          "Fee Type",
          "Amount",
          "Installments",
          "Late Fee",
          "Description",
          "Actions",
        ];
      default:
        return [];
    }
  };

  const renderTableRow = (item, index) => {
    const student = students.find((s) => s.id === item.studentId);

    switch (activeTab) {
      case "feemanagement":
        return (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {index + 1} {/* Assuming srNo is an object with index */}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.feeType}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.className}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.section}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ₹{item.amount}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {new Date(item.dueDate).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.description}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleView(item)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="text-green-600 hover:text-green-800"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        );
      case "feecollection":
        return (
          
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {index + 1} {/* Assuming srNo is an object with index */}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {student
                ? `${student.studentName}` 
                : "Unknown Student"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {student ? student.Admission_Number : "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {student ? student.class_ || student.class : "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {student ? student.sectionclass || student.section : "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {student ? student.fatherName || "N/A" : "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {student ? student.motherName || "N/A" : "N/A"}
            </td>
            <td className="px-6 py-4 text-sm text-gray-900 wrap text-ellipsis">
              {Array.isArray(item.feeType)
                ? item.feeType.join(", ")
                : item.feeType}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ₹{item.amount}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ₹{item.pendingAmount}
            </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ₹{Math.max(item.amount - item.pendingAmount, 0)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.paymentMode}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {new Date(item.paidDate).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.receiptNumber}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleView(item)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="text-green-600 hover:text-green-800"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => {
                    setPrintData(item);
                    setShowPrintModal(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-800"
                  title="Print Receipt"
                >
                  🖨️
                </button>
              </div>
            </td>
          </tr>
        );
      case "schoolfee":
        // If classfee is an object, display each class and amount
        const classFeeEntries =
          item.classfee && typeof item.classfee === "object"
            ? Object.entries(item.classfee)
            : [];
        return classFeeEntries.length > 0 ? (
          classFeeEntries.map(([className, amount], idx) => (
            <tr key={item.id + "-" + className}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {idx + 1} {/* Assuming srNo is an object with index */}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {className}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.feeStructure || item.feeType}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ₹{amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.installments}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ₹{item.lateFeeCharge}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(item)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr key={item.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.className}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.feeStructure || item.feeType}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ₹{item.amount}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.installments}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ₹{item.lateFeeCharge}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.description}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleView(item)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="text-green-600 hover:text-green-800"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        );
      default:
        return null;
    }
  };

  const filteredData = getFilteredData();

  // Update formData.amount based on selected fee types and student
  useEffect(() => {
    if (
      activeTab === "feecollection" &&
      Array.isArray(formData.feeType) &&
      formData.feeType.length > 0 &&
      formData.studentId
    ) {
      const student = students.find((s) => s.id === formData.studentId);
      if (!student) return;

      // Find all matching feeManagement records for this student's class and section
      const matchingFees = feeManagement.filter(
        (f) =>
          (f.className === student.class_ || f.className === student.class) &&
          (f.section === student.sectionclass ||
            f.section === student.section) &&
          formData.feeType.includes(f.feeType)
      );

      // Sum the amounts for the selected fee types
      const total = matchingFees.reduce(
        (sum, f) => sum + Number(f.amount || 0),
        0
      );

      // Only update if different to avoid infinite loop
      if (formData.amount !== total) {
        setFormData((prev) => ({ ...prev, amount: total }));
      }
    } else if (
      activeTab === "feecollection" &&
      formData.amount !== 0 &&
      (!Array.isArray(formData.feeType) || formData.feeType.length === 0)
    ) {
      setFormData((prev) => ({ ...prev, amount: 0 }));
    }
    // eslint-disable-next-line
  }, [formData.feeType, formData.studentId, feeManagement, activeTab]);

  // Auto-calculate pendingAmount when paidAmount or amount changes
  useEffect(() => {
    if (activeTab === "feecollection") {
      const total = parseFloat(formData.amount) || 0;
      const paid = parseFloat(formData.paidAmount) || 0;
      const pending = Math.max(total - paid, 0);
      if (formData.pendingAmount !== pending) {
        setFormData((prev) => ({ ...prev, pendingAmount: pending }));
      }
    }
  }, [formData.amount, formData.paidAmount, activeTab]);

  // Get available fee types for the selected student
  const getAvailableFeeTypes = () => {
    if (activeTab !== "feecollection" || !formData.studentId) return [];
    const student = students.find((s) => s.id === formData.studentId);
    if (!student) return [];
    // Find all feeManagement records for this student's class and section
    const matchingFees = feeManagement.filter(
      (f) =>
        (f.className === student.class_ || f.className === student.class) &&
        (f.section === student.sectionclass || f.section === student.section)
    );
    // Return unique fee types
    return Array.from(new Set(matchingFees.map((f) => f.feeType))).map(
      (type) => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " "),
      })
    );
  };

  // Filtered fee collection for summary/download (class filter applied)
  const filteredFeeCollection = feeCollection.filter((item) => {
    // Class filter logic (same as getFilteredData)
    let matchesClass = true;
    if (activeTab === "feecollection" && filterClass) {
      const student = students.find((s) => s.id === item.studentId);
      const classNames = [
        item.className,
        student?.class_,
        student?.class
      ].filter(Boolean).map((c) => c.toString().toLowerCase());
      matchesClass = classNames.includes(filterClass.toLowerCase());
    } else if (filterClass) {
      matchesClass = item.className?.toString().toLowerCase() === filterClass.toLowerCase();
    }
    // Date range filter
    if (!dateRange.from && !dateRange.to) return matchesClass;
    const payDate = new Date(item.paidDate);
    const from = dateRange.from ? new Date(dateRange.from) : null;
    const to = dateRange.to ? new Date(dateRange.to) : null;
    if (from && payDate < from) return false;
    if (to && payDate > to) return false;
    return matchesClass;
  });

  const summaryTableRef = useRef();

  const handleDownloadPDF = async () => {
    if (!summaryTableRef.current) return;
    const canvas = await html2canvas(summaryTableRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("fee-collection-summary.pdf");
  };

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredFeeCollection);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FeeCollection");
    XLSX.writeFile(wb, "fee-collection-summary.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="max-w-10xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fee Management System
          </h1>
          <p className="text-gray-600">
            Manage school fees, collections, and fee structures
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-500 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Fee Types</p>
                <p className="text-2xl font-bold">{feeManagement.length}</p>
              </div>
              <DollarSign size={32} className="text-blue-200" />
            </div>
          </div>
          <div className="bg-green-500 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Collections Today</p>
                <p className="text-2xl font-bold">{feeCollection.length}</p>
              </div>
              <Users size={32} className="text-green-200" />
            </div>
          </div>
          <div className="bg-purple-500 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Active Classes</p>
                <p className="text-2xl font-bold">{classes.length}</p>
              </div>
              <BookOpen size={32} className="text-purple-200" />
            </div>
          </div>
          <div className="bg-orange-500 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <Calendar size={32} className="text-orange-200" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-2 mb-6">
            <TabButton
              tabKey="feecollection"
              label="Fee Collection"
              icon={Users}
            />
            <TabButton
              tabKey="feemanagement"
              label="Fee Management"
              icon={DollarSign}
            />
            <TabButton
              tabKey="schoolfee"
              label="School Fee Structure"
              icon={BookOpen}
            />
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Filter by Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} /> Add New
              </button>
            </div>
          </div>

          {/* Date Filter and Download Buttons for Fee Collection */}
          {activeTab === "feecollection" && (
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <div className="flex gap-2 items-center">
                <label className="text-sm">From:</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange((r) => ({ ...r, from: e.target.value }))
                  }
                  className="border rounded px-2 py-1"
                />
                <label className="text-sm">To:</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange((r) => ({ ...r, to: e.target.value }))
                  }
                  className="border rounded px-2 py-1"
                />
              </div>
              <div className="flex gap-2">
                {/* Print Icon Button */}
                <button
                  onClick={() => {
                    if (summaryTableRef.current) {
                      const printWindow = window.open("", "", "height=600,width=1000");
                      printWindow.document.write(`
      <html>
        <head>
          <title>Print</title>
          <style>
            @media print {
              @page { size: landscape; }
              th:last-child, td:last-child { display: none !important; }
            }
            body { font-family: sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; }
            th { background: #f2f2f2; }
            th:last-child, td:last-child { display: none; }
          </style>
        </head>
        <body>
          ${summaryTableRef.current.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
}}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-2"
                  title="Print Table"
                >
                  <Printer size={18} /> Print
                </button>
                <button
                  onClick={handleDownloadExcel}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Download Excel
                </button>
              </div>
            </div>
          )}

          {/* Data Table  */}
          {activeTab !== "feecollection" && (
            loading ? (
              <div className="text-center py-8">Loading data...</div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {renderTableHeaders().map((header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => renderTableRow(item, index))
                    ) : (
                      <tr>
                        <td
                          colSpan={renderTableHeaders().length}
                          className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                        >
                          No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>

        {/* Summary Table for Fee Collection (ref for PDF export) */}
        {activeTab === "feecollection" && (
          <div
            ref={summaryTableRef}
            className="overflow-x-auto bg-white rounded-lg shadow-sm mb-6"
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {renderTableHeaders().map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFeeCollection.length > 0 ? (
                  filteredFeeCollection.map(renderTableRow)
                ) : (
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      No records found.
                    </td>
                  </tr>
                )}
                {/* Summary Row */}
                {filteredFeeCollection.length > 0 && (
                  <tr className="bg-gray-100 font-bold">
                    <td className="px-6 py-4 text-right" colSpan={8}>
                      Total
                    </td>
                    <td className="px-6 py-4">
                      ₹
                      {filteredFeeCollection.reduce(
                        (sum, item) => sum + Number(item.amount || 0),
                        0
                      )}
                    </td>
                    <td className="px-6 py-4">
                      ₹
                      {filteredFeeCollection.reduce(
                        (sum, item) => sum + Number(item.pendingAmount || 0),
                        0
                      )}
                    </td>
                    <td className="px-6 py-4">
                      ₹
                      {filteredFeeCollection.reduce(
                        (sum, item) =>
                          sum + Math.max(Number(item.amount || 0) - Number(item.pendingAmount || 0), 0),
                        0
                      )}
                    </td>
                    {/* Fill remaining columns with empty cells */}
                    <td colSpan={renderTableHeaders().length - 11}></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit/View */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {modalType === "create" &&
                  `Add New ${activeTab
                    .replace("fee", "Fee ")
                    .replace("management", "Management")
                    .replace("collection", "Collection")
                    .replace("school", "School Fee ")}`}
                {modalType === "edit" &&
                  `Edit ${activeTab
                    .replace("fee", "Fee ")
                    .replace("management", "Management")
                    .replace("collection", "Collection")
                    .replace("school", "School Fee ")}`}
                {modalType === "view" &&
                  `View ${activeTab
                    .replace("fee", "Fee ")
                    .replace("management", "Management")
                    .replace("collection", "Collection")
                    .replace("school", "School Fee ")} Details`}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {modalType === "edit" && (
                <div className="mb-4 flex gap-4">
                  <label>
                    <input
                      type="radio"
                      name="editFeeMode"
                      value="pending"
                      checked={editFeeMode === "pending"}
                      onChange={() => setEditFeeMode("pending")}
                    />
                    Pay Pending Amount
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="editFeeMode"
                      value="new"
                      checked={editFeeMode === "new"}
                      onChange={() => setEditFeeMode("new")}
                    />
                    Add New Fee
                  </label>
                </div>


              )}
              {getFormFields().map((field) => (
                <div className="col-span-1" key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {field.label}
                  </label>
                  {renderFormField(field)}
                </div>
              ))}
              <div className="col-span-full flex justify-end gap-3 mt-4">
                {modalType !== "view" && (
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fee Collection Success Modal */}
      {showFeeCollectionSuccessModal && printData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowFeeCollectionSuccessModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col items-center justify-center text-center">
              <CheckCircle size={64} className="text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Fee Collected Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                Receipt Number: <strong>{printData.receiptNumber}</strong>
              </p>
              <div className="flex gap-4">
                <Link
                  to="/principal/register-student" // Assuming this is your add student route
                  className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  onClick={() => setShowFeeCollectionSuccessModal(false)}
                >
                  <Plus size={18} /> Add Student
                </Link>
                <button
                  onClick={() => {
                    setShowFeeCollectionSuccessModal(false);
                    setPrintData(printData);
                    setShowPrintModal(true);
                  }}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  🖨️ Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Receipt Modal (existing) */}
      {showPrintModal && printData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                Print Receipt
              </h3>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6" ref={printReceiptRef}>
              {/* Receipt Content */}
                <div className="header text-center mb-6">
                  {schoolLogo && (
                    <img
                      src={getImageUrl(schoolLogo)}
                      alt="School Logo"
                      className="h-20 mx-auto mb-2"
                      crossOrigin="anonymous"
                      onError={(e) => (e.target.src = "/no-photo.png")}
                    />
                  )}
                  <h2 className="text-3xl font-bold text-gray-900">
                    {schoolName}
                  </h2>
                  <p className="text-gray-600 text-sm">Fee Receipt</p>
                </div>

                <div className="details mb-6 text-gray-700">
                  <p>
                    <strong>Receipt No:</strong> {printData.receiptNumber}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(printData.paidDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Student Name:</strong>{" "}
                    {
                      students.find((s) => s.id === printData.studentId)
                        ?.studentName
                    }
                  </p>
                  <p>
                    <strong>Admission No:</strong>{" "}
                    {
                      students.find((s) => s.id === printData.studentId)
                        ?.Admission_Number
                    }
                  </p>
                  <p>
                    <strong>Class:</strong> {(() => {
                      // Prefer printData.class, else get from student object
                      if (printData.class) return printData.class;
                      const student = students.find((s) => s.id === printData.studentId);
                      return student?.class_ || student?.class || "";
                    })()}
                  </p>
                  <p>
                    <strong>Section:</strong> {(() => {
                      // Prefer printData.class, else get from student object
                      if (printData.class) return printData.class;
                      const student = students.find((s) => s.id === printData.studentId);
                      return student?.sectionclass || student?.sectionclass || "";
                    })()}
                  </p>
                </div>

                <table className="fee-table w-full text-left border-collapse mb-6">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border border-gray-300 bg-gray-100">
                        Fee Type
                      </th>
                      <th className="py-2 px-4 border border-gray-300 bg-gray-100">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-4 border border-gray-300">
                        {Array.isArray(printData.feeType)
                          ? printData.feeType.join(", ")
                          : printData.feeType}
                      </td>
                      <td className="py-2 px-4 border border-gray-300">
                        ₹{printData.amount}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="total text-right text-gray-900 mb-6">
                  Total Paid: ₹{printData.amount}
                </div>

                <div className="payment-method text-gray-700 mb-6">
                  <p>
                    <strong>Payment Method:</strong> {printData.paymentMode}
                  </p>
                      <p>
                    <strong>Pending Amount:</strong> {printData.pendingAmount||0}
                  </p>
                  {printData.description && (
                    <p>
                      <strong>Description:</strong> {printData.description}
                    </p>
                  )}
                </div>

                <div className="signature text-right mt-8">
                  {principalSignature && (
                    <img
                      src={getImageUrl(principalSignature)}
                      alt="Principal Signature"
                      className="h-16 mx-auto mb-2"
                      crossOrigin="anonymous"
                      onError={(e) => (e.target.src = "/no-photo.png")}
                    />
                  )}
                  <p className="font-semibold text-gray-800">
                    Principal Signature
                  </p>
                </div>

                <div className="footer text-center text-xs text-gray-500 mt-8">
                  Thank you for your payment.
                </div>
                
              </div>
               <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handlePrintReceipt}
                className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                🖨️ Print
              </button>
              <button
                onClick={() => setShowPrintModal(false)}
                className="bg-gray-300 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
            </div>
           
  
        </div>
      )}
    </div>
  );
};

export default FeeManagementSystem;
