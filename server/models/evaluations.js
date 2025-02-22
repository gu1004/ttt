const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('evaluations', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      }
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    create_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    status: {
      type: DataTypes.ENUM('pending','approved','rejected'),
      allowNull: false,
      defaultValue: "pending",
      comment: "?????????????????????????"
    },
    content_richness: {
      type: DataTypes.DECIMAL(4,1),
      allowNull: true,
      comment: "内容丰富性(10分)"
    },
    content_update: {
      type: DataTypes.DECIMAL(4,1),
      allowNull: true,
      comment: "内容更新性(5分)"
    },
    content_organization: {
      type: DataTypes.DECIMAL(4,1),
      allowNull: true,
      comment: "内容组织(5分)"
    },
    teaching_method_diversity: {
      type: DataTypes.DECIMAL(4,1),
      allowNull: true,
      comment: "教学方法多样性(10分)"
    },
    teaching_interaction: {
      type: DataTypes.DECIMAL(4,1),
      allowNull: true,
      comment: "互动性(5分)"
    },
    teaching_resource: {
      type: DataTypes.DECIMAL(4,1),
      allowNull: true,
      comment: "教学资源利用(5分)"
    },
    teacher_attitude: {
      type: DataTypes.DECIMAL(4,1),
      allowNull: true,
      comment: "教学态度(10分)"
    },
    teacher_ability: {
      type: DataTypes.DECIMAL(4,1),
      allowNull: true,
      comment: "教学能力(5分)"
    },
    teacher_personality: {
      type: DataTypes.DECIMAL(4,1),
      allowNull: true,
      comment: "亲和力(5分)"
    },
    course_objective: {
      type: DataTypes.DECIMAL(4,1),
      allowNull: true,
      comment: "课程目标明确性(10分)"
    },
    course_difficulty: {
      type: DataTypes.DECIMAL(4,1),
      allowNull: true,
      comment: "课程难度(5分)"
    },
    course_pace: {
      type: DataTypes.DECIMAL(4,1),
      allowNull: true,
      comment: "课程进度(5分)"
    },
    knowledge_grasp: {
      type: DataTypes.DECIMAL(4,1),
      allowNull: true,
      comment: "知识掌握(10分)"
    },
    ability_improvement: {
      type: DataTypes.DECIMAL(4,1),
      allowNull: true,
      comment: "能力提升(5分)"
    },
    interest_stimulation: {
      type: DataTypes.DECIMAL(4,1),
      allowNull: true,
      comment: "兴趣激发(5分)"
    },
    total_score: {
      type: DataTypes.DECIMAL(5,1),
      allowNull: true,
      comment: "总分(100分)"
    }
  }, {
    sequelize,
    tableName: 'evaluations',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "student_id",
        using: "BTREE",
        fields: [
          { name: "student_id" },
        ]
      },
      {
        name: "course_id",
        using: "BTREE",
        fields: [
          { name: "course_id" },
        ]
      },
      {
        name: "idx_content_score",
        using: "BTREE",
        fields: [
          { name: "content_richness" },
          { name: "content_update" },
          { name: "content_organization" },
        ]
      },
      {
        name: "idx_method_score",
        using: "BTREE",
        fields: [
          { name: "teaching_method_diversity" },
          { name: "teaching_interaction" },
          { name: "teaching_resource" },
        ]
      },
      {
        name: "idx_teacher_score",
        using: "BTREE",
        fields: [
          { name: "teacher_attitude" },
          { name: "teacher_ability" },
          { name: "teacher_personality" },
        ]
      },
      {
        name: "idx_course_score",
        using: "BTREE",
        fields: [
          { name: "course_objective" },
          { name: "course_difficulty" },
          { name: "course_pace" },
        ]
      },
      {
        name: "idx_effect_score",
        using: "BTREE",
        fields: [
          { name: "knowledge_grasp" },
          { name: "ability_improvement" },
          { name: "interest_stimulation" },
        ]
      },
    ]
  });
};
