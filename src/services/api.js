import axios from 'axios';

// Bạn có thể thay đổi baseURL này cho đúng với cổng backend .NET của bạn (VD: 5001, 7000...)
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to normalize array data wrapped by .NET backend
apiClient.interceptors.response.use(response => {
  if (response.data) {
    if (response.data.$values !== undefined) {
      response.data = response.data.$values;
    } else if (response.data.value !== undefined && Array.isArray(response.data.value)) {
      response.data = response.data.value;
    }
  }
  return response;
}, error => {
  return Promise.reject(error);
});

export default {
  // 📘 COURSES
  getCourses() {
    return apiClient.get('/courses');
  },
  getCourse(id) {
    return apiClient.get(`/courses/${id}`);
  },
  createCourse(data) {
    return apiClient.post('/courses', data);
  },
  updateCourse(id, data) {
    return apiClient.put(`/courses/${id}`, data);
  },
  deleteCourse(id) {
    return apiClient.delete(`/courses/${id}`);
  },

  // 🏫 CLASSES
  getClasses() {
    return apiClient.get('/classes');
  },
  getClass(id) {
    return apiClient.get(`/classes/${id}`);
  },
  getClassesByCourse(courseId) {
    return apiClient.get(`/classes/course/${courseId}`);
  },
  async createClass(data) {
    return apiClient.post('/classes', data);
  },

  async updateClass(id, data) {
    let targetRoom = null;
    try {
      const res = await apiClient.get('/rooms');
      const roomsList = res.data.value || res.data;
      targetRoom = roomsList.find(r => r.roomId === data.roomId || r.roomId === Number(data.roomId));
    } catch (e) {
      console.error('Lỗi khi lấy thông tin phòng cập nhật:', e);
    }

    const putPayload = {
      ...data,
      room: targetRoom ? {
        roomId: targetRoom.roomId,
        roomName: targetRoom.roomName,
        status: targetRoom.status
      } : null
    };

    return apiClient.put(`/classes/${id}`, putPayload);
  },
  deleteClass(id) {
    return apiClient.delete(`/classes/${id}`);
  },

  // 📅 CLASS SCHEDULES
  getSchedules() {
    return apiClient.get('/schedules');
  },
  getSchedulesByClass(classId) {
    return apiClient.get(`/schedules/class/${classId}`);
  },
  createSchedule(data) {
    return apiClient.post('/schedules', data);
  },
  updateSchedule(id, data) {
    return apiClient.put(`/schedules/${id}`, data);
  },
  deleteSchedule(id) {
    return apiClient.delete(`/schedules/${id}`);
  },

  // 🏠 ROOMS
  getRooms() {
    return apiClient.get('/rooms');
  },
  createRoom(data) {
    return apiClient.post('/rooms', data);
  },
  updateRoom(id, data) {
    return apiClient.put(`/rooms/${id}`, data);
  },
  deleteRoom(id) {
    return apiClient.delete(`/rooms/${id}`);
  },

  // 🔥 JOIN / TIMETABLE
  getCourseInfo() {
    return apiClient.get('/course-info');
  },

  // 📝 RESCHEDULE REQUESTS (MOCK API using localStorage)
  // Trong tương lai, nếu backend có endpoint, chỉ cần đổi thành gọi apiClient.get/post/put
  getRescheduleRequests() {
    return new Promise((resolve) => {
      const requests = JSON.parse(localStorage.getItem('rescheduleRequests') || '[]');
      resolve({ data: requests });
    });
  },
  createRescheduleRequest(data) {
    return new Promise((resolve) => {
      const requests = JSON.parse(localStorage.getItem('rescheduleRequests') || '[]');
      const newRequest = {
        ...data,
        id: Date.now().toString(),
        status: 'PENDING', // PENDING, APPROVED, REJECTED
        createdAt: new Date().toISOString()
      };
      requests.push(newRequest);
      localStorage.setItem('rescheduleRequests', JSON.stringify(requests));
      resolve({ data: newRequest });
    });
  },
  updateRescheduleRequestStatus(id, status) {
    return new Promise((resolve, reject) => {
      const requests = JSON.parse(localStorage.getItem('rescheduleRequests') || '[]');
      const index = requests.findIndex(r => r.id === id);
      if (index !== -1) {
        requests[index].status = status;
        localStorage.setItem('rescheduleRequests', JSON.stringify(requests));
        resolve({ data: requests[index] });
      } else {
        reject(new Error('Không tìm thấy yêu cầu'));
      }
    });
  }
};
