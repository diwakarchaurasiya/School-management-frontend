import React from "react";

const CsvPreviewTable = ({ csvData }) => {
  // Guard against empty data
  if (!csvData || csvData.length === 0) {
    return null;
  }

  // Get headers from the first row of data
  const headers = Object.keys(csvData[0]);

  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="p-2 border">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {csvData.map((row, rowIndex) => (
            <tr key={rowIndex} className="even:bg-gray-50">
              {headers.map((header, colIndex) => (
                <td key={`${rowIndex}-${colIndex}`} className="p-2 border">
                  {row[header] || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CsvPreviewTable;
