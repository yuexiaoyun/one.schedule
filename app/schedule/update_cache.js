module.exports = {
  schedule: { interval: '10s', type: 'all' },
  task: async ctx => {
    console.log(new Date)
  },
};
