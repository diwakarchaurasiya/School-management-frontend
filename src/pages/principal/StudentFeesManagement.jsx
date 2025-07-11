// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import {
//   FiFilter,
//   FiChevronLeft,
//   FiChevronRight,
//   FiDollarSign,
//   FiCalendar,
// } from "react-icons/fi";
// import AdmissionsSkeleton from "../../Loading/AdmissionsLoading";

// export const months = [
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
//   "January",
//   "February",
//   "March",
// ];

// const StudentFeesManagement = () => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [selectedMonthIndex, setSelectedMonthIndex] = useState(-1);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [filters, setFilters] = useState({
//     class: "",
//     section: "",
//   });
//   const [showFilters, setShowFilters] = useState(false);

//   // Extract unique classes and sections from student data
//   const classes = [
//     ...new Set(students.map((student) => student.class_)),
//   ].sort();
//   const sections = [
//     ...new Set(students.map((student) => student.sectionclass)),
//   ].sort();

//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const userRaw = localStorage.getItem("user");
//         const user = userRaw ? JSON.parse(userRaw) : null;
//         const schools = user?.user?.schools || user?.schools || [];
//         const schoolId = schools[0]?.id || null;
//         const principal_token = localStorage.getItem("principal_token");

//         if (!schoolId || !principal_token) {
//           setStudents([]);
//           setLoading(false);
//           return;
//         }

//         const response = await axios.get(
//           `https://api.jsic.in/api/admission/students/by-school/${schoolId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${principal_token}`,
//             },
//           }
//         );

//         let studentsArr = [];
//         if (Array.isArray(response.data?.students)) {
//           studentsArr = response.data.students;
//         }
//         setStudents(Array.isArray(studentsArr) ? studentsArr : []);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchStudents();
//   }, []);

//   // Filter students based on class and section
//   const filteredStudents = Array.isArray(students)
//     ? students.filter((student) => {
//         return (
//           (filters.class === "" || student.class_ === filters.class) &&
//           (filters.section === "" || student.sectionclass === filters.section)
//         );
//       })
//     : [];

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentStudents = filteredStudents.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

//   const handleAddMonths = (student) => {
//     setSelectedStudent(student);

//     const paidMonths = student.feesPaid
//       ? student.feesPaid.split(",").map((m) => m.trim())
//       : [];

//     const lastPaidIndex =
//       paidMonths.length > 0
//         ? months.findIndex(
//             (month) => month === paidMonths[paidMonths.length - 1]
//           )
//         : -1;

//     setSelectedMonthIndex(lastPaidIndex);
//   };

//   const handleSubmit = async () => {
//     if (!selectedStudent || selectedMonthIndex === -1) {
//       toast.error("Please select a student and month before submitting.");
//       return;
//     }

//     try {
//       const paidMonths = months.slice(0, selectedMonthIndex + 1);
//       console.log("Paid Months:", paidMonths);

//       const principal_token = localStorage.getItem("principal_token");

//       const updateResponse = await axios.put(
//         `https://api.jsic.in/api/admission/students/${selectedStudent.id}/feesPaid`,
//         {
//           feesPaid: paidMonths, // ✅ send as array
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${principal_token}`,
//           },
//         }
//       );

//       if (updateResponse.status !== 200) {
//         setError("Failed to update paid fee data.");
//         toast.error("Failed to update paid fee data.");
//         return;
//       }

//       // Refresh student list
//       const userRaw = localStorage.getItem("user");
//       const user = userRaw ? JSON.parse(userRaw) : null;
//       const schools = user?.user?.schools || user?.schools || [];
//       const schoolId = schools[0]?.id || null;

//       const response = await axios.get(
//         `https://api.jsic.in/api/admission/students/by-school/${schoolId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${principal_token}`,
//           },
//         }
//       );

//       const studentsArr = Array.isArray(response.data?.students)
//         ? response.data.students
//         : [];

//       setStudents(studentsArr);
//       setSelectedStudent(null);
//       setSelectedMonthIndex(-1);

//       toast.success("Student fee data updated successfully.");
//     } catch (err) {
//       setError(err.message);
//       toast.error("An error occurred while updating fee data.");
//     }
//   };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//     setCurrentPage(1); // Reset to first page when filters change
//   };

//   const resetFilters = () => {
//     setFilters({
//       class: "",
//       section: "",
//     });
//     setCurrentPage(1);
//   };

//   if (loading) return <AdmissionsSkeleton />;

//   if (error)
//     return (
//       <div
//         className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
//         role="alert"
//       >
//         <p className="font-bold">Error</p>
//         <p>{error}</p>
//       </div>
//     );

//   return (
//     <div className="container mx-auto p-4 w-full">
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-800">
//             <FiDollarSign className="inline mr-2" />
//             Student Fees Management
//           </h1>
//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
//           >
//             <FiFilter className="mr-2" />
//             Filters
//           </button>
//         </div>

