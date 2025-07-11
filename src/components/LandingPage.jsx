import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  GraduationCap,
  Users,
  Target,
  Flag,
  PlayCircle,
  LogIn,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  Download,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/getImageUrl";



function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [teamImages, setTeamImages] = useState([]);
  const [topperList, setTopperList] = useState([]);
  const [filteredGalleryImages, setFilteredGalleryImages] = useState([]);
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [schoolName, setSchoolName] = useState(
    "Shri Jagdamba Saraswati Inter College"
  );

  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState([]); // State to store fetched notices
  const [apkInfo, setApkInfo] = useState(null);

  const [heroImages, setHeroImages] = useState([
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
  ]);

  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [schoolid] = useState("1");

  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [enquiryMobile, setEnquiryMobile] = useState("");
  const [enquiryClass, setEnquiryClass] = useState("");
  const [enquiryStream, setEnquiryStream] = useState("");
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

  // --- New: Fetch Notices ---
  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://api.jsic.in/api/notices/notices");
      // Duplicate notices for seamless scrolling if there are enough notices
      const fetchedNotices = res.data.notices || [];
      if (fetchedNotices.length > 2) {
        // Only duplicate if there are at least 3 unique notices for a smooth loop
        setNotices([...fetchedNotices, ...fetchedNotices]);
      } else {
        setNotices(fetchedNotices);
      }
    } catch (err) {
      console.error("Failed to fetch notices:", err);
      toast.error("Failed to load notices.");
      setNotices([]); // Clear notices on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices(); // Call fetchNotices on component mount
  }, []);

  // Effect for notice board auto-scroll
  useEffect(() => {
    if (!containerRef.current || notices.length === 0) return;

    const noticeHeight = 60; // Approximate height of one notice item including padding/margin

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        let nextIndex = prevIndex + 1;

        // Calculate scroll position
        const nextScrollTop = nextIndex * noticeHeight;
        containerRef.current.scrollTo({
          top: nextScrollTop,
          behavior: "smooth",
        });

        // If we've scrolled past the first half of the duplicated notices, reset to start instantly
        if (nextIndex >= notices.length / 2) {
          setTimeout(() => {
            containerRef.current.scrollTo({ top: 0, behavior: "auto" });
          }, 600); // Allow smooth scroll to finish before instant reset
          return 0; // Reset index to 0
        }
        return nextIndex;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [notices, currentIndex]); // notices added as dependency to re-run if notices change

  // Effect for hero image slider (unchanged)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Fetch and categorize images from API (unchanged logic)
  const fetchLandingImages = async () => {
    if (!schoolid) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.jsic.in/api/newSchool/landing-images/by-school/${schoolid}`
      );
      const images = res.data.images || [];

      const fetchedTeam = [];
      const fetchedToppers = [];
      const fetchedGallery = [];
      let fetchedSchoolLogo = null;
      let fetchedHeroImages = [];

      images.forEach((img) => {
        if (
          img.type === "principal" ||
          img.type === "vice_principal" ||
          img.type === "manager"
        ) {
          fetchedTeam.push({
            name: img.name || "Name N/A",
            role:
              img.type
                ?.replace(/_/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase()) || "Role N/A",
            img: img.url,
          });
        } else if (img.type?.startsWith("topper")) {
          fetchedToppers.push({
            name: img.name || "Name N/A",
            class: img.class || "Class N/A",
            percentage: img.percentage || "N/A",
            img: img.url,
          });
        } else if (img.type === "SchoolLogo") {
          fetchedSchoolLogo = img.url;
          if (img.altText) {
            setSchoolName("Shri Jagdamba Saraswati Inter College");
          } else {
            setSchoolName("Jalpai Public School");
          }
        } else if (img.type === "hero" || img.type === "main banner") {
          fetchedHeroImages.push(img.url);
        } else {
          fetchedGallery.push(img.url);
        }
      });

      setTeamImages(fetchedTeam);
      setTopperList(
        fetchedToppers.sort((a, b) => {
          const percentageA = parseFloat(a.percentage);
          const percentageB = parseFloat(b.percentage);
          if (!isNaN(percentageA) && !isNaN(percentageB)) {
            return percentageB - percentageA;
          }
          return (
            (a.type || "").localeCompare(b.type || "") ||
            (a.name || "").localeCompare(b.name || "")
          );
        })
      );
      setFilteredGalleryImages(fetchedGallery);
      setSchoolLogo(fetchedSchoolLogo);
      if (fetchedHeroImages.length > 0) {
        setHeroImages(fetchedHeroImages);
      } else {
        setHeroImages([
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
          "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
          "https://api.jsic.in/uploads/1749936916244.png?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
          "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch landing page images:", err);
      toast.error("Failed to load school data. Please try again.");
      setHeroImages([
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle enquiry form submission
  const handleSubmitEnquiry = async (e) => {
    e.preventDefault();

    if (!enquiryName || !enquiryEmail || !enquiryMobile || !enquiryClass) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(enquiryEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(enquiryMobile)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    const classesWithStream = ["11", "12"];
    const payload = {
      name: enquiryName,
      email: enquiryEmail,
      mobile: enquiryMobile,
      class: enquiryClass,
      schoolid: schoolid,
      stream: "", // default
    };

    if (classesWithStream.includes(enquiryClass)) {
      if (!enquiryStream) {
        toast.error("Please select a stream for Class 11 or 12.");
        return;
      }
      payload.stream = enquiryStream;
    }

    console.log("Enquiry Payload:", payload);

    setSubmittingEnquiry(true);
    try {
      await axios.post("https://api.jsic.in/api/enquiry", payload);
      toast.success(
        "Enquiry submitted successfully! We will contact you soon."
      );

      // Clear form
      setEnquiryName("");
      setEnquiryEmail("");
      setEnquiryMobile("");
      setEnquiryClass("");
      setEnquiryStream("");
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      toast.error("Failed to submit enquiry. Please try again later.");
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  useEffect(() => {
    fetchLandingImages();
  }, [schoolid]);

  useEffect(() => {
    if (schoolid) {
      fetch(`https://api.jsic.in/api/newSchool/school-apk/latest/${schoolid}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setApkInfo(data))
        .catch(() => setApkInfo(null));
    }
  }, [schoolid]);

  const showStreamField = ["9", "10", "11", "12"].includes(enquiryClass);
  const class10Toppers = topperList.filter(
    (student) => student.class === "10th"
  );

  const class12Toppers = topperList.filter(
    (student) => student.class === "12th"
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-300 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              {schoolLogo ? (
                <img
                  src={getImageUrl(schoolLogo)}
                  alt="School Logo"
                  className="h-10 w-auto mr-2 rounded-md"
                  crossOrigin="anonymous"
                />
              ) : (
                <GraduationCap className="h-8 w-8 text-gray-900" />
              )}
              <span className="ml-2 text-xl font-bold text-gray-900 capitalize">
                {schoolName}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* APK Download Icon */}
              {apkInfo && apkInfo.url && (
                <a
                  href={getImageUrl(apkInfo.url)}
                  download
                  className="text-gray-700 hover:text-blue-700 transition-colors flex items-center"
                  title={`Download School App (v${apkInfo.version || ''})`}
                >
                  <Download className="w-6 h-6 mr-1" />
                  <span className="hidden sm:inline">Download App</span>
                </a>
              )}
              <Link to="/login" className="text-gray-900 hover:text-gray-700">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section with Slider */}
      <div className="relative">
        <div className="absolute inset-0">
          {loading && heroImages.length === 0 ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600">
              Loading Hero Images...
            </div>
          ) : (
            heroImages.map((image, index) => (
              <img
                key={index}
                className={`w-full h-full object-cover transition-opacity duration-1000 absolute ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
                src={image}
                alt={`Slide ${index + 1}`}
              />
            ))
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-500 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Excellence Starts Here at Shri Jagdamba Saraswati Inter College.
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            At Shri Jagdamba Saraswati Inter College, we're dedicated to
            nurturing every student's unique potential. Our personalized
            learning paths and expert guidance are designed to empower you to
            achieve academic excellence and confidently pursue your dreams. Join
            a vibrant community where your success is our priority, and every
            step of your educational journey is supported.
          </p>
          <div className="mt-10 flex space-x-4">
            <Link to="/login">
              <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-100 transition-colors">
                Get Started
              </button>
            </Link>
            <a
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-200 bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition-colors"
              href="#enquiry-form"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              Enquiry Now
            </a>
          </div>
        </div>
      </div>
      {/* Add Registration Button Section */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="flex justify-center mb-6">
          <Link
            to="/public/register-student"
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition"
          >
            Public Student Registration
          </Link>
        </div>
      </div>
      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose EduExcel?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Discover how we help students excel in their academic journey
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col items-center p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-900 text-white mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                Personalized Learning
              </h3>
              <p className="mt-2 text-base text-gray-600 text-center">
                Tailored educational paths designed to match your unique
                learning style and pace.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-900 text-white mb-4">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                Expert Guidance
              </h3>
              <p className="mt-2 text-base text-gray-600 text-center">
                Access to experienced educators and mentors who support your
                academic growth.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-900 text-white mb-4">
                <Flag className="h-8 w-8" />
              </div>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                Track Progress
              </h3>
              <p className="mt-2 text-base text-gray-600 text-center">
                Monitor your achievements and stay motivated with our progress
                tracking system.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Team Section (Principal, Vice Principal, Manager) */}
      <div className="py-16 text-center bg-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
          Our Authorities
        </h2>
        <p className="mt-2 text-lg text-gray-600 mb-12">
          Meet our educational community leaders
        </p>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-evenly gap-8">
          {loading ? (
            <p className="text-gray-600">Loading team data...</p>
          ) : teamImages.length === 0 ? (
            <p className="text-gray-600">No team members available.</p>
          ) : (
            teamImages.map((member, index) => (
              <div
                className="bg-white shadow-lg rounded-lg overflow-hidden w-64 transform transition-transform duration-300 hover:scale-105"
                key={index}
              >
                <div className="relative w-full h-64 overflow-hidden">
                  <img
                    src={
                      member.img
                        ? getImageUrl(member.img)
                        : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                    }
                    alt={member.name}
                    className="w-full h-full object-cover object-center"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-base text-gray-600">{member.role}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* //topper section */}
      <div className="py-16 bg-white text-center">
        {" "}
        {/* This centers the main headings and descriptions */}
        {/* High School Toppers - Class 10th */}
        <section className="my-20">
          <h2 className="text-5xl font-extrabold text-yellow-600 mb-4">
            High School Toppers
          </h2>
          <p className="text-xl text-gray-700 mt-2 mb-12 max-w-2xl mx-auto">
            Celebrating the exceptional academic achievements of our Class 10th
            students.
          </p>
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-10">
            {" "}
            {/* Flex container: justify-center to center the row of cards */}
            {loading ? (
              <p className="text-gray-600 text-lg w-full">
                Loading toppers data...
              </p>
            ) : class10Toppers.length === 0 ? (
              <p className="text-gray-600 text-lg w-full">
                No Class 10th toppers available at the moment. Check back soon!
              </p>
            ) : (
              class10Toppers.map((student, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex-shrink-0" /* flex-shrink-0 to prevent shrinking */
                  style={{
                    flexBasis: "calc(25% - 30px)",
                  }} /* Adjust 25% for 4 columns, 30px for gap */
                >
                  <div className="relative mb-6">
                    <img
                      src={
                        student.img
                          ? getImageUrl(student.img)
                          : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                      }
                      alt={student.name}
                      className="w-36 h-36 rounded-full mx-auto object-cover border-4 border-yellow-400 shadow-md"
                      crossOrigin="anonymous"
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-yellow-400 text-yellow-900 px-4 py-1.5 rounded-full text-sm font-bold flex items-center justify-center shadow-lg">
                        <Trophy className="w-4 h-4 inline mr-2" /> Topper
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {student.name}
                  </h3>
                  <p className="text-md text-gray-700 mb-1">
                    Class:{" "}
                    <span className="font-semibold">{student.class}</span>
                  </p>
                  <p className="text-lg font-extrabold text-yellow-700">
                    Percentage: {student.percentage}%
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
        ---
        {/* Intermediate Toppers - Class 12th */}
        <section className="my-20">
          <h2 className="text-5xl font-extrabold text-indigo-600 mb-4">
            Intermediate Toppers
          </h2>
          <p className="text-xl text-gray-700 mt-2 mb-12 max-w-2xl mx-auto">
            Highlighting the outstanding academic achievements of our Class 12th
            students.
          </p>
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-10">
            {" "}
            {/* Flex container: justify-center to center the row of cards */}
            {loading ? (
              <p className="text-gray-600 text-lg w-full">
                Loading toppers data...
              </p>
            ) : class12Toppers.length === 0 ? (
              <p className="text-gray-600 text-lg w-full">
                No Class 12th toppers available at the moment. Check back soon!
              </p>
            ) : (
              class12Toppers.map((student, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex-shrink-0" /* flex-shrink-0 to prevent shrinking */
                  style={{
                    flexBasis: "calc(25% - 30px)",
                  }} /* Adjust 25% for 4 columns, 30px for gap */
                >
                  <div className="relative mb-6">
                    <img
                      src={
                        student.img
                          ? getImageUrl(student.img)
                          : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                      }
                      alt={student.name}
                      className="w-36 h-36 rounded-full mx-auto object-cover border-4 border-indigo-400 shadow-md"
                      crossOrigin="anonymous"
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-indigo-400 text-indigo-900 px-4 py-1.5 rounded-full text-sm font-bold flex items-center justify-center shadow-lg">
                        <Trophy className="w-4 h-4 inline mr-2" /> Topper
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {student.name}
                  </h3>
                  <p className="text-md text-gray-700 mb-1">
                    Class:{" "}
                    <span className="font-semibold">{student.class}</span>
                  </p>
                  <p className="text-lg font-extrabold text-indigo-700">
                    Percentage: {student.percentage}%
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
      {/* Notices and Enquiry Form Section */}
      <h2 className="text-3xl text-center font-extrabold text-gray-900 sm:text-4xl my-4">
        Notices and Enquiry
      </h2>
      <section
        id="enquiry-form"
        className="mt-20 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto "
      >
        {/* Scrollable notice board */}
        <div className="w-full lg:w-1/2 bg-white shadow-xl rounded-lg overflow-hidden">
          <h1 className="text-2xl font-bold text-gray-900 text-center py-4 bg-gray-50 border-b border-gray-200">
            Notices & Circulars
          </h1>
          <div
            ref={containerRef}
            className="p-6 max-h-[25rem] overflow-y-scroll custom-scrollbar"
          >
            {" "}
            {/* Add custom-scrollbar class */}
            {loading ? (
              <p className="text-center text-gray-600 py-4">
                Loading notices...
              </p>
            ) : notices.length === 0 ? (
              <p className="text-center text-gray-600 py-4">
                No notices available at the moment.
              </p>
            ) : (
              notices.map((notice, index) => (
                <div
                  key={notice.id || index} // Use unique ID if available, otherwise index
                  className={`border-b border-gray-200 py-4 flex justify-between items-center transition-all duration-500 ease-in-out cursor-pointer hover:bg-gray-50 hover:shadow-md transform hover:scale-[1.01] rounded-md px-2 ${
                    index % (notices.length / 2) === currentIndex
                      ? "opacity-100"
                      : "opacity-70"
                  }`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {notice.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {notice.content}
                    </p>
                  </div>
                  {notice.pdfUrl && ( // Only show download if PDF URL exists
                    <a
                      href={getImageUrl(notice.pdfUrl)}
                      target="_blank" // Open in new tab
                      rel="noopener noreferrer" // Security best practice
                      className="text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0 ml-4"
                      onClick={(e) => e.stopPropagation()}
                      title="Download PDF"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  )}
                </div>
              ))
           ) }
          </div>
        </div>

        {/* Enquiry Form */}
        <section className="w-full lg:w-1/2 bg-white shadow-xl rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6 border-b pb-4">
            Admission Enquiry
          </h2>
          <form onSubmit={handleSubmitEnquiry}>
            <div className="mb-4">
              <label
                htmlFor="enquiryName"
                className="block text-gray-700 text-sm font-semibold mb-2"
              >
                Your Name *
              </label>
              <input
                type="text"
                id="enquiryName"
                className="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your name"
                value={enquiryName}
                onChange={(e) => setEnquiryName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="enquiryEmail"
                className="block text-gray-700 text-sm font-semibold mb-2"
              >
                Your Email *
              </label>
              <input
                type="email"
                id="enquiryEmail"
                className="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                value={enquiryEmail}
                onChange={(e) => setEnquiryEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="enquiryMobile"
                className="block text-gray-700 text-sm font-semibold mb-2"
              >
                Mobile Number *
              </label>
              <input
                type="tel"
                id="enquiryMobile"
                className="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., 9876543210"
                pattern="[0-9]{10}"
                value={enquiryMobile}
                onChange={(e) => setEnquiryMobile(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="enquiryClass"
                className="block text-gray-700 text-sm font-semibold mb-2"
              >
                Class for Admission *
              </label>
              <select
                id="enquiryClass"
                className="shadow-sm border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                value={enquiryClass}
                onChange={(e) => {
                  setEnquiryClass(e.target.value);
                  setEnquiryStream("");
                }}
                required
              >
                <option value="">Select Class</option>
                {[...Array(12).keys()].map((i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    Class {i + 1}
                  </option>
                ))}
                <option value="Nursery">Nursery</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
              </select>
            </div>

            {showStreamField && (
              <div className="mb-4">
                <label
                  htmlFor="enquiryStream"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Stream *
                </label>
                <select
                  id="enquiryStream"
                  className="shadow-sm border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  value={enquiryStream}
                  onChange={(e) => setEnquiryStream(e.target.value)}
                  required
                >
                  <option value="">Select Stream</option>
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="bg-primary hover:bg-primary-50 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full transition-colors duration-200 ease-in-out transform "
              disabled={submittingEnquiry}
            >
              {submittingEnquiry ? "Submitting..." : "Submit Enquiry"}
            </button>
          </form>
        </section>
      </section>
      {/* Gallery Section */}
      <div className="py-24 bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Campus Life Gallery
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Experience the vibrant atmosphere of our educational community
            </p>
          </div>
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
            {loading ? (
              <p className="text-gray-600">Loading gallery images...</p>
            ) : filteredGalleryImages.length === 0 ? (
              <p className="text-gray-600 col-span-full text-center">
                No gallery images available.
              </p>
            ) : (
              filteredGalleryImages.map((image, index) => (
                <div key={index} className="break-inside-avoid mb-4">
                  <img
                    src={getImageUrl(image)}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/no-photo.png";
                    }}
                  />
                </div>
              ))
           ) }
          </div>
        </div>
      </div>
      {/* CTA Section */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to start learning?</span>
            <span className="block text-gray-300">Join EduExcel today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/login">
                <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-100 transition-colors">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                {schoolLogo ? (
                  <img
                    src={getImageUrl(schoolLogo)}
                    alt="School Logo"
                    className="h-10 w-auto mr-2 rounded-md"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <GraduationCap className="h-8 w-8 text-white" />
                )}
                <span className="ml-2 text-xl font-bold text-white">
                  {schoolName}
                </span>
              </div>
              <p className="mt-4 text-gray-400">
                Empowering students to achieve their academic goals through
                personalized learning paths and expert guidance.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Contact
              </h3>
              <ul className="mt-4 space-y-4">
                <li className="flex items-center text-gray-300">
                  <Mail className="h-5 w-5 mr-2 text-white" />
                  info@eduexcel.com
                </li>
                <li className="flex items-center text-gray-300">
                  <Phone className="h-5 w-5 mr-2 text-white" />
                  +1 (555) 123-4567
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Follow Us
              </h3>
              <div className="mt-4 flex space-x-6">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Twitter className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 md:flex md:items-center md:justify-between">
            <p className="text-base text-gray-400">
              &copy; 2024 EduExcel. All rights reserved.
            </p>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
