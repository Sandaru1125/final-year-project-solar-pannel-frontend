import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Typography, 
  Card, 
  Button, 
  Upload, 
  message, 
  List, 
  Modal, 
  Form, 
  DatePicker, 
  Table, 
  Tag, 
  Input, 
  Steps, 
  Result, 
  Avatar, 
  Badge, 
  Space, 
  Divider, 
  Tooltip, 
  Alert, 
  Empty, 
  Row, 
  Col, 
  Statistic,
  Select
} from 'antd';
import { 
  UploadOutlined, 
  LogoutOutlined, 
  CalendarOutlined, 
  UserOutlined, 
  PhoneOutlined, 
  CheckCircleOutlined, 
  WarningOutlined, 
  ExperimentOutlined, 
  TeamOutlined, 
  HistoryOutlined, 
  HomeOutlined,
  EnvironmentOutlined,
  IdcardOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import dayjs from 'dayjs';
import './UserDashboard.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [predictionData, setPredictionData] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0
  });

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

  useEffect(() => {
    if (fileList.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(fileList[0].originFileObj || fileList[0]);
    } else {
      setPreviewImage(null);
    }
  }, [fileList]);

  useEffect(() => {
    // Update step based on prediction and bookings
    if (predictionData) {
      setActiveStep(1);
    }
    if (bookings.length > 0) {
      setActiveStep(2);
    }
  }, [predictionData, bookings]);

  useEffect(() => {
    // Calculate stats
    const completed = bookings.filter(b => b.status === 'completed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    setStats({
      totalBookings: bookings.length,
      completedBookings: completed,
      pendingBookings: pending
    });
  }, [bookings]);

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/users/technicians');
      setTechnicians(res.data);
    } catch (error) {
      message.error({
        content: 'Failed to load technicians in your area.',
        icon: <WarningOutlined />
      });
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
    if (!fileList.length) {
      message.warning('Please select an image first.');
      return;
    }
    
    const formData = new FormData();
    formData.append('image', fileList[0].originFileObj || fileList[0]);

    setLoadingUpload(true);
    try {
      const res = await api.post('/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // You can show progress if needed
        }
      });
      setPredictionData(res.data);
      message.success({
        content: 'Image analyzed successfully!',
        icon: <CheckCircleOutlined />
      });
      setActiveStep(1);
    } catch (error) {
      message.error('Error analyzing image. Please try again.');
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
        preferredTime: values.preferredTime,
        imageUrl: predictionData.imageUrl,
        prediction: predictionData.prediction,
        technicianId: selectedTechnician._id,
        technicianName: selectedTechnician.firstName ? `${selectedTechnician.firstName} ${selectedTechnician.lastName}` : selectedTechnician.name,
        technicianPhone: selectedTechnician.phone
      };
      await api.post('/bookings', payload);
      message.success({
        content: 'Booking created successfully!',
        icon: <CheckCircleOutlined />
      });
      setIsModalVisible(false);
      setFileList([]);
      setPredictionData(null);
      fetchMyBookings();
    } catch (error) {
      message.error('Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    { 
      title: 'Date', 
      dataIndex: 'preferredDate', 
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format('DD MMM YYYY')}
        </Space>
      ),
      sorter: (a, b) => dayjs(a.preferredDate).unix() - dayjs(b.preferredDate).unix()
    },
    { 
      title: 'Issue', 
      dataIndex: 'panelIssue', 
      render: (issue) => (
        <Tooltip title="Detected panel issue">
          <Tag color="error" icon={<WarningOutlined />}>
            {issue.toUpperCase()}
          </Tag>
        </Tooltip>
      )
    },
    { 
      title: 'Technician', 
      dataIndex: 'technicianName',
      render: (name) => (
        <Space>
          <UserOutlined />
          {name}
        </Space>
      )
    },
    { 
      title: 'Contact', 
      dataIndex: 'technicianPhone',
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          {phone || 'N/A'}
        </Space>
      )
    },
    { 
      title: 'Status', 
      dataIndex: 'status',
      render: (status) => (
        <Badge 
          status={getStatusColor(status)} 
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Completed', value: 'completed' },
        { text: 'Cancelled', value: 'cancelled' }
      ],
      onFilter: (value, record) => record.status === value
    }
  ];

  const uploadProps = {
    onRemove: (file) => {
      setFileList([]);
      setPredictionData(null);
      setPreviewImage(null);
    },
    beforeUpload: (file) => {
      const isValidImage = file.type.startsWith('image/');
      if (!isValidImage) {
        message.error('You can only upload image files!');
        return false;
      }
      const isLessThan5MB = file.size / 1024 / 1024 < 5;
      if (!isLessThan5MB) {
        message.error('Image must be smaller than 5MB!');
        return false;
      }
      setFileList([file]);
      return false;
    },
    fileList,
    maxCount: 1,
    listType: 'picture-card',
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
    onPreview: async (file) => {
      if (!file.url && !file.preview) {
        file.preview = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file.originFileObj);
          reader.onload = () => resolve(reader.result);
        });
      }
      const previewUrl = file.url || file.preview;
      setPreviewImage(previewUrl);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <HomeOutlined style={{ color: 'white', fontSize: '24px' }} />
          <Title level={3} style={{ color: 'white', margin: 0, letterSpacing: '1px' }}>
            SolarCare User Portal
          </Title>
        </div>
        <Space size="large">
          <Badge count={stats.pendingBookings} style={{ backgroundColor: '#52c41a' }}>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
          </Badge>
          <Button 
            type="primary" 
            danger 
            icon={<LogoutOutlined />} 
            onClick={() => { 
              localStorage.clear(); 
              navigate('/login');
            }}
            style={{ borderRadius: '6px' }}
          >
            Logout
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Welcome Section */}
        <Card style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>Welcome back, {user?.name}! 👋</Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                {user?.email} • Member since {dayjs(user?.createdAt).format('MMMM YYYY')}
              </Text>
            </div>
            <Space size="large">
              <Statistic 
                title="Total Bookings" 
                value={stats.totalBookings} 
                prefix={<HistoryOutlined />}
              />
              <Statistic 
                title="Completed" 
                value={stats.completedBookings} 
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              />
            </Space>
          </div>
        </Card>

        {/* Progress Steps */}
        <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
          <Steps
            current={activeStep}
            items={[
              {
                title: 'Upload Image',
                description: 'Take a photo of your solar panel',
                icon: <UploadOutlined />,
              },
              {
                title: 'Get Analysis',
                description: 'AI-powered issue detection',
                icon: <ExperimentOutlined />,
              },
              {
                title: 'Book Technician',
                description: 'Schedule a service visit',
                icon: <TeamOutlined />,
              },
            ]}
          />
        </Card>

        <Row gutter={[24, 24]}>
          {/* Left Column - Image Upload */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <UploadOutlined style={{ color: '#1890ff' }} />
                  <span>1. Upload Faulty Panel Image</span>
                </Space>
              }
              style={{ borderRadius: '12px', height: '100%' }}
              extra={
                predictionData && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    Analysis Complete
                  </Tag>
                )
              }
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Upload {...uploadProps}>
                  {fileList.length === 0 && (
                    <div>
                      <UploadOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                      <div style={{ marginTop: 8 }}>Click or drag image to upload</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Supports: JPG, PNG (Max 5MB)
                      </Text>
                    </div>
                  )}
                </Upload>
              </div>

              {previewImage && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <Divider>Preview</Divider>
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '200px', 
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }} 
                  />
                </div>
              )}

              <Button 
                type="primary"
                size="large"
                icon={<ExperimentOutlined />}
                onClick={handleUpload}
                loading={loadingUpload}
                disabled={!fileList.length}
                block
                style={{ 
                  marginTop: '20px',
                  height: '45px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Analyze Image
              </Button>

              {predictionData && (
                <Result
                  status="success"
                  title="Issue Detected"
                  subTitle={predictionData.prediction.toUpperCase()}
                  extra={[
                    <Alert
                      message="Recommendation"
                      description={predictionData.recommendation}
                      type="info"
                      showIcon
                      style={{ textAlign: 'left' }}
                    />
                  ]}
                  style={{ padding: '20px 0' }}
                />
              )}
            </Card>
          </Col>

          {/* Right Column - Technicians */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <TeamOutlined style={{ color: '#1890ff' }} />
                  <span>2. Available Technicians in Your Area</span>
                </Space>
              }
              style={{ borderRadius: '12px', height: '100%' }}
              extra={
                <Badge count={technicians.length} style={{ backgroundColor: '#52c41a' }} />
              }
            >
              {technicians.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={technicians}
                  renderItem={(tech) => (
                    <List.Item
                      actions={[
                        <Button 
                          type="primary"
                          ghost
                          icon={<CalendarOutlined />}
                          onClick={() => showBookingModal(tech)}
                          disabled={!predictionData}
                        >
                          Book Now
                        </Button>
                      ]}
                      style={{ 
                        padding: '16px',
                        borderRadius: '8px',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                      }}
                      className="technician-list-item"
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            size={48} 
                            icon={<UserOutlined />}
                            style={{ backgroundColor: '#87d068' }}
                          />
                        }
                        title={
                          <Space>
                            <Text strong>{tech.firstName ? `${tech.firstName} ${tech.lastName}` : tech.name}</Text>
                            <Badge status="success" text="Available" />
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small">
                            <Space>
                              <PhoneOutlined />
                              {tech.phone || 'No phone number'}
                            </Space>
                            <Space>
                              <EnvironmentOutlined />
                              {tech.location || 'Location not specified'}
                            </Space>
                            <Space>
                              <IdcardOutlined />
                              ID: {tech._id}
                            </Space>
                            <Text type="secondary">
                              Experience: {tech.experience || 'N/A'} years
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  description="No technicians found in your location" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}

              {!predictionData && technicians.length > 0 && (
                <Alert
                  message="Upload an image first to book a technician"
                  type="info"
                  showIcon
                  style={{ marginTop: '16px' }}
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* Bookings Table */}
        <Card 
          title={
            <Space>
              <HistoryOutlined style={{ color: '#1890ff' }} />
              <span>Your Booking History</span>
            </Space>
          }
          style={{ marginTop: '24px', borderRadius: '12px' }}
        >
          <Table 
            dataSource={bookings} 
            columns={columns} 
            rowKey="_id" 
            pagination={{ 
              pageSize: 5,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} bookings`
            }}
            locale={{
              emptyText: (
                <Empty 
                  description="No bookings yet" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )
            }}
          />
        </Card>

        {/* Booking Modal */}
        <Modal
          title={
            <Space>
              <CalendarOutlined />
              <span>Book Technician: {selectedTechnician?.name}</span>
            </Space>
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={500}
          centered
          destroyOnClose
        >
          <Form layout="vertical" onFinish={handleBookingConfirm}>
            <Form.Item label="Detected Issue">
              <Input 
                value={predictionData?.prediction} 
                disabled 
                prefix={<WarningOutlined />}
                style={{ color: '#f5222d' }}
              />
            </Form.Item>
            
            <Form.Item 
              name="preferredDate" 
              label="Preferred Date" 
              rules={[{ required: true, message: 'Please select a date!' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                disabledDate={(c) => c && c < dayjs().startOf('day')}
                format="DD MMM YYYY"
              />
            </Form.Item>

            <Form.Item 
              name="preferredTime" 
              label="Preferred Time" 
              rules={[{ required: true, message: 'Please select a time!' }]}
            >
              <Select placeholder="Select time slot">
                <Option value="09:00">09:00 AM</Option>
                <Option value="10:00">10:00 AM</Option>
                <Option value="11:00">11:00 AM</Option>
                <Option value="14:00">02:00 PM</Option>
                <Option value="15:00">03:00 PM</Option>
                <Option value="16:00">04:00 PM</Option>
              </Select>
            </Form.Item>

            <Divider />

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={bookingLoading}
                block
                size="large"
                icon={<CheckCircleOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  height: '45px',
                  borderRadius: '8px'
                }}
              >
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