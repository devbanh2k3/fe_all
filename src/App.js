import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
const TableContainer = styled.div`
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ccc;
  margin-top: 20px;
  background-color: #fff;
`;

const TableHeader = styled.th`
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
  background-color: #f2f2f2;
  font-weight: bold;
`;

const TableCell = styled.td`
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;

  /* Add color styles for different cells */
  &:nth-child(2) {
    background-color: #e6f5ff; /* Light blue for second column */
  }

  &:nth-child(3) {
    background-color: #ffcccc; /* Light red for third column */
  }

  &:nth-child(4) {
    background-color: #ffffcc; /* Light yellow for fourth column */
  }

  /* Add more styles for other cells if needed */
`;

const TableHeaderSticky = styled(TableHeader)`
  position: sticky;
  top: 0;
  background-color: #f2f2f2;
`;

const TableDataRow = styled.tr`
  /* Alternate row colors */
  &:nth-child(even) {
    background-color: #f9f9f9; /* Light gray for even rows */
  }

  &:nth-child(odd) {
    background-color: #f0f0f0; /* Lighter gray for odd rows */
  }
`;
const ExportButton = styled.button`
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;

  &:hover {
    background-color: #45a049;
  }
`;
function App() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Replace 'your_server_url' with the URL where your Node.js server is running
    const serverUrl = 'http://localhost:5000/api/getUserData';

    axios
      .post(serverUrl, {})
      .then((response) => {
        setResults(response.data);
        console.log('hello', response.data);
      })
      .catch((error) => {
        console.log('Error fetching data:', error);
      });
  }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.table_to_sheet(document.querySelector('table'));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'zalopay_data.xlsx');
  };
  return (
    <TableContainer>
      <h1>Kiểm tra hóa đơn tiền điện</h1>
      <Table>
        <thead>
          <tr>
            <TableHeaderSticky>#</TableHeaderSticky>
            <TableHeader>Mã khách hàng</TableHeader>
            <TableHeader>Số tiền</TableHeader>
            <TableHeader>Tên khách hàng</TableHeader>
            <TableHeader>Thời gian</TableHeader>
            <TableHeader>Status</TableHeader>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <TableDataRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{result != null ? result.makhachhang : ''}</TableCell>
              <TableCell>{result != null ? result.sotien : ''}</TableCell>
              <TableCell>{result != null ? result.tenkhachhang : ''}</TableCell>
              <TableCell>{result != null ? result.thoigian : ''}</TableCell>
              <TableCell>{result != null ? result.status : ''}</TableCell>
            </TableDataRow>
          ))}
        </tbody>
      </Table>
      <ExportButton onClick={exportToExcel}>Export to Excel</ExportButton>
    </TableContainer>
  );
}

export default App;
