// ═══════════════════════════════════════════════════════════════
// MOCK DATA - Đồng bộ 100% với Full Stack Picture
// ═══════════════════════════════════════════════════════════════

export const students = [
  { id:1, code:'HV-001', name:'Nguyễn Minh Tuấn', course:'Lập trình Java Web & Spring Boot', enrollDate:'12/01/2026', attendance:92, feeStatus:'Đã đóng', status:'Đang học', phone:'0901111222' },
  { id:2, code:'HV-002', name:'Trần Thị Lan', course:'Lập trình Java Web & Spring Boot', enrollDate:'05/03/2026', attendance:78, feeStatus:'Còn nợ', status:'Đang học', phone:'0902222333' },
  { id:3, code:'HV-003', name:'Lê Văn Hùng', course:'Lập trình Web Frontend', enrollDate:'20/02/2026', attendance:65, feeStatus:'Chưa đóng', status:'Đang học', phone:'0903333444' },
  { id:4, code:'HV-004', name:'Phạm Thu Hà', course:'Lập trình Web Frontend', enrollDate:'10/01/2026', attendance:97, feeStatus:'Đã đóng', status:'Hoàn thành', phone:'0904444555' },
  { id:5, code:'HV-0244', name:'Hoàng Đức Nam', course:'Lập trình Java Web & Spring Boot', enrollDate:'15/01/2026', attendance:96, feeStatus:'Đã đóng', status:'Đang học', phone:'0905555666' },
  { id:6, code:'HV-0312', name:'Nguyễn Văn An', course:'Cấu trúc dữ liệu & Giải thuật', enrollDate:'03/03/2025', attendance:92, feeStatus:'Đã đóng', status:'Đang học', phone:'0906666777' },
  { id:7, code:'HV-0295', name:'Trần Thị Bích', course:'Cấu trúc dữ liệu & Giải thuật', enrollDate:'05/03/2025', attendance:78, feeStatus:'Chờ TT', status:'Đang học', phone:'0907777888' },
  { id:8, code:'HV-0278', name:'Lê Minh Khoa', course:'Lập trình Web Frontend', enrollDate:'10/04/2025', attendance:88, feeStatus:'Đã đóng', status:'Đang học', phone:'0908888999' },
  { id:9, code:'HV-0261', name:'Phạm Thu Hà', course:'Cấu trúc dữ liệu & Giải thuật', enrollDate:'15/04/2025', attendance:65, feeStatus:'Nợ HF', status:'Đang học', phone:'0909999000' },
  { id:10, code:'HV-012', name:'Vũ Minh Khoa', course:'Cấu trúc dữ liệu & Giải thuật', enrollDate:'20/03/2026', attendance:85, feeStatus:'Còn nợ', status:'Đang học', phone:'0901010101' },
]

