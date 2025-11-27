// services/courseService.js
const Course = require('../models/Course');

class CourseService {
  async getCoursesForUser(user, { page = 1, limit = 10, search, semester, year }) {
    const filters = {};

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (semester) filters.semester = semester;
    if (year) filters.year = parseInt(year);

    // Role-based visibility
    if (['instructor', 'admin'].includes(user.role)) {
      filters.$or = [
        ...(filters.$or || []),
        { instructor: user._id },
        { teachingAssistants: user._id },
        { students: user._id },
      ];
    } else {
      filters.students = user._id;
    }

    const courses = await Course.find(filters)
      .populate('instructor', 'firstName lastName email')
      .populate('teachingAssistants', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(filters);

    return {
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
  }

  async getCourseById(id) {
    const course = await Course.findById(id)
      .populate('instructor', 'firstName lastName email')
      .populate('teachingAssistants', 'firstName lastName email')
      .populate('students', 'firstName lastName email studentId');

    if (!course) throw new Error('NOT_FOUND');
    return course;
  }

  async createCourse(instructor, data) {
    const course = new Course({
      ...data,
      instructor: instructor._id,
    });
    await course.save();
    return course;
  }

  async updateCourse(id, data) {
    const course = await Course.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!course) throw new Error('NOT_FOUND');
    return course;
  }

  async deleteCourse(id) {
    const course = await Course.findByIdAndDelete(id);
    if (!course) throw new Error('NOT_FOUND');
    return course;
  }

  async enrollUser(courseId, user, enrollmentCode) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('NOT_FOUND');

    if (course.students.includes(user._id)) throw new Error('ALREADY_ENROLLED');
    if (course.currentEnrollment >= course.capacity) throw new Error('COURSE_FULL');

    if (course.settings.allowSelfEnrollment && course.enrollmentCode) {
      if (enrollmentCode !== course.enrollmentCode) throw new Error('INVALID_CODE');
    }

    course.students.push(user._id);
    course.currentEnrollment += 1;
    await course.save();

    return { message: 'Successfully enrolled' };
  }

  async unenrollUser(courseId, user) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('NOT_FOUND');

    course.students = course.students.filter(
      (id) => id.toString() !== user._id.toString()
    );
    course.currentEnrollment = Math.max(0, course.currentEnrollment - 1);
    await course.save();

    return { message: 'Successfully unenrolled' };
  }
}

module.exports = new CourseService();
