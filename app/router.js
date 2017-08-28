module.exports = app => {
  app.get('/user/:id', app.controller.home.info);
};
