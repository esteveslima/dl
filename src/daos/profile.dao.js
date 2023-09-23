const sequelize = require('sequelize');
const ResourceNotFoundException = require('../exceptions/resource-not-found.exception');
const Profile = require('../models/entities/profile.model');

const { Op } = sequelize;

module.exports.getProfile = async (profileId) => {
  const profile = await Profile.findOne({ where: { id: profileId } });
  if (!profile) throw new ResourceNotFoundException('Profile');

  return profile;
};