export const courses = [
  { id:1, name:'Lập trình Web Frontend', code:'LH-IELTS-INT-2025A', level:'Trung cấp', teacher:'Nguyễn Thị Lan', schedule:'Thứ 2, 4, 6', time:'07:30 – 09:00', room:'Phòng 201', students:22, maxStudents:25, weeks:16, currentWeek:8, fee:4500000, status:'Đang mở' },
  { id:2, name:'Cấu trúc dữ liệu & Giải thuật', code:'LH-TOEIC-600-2025B', level:'Trung cấp', teacher:'Nguyễn Thị Lan', schedule:'Thứ 3, 5, 7', time:'14:00 – 15:30', room:'Phòng 105', students:18, maxStudents:20, weeks:12, currentWeek:6, fee:3500000, status:'Đang mở' },
  { id:3, name:'Cấu trúc dữ liệu & Giải thuật', code:'LH-GT-CB-2025C', level:'Sơ cấp', teacher:'Hoàng Anh', schedule:'Thứ 2, 4, 6', time:'17:30 – 19:00', room:'Phòng 302', students:25, maxStudents:30, weeks:10, currentWeek:4, fee:2400000, status:'Đang mở' },
  { id:4, name:'Cấu trúc dữ liệu & Giải thuật', code:'LH-IELTS-ADV-2025A', level:'Nâng cao', teacher:'Nguyễn Thị Lan', schedule:'Thứ 2, 5, 7', time:'09:30 – 11:00', room:'Phòng 401', students:22, maxStudents:25, weeks:20, currentWeek:10, fee:5500000, status:'Đang mở' },
  { id:5, name:'Lập trình Java Web & Spring Boot', code:'LH-B1-A-2026', level:'Trung cấp', teacher:'Minh Châu', schedule:'Thứ 2, 4, 6', time:'07:30 – 09:00', room:'P.201', students:22, maxStudents:25, weeks:16, currentWeek:8, fee:3600000, status:'Đang mở' },
  { id:6, name:'Lập trình Java Web & Spring Boot', code:'LH-THVP-C1', level:'Sơ cấp', teacher:'Thanh Hải', schedule:'Thứ 2, 4, 6', time:'09:00 – 10:30', room:'Lab 1', students:20, maxStudents:25, weeks:12, currentWeek:6, fee:2400000, status:'Đang mở' },
  { id:7, name:'Lập trình Web Frontend', code:'LH-JP-N4-B', level:'Trung cấp', teacher:'Yuki Sato', schedule:'Thứ 2, 4, 6', time:'09:00 – 10:30', room:'P.304', students:15, maxStudents:20, weeks:16, currentWeek:8, fee:4200000, status:'Đang mở' },
  { id:8, name:'Lập trình Web Frontend', code:'LH-B1-B-2026', level:'Trung cấp', teacher:'Minh Châu', schedule:'Thứ 2, 4, 6', time:'17:30 – 19:00', room:'P.201', students:20, maxStudents:25, weeks:16, currentWeek:8, fee:3600000, status:'Đang mở' },
  { id:9, name:'Cấu trúc dữ liệu & Giải thuật', code:'LH-KNGT-2026', level:'Sơ cấp', teacher:'Hoàng Anh', schedule:'Thứ 2, 4, 6', time:'13:30 – 15:00', room:'P.102', students:18, maxStudents:25, weeks:10, currentWeek:5, fee:1800000, status:'Đang mở' },
  { id:10, name:'Cấu trúc dữ liệu & Giải thuật', code:'LH-PY-2026', level:'Trung cấp', teacher:'Đức Hùng', schedule:'Thứ 2, 4, 6', time:'17:30 – 19:00', room:'Lab 2', students:15, maxStudents:20, weeks:12, currentWeek:6, fee:3000000, status:'Đang mở' },
  { id:11, name:'Cấu trúc dữ liệu & Giải thuật', code:'LH-JP-N4-A', level:'Trung cấp', teacher:'Yuki Sato', schedule:'Thứ 3, 5, 7', time:'19:00 – 20:30', room:'P.304', students:18, maxStudents:20, weeks:16, currentWeek:10, fee:4200000, status:'Đang mở' },
  { id:12, name:'Lập trình Java Web & Spring Boot', code:'LH-TOEIC-450', level:'Sơ cấp', teacher:'Minh Châu', schedule:'Thứ 3, 5, 7', time:'09:00 – 10:30', room:'P.202', students:20, maxStudents:25, weeks:10, currentWeek:4, fee:2800000, status:'Đang mở' },
]

export const registrations = [
  { id:1, studentName:'Trần Thị Lan', courseName:'Lập trình Java Web & Spring Boot', requestClass:'Ca tối', registerDate:'27/05/2026', note:'Học lại từ đầu', status:'Chờ duyệt' },
  { id:2, studentName:'Lê Văn Hùng', courseName:'Cấu trúc dữ liệu & Giải thuật', requestClass:'Cuối tuần', registerDate:'26/05/2026', note:'', status:'Chờ duyệt' },
  { id:3, studentName:'Hoàng Đức Nam', courseName:'Lập trình Java Web & Spring Boot', requestClass:'Ca sáng', registerDate:'24/05/2026', note:'Có chứng chỉ A1', status:'Chờ duyệt' },
]

export const attendanceToday = [
  { id:1, studentName:'Nguyễn Minh Tuấn', code:'HV-001', status:'', note:'' },
  { id:2, studentName:'Trần Thị Lan', code:'HV-002', status:'', note:'' },
  { id:3, studentName:'Hoàng Đức Nam', code:'HV-0244', status:'', note:'' },
  { id:4, studentName:'Phạm Thu Hà', code:'HV-004', status:'', note:'' },
  { id:5, studentName:'Bùi Thanh Tùng', code:'HV-005', status:'', note:'' },
]

export const attendanceStats = [
  { name:'Nguyễn Minh Tuấn', present:22, absent:2, rate:92 },
  { name:'Trần Thị Lan', present:18, absent:6, rate:75 },
  { name:'Hoàng Đức Nam', present:23, absent:1, rate:96 },
  { name:'Phạm Thu Hà', present:21, absent:3, rate:87 },
]

export const scoresAdmin = [
  { id:1, name:'Nguyễn Minh Tuấn', code:'HV-001', theory:8.5, practical:7.0, project:8.0, average:7.8, grade:'Giỏi' },
  { id:2, name:'Trần Thị Lan', code:'HV-002', theory:6.0, practical:6.5, project:7.0, average:6.5, grade:'Khá' },
  { id:3, name:'Hoàng Đức Nam', code:'HV-0244', theory:9.0, practical:8.5, project:9.5, average:9.0, grade:'Xuất sắc' },
  { id:4, name:'Lê Văn Hùng', code:'HV-003', theory:5.0, practical:5.0, project:5.5, average:5.0, grade:'Trung bình' },
]

export const scoresTeacher = [
  { id:1, name:'Nguyễn Văn An', code:'HV-0312', practical:7, assignment:8, theory:7.5, project:8, total:7.6, grade:'Khá' },
  { id:2, name:'Trần Thị Bích', code:'HV-0295', practical:8.5, assignment:9, theory:8.5, project:8.5, total:8.5, grade:'Giỏi' },
  { id:3, name:'Lê Minh Khoa', code:'HV-0278', practical:6, assignment:6.5, theory:6.0, project:7, total:6.4, grade:'TB' },
  { id:4, name:'Phạm Thu Hà', code:'HV-0261', practical:5.5, assignment:6, theory:5.5, project:5.5, total:5.5, grade:'TB' },
  { id:5, name:'Hoàng Đức Nam', code:'HV-0244', practical:9, assignment:8.5, theory:9.0, project:9.5, total:9.0, grade:'Giỏi' },
]

export const teacherStudents = [
  { name:'Nguyễn Văn An', code:'HV-0312', course:'Cấu trúc dữ liệu & Giải thuật', attendance:92, avg:7.8, feeStatus:'Đã đóng' },
  { name:'Trần Thị Bích', code:'HV-0295', course:'Cấu trúc dữ liệu & Giải thuật', attendance:78, avg:8.2, feeStatus:'Chờ TT' },
  { name:'Lê Minh Khoa', code:'HV-0278', course:'Lập trình Web Frontend', attendance:88, avg:6.5, feeStatus:'Đã đóng' },
  { name:'Phạm Thu Hà', code:'HV-0261', course:'Cấu trúc dữ liệu & Giải thuật', attendance:65, avg:5.9, feeStatus:'Nợ HF' },
]

export const teacherAttendanceList = [
  { id:1, name:'Nguyễn Văn An', code:'HV-0312', status:'P' },
  { id:2, name:'Trần Thị Bích', code:'HV-0295', status:'P' },
  { id:3, name:'Lê Minh Khoa', code:'HV-0278', status:'' },
  { id:4, name:'Phạm Thu Hà', code:'HV-0261', status:'' },
  { id:5, name:'Hoàng Đức Nam', code:'HV-0244', status:'P' },
  { id:6, name:'Vũ Quốc Tuấn', code:'HV-0229', status:'P' },
  { id:7, name:'Nguyễn Thị Lan', code:'HV-0215', status:'' },
  { id:8, name:'Đặng Minh Trí', code:'HV-0201', status:'' },
  { id:9, name:'Bùi Thị Mai', code:'HV-0187', status:'P' },
  { id:10, name:'Lý Văn Hùng', code:'HV-0173', status:'P' },
]

export const leaveRequests = [
  { id:1, studentName:'Nguyễn Văn An', course:'Cấu trúc dữ liệu & Giải thuật', leaveDate:'02/06/2025', reason:'Bận việc gia đình', sentAt:'Hôm nay 08:30', status:'Chờ duyệt' },
  { id:2, studentName:'Trần Thị Bích', course:'Cấu trúc dữ liệu & Giải thuật', leaveDate:'03/06/2025', reason:'Khám sức khoẻ định kỳ', sentAt:'Hôm qua 20:15', status:'Chờ duyệt' },
  { id:3, studentName:'Lê Minh Khoa', course:'Lập trình Web Frontend', leaveDate:'28/05/2025', reason:'Đi công tác', sentAt:'3 ngày trước', status:'Đã duyệt' },
  { id:4, studentName:'Phạm Thu Hà', course:'Cấu trúc dữ liệu & Giải thuật', leaveDate:'25/05/2025', reason:'Bệnh (có giấy xác nhận)', sentAt:'5 ngày trước', status:'Từ chối' },
]

export const tuitionReceipts = [
  { id:'PT-2026-0542', studentName:'Nguyễn Minh Tuấn', course:'Lập trình Java Web & Spring Boot', amount:3600000, date:'28/05/2026', method:'Chuyển khoản', status:'Đã thu' },
  { id:'PT-2026-0541', studentName:'Phạm Thu Hà', course:'Lập trình Java Web & Spring Boot', amount:3600000, date:'27/05/2026', method:'Tiền mặt', status:'Đã thu' },
  { id:'PT-2026-0540', studentName:'Trần Thị Lan', course:'Cấu trúc dữ liệu & Giải thuật', amount:1200000, date:'25/05/2026', method:'Tiền mặt', status:'Đóng 1 phần' },
  { id:'PT-2026-0539', studentName:'Lê Văn Hùng', course:'Lập trình Web Frontend', amount:4200000, date:'', method:'—', status:'Chưa đóng' },
]

export const debtList = [
  { name:'Lê Văn Hùng', code:'HV-003', course:'Lập trình Web Frontend', totalFee:4200000, paid:0, remaining:4200000, deadline:'Quá hạn 15 ngày', urgency:'danger' },
  { name:'Trần Thị Lan', code:'HV-002', course:'Cấu trúc dữ liệu & Giải thuật', totalFee:2400000, paid:1200000, remaining:1200000, deadline:'Còn 7 ngày', urgency:'warning' },
  { name:'Vũ Minh Khoa', code:'HV-012', course:'Cấu trúc dữ liệu & Giải thuật', totalFee:1800000, paid:900000, remaining:900000, deadline:'Còn 3 ngày', urgency:'warning' },
]

export const scheduleAdmin = [
  { time:'07:30', items:[{name:'Lập trình Java Web & Spring Boot', room:'P.201', teacher:'GV: Minh Châu', color:'blue'}] },
  { time:'09:00', items:[{name:'Lập trình Java Web & Spring Boot', room:'Lab 1', teacher:'GV: Thanh Hải', color:'green'}, {name:'Lập trình Web Frontend', room:'P.304', teacher:'GV: Yuki Sato', color:'yellow'}] },
  { time:'13:30', items:[{name:'Cấu trúc dữ liệu & Giải thuật', room:'P.102', teacher:'GV: Hoàng Anh', color:'red'}] },
  { time:'17:30', items:[{name:'Lập trình Web Frontend', room:'P.201', teacher:'GV: Minh Châu', color:'blue'}, {name:'Cấu trúc dữ liệu & Giải thuật', room:'Lab 2', teacher:'GV: Đức Hùng', color:'purple'}] },
  { time:'19:00', items:[{name:'Cấu trúc dữ liệu & Giải thuật', room:'P.304', teacher:'GV: Yuki Sato', color:'green'}] },
]

