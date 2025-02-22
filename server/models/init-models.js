var DataTypes = require("sequelize").DataTypes;
var _administrators = require("./administrators");
var _course_classes = require("./course_classes");
var _courses = require("./courses");
var _evaluations = require("./evaluations");
var _notification_reads = require("./notification_reads");
var _notifications = require("./notifications");
var _student_courses = require("./student_courses");
var _students = require("./students");
var _teachers = require("./teachers");

function initModels(sequelize) {
  var administrators = _administrators(sequelize, DataTypes);
  var course_classes = _course_classes(sequelize, DataTypes);
  var courses = _courses(sequelize, DataTypes);
  var evaluations = _evaluations(sequelize, DataTypes);
  var notification_reads = _notification_reads(sequelize, DataTypes);
  var notifications = _notifications(sequelize, DataTypes);
  var student_courses = _student_courses(sequelize, DataTypes);
  var students = _students(sequelize, DataTypes);
  var teachers = _teachers(sequelize, DataTypes);

  notifications.belongsTo(administrators, { as: "created_by_administrator", foreignKey: "created_by"});
  administrators.hasMany(notifications, { as: "notifications", foreignKey: "created_by"});
  course_classes.belongsTo(courses, { as: "course", foreignKey: "course_id"});
  courses.hasMany(course_classes, { as: "course_classes", foreignKey: "course_id"});
  evaluations.belongsTo(courses, { as: "course", foreignKey: "course_id"});
  courses.hasMany(evaluations, { as: "evaluations", foreignKey: "course_id"});
  notifications.belongsTo(courses, { as: "course", foreignKey: "course_id"});
  courses.hasMany(notifications, { as: "notifications", foreignKey: "course_id"});
  student_courses.belongsTo(courses, { as: "course", foreignKey: "course_id"});
  courses.hasMany(student_courses, { as: "student_courses", foreignKey: "course_id"});
  notification_reads.belongsTo(notifications, { as: "notification", foreignKey: "notification_id"});
  notifications.hasMany(notification_reads, { as: "notification_reads", foreignKey: "notification_id"});
  evaluations.belongsTo(students, { as: "student", foreignKey: "student_id"});
  students.hasMany(evaluations, { as: "evaluations", foreignKey: "student_id"});
  student_courses.belongsTo(students, { as: "student", foreignKey: "student_id"});
  students.hasMany(student_courses, { as: "student_courses", foreignKey: "student_id"});
  courses.belongsTo(teachers, { as: "teacher", foreignKey: "teacher_id"});
  teachers.hasMany(courses, { as: "courses", foreignKey: "teacher_id"});

  return {
    administrators,
    course_classes,
    courses,
    evaluations,
    notification_reads,
    notifications,
    student_courses,
    students,
    teachers,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
