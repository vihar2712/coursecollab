// backend/services/__tests__/courseService.test.js
const CourseService = require("../courseService");
const Course = require("../../models/Course");
const mongoose = require("mongoose");

// Mock the Course model
jest.mock("../../models/Course", () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  prototype: {
    save: jest.fn(),
  },
}));

describe("CourseService", () => {
  beforeAll(async () => {
    // Connect to a test database or mock mongoose connection
    // For now, we'll rely on the mock Course model
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("enrollUser", () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockCourseId = new mongoose.Types.ObjectId();

    let baseCourse;

    beforeEach(() => {
      baseCourse = {
        _id: mockCourseId,
        students: [],
        currentEnrollment: 0,
        capacity: 10,
        settings: { allowSelfEnrollment: false },
        save: jest.fn(),
      };
    });

    // Black Box & White Box Test Cases

    // Test Case 1: Successful enrollment without enrollment code (Path 1)
    test("should successfully enroll a user without an enrollment code", async () => {
      Course.findById.mockResolvedValueOnce(baseCourse);

      const result = await CourseService.enrollUser(mockCourseId, { _id: mockUserId });

      expect(baseCourse.students).toContain(mockUserId);
      expect(baseCourse.currentEnrollment).toBe(1);
      expect(baseCourse.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: "Successfully enrolled" });
    });

    // Test Case 2: Course not found (Path 2)
    test("should throw NOT_FOUND error if course does not exist", async () => {
      Course.findById.mockResolvedValueOnce(null);

      await expect(CourseService.enrollUser(mockCourseId, { _id: mockUserId })).rejects.toThrow("NOT_FOUND");
      expect(baseCourse.save).not.toHaveBeenCalled();
    });

    // Test Case 3: User already enrolled (Path 3)
    test("should throw ALREADY_ENROLLED error if user is already a student", async () => {
      baseCourse.students = [mockUserId]; // Set student before mockResolvedValueOnce
      Course.findById.mockResolvedValueOnce(baseCourse);

      await expect(CourseService.enrollUser(mockCourseId, { _id: mockUserId })).rejects.toThrow("ALREADY_ENROLLED");
      expect(baseCourse.save).not.toHaveBeenCalled();
    });

    // Test Case 4: Course is full (Path 4)
    test("should throw COURSE_FULL error if course capacity is reached", async () => {
      baseCourse.currentEnrollment = 10;
      baseCourse.capacity = 10;
      Course.findById.mockResolvedValueOnce(baseCourse);

      await expect(CourseService.enrollUser(mockCourseId, { _id: mockUserId })).rejects.toThrow("COURSE_FULL");
      expect(baseCourse.save).not.toHaveBeenCalled();
    });

    // Test Case 5: Successful enrollment with correct enrollment code (Path 5)
    test("should successfully enroll a user with a valid enrollment code", async () => {
      baseCourse.settings.allowSelfEnrollment = true;
      baseCourse.enrollmentCode = "SECRETCODE";
      Course.findById.mockResolvedValueOnce(baseCourse);

      const result = await CourseService.enrollUser(mockCourseId, { _id: mockUserId }, "SECRETCODE");

      expect(baseCourse.students).toContain(mockUserId);
      expect(baseCourse.currentEnrollment).toBe(1);
      expect(baseCourse.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: "Successfully enrolled" });
    });

    // Test Case 6: Invalid enrollment code (Path 6)
    test("should throw INVALID_CODE error if enrollment code is incorrect", async () => {
      baseCourse.settings.allowSelfEnrollment = true;
      baseCourse.enrollmentCode = "SECRETCODE";
      Course.findById.mockResolvedValueOnce(baseCourse);

      await expect(CourseService.enrollUser(mockCourseId, { _id: mockUserId }, "WRONGCODE")).rejects.toThrow("INVALID_CODE");
      expect(baseCourse.save).not.toHaveBeenCalled();
    });

    // Test Case 7: Enrollment with self-enrollment allowed but no code set on course
    test("should enroll if self-enrollment allowed but no code set on course", async () => {
      baseCourse.settings.allowSelfEnrollment = true;
      baseCourse.enrollmentCode = undefined;
      Course.findById.mockResolvedValueOnce(baseCourse);

      const result = await CourseService.enrollUser(mockCourseId, { _id: mockUserId }, "ANYCODE"); // Code provided but not checked

      expect(baseCourse.students).toContain(mockUserId);
      expect(baseCourse.currentEnrollment).toBe(1);
      expect(baseCourse.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: "Successfully enrolled" });
    });

    // Test Case 8: Enrollment with self-enrollment allowed and code set, but no code provided by user
    test("should throw INVALID_CODE if self-enrollment allowed and code set, but user provides no code", async () => {
      baseCourse.settings.allowSelfEnrollment = true;
      baseCourse.enrollmentCode = "SECRETCODE";
      Course.findById.mockResolvedValueOnce(baseCourse);

      await expect(CourseService.enrollUser(mockCourseId, { _id: mockUserId }, undefined)).rejects.toThrow("INVALID_CODE");
      expect(baseCourse.save).not.toHaveBeenCalled();
    });

    // Test Case 9: Enrollment with self-enrollment disabled but code provided (should still enroll if no other issues)
    test("should enroll even if code is provided when self-enrollment is disabled", async () => {
      baseCourse.settings.allowSelfEnrollment = false;
      Course.findById.mockResolvedValueOnce(baseCourse);

      const result = await CourseService.enrollUser(mockCourseId, { _id: mockUserId }, "SOMECODE");

      expect(baseCourse.students).toContain(mockUserId);
      expect(baseCourse.currentEnrollment).toBe(1);
      expect(baseCourse.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: "Successfully enrolled" });
    });

    // Test Case 10: Course capacity is 0, should still throw COURSE_FULL
    test("should throw COURSE_FULL error if course capacity is 0 and current enrollment is 0", async () => {
      baseCourse.currentEnrollment = 0;
      baseCourse.capacity = 0;
      Course.findById.mockResolvedValueOnce(baseCourse);

      await expect(CourseService.enrollUser(mockCourseId, { _id: mockUserId })).rejects.toThrow("COURSE_FULL");
      expect(baseCourse.save).not.toHaveBeenCalled();
    });
  });
});
