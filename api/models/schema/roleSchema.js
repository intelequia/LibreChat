const { PermissionTypes, Permissions } = require('librechat-data-provider');
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  /**
   * Assistant Creator permission in role schema
   * @Organization Intelequia
   * @Author Enrique M. Pedroza Castillo
   */
  [PermissionTypes.ASSISTANT_CREATOR]:{
    [Permissions.USE]: {
      type: Boolean,
      default: false,
    },
  },
  [PermissionTypes.BOOKMARKS]: {
    [Permissions.USE]: {
      type: Boolean,
      default: true,
    },
  },
  [PermissionTypes.PROMPTS]: {
    [Permissions.SHARED_GLOBAL]: {
      type: Boolean,
      default: false,
    },
    [Permissions.USE]: {
      type: Boolean,
      default: true,
    },
    [Permissions.CREATE]: {
      type: Boolean,
      default: true,
    },
  },
  [PermissionTypes.AGENTS]: {
    [Permissions.SHARED_GLOBAL]: {
      type: Boolean,
      default: false,
    },
    [Permissions.USE]: {
      type: Boolean,
      default: true,
    },
    [Permissions.CREATE]: {
      type: Boolean,
      default: true,
    },
  },
  [PermissionTypes.MULTI_CONVO]: {
    [Permissions.USE]: {
      type: Boolean,
      default: true,
    },
  },
  [PermissionTypes.TEMPORARY_CHAT]: {
    [Permissions.USE]: {
      type: Boolean,
      default: true,
    },
  },
  [PermissionTypes.RUN_CODE]: {
    [Permissions.USE]: {
      type: Boolean,
      default: true,
    },
  },
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
