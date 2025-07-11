import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Trash2, XCircle } from "lucide-react"; // Removed Wand2 (AI icon) as it's not used
import { getImageUrl } from "../../utils/getImageUrl";

const SchoolGallary = () => {
  const [schoolid, setSchoolid] = useState("");
  const [type, setType] = useState("");
  const [customType, setCustomType] = useState("");
  const [altText, setAltText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [showGallery, setShowGallery] = useState(false);

  const [Name, setName] = useState("");
  const [topperClass, setTopperClass] = useState(""); // State for Class (10th or 12th)
  const [topperPercentage, setTopperPercentage] = useState("");

  // State for the custom confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  // Effect to get school ID from localStorage
  useEffect(() => {
    try {
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      // Defensive check for nested properties
      const schools = user?.user?.schools || user?.schools || [];
      const schoolId = schools[0]?.id || "";
      setSchoolid(schoolId);
      console.log("School ID initialized from localStorage:", schoolId);
      if (!schoolId) {
        toast.warn(
          "School ID not found in user data. Please ensure you are logged in correctly."
        );
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      toast.error("Error loading user data. Please log in again.");
    }
  }, []);
  useEffect(() => {
    // Set default zoom to 80% for this page
    const prevZoom = document.body.style.zoom;
    document.body.style.zoom = "85%";
    return () => {
      document.body.style.zoom = prevZoom || "";
    };
  }, []);

  // Effect to fetch gallery images when showGallery is true and schoolid is available
  useEffect(() => {
    if (showGallery && schoolid) {
      fetchGallery();
    }
  }, [showGallery, schoolid]); // Re-run when showGallery or schoolid changes

  // Function to fetch images from the backend
  const fetchGallery = async () => {
    if (!schoolid) {
      console.log("Cannot fetch gallery: School ID is missing.");
      return;
    }
    setLoading(true); // Set loading true while fetching
    try {
      const res = await axios.get(
        `http://localhost:5002/api/newSchool/landing-images/by-school/${schoolid}`
      );
      setGallery(res.data.images || []);
      console.log("Gallery fetched successfully:", res.data);
    } catch (err) {
      setGallery([]);
      console.error("Failed to fetch images:", err);
      toast.error("Failed to fetch images. Please check network and backend.");
    } finally {
      setLoading(false); // Always set loading false after fetch attempt
    }
  };

  // Handler for image file input change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null); // Create URL for image preview
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Determine the final type to send to the backend
    const finalType = type === "other" ? customType : type;

    // Frontend validation checks
    if (!schoolid) {
      toast.error("School ID is missing. Cannot upload.");
      return;
    }
    if (!finalType) {
      toast.error("Please select or enter an image type.");
      return;
    }
    if (!image) {
      toast.error("Please select an image file to upload.");
      return;
    }

    // Validation for Name field based on type
    const requiresName = [
      "principal",
      "vice_principal",
      "manager",
      "topper_highschool_1",
      "topper_highschool_2",
      "topper_highschool_3",
      "topper_inter_1",
      "topper_inter_2",
      "topper_inter_3",
    ].includes(finalType);
    if (requiresName && !Name.trim()) {
      toast.error(`Please enter the name for type "${type}".`);
      return;
    }

    // Validation for Class and Percentage for topper types
    if (
      finalType.startsWith("topper") &&
      (!topperClass.trim() || !topperPercentage.trim())
    ) {
      toast.error("Please enter topper's class and percentage.");
      return;
    }

    // Create FormData object to send file and other data
    const formData = new FormData();
    formData.append("image", image); // file is your File object
    formData.append("schoolid", schoolid); // must be 'schoolid', not 'schoolId'
    formData.append("type", finalType); // Use finalType here
    formData.append("altText", altText);
    formData.append("name", Name);

    // Only append class and percentage if it's a topper type
    if (finalType.startsWith("topper")) {
      formData.append("class", topperClass);
      formData.append("percentage", topperPercentage);
    }

    setLoading(true); // Set loading true before API call
    console.log("Submitting form with data:", { formData });
    try {
      // Make the POST request to the backend
      const response = await axios.post(
        "http://localhost:5002/api/newSchool/landing-images",
        formData
      );
      toast.success("Image uploaded successfully!");
      console.log("Upload successful:", response.data);

      // Reset form fields after successful upload
      setType("");
      setCustomType("");
      setAltText("");
      setImage(null);
      setPreview(null);
      setName("");
      setTopperClass("");
      setTopperPercentage("");

      // If gallery is currently shown, re-fetch to update the list
      if (showGallery) {
        fetchGallery();
      }
    } catch (err) {
      // Handle upload errors
      console.error("Error uploading image:", err.response?.data || err);
      toast.error(
        err.response?.data?.error ||
          "Error uploading image. Please check backend server and network."
      );
    } finally {
      setLoading(false); // Always set loading false after the API call finishes
    }
  };

  // Handler for opening delete confirmation modal
  const handleDeleteClick = (id) => {
    setDeleteItemId(id);
    setShowConfirmModal(true);
  };

  // Handler for actual deletion after confirmation
  const confirmDelete = async () => {
    setShowConfirmModal(false); // Close modal
    if (!deleteItemId) return;

    setLoading(true); // Set loading true for delete operation
    try {
      await axios.delete(
        `http://localhost:5002/api/newSchool/landing-images/${deleteItemId}`
      );
      toast.success("Image deleted successfully.");
      console.log(`Image with ID ${deleteItemId} deleted.`);
      fetchGallery(); // Re-fetch gallery to update the list
    } catch (err) {
      console.error("Error deleting image:", err.response?.data || err);
      toast.error(
        err.response?.data?.error || "Error deleting image. Please try again."
      );
    } finally {
      setLoading(false); // Always set loading false after delete attempt
      setDeleteItemId(null); // Clear item ID
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 text-black p-6 rounded-xl shadow-lg border border-gray-200 font-inter">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Upload Landing Image
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="schoolid"
            className="block mb-1 font-semibold text-gray-700"
          >
            School ID *
          </label>
          <input
            id="schoolid"
            type="number"
            className="border px-3 py-2 rounded-md w-full bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            value={schoolid}
            readOnly // Keep readOnly as per original code, value comes from localStorage
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="type"
            className="block mb-1 font-semibold text-gray-700"
          >
            Type *
          </label>
          <select
            id="type"
            className="border px-3 py-2 rounded-md w-full bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              // Clear customType if a predefined type is selected
              if (e.target.value !== "other") setCustomType("");
            }}
            required
            disabled={loading}
          >
            <option value="">Select type</option>
            <option value="principal">Principal</option>
            <option value="vice_principal">Vice Principal</option>
            <option value="manager">Manager</option>
            <option value="topper_highschool_1">High School Topper 1</option>
            <option value="topper_highschool_2">High School Topper 2</option>
            <option value="topper_highschool_3">High School Topper 3</option>
            <option value="topper_inter_1">Intermediate Topper 1</option>
            <option value="topper_inter_2">Intermediate Topper 2</option>
            <option value="topper_inter_3">Intermediate Topper 3</option>
            <option value="SchoolLogo">School Logo</option>
            <option value="school_banner">School Banner</option>
            <option value="school_building">School Building</option>
            <option value="school_event">School Event</option>
            <option value="school_activity">School Activity</option>
            <option value="school_cultural">School Cultural</option>
            <option value="school_sports">School Sports</option>
            <option value="school_trip">School Trip</option>
            <option value="school_festival">School Festival</option>
            <option value="school_achievement">School Achievement</option>
            <option value="other">Other</option>
          </select>
          {type === "other" && (
            <input
              type="text"
              className="border px-3 py-2 rounded-md w-full bg-gray-50 text-gray-900 mt-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              placeholder="Enter custom type"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              required
              disabled={loading}
            />
          )}
        </div>

        {/* Conditionally render Name field for specific types */}
        {[
          "principal",
          "vice_principal",
          "manager",
          "topper_highschool_1",
          "topper_highschool_2",
          "topper_highschool_3",
          "topper_inter_1",
          "topper_inter_2",
          "topper_inter_3",
        ].includes(type) && (
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block mb-1 font-semibold text-gray-700"
            >
              Name *
            </label>
            <input
              id="name"
              type="text"
              className="border px-3 py-2 rounded-md w-full bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              value={Name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              required
              disabled={loading}
            />
          </div>
        )}

        {/* Conditional rendering for Topper Class and Percentage */}
        {type?.startsWith("topper") && (
          <>
            <div className="mb-4">
              <label
                htmlFor="topperClass"
                className="block mb-1 font-semibold text-gray-700"
              >
                Class *
              </label>
              <select
                id="topperClass"
                className="border px-3 py-2 rounded-md w-full bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                value={topperClass}
                onChange={(e) => setTopperClass(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">Select Class</option>
                <option value="10th">10th</option>
                <option value="12th">12th</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="topperPercentage"
                className="block mb-1 font-semibold text-gray-700"
              >
                Percentage *
              </label>
              <input
                id="topperPercentage"
                type="number" // Changed to number for percentage input
                className="border px-3 py-2 rounded-md w-full bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                value={topperPercentage}
                onChange={(e) => setTopperPercentage(e.target.value)}
                required
                disabled={loading}
                min="0" // Added min and max for percentage
                max="100"
                step="0.01" // Allow decimal percentages
              />
            </div>
          </>
        )}

        <div className="mb-4">
          <label
            htmlFor="altText"
            className="block mb-1 font-semibold text-gray-700"
          >
            Alt Text
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="altText"
              type="text"
              className="border px-3 py-2 rounded-md w-full bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for accessibility"
              disabled={loading}
            />
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="imageUpload"
            className="block mb-1 font-semibold text-gray-700"
          >
            Image *
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            className="border px-3 py-2 rounded-md w-full bg-gray-50 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition duration-150 ease-in-out"
            onChange={handleImageChange}
            required
            disabled={loading}
          />
        </div>

        {preview && (
          <div className="mb-4">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-40 object-cover rounded-md border border-gray-300 shadow-sm"
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-gray-800 text-white font-semibold px-4 py-2 rounded-md w-full border border-gray-700 hover:bg-gray-700 transition duration-150 ease-in-out flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block mr-2 text-xl">
                &#9696;
              </span>{" "}
              {/* Spinner unicode */}
              Uploading...
            </>
          ) : (
            "Upload Image"
          )}
        </button>
      </form>

      <div className="mt-6">
        <button
          className="bg-gray-900 text-white font-medium px-4 py-2 rounded-md w-full mt-4 border border-gray-700 hover:bg-gray-800 transition duration-150 ease-in-out shadow-md"
          onClick={() => setShowGallery((prev) => !prev)}
          disabled={loading}
        >
          {showGallery ? "Hide Uploaded Images" : "Show Uploaded Images"}
        </button>
      </div>

      {showGallery && (
        <div className="mt-6 bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-center text-gray-800">
            Uploaded Images
          </h3>
          {loading && gallery.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Loading images...
            </div>
          ) : gallery.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No images found for this school.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((img) => (
                <div
                  key={img.id}
                  className="border border-gray-300 rounded-lg p-3 bg-white text-gray-900 relative shadow-md hover:shadow-lg transition duration-200 ease-in-out"
                >
                  <button
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white bg-opacity-75 rounded-full p-1.5 shadow-sm hover:scale-110 transition duration-200 ease-in-out"
                    title="Delete Image"
                    onClick={() => handleDeleteClick(img.id)}
                    disabled={loading}
                  >
                    <Trash2 size={20} />
                  </button>
                  <img
                    src={getImageUrl(img.url)}
                    alt={img.altText || "School gallery image"}
                    className="w-full h-40 object-cover rounded-md mb-3 border border-gray-200"
                    // Add onerror to display a placeholder if image URL is broken
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/400x200/cccccc/333333?text=Image+Not+Found`;
                    }}
                  />
                  <div className="text-sm font-bold capitalize text-blue-700">
                    {img.type
                      ?.replace(/_/g, " ")
                      .replace("topper highschool", "High School Topper")
                      .replace("topper inter", "Intermediate Topper")}
                  </div>
                  {img.name && (
                    <div className="text-sm text-gray-800">
                      Name: <span className="font-medium">{img.name}</span>
                    </div>
                  )}
                  {img.class && (
                    <div className="text-sm text-gray-800">
                      Class: <span className="font-medium">{img.class}</span>
                    </div>
                  )}
                  {img.percentage && (
                    <div className="text-sm text-gray-800">
                      Percentage:{" "}
                      <span className="font-medium">{img.percentage}</span>%
                    </div>
                  )}
                  {img.altText && (
                    <div className="text-xs text-gray-500 mt-1">
                      Alt Text: {img.altText}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full relative">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close"
            >
              <XCircle size={24} />
            </button>
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this image? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolGallary;