export const curriculum = [
  { weeks:'Tuần 1-2', name:'Listening Foundation', desc:'Part 1 & 2 · Photographs, Question-Response · 200 từ vựng cơ bản', status:'done' },
  { weeks:'Tuần 3-4', name:'Reading Comprehension Basics', desc:'Part 5 & 6 · Grammar: Tenses, Articles · Incomplete Sentences', status:'done' },
  { weeks:'Tuần 5-6', name:'Listening Advanced', desc:'Part 3 & 4 · Conversations, Talks · 300 từ vựng Business', status:'done' },
  { weeks:'Tuần 7-8', name:'Reading Full Practice', desc:'Part 7 · Single & Multiple Passages · Scanning techniques', status:'current' },
  { weeks:'Tuần 9-10', name:'Mixed Test Practice', desc:'Full TOEIC simulation · Mini-test 5 buổi · Review sai lầm phổ biến', status:'upcoming' },
  { weeks:'Tuần 11', name:'Vocabulary Intensive', desc:'600 từ TOEIC trọng điểm · Idioms & Collocations · Word families', status:'upcoming' },
  { weeks:'Tuần 12', name:'Final Exam Preparation', desc:'Full mock test · Chiến lược làm bài · Ôn tập toàn bộ', status:'upcoming' },
]

export const studentScheduleWeek = [
  { day:'Thứ 3', slots:[{time:'14:00', name:'Cấu trúc dữ liệu & Giải thuật', room:'P.105', status:'Đã học ✓'}] },
  { day:'Thứ 5', slots:[{time:'14:00', name:'Cấu trúc dữ liệu & Giải thuật', room:'P.105', status:'Đã học ✓'}] },
  { day:'Thứ 6', slots:[{time:'14:00', name:'Cấu trúc dữ liệu & Giải thuật', room:'P.105', status:'Hôm nay'}] },
  { day:'Thứ 7', slots:[{time:'14:00', name:'Cấu trúc dữ liệu & Giải thuật', room:'P.105', status:''}] },
]

export const notifications = [
  { text:'Kiểm tra giữa kỳ vào ngày 10/06/2025', from:'Từ GV Nguyễn Thị Lan · 2 ngày trước', type:'exam' },
  { text:'Đơn xin nghỉ ngày 02/06 đã được duyệt', from:'Hệ thống · Hôm nay 09:00', type:'system' },
  { text:'Nhắc nhở: Hoàn thành bài tập Unit 7', from:'Từ GV Nguyễn Thị Lan · 3 ngày trước', type:'reminder' },
]

export const rules = [
  { num:1, title:'Giờ giấc', text:'Học viên phải có mặt trước giờ học ít nhất 5 phút. Đến trễ quá 15 phút sẽ bị tính vắng.' },
  { num:2, title:'Điểm danh', text:'Học viên vắng mặt quá 30% tổng số buổi sẽ không đủ điều kiện thi cuối kỳ.' },
  { num:3, title:'Xin nghỉ', text:'Phải gửi đơn qua hệ thống trước 24 giờ. Tối đa 3 buổi nghỉ có phép/kỳ học.' },
  { num:4, title:'Thiết bị', text:'Tắt hoặc để yên lặng điện thoại trong giờ học. Không được sử dụng điện thoại cá nhân trong buổi học.' },
  { num:5, title:'Trang phục', text:'Mặc trang phục lịch sự, phù hợp môi trường học thuật.' },
]

export const studyRules = [
  { num:6, text:'Bài tập: Hoàn thành đầy đủ bài tập về nhà trước buổi học kế tiếp.' },
  { num:7, text:'Kiểm tra: Tham dự đầy đủ các bài kiểm tra định kỳ. Vắng thi phải có lý do chính đáng và thông báo trước.' },
  { num:8, text:'Học phí: Đóng học phí đúng hạn. Quá hạn 15 ngày sẽ bị tạm ngưng học đến khi hoàn tất nghĩa vụ.' },
]

export const graduationReqs = [
  { text:'Điểm danh ≥ 70% tổng số buổi', met:true },
  { text:'Điểm trung bình ≥ 5.0/10', met:true },
  { text:'Tham dự bài kiểm tra cuối kỳ', met:true },
  { text:'Hoàn tất học phí', met:true },
]
