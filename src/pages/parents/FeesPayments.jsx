import React from 'react';

const feeSummary = {
  total: 50000,
  paid: 30000,
  due: 20000,
};

const paymentHistory = [
  {
    date: '2025-01-15',
    amount: 15000,
    method: 'Online',
    status: 'Paid',
    receiptId: 'RCPT12345',
  },
  {
    date: '2025-03-01',
    amount: 15000,
    method: 'Online',
    status: 'Paid',
    receiptId: 'RCPT12346',
  },
  {
    date: '2025-04-01',
    amount: 20000,
    method: 'Pending',
    status: 'Unpaid',
    receiptId: null,
  },
];

const getStatusStyle = (status) => {
  switch (status) {
    case 'Paid': return 'text-green-600';
    case 'Unpaid': return 'text-red-600';
    case 'Overdue': return 'text-yellow-600';
    default: return 'text-gray-600';
  }
};

const FeePayments = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-2xl border border-gray-200 mt-8">
      <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">Fee Payment Summary</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Total Fees</p>
          <p className="text-lg font-bold">₹{feeSummary.total}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-lg font-bold">₹{feeSummary.paid}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Due</p>
          <p className="text-lg font-bold">₹{feeSummary.due}</p>
        </div>
      </div>

      {/* Payment History Table */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment History</h2>
      <table className="w-full border border-gray-300 text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Amount</th>
            <th className="border px-4 py-2">Method</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Receipt</th>
          </tr>
        </thead>
        <tbody>
          {paymentHistory.map((entry, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{entry.date}</td>
              <td className="border px-4 py-2">₹{entry.amount}</td>
              <td className="border px-4 py-2">{entry.method}</td>
              <td className={`border px-4 py-2 font-medium ${getStatusStyle(entry.status)}`}>
                {entry.status}
              </td>
              <td className="border px-4 py-2">
                {entry.receiptId ? (
                  <button className="text-blue-600 underline text-sm hover:text-blue-800">
                    Download
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeePayments;
