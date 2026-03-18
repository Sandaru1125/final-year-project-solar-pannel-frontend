import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Button, Table, message, Tabs, Tag } from 'antd';
import { LogoutOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import dayjs from 'dayjs';

const { Header, Content } = Layout;
const { Title } = Typography;

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchBookings();
    fetchUsers();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.bookings);
    } catch (error) {
      message.error('Failed to load bookings');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/normal');
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const promoteUser = async (id) => {
    try {
      await api.put(`/users/make-technician/${id}`);
      message.success('User promoted to technician');
      fetchUsers();
    } catch (error) {
      message.error('Failed to promote user');
    }
  };

  const bookingColumns = [
    { title: 'Date', dataIndex: 'preferredDate', render: (d) => dayjs(d).format('YYYY-MM-DD') },
    { title: 'Client', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Issue', dataIndex: 'panelIssue' },
    { title: 'Technician', dataIndex: 'technicianName', render: (t) => t || 'Unassigned' },
    { 
      title: 'Status', 
      dataIndex: 'status',
      render: (s) => <Tag color={s === 'completed' ? 'green' : s === 'pending' ? 'orange' : 'red'}>{s.toUpperCase()}</Tag>
    }
  ];

  const userColumns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Location', dataIndex: 'location' },
    { title: 'Phone', dataIndex: 'phone' },
    { 
      title: 'Action', 
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<UserAddOutlined />}
          onClick={() => promoteUser(record._id)}
        >
          Make Technician
        </Button>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#001529', padding: '0 20px' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>Admin Portal</Title>
        <Button 
          type="primary" 
          danger 
          icon={<LogoutOutlined />} 
          onClick={() => { localStorage.clear(); navigate('/login'); }}
        >
          Logout
        </Button>
      </Header>
      
      <Content style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Tabs defaultActiveKey="1" items={[
          {
            key: '1',
            label: 'All Bookings',
            children: (
              <Card>
                <Table dataSource={bookings} columns={bookingColumns} rowKey="_id" pagination={{ pageSize: 10 }} />
              </Card>
            )
          },
          {
            key: '2',
            label: 'Manage Users',
            children: (
              <Card>
                <Table dataSource={users} columns={userColumns} rowKey="_id" pagination={{ pageSize: 10 }} />
              </Card>
            )
          }
        ]} />
      </Content>
    </Layout>
  );
};

export default AdminDashboard;
