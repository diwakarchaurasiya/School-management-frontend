import React, { useState, useEffect, useMemo, useRef } from "react";
import { Trash2, Download, FileText, XCircle, CheckCircle } from "lucide-react"; // Lucide React icons

/**
 * MessageModal Component
 * A custom modal for displaying messages (info, success, error) and confirmations.
 * Replaces native alert() and confirm() to adhere to strict rules.
 *
 * @param {object} props - The component props.
 * @param {string|null} props.message - The message to display in the modal. If null, the modal is hidden.
 * @param {'info'|'error'|'success'} props.type - The type of message, influences styling and icon.
 * @param {function} props.onConfirm - Callback function when the 'Confirm' or 'OK' button is clicked.
 * @param {function} props.onCancel - Callback function when the 'Cancel' button is clicked (only if showConfirmCancelButtons is true).
 * @param {boolean} props.showConfirmCancelButtons - If true, displays 'Confirm' and 'Cancel' buttons; otherwise, displays a single 'OK' button.
 */
const MessageModal = ({
  message,
  type,
  onConfirm,
  onCancel,
  showConfirmCancelButtons,
}) => {
  if (!message) return null; // Do not render modal if no message

  // Determine icon based on message type
  const icon =
    type === "error" ? (
      <XCircle className="w-6 h-6 text-red-500" />
    ) : type === "success" ? (
      <CheckCircle className="w-6 h-6 text-green-500" />
    ) : null; // No specific icon for info/confirm by default

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 font-inter">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
        <div className="flex items-start">
          {/* Icon display */}
          {icon && (
            <div className="flex-shrink-0 mx-0 flex items-center justify-center h-12 w-12 rounded-full bg-transparent sm:mx-0 sm:h-10 sm:w-10">
              {icon}
            </div>
          )}
          {/* Modal content */}
          <div className="mt-0 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3
              className="text-lg leading-6 font-medium text-gray-900"
              id="modal-title"
            >
              {/* Title based on message type */}
              {type === "error"
                ? "Error"
                : type === "success"
                ? "Success"
                : "Confirmation"}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          </div>
        </div>
        {/* Action buttons */}
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
          {showConfirmCancelButtons ? (
            // Render Confirm/Cancel buttons for confirmation type modals
            <>
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200 ease-in-out"
                onClick={onConfirm}
              >
                Confirm
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-all duration-200 ease-in-out"
                onClick={onCancel}
              >
                Cancel
              </button>
            </>
          ) : (
            // Render a single 'OK' button for info/error/success messages
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200 ease-in-out"
              onClick={onConfirm} // OnConfirm acts as 'OK' to dismiss the modal
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * EnquiryManagement Component
 * Manages fetching, displaying, filtering, deleting, and exporting enquiry data.
 */
const EnquiryManagement = () => {
  const [enquiries, setEnquiries] = useState([]); // Stores all fetched enquiries
  const [filteredEnquiries, setFilteredEnquiries] = useState([]); // Stores enquiries after applying filters
  const [loading, setLoading] = useState(true); // Manages loading state
  const [error, setError] = useState(null); // Stores general error messages
  const [selectedClass, setSelectedClass] = useState("All"); // State for the class filter dropdown
  const [modalMessage, setModalMessage] = useState(null); // Message to display in the custom modal
  const [modalType, setModalType] = useState("info"); // Type of modal (info, error, success)
  const [showModalButtons, setShowModalButtons] = useState(false); // Controls if confirm/cancel buttons are shown in modal
  const deleteEnquiryIdRef = useRef(null); // Ref to temporarily store the ID of the enquiry to be deleted

  // IMPORTANT: Replace 'your_principal_token_here' with your actual token.
  // In a real application, this token should be fetched securely (e.g., from localStorage,
  // a React Context, or an authentication service) and not hardcoded.
  const principalToken =
    localStorage.getItem("principal_token") || "your_principal_token_here";

  const API_BASE_URL = "https://api.jsic.in/api/enquiry";

  /**
   * Fetches all enquiries from the API.
   * Handles loading and error states.
   */
  const fetchEnquiries = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await fetch(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${principalToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // If response is not OK (e.g., 404, 500), throw an error
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      setEnquiries(data);
      setFilteredEnquiries(data); // Initialize filtered list with all fetched data
    } catch (err) {
      console.error("Failed to fetch enquiries:", err);
      setError(
        "Failed to load enquiries. Please ensure the API is running and accessible."
      );
      setModalMessage(
        "Failed to load enquiries. Please ensure the API is running and accessible. Error: " +
          err.message
      );
      setModalType("error");
      setShowModalButtons(false);
    } finally {
      setLoading(false);
    }
  };

  // Effect hook to fetch enquiries when the component mounts
  useEffect(() => {
    fetchEnquiries();
  }, []); // Empty dependency array ensures it runs only once on mount

  /**
   * Effect hook to apply class filtering whenever `selectedClass` or `enquiries` change.
   */
  useEffect(() => {
    if (selectedClass === "All") {
      setFilteredEnquiries(enquiries);
    } else {
      setFilteredEnquiries(
        enquiries.filter(
          (enquiry) => String(enquiry.class) === String(selectedClass)
        )
      );
    }
  }, [selectedClass, enquiries]);

  /**
   * Memoized computation for unique classes available in the enquiries list.
   * Used to populate the filter dropdown dynamically.
   */
  const uniqueClasses = useMemo(() => {
    const classes = new Set(enquiries.map((enquiry) => enquiry.class));
    // Filter out any null/undefined/empty string classes and sort numerically
    const sortedClasses = Array.from(classes)
      .filter((cls) => cls != null && String(cls).trim() !== "") // Ensure class is not null, undefined, or empty string
      .sort((a, b) => parseInt(a) - parseInt(b)); // Sort numerically
    return ["All", ...sortedClasses];
  }, [enquiries]);

  /**
   * Displays a confirmation modal before attempting to delete an enquiry.
   * Stores the ID of the enquiry to be deleted in a ref.
   * @param {number} id - The ID of the enquiry to be deleted.
   */
  const handleConfirmDelete = (id) => {
    deleteEnquiryIdRef.current = id; // Store ID in ref
    setModalMessage(
      "Are you sure you want to delete this enquiry? This action cannot be undone."
    );
    setModalType("info");
    setShowModalButtons(true); // Show confirm/cancel buttons
  };

  /**
   * Executes the deletion of an enquiry after user confirmation.
   * Makes an API call to delete the enquiry and then refetches the list.
   */
  const executeDelete = async () => {
    setModalMessage(null); // Hide the modal immediately after confirmation
    const idToDelete = deleteEnquiryIdRef.current;
    if (!idToDelete) return; // Should not happen if flow is correct

    try {
      const response = await fetch(`${API_BASE_URL}/${idToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${principalToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status} - ${errorText}`
        );
      }

      // If deletion is successful, refetch the data to update the UI
      fetchEnquiries();
      setModalMessage("Enquiry deleted successfully!");
      setModalType("success");
      setShowModalButtons(false); // Hide buttons for a success message
    } catch (err) {
      console.error(`Failed to delete enquiry with ID ${idToDelete}:`, err);
      setModalMessage(`Failed to delete enquiry. Error: ${err.message}`);
      setModalType("error");
      setShowModalButtons(false); // Hide buttons for an error message
    } finally {
      deleteEnquiryIdRef.current = null; // Clear the ref
    }
  };

  /**
   * Cancels the modal action (e.g., delete confirmation).
   * Hides the modal and clears any pending actions.
   */
  const handleCancelModal = () => {
    setModalMessage(null); // Hide modal
    deleteEnquiryIdRef.current = null; // Clear ref for safety
  };

  /**
   * Exports the currently filtered enquiries to an Excel-compatible CSV file.
   * Generates CSV string and triggers a download.
   */
  const exportToExcel = () => {
    if (filteredEnquiries.length === 0) {
      setModalMessage(
        "No enquiries found matching the current filter to export to Excel."
      );
      setModalType("info");
      setShowModalButtons(false);
      return;
    }

    // Define CSV headers
    const headers = [
      "ID",
      "Name",
      "Email",
      "Mobile",
      "Class",
      "Stream",
      "Created At",
    ];
    const csvRows = [];

    // Add headers to CSV
    csvRows.push(headers.join(","));

    // Add data rows, escaping double quotes and handling commas
    filteredEnquiries.forEach((enquiry) => {
      const createdAt = new Date(enquiry.createdAt).toLocaleString(); // Format date
      csvRows.push(
        [
          enquiry.id,
          `"${String(enquiry.name || "").replace(/"/g, '""')}"`, // Handle quotes and ensure string
          `"${String(enquiry.email || "").replace(/"/g, '""')}"`,
          `"${String(enquiry.mobile || "")}"`, // Treat mobile as string to preserve leading zeros
          String(enquiry.class || ""),
          `"${String(enquiry.stream || "N/A").replace(/"/g, '""')}"`, // Handle empty stream
          `"${createdAt}"`,
        ].join(",")
      );
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a"); // Create a temporary anchor element
    link.href = URL.createObjectURL(blob); // Create a URL for the blob
    link.setAttribute("download", "enquiries.csv"); // Set download file name
    document.body.appendChild(link); // Append to body to make it clickable
    link.click(); // Programmatically click the link to trigger download
    document.body.removeChild(link); // Clean up the temporary link
    URL.revokeObjectURL(link.href); // Release the object URL
    setModalMessage("Enquiries exported to Excel (CSV) successfully!");
    setModalType("success");
    setShowModalButtons(false);
  };

  /**
   * Exports the currently filtered enquiries to PDF using the browser's native print functionality.
   * Opens a new window with a printable version of the table and triggers print dialog.
   * Note: This method relies on the user's browser's "print to PDF" feature,
   * as direct PDF generation without external libraries is not feasible in a client-side environment.
   */
  const exportToPdf = () => {
    if (filteredEnquiries.length === 0) {
      setModalMessage(
        "No enquiries found matching the current filter to export to PDF."
      );
      setModalType("info");
      setShowModalButtons(false);
      return;
    }

    // Open a new window to render the printable content
    const printWindow = window.open("", "_blank", "height=600,width=800");
    if (!printWindow) {
      // Handle cases where pop-ups might be blocked
      setModalMessage("Please allow pop-ups in your browser to export to PDF.");
      setModalType("error");
      setShowModalButtons(false);
      return;
    }

    // Write the HTML structure and basic styles for printing into the new window
    printWindow.document.write("<html><head><title>Enquiry List</title>");
    printWindow.document.write(`
      <style>
        body { font-family: 'Inter', sans-serif; margin: 20px; color: #333; }
        h1 { text-align: center; color: #1a1a1a; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f0f0f0; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        /* Print-specific styles to ensure proper rendering */
        @media print {
          body { -webkit-print-color-adjust: exact; } /* For accurate color printing */
          table { page-break-inside: auto; } /* Allow table to break across pages */
          tr { page-break-inside: avoid; page-break-after: auto; } /* Avoid breaking rows */
          thead { display: table-header-group; } /* Repeat table header on each page */
          tfoot { display: table-footer-group; } /* Repeat table footer on each page */
        }
      </style>
    `);
    printWindow.document.write("</head><body>");
    printWindow.document.write("<h1>Enquiry List</h1>");
    printWindow.document.write("<table>");
    printWindow.document.write(
      "<thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Mobile</th><th>Class</th><th>Stream</th><th>Created At</th></tr></thead>"
    );
    printWindow.document.write("<tbody>");

    // Populate table rows with filtered enquiry data
    filteredEnquiries.forEach((enquiry) => {
      const createdAt = new Date(enquiry.createdAt).toLocaleString();
      printWindow.document.write(`
        <tr>
          <td>${enquiry.id}</td>
          <td>${enquiry.name}</td>
          <td>${enquiry.email}</td>
          <td>${enquiry.mobile}</td>
          <td>${enquiry.class}</td>
          <td>${enquiry.stream || "N/A"}</td>
          <td>${createdAt}</td>
        </tr>
      `);
    });

    printWindow.document.write("</tbody></table>");
    printWindow.document.write("</body></html>");
    printWindow.document.close(); // Close the document stream
    printWindow.focus(); // Focus on the new window
    printWindow.print(); // Trigger the print dialog
    // No explicit success modal here, as the user interacts directly with the browser's print dialog.
  };

  // Set default zoom to 75% for this page
  useEffect(() => {
    const prevZoom = document.body.style.zoom;
    document.body.style.zoom = "85%";
    return () => {
      document.body.style.zoom = prevZoom || "";
    };
  }, []);

  // Render a loading state while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-gray-800">
        <p className="text-xl font-medium">Loading enquiries...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 p-4 sm:p-6 md:p-8 font-inter">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden ring-1 ring-gray-200">
        {/* Header section with title, filter, and export buttons */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Enquiry Management
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Class Filter Dropdown */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-700 bg-gray-50 text-sm sm:text-base cursor-pointer"
              aria-label="Filter by class"
            >
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls === "All" ? "All Classes" : `Class ${cls}`}
                </option>
              ))}
            </select>

            {/* Export Buttons */}
            <button
              onClick={exportToExcel}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 ease-in-out text-sm sm:text-base"
              aria-label="Export to Excel"
            >
              <Download size={18} /> Export Excel
            </button>
            <button
              onClick={exportToPdf}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 ease-in-out text-sm sm:text-base"
              aria-label="Export to PDF"
            >
              <FileText size={18} /> Export PDF
            </button>
          </div>
        </div>

        {/* Error message display */}
        {error && (
          <div className="p-4 sm:p-6 text-center bg-red-100 text-red-700 border border-red-400 rounded-b-lg">
            <p className="font-semibold text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Enquiry list table */}
        <div className="overflow-x-auto p-4 sm:p-6">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                  ID
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mobile
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stream
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEnquiries.length > 0 ? (
                filteredEnquiries.map((enquiry) => (
                  <tr
                    key={enquiry.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {enquiry.id}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">
                      {enquiry.name}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">
                      {enquiry.email}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">
                      {enquiry.mobile}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">
                      {enquiry.class}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">
                      {enquiry.stream || "N/A"}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(enquiry.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleConfirmDelete(enquiry.id)}
                        className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-full p-1 transition-all duration-200 ease-in-out"
                        aria-label={`Delete enquiry ${enquiry.name}`}
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-3 py-8 text-center text-gray-500 text-lg"
                  >
                    No enquiries found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filteredEnquiries.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 font-semibold">
              {filteredEnquiries.length} found.
            </div>
          )}
        </div>
      </div>

      {/* Render the custom MessageModal */}
      <MessageModal
        message={modalMessage}
        type={modalType}
        // If showModalButtons is true, onConfirm triggers executeDelete; otherwise, it acts as a dismiss action (handleCancelModal)
        onConfirm={showModalButtons ? executeDelete : handleCancelModal}
        onCancel={handleCancelModal}
        showConfirmCancelButtons={showModalButtons}
      />
    </div>
  );
};

export default EnquiryManagement;
