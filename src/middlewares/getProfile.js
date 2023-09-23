const profileDao = require('../daos/profile.dao');

const getProfile = async (req, res, next) => {
  try {
    const profile = await profileDao.getProfile(req.get('profile_id'));
    req.profile = profile;
    return next();
  } catch (exception) {
    return res.status(401).end();
  }
};

module.exports = { getProfile };
