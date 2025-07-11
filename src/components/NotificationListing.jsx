import React from "react";
import { Bell } from "lucide-react";
// mockNotifications.js (optional)
export const mockNotifications = [
  {
    id: 1,
    title: "New Assignment Uploaded",
    message: "Your science teacher uploaded a new assignment for Class 10-B.",
    date: "2025-05-06",
  },
  {
    id: 2,
    title: "Fee Payment Reminder",
    message: "Your school fees for May are due by 10th May.",
    date: "2025-05-05",
  },
  {
    id: 3,
    title: "PTM Scheduled",
    message: "Parent-Teacher Meeting for Class 8-A on 12th May at 10 AM.",
    date: "2025-05-04",
  },
  {
    id: 4,
    title: "Holiday Notice",
    message: "School will remain closed on 9th May due to a local holiday.",
    date: "2025-05-03",
  },
  {
    id: 5,
    title: "Exam Timetable Released",
    message: "Final term exam timetable for Class 12 is now available.",
    date: "2025-05-02",
  },
  {
    id: 1,
    title: "New Assignment Uploaded",
    message: "Your science teacher uploaded a new assignment for Class 10-B.",
    date: "2025-05-06",
  },
  {
    id: 2,
    title: "Fee Payment Reminder",
    message: "Your school fees for May are due by 10th May.",
    date: "2025-05-05",
  },
  {
    id: 3,
    title: "PTM Scheduled",
    message: "Parent-Teacher Meeting for Class 8-A on 12th May at 10 AM.",
    date: "2025-05-04",
  },
  {
    id: 4,
    title: "Holiday Notice",
    message: "School will remain closed on 9th May due to a local holiday.",
    date: "2025-05-03",
  },
  {
    id: 5,
    title: "Exam Timetable Released",
    message: "Final term exam timetable for Class 12 is now available.",
    date: "2025-05-02",
  },
  {
    id: 1,
    title: "New Assignment Uploaded",
    message: "Your science teacher uploaded a new assignment for Class 10-B.",
    date: "2025-05-06",
  },
  {
    id: 2,
    title: "Fee Payment Reminder",
    message: "Your school fees for May are due by 10th May.",
    date: "2025-05-05",
  },
  {
    id: 3,
    title: "PTM Scheduled",
    message: "Parent-Teacher Meeting for Class 8-A on 12th May at 10 AM.",
    date: "2025-05-04",
  },
  {
    id: 4,
    title: "Holiday Notice",
    message: "School will remain closed on 9th May due to a local holiday.",
    date: "2025-05-03",
  },
  {
    id: 5,
    title: "Exam Timetable Released",
    message: "Final term exam timetable for Class 12 is now available.",
    date: "2025-05-02",
  },
];

const NotificationListing = () => {
  return (
    <div className="h-screen">
      <div className="h-full overflow-y-auto bg-gray-50 ">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2  top-0 bg-gray-50">
          <Bell className="w-5 h-5" /> Notifications
        </h2>
        <div className="grid gap-4">
          {mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white border rounded-xl shadow-sm p-4 hover:shadow-md transition"
            >
              <div className="text-lg font-medium">{notification.title}</div>
              <div className="text-sm text-gray-600 mt-1">
                {notification.message}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {notification.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationListing;
