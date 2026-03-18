import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Button, Upload, message, List, Modal, Form, DatePicker, Table, Tag, Input } from 'antd';
import { UploadOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import dayjs from 'dayjs';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchTechnicians();
    fetchMyBookings();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/users/technicians');
      setTechnicians(res.data);
    } catch (error) {
      message.error('Failed to load technicians in your area.');
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await api.get('/bookings/my-jobs');
      setBookings(res.data.bookings);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      message.warning('Please select an image first.');
      return;
    }
    const formData = new FormData();
    formData.append('image', file);

    setLoadingUpload(true);
    try {
      const res = await api.post('/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPredictionData(res.data);
      message.success('Image analyzed successfully.');
    } catch (error) {
      message.error('Error analyzing image.');
    } finally {
      setLoadingUpload(false);
    }
  };

  const showBookingModal = (tech) => {
    if (!predictionData) {
      message.warning('Please upload and analyze a panel image first.');
      return;
    }
    setSelectedTechnician(tech);
    setIsModalVisible(true);
  };

  const handleBookingConfirm = async (values) => {
    setBookingLoading(true);
    try {
      const payload = {
        name: user.name,
        email: user.email,
        panelIssue: predictionData.prediction,
        preferredDate: values.preferredDate.format('YYYY-MM-DD'),
        imageUrl: predictionData.imageUrl,
        prediction: predictionData.prediction,
        technicianId: selectedTechnician._id,
        technicianName: selectedTechnician.name,
        technicianPhone: selectedTechnician.phone
      };
      await api.post('/bookings', payload);
      message.success('Booking created successfully!');
      setIsModalVisible(false);
      fetchMyBookings();
    } catch (error) {
      message.error('Failed to create booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  const columns = [
    { title: 'Date', dataIndex: 'preferredDate', render: (date) => dayjs(date).format('YYYY-MM-DD') },
    { title: 'Issue', dataIndex: 'panelIssue', render: (issue) => <Tag color="red">{issue}</Tag> },
    { title: 'Technician', dataIndex: 'technicianName' },
    { title: 'Contact', dataIndex: 'technicianPhone' },
    { 
      title: 'Status', 
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#001529', padding: '0 20px' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>SolarCare User Portal</Title>
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
        <Title level={4}>Welcome, {user?.name}!</Title>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
          
          <Card title="1. Upload Faulty Panel Image" style={{ flex: 1, minWidth: '300px' }}>
            <Upload
              beforeUpload={(f) => { setFile(f); return false; }}
              maxCount={1}
              onRemove={() => setFile(null)}
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
            <Button 
              type="primary" 
              onClick={handleUpload} 
              loading={loadingUpload} 
              style={{ marginTop: '15px' }}
              disabled={!file}
            >
              Analyze Image
            </Button>

            {predictionData && (
              <div style={{ marginTop: '20px', padding: '15px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '5px' }}>
                <Text strong type="danger">Detected Issue: {predictionData.prediction.toUpperCase()}</Text>
                <br /><br />
                <Text>{predictionData.recommendation}</Text>
              </div>
            )}
          </Card>

          <Card title="2. Available Technicians in Your Area" style={{ flex: 1, minWidth: '400px' }}>
            <List
              itemLayout="horizontal"
              dataSource={technicians}
              renderItem={(tech) => (
                <List.Item
                  actions={[<Button type="primary" onClick={() => showBookingModal(tech)}>Book Now</Button>]}
                >
                  <List.Item.Meta
                    title={tech.name}
                    description={`Phone: ${tech.phone || 'N/A'}`}
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No technicians found in your location.' }}
            />
          </Card>

        </div>

        <Card title="Your Bookings">
          <Table 
            dataSource={bookings} 
            columns={columns} 
            rowKey="_id" 
            pagination={{ pageSize: 5 }} 
          />
        </Card>

        <Modal
          title={`Book Technician: ${selectedTechnician?.name}`}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <Form layout="vertical" onFinish={handleBookingConfirm}>
            <Form.Item label="Detected Issue">
              <Input value={predictionData?.prediction} disabled />
            </Form.Item>
            <Form.Item 
              name="preferredDate" 
              label="Preferred Date" 
              rules={[{ required: true, message: 'Please select a date!' }]}
            >
              <DatePicker style={{ width: '100%' }} disabledDate={(c) => c && c < dayjs().startOf('day')} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={bookingLoading} block>
                Confirm Booking
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default UserDashboard;
