import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
const StyledDiv = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

function UserList() {
  const [users, setUsers] = useState([]);

  const fetchData = () => {
    fetch('http://103.188.167.91/users')
      .then((response) => response.json())
      .then((data) => {
        // Sort the data by the "Last Update" property in descending order
        const sortedData = _.orderBy(data, ['update_time'], ['desc']);
        setUsers(sortedData);
      })
      .catch((error) => console.error('Error fetching user list:', error));
  };

  useEffect(() => {
    fetchData(); // Fetch user data from the server when the component mounts

    // Polling every 5 seconds to get updated data
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <StyledDiv>
      <h1>User List</h1>
      <StyledTable>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>UID</th>
            <th>Date of Birth</th>
            <th>Account Status</th>
            <th>Adtrust sl</th>
            <th>Amount Spent</th>
            <th>Currency</th>
            <th>Last Update</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.machine_name}</td>
              <td>{user.UID}</td>
              <td>{user.date_of_birth}</td>
              <td>{user.account_status}</td>
              <td>{user.adtrust_dsl}</td>
              <td>{user.amount_spent}</td>
              <td>{user.currency}</td>
              <td>{user.update_time}</td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledDiv>
  );
}

export default UserList;