//         {/* Filter Panel */}
//         {showFilters && (
//           <div className="bg-gray-50 p-4 rounded-lg mb-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Class
//                 </label>
//                 <select
//                   name="class"
//                   value={filters.class}
//                   onChange={handleFilterChange}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="">All Classes</option>
//                   {classes.map((cls) => (
//                     <option key={cls} value={cls}>
//                       {cls}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Section
//                 </label>
//                 <select
//                   name="section"
//                   value={filters.section}
//                   onChange={handleFilterChange}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="">All Sections</option>
//                   {sections.map((sec) => (
//                     <option key={sec} value={sec}>
//                       {sec}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="flex items-end">
//                 <button
//                   onClick={resetFilters}
//                   className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
//                 >
//                   Reset Filters
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Student Table */}
//         <div className="overflow-x-auto rounded-lg border border-gray-200">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Roll No.
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Student Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Father's Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Class/Section
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Paid Months
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {currentStudents.length > 0 ? (
//                 currentStudents.map((student) => {
//                   const paidMonths =
//                     typeof student.setSelectedMonthIndex === "string"
//                       ? student.setSelectedMonthIndex.split(",")
//                       : [];
//                   const lastPaidIndex =
//                     paidMonths.length > 0
//                       ? months.findIndex(
//                           (month) => month === paidMonths[paidMonths.length - 1]
//                         )
//                       : -1;

//                   return (
//                     <tr key={student.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {student.rollNumber}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {student.studentName}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {student.fatherName}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {student.class_} - {student.sectionclass}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex flex-wrap gap-1">
//                           {months.map((month, index) => {
//                             const isPaid = index <= lastPaidIndex;
//                             return (
//                               <span
//                                 key={month}
//                                 className={`px-2 py-1 text-xs rounded ${
//                                   isPaid
//                                     ? "bg-green-200 text-green-800"
//                                     : "bg-gray-200 text-gray-600"
//                                 }`}
//                               >
//                                 {month.substring(0, 3)}
//                               </span>
//                             );
//                           })}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         <button
//                           onClick={() => handleAddMonths(student)}
//                           className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center"
//                         >
//                           <FiCalendar className="mr-1" />
//                           Update Fees
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td
//                     colSpan="6"
//                     className="px-6 py-4 text-center text-sm text-gray-500"
//                   >
//                     No students found matching your filters
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {filteredStudents.length > itemsPerPage && (
//           <div className="flex items-center justify-between mt-4">
//             <div className="text-sm text-gray-700">
//               Showing{" "}
//               <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
//               <span className="font-medium">
//                 {Math.min(indexOfLastItem, filteredStudents.length)}
//               </span>{" "}
//               of <span className="font-medium">{filteredStudents.length}</span>{" "}
//               students
//             </div>
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                 disabled={currentPage === 1}
//                 className={`px-3 py-1 rounded-md ${
//                   currentPage === 1
//                     ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                     : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                 }`}
//               >
//                 <FiChevronLeft />
//               </button>
//               {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                 (page) => (
//                   <button
//                     key={page}
//                     onClick={() => setCurrentPage(page)}
//                     className={`px-3 py-1 rounded-md ${
//                       currentPage === page
//                         ? "bg-blue-600 text-white"
//                         : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                     }`}
//                   >
//                     {page}
//                   </button>
//                 )
//               )}
//               <button
//                 onClick={() =>
//                   setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                 }
//                 disabled={currentPage === totalPages}
//                 className={`px-3 py-1 rounded-md ${
//                   currentPage === totalPages
//                     ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                     : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                 }`}
//               >
//                 <FiChevronRight />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {selectedStudent && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold text-gray-800">
//                 Update Student Fees
//               </h2>
//               <button
//                 onClick={() => {
//                   setSelectedStudent(null);
//                   setSelectedMonthIndex(-1);
//                 }}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="mb-4">
//               <h3 className="font-medium text-gray-700">
//                 {selectedStudent.studentName}
//               </h3>
//               <p className="text-sm text-gray-500">
//                 Admission No: {selectedStudent.Admission_Number} | Class:{" "}
//                 {selectedStudent.class_}
//               </p>
//             </div>

//             {/* Set default selected month index from string only once (no hooks) */}
//             {selectedMonthIndex === -1 &&
//               (() => {
//                 const paidMonths = selectedStudent.setSelectedMonthIndex
//                   ? selectedStudent.setSelectedMonthIndex
//                       .split(",")
//                       .map((m) => m.trim())
//                   : [];
//                 const lastPaidMonth =
//                   paidMonths.length > 0
//                     ? paidMonths[paidMonths.length - 1]
//                     : "";
//                 const defaultIndex = months.findIndex(
//                   (m) => m.toLowerCase() === lastPaidMonth.toLowerCase()
//                 );
//                 if (defaultIndex !== -1) setSelectedMonthIndex(defaultIndex);
//               })()}

//             <div className="mb-4">
//               <p className="text-sm font-medium text-gray-700 mb-2">
//                 Select up to which month fees are paid:
//               </p>
//               <div className="flex flex-wrap gap-2">
//                 {months.map((month, index) => (
//                   <button
//                     type="button"
//                     key={month}
//                     onClick={() => setSelectedMonthIndex(index)}
//                     className={`text-sm px-3 py-2 rounded-md border ${
//                       selectedMonthIndex >= 0 && index <= selectedMonthIndex
//                         ? "bg-black text-white border-black"
//                         : "bg-white text-gray-700 border-gray-300"
//                     }`}
//                   >
//                     {month}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
//               <button
//                 onClick={() => {
//                   setSelectedStudent(null);
//                   setSelectedMonthIndex(-1);
//                 }}
//                 className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 disabled={selectedMonthIndex === -1}
//                 className={`px-4 py-2 rounded-md text-white transition-colors ${
//                   selectedMonthIndex === -1
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-blue-600 hover:bg-blue-700"
//                 }`}
//               >
//                 Confirm Fee Update
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StudentFeesManagement;
