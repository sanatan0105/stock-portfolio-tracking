module.exports = {
  up(db) {
    return db.collection('securitymodels').remove();

  },
  down(db) {}
};
