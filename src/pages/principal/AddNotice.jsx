import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Download, PlusCircle, Trash2 } from "lucide-react";
import Modal from "react-modal";
import AlertDialog from "../../components/AlertDialog"; // import the new dialog component
import { getImageUrl } from "../../utils/getImageUrl";

const AddNotice = () => {
  const [notices, setNotices] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // State for alert dialog
  const [alertOpen, setAlertOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem("principal_token");
      const res = await fetch(
        "https://api.jsic.in/api/notices/notices", // Updated API URL
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch notices");
      const data = await res.json();
      setNotices(data.notices || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const onSubmit = async (data) => {
    if (!data.pdf || data.pdf.length === 0) {
      toast.error("Please upload a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("text", data.text);
    formData.append("tag", data.tag);
    formData.append("forClass", data.class);
    formData.append("pdf", data.pdf[0]); // ✅ guaranteed to exist now

    try {
      const token = localStorage.getItem("principal_token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const res = await fetch("https://api.jsic.in/api/notices/notices", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to add notice");

      toast.success("Notice uploaded successfully!");
      reset();
      setModalIsOpen(false);
      fetchNotices();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Open AlertDialog and set notice to delete
  const openDeleteDialog = (notice) => {
    setNoticeToDelete(notice);
    setAlertOpen(true);
  };

  // Handle confirmed deletion
  const handleDeleteConfirmed = async () => {
    if (!noticeToDelete) return;
    try {
      const token = localStorage.getItem("principal_token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const res = await fetch(
        `https://api.jsic.in/api/notices/notices/${noticeToDelete.id}`, // Updated API URL
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete notice");

      toast.success("Notice deleted successfully!");
      setAlertOpen(false);
      setNoticeToDelete(null);
      fetchNotices();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="w-full  mx-auto  rounded-lg overflow-hidden">
      <h1 className="text-3xl font-bold text-black text-center my-10">
        Notices
      </h1>

      <h2 className=" text-black bg-gray-200 rounded-md text-lg font-bold p-3 flex justify-between items-center">
        <span>Notices & Circulars</span>
        <button
          onClick={() => setModalIsOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-black/80 "
        >
          <PlusCircle size={18} /> Add Notice
        </button>
      </h2>

      <div className="p-4 max-h-80 overflow-auto">
        {notices.map((notice, index) => (
          <div
            key={notice.id || index}
            className={`border-b py-3 flex justify-between items-center transition-opacity duration-500 `}
          >
            <div>
              <h3 className="text-lg font-semibold">{notice.title}</h3>
              <p className="text-gray-600">{notice.content}</p>
              <p className="text-sm text-gray-400">
                Class: {notice.forClass || "All"}
              </p>
            </div>
            <div className="flex gap-4">
              {notice.pdfUrl && (
                <a
                  href={getImageUrl(notice.pdfUrl)}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-green-600 transition"
                >
                  <Download className="w-5 h-5" />
                </a>
              )}
              <button
                onClick={() => openDeleteDialog(notice)}
                className="text-gray-500 hover:text-red-600 transition"
                aria-label="Delete Notice"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Notice Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="bg-white p-6 rounded-xl w-1/2 shadow-lg  mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center"
        ariaHideApp={false}
      >
        <h2 className="text-2xl font-bold text-black mb-6">Add New Notice</h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          encType="multipart/form-data"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title (Required)
            </label>
            <input
              type="text"
              {...register("title", { required: "Title is required" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notice Text (Required)
            </label>
            <textarea
              {...register("text")}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tag (Required)
            </label>
            <select
              {...register("tag", { required: "Tag is required" })}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-black focus:ring-black text-sm"
            >
              <option value="">Select a Tag</option>
              <option value="Announcements">Announcements</option>
              <option value="Events">Events</option>
              <option value="Scholarships">Scholarships</option>
              <option value="Exams">Exams</option>
            </select>
            {errors.tag && (
              <p className="text-sm text-red-500">{errors.tag.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Class (Required)
            </label>
            <select
              {...register("class", { required: "Class is required" })}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-black focus:ring-black text-sm"
            >
              <option value="">Select class</option>
              {[
                "All",
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
              ].map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            {errors.class && (
              <p className="text-sm text-red-500">{errors.class.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload PDF (Required)
            </label>
            <input
              type="file"
              accept="application/pdf"
              {...register("pdf", { required: true })}
              className="border p-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
          >
            Submit Notice
          </button>
        </form>
      </Modal>

      {/* Alert Dialog for delete confirmation */}
      <AlertDialog
        isOpen={alertOpen}
        title="Delete Notice"
        message={`Are you sure you want to delete the notice "${noticeToDelete?.title}"?`}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setAlertOpen(false)}
      />
    </div>
  );
};

export default AddNotice;
