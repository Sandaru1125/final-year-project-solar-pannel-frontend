import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Button, Table, message, Select, Tag } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import dayjs from 'dayjs';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const TechnicianDashboard = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'technician') {
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await api.get('/bookings/my-jobs');
      setBookings(res.data.bookings);
    } catch (error) {
      console.error(error);
      message.error('Failed to load your assigned jobs.');
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      message.success('Status updated successfully');
      fetchMyJobs();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const columns = [
    { title: 'Booking Date', dataIndex: 'preferredDate', render: (date) => dayjs(date).format('YYYY-MM-DD') },
    { title: 'Client Name', dataIndex: 'name' },
    { title: 'Panel Issue', dataIndex: 'panelIssue', render: (issue) => <Tag color="red">{issue}</Tag> },
    { title: 'Address', dataIndex: 'address' },
    { title: 'Telephone', dataIndex: 'telephone' },
    { 
      title: 'Status', 
      dataIndex: 'status',
      render: (status, record) => (
        <Select 
          value={status} 
          style={{ width: 120 }} 
          onChange={(val) => handleStatusChange(record._id, val)}
          disabled={status === 'completed' || status === 'cancelled'}
        >
          <Option value="pending">Pending</Option>
          <Option value="completed">Completed</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#001529', padding: '0 20px' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>Technician Portal</Title>
        <Button 
          type="primary" 
          danger 
          icon={<LogoutOutlined />} 
          onClick={() => { localStorage.clear(); navigate('/login'); }}
        >
          Logout
        </Button>
      </Header>
      <Content style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <Title level={4}>Welcome, Technician {user?.name}</Title>
        <Card title="Your Assigned Jobs">
          <Table 
            dataSource={bookings} 
            columns={columns} 
            rowKey="_id" 
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default TechnicianDashboard;
