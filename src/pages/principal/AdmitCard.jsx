import React, { useState, useEffect, useMemo } from "react";
import { Search, School, Calendar } from "lucide-react";
import axios from "axios";
import AdmissionsSkeleton from "../../Loading/AdmissionsLoading";

// Class configurations
const classes = [
  "LKG",
  "UKG",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];
const sections = ["A", "B", "C", "D"];
const examTypes = ["Quarterly", "Halfyearly", "Annual"];
const timeSlots = [
  "08:00 AM - 11:00 AM",
  "11:30 AM - 2:30 PM",
  "03:00 PM - 6:00 PM",
];

const AdmitCard = () => {
  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [subjectConfigs, setSubjectConfigs] = useState({});

  // Form states
  const [scheduleFormData, setScheduleFormData] = useState({
    class: "",
    section: "",
    examType: "",
    examDates: {},
    examTimes: {},
  });
  const [errors, setErrors] = useState({});
  const [activeView, setActiveView] = useState("list");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch admissions data
        const admissionsResponse = await axios.get(
          "https://api.jsic.in/api/admission/students"
        );
        setAdmissions(admissionsResponse.data.students || []);

        // Fetch subjects configuration from backend
        const subjectsResponse = await axios.get(
          "https://api.jsic.in/api/newSchool/schools/"
        );
        
        // Add safe parsing with error handling
        if (subjectsResponse.data?.[0]?.subjects) {
          try {
            // Check if subjects is already an object
            const subjectsData = typeof subjectsResponse.data[0].subjects === 'string' 
              ? JSON.parse(subjectsResponse.data[0].subjects)
              : subjectsResponse.data[0].subjects;
            
            setSubjectConfigs(subjectsData);
          } catch (parseError) {
            console.error('Error parsing subjects data:', parseError);
            setSubjectConfigs({});
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((student) =>
      student.studentName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [admissions, searchQuery]);

  // Get subjects for selected class
  const getSubjectsForClass = (className) => {
    if (!className || !subjectConfigs[className]) return [];

    return Object.entries(subjectConfigs[className])
      .filter(([_, isEnabled]) => isEnabled)
      .map(([subject]) => ({
        name: subject,
        key: subject.toLowerCase().replace(/\s+/g, "_"),
      }));
  };

  const subjects = scheduleFormData.class
    ? getSubjectsForClass(scheduleFormData.class)
    : [];

  // Form handlers
  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setScheduleFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateChange = (subjectKey, value) => {
    setScheduleFormData((prevData) => ({
      ...prevData,
      examDates: {
        ...prevData.examDates,
        [subjectKey]: value,
      },
    }));

    if (errors[`examDates.${subjectKey}`]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[`examDates.${subjectKey}`];
        return newErrors;
      });
    }
  };

  const handleTimeChange = (subjectKey, value) => {
    setScheduleFormData((prevData) => ({
      ...prevData,
      examTimes: {
        ...prevData.examTimes,
        [subjectKey]: value,
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!scheduleFormData.class) {
      newErrors.class = "Class is required";
    }
    if (!scheduleFormData.section) {
      newErrors.section = "Section is required";
    }
    if (!scheduleFormData.examType) {
      newErrors.examType = "Exam type is required";
    }

    subjects.forEach((subject) => {
      if (!scheduleFormData.examDates[subject.key]) {
        newErrors[`examDates.${subject.key}`] = "Exam date is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Show loading state
        setLoading(true);

        const response = await axios.post('http://localhost:5000/api/admitcard/exam-schedule', {
          class: scheduleFormData.class,
          section: scheduleFormData.section,
          examType: scheduleFormData.examType,
          examDates: scheduleFormData.examDates,
          examTimes: scheduleFormData.examTimes
        });

        if (response.data) {
          alert('Exam schedule saved successfully!');
          setActiveView('list');
          
          // Reset form
          setScheduleFormData({
            class: '',
            section: '',
            examType: '',
            examDates: {},
            examTimes: {}
          });
        }
      } catch (error) {
        console.error('Error saving exam schedule:', error);
        alert('Failed to save exam schedule. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const generateDefaultDates = () => {
    const today = new Date();
    const newDates = {};
    const newTimes = {};

    subjects.forEach((subject, index) => {
      const examDate = new Date(today);
      examDate.setDate(today.getDate() + index + 1);
      newDates[subject.key] = examDate.toISOString().split("T")[0];
      newTimes[subject.key] = timeSlots[index % timeSlots.length];
    });

    setScheduleFormData((prevData) => ({
      ...prevData,
      examDates: newDates,
      examTimes: newTimes,
    }));
  };

  // Generate exam schedule for selected student's class
  const getExamScheduleForClass = (className) => {
    const classSubjects = getSubjectsForClass(className);

    if (classSubjects.length > 0) {
      return classSubjects.map((subject) => ({
        subject: subject.name,
        date: scheduleFormData.examDates[subject.key] || "Not scheduled",
        time: scheduleFormData.examTimes[subject.key] || "Not scheduled",
      }));
    }

    // Fallback default schedule
    return [
      { subject: "Maths", date: "Not scheduled", time: "Not scheduled" },
      { subject: "Science", date: "Not scheduled", time: "Not scheduled" },
    ];
  };

  if (loading) return <AdmissionsSkeleton />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">School Management System</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView("list")}
            className={`px-4 py-2 rounded ${
              activeView === "list" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Student List
          </button>
          <button
            onClick={() => setActiveView("schedule")}
            className={`px-4 py-2 rounded ${
              activeView === "schedule"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Create Exam Schedule
          </button>
        </div>
      </div>

      {/* Student List View */}
      {activeView === "list" && !selectedStudent && (
        <>
          <div className="flex gap-3">
            <Search className="text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <table className="w-full border-collapse border border-gray-300 text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-2 py-2">Name</th>
                <th className="border border-gray-300 px-2 py-2">Class</th>
                <th className="border border-gray-300 px-2 py-2">
                  Roll Number
                </th>
                <th className="border border-gray-300 px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmissions.map((student) => (
                <tr key={student._id}>
                  <td className="border border-gray-300 px-2 py-2">
                    {student.studentName}
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    {student.class}
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    {student.rollNumber}
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Generate Admit Card
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Admit Card View */}
      {selectedStudent && (
        <div className="w-full max-w-4xl mx-auto bg-white p-10 border border-gray-300 shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Singh Public School</h1>
            <p>Affiliation No - GJHS338</p>
            <p>Gautam Buddha Nagar, Greater Noida</p>
            <h2 className="text-lg font-bold mt-4">Examination Admit Card</h2>
          </div>
          <hr className="my-4 border-gray-400" />
          <p>
            <strong>Student's Name:</strong> {selectedStudent.studentName}
          </p>
          <p>
            <strong>Class:</strong> {selectedStudent.class}
          </p>
          <p>
            <strong>Roll Number:</strong> {selectedStudent.rollNumber}
          </p>
          <p>
            <strong>Father's Name:</strong> {selectedStudent.fatherName}
          </p>
          <p>
            <strong>Mother's Name:</strong> {selectedStudent.motherName}
          </p>

          <h3 className="mt-4 font-bold">Exam Schedule</h3>
          <table className="w-full border-collapse border border-gray-300 text-center mt-2">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-2 py-2">Subject</th>
                <th className="border border-gray-300 px-2 py-2">Date</th>
                <th className="border border-gray-300 px-2 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {getExamScheduleForClass(selectedStudent.class).map(
                (exam, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-2 py-2">
                      {exam.subject}
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      {exam.date}
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      {exam.time}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setSelectedStudent(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded"
            >
              Back
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Print Admit Card
            </button>
          </div>
        </div>
      )}

      {/* Exam Schedule Creation View */}
      {activeView === "schedule" && (
        <div className="w-full mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
              <School /> Create Exam Schedule
            </h2>

            <form onSubmit={handleScheduleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    name="class"
                    value={scheduleFormData.class}
                    onChange={handleScheduleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                  {errors.class && (
                    <p className="text-sm text-red-500 mt-1">{errors.class}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <select
                    name="section"
                    value={scheduleFormData.section}
                    onChange={handleScheduleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
                  >
                    <option value="">Select Section</option>
                    {sections.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                  {errors.section && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.section}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Type
                  </label>
                  <select
                    name="examType"
                    value={scheduleFormData.examType}
                    onChange={handleScheduleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
                  >
                    <option value="">Select Exam Type</option>
                    {examTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.examType && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.examType}
                    </p>
                  )}
                </div>
              </div>

              {scheduleFormData.class && subjects.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Calendar /> Exam Schedule
                    </h3>
                    <button
                      type="button"
                      onClick={generateDefaultDates}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Generate Default Dates
                    </button>
                  </div>

                  <div className="space-y-4">
                    {subjects.map((subject) => (
                      <div
                        key={subject.key}
                        className="p-4 bg-gray-50 rounded-lg mb-4 shadow-sm border"
                      >
                        <div className="flex flex-col gap-4 md:grid md:grid-cols-3">
                          {/* Subject Name */}
                          <div className="font-semibold text-gray-800 flex items-center">
                            {subject.name}
                          </div>

                          {/* Exam Date */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Exam Date
                            </label>
                            <input
                              type="date"
                              value={
                                scheduleFormData.examDates[subject.key] || ""
                              }
                              onChange={(e) =>
                                handleDateChange(subject.key, e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            {errors[`examDates.${subject.key}`] && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors[`examDates.${subject.key}`]}
                              </p>
                            )}
                          </div>

                          {/* Time Slot */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Timeslot
                            </label>
                            <select
                              value={
                                scheduleFormData.examTimes[subject.key] ||
                                timeSlots[0]
                              }
                              onChange={(e) =>
                                handleTimeChange(subject.key, e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            >
                              {timeSlots.map((slot) => (
                                <option key={slot} value={slot}>
                                  {slot}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scheduleFormData.class && subjects.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No subjects found for this class in the system.
                </div>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveView("list")}
                  className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-opacity-90"
                >
                  Back to Students
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-black text-white py-2 px-4 rounded-md hover:bg-opacity-90 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <>
                      <Calendar /> Save Schedule
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmitCard;
