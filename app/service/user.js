module.exports = app => {
  class User extends app.Service {
    async find(uid) {
      const data = await app.mysql.get('tb_groups', { bid: uid });
      return data;
    }
  }
  return User;
};
