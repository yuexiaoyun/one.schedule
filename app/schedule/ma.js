module.exports = {
  schedule: { interval: '10s', type: 'all' },
  task: async ctx => {

    console.log('-002-');

    //获取需要接榫的新报名学生
    const data = await ctx.app.knex('tb_groups')
      .select([
        'tb_courses.id as courseId',
        'tb_courses.course_name as courseName',
        'tb_groups.bid as groupId',
        'tb_groups.name as groupName',
        'tb_groups_course.name as subjectName',
        'tb_groups_course.*'
      ])
      .innerJoin('tb_courses', 'tb_courses.id', 'tb_groups.catelog')
      .innerJoin('tb_groups_course', 'tb_groups.bid', 'tb_groups_course.group_id')
      .where({
        'tb_groups_course.status': 2
      });

    data.forEach(item => {
      var basePrice = item.price * item.count;
      var a = {
        kechou_Price: basePrice * 0.20, //课酬  to 老师
        zhashe_Price: basePrice * 0.03, //招生提成 to 业务员
        changz_Price: basePrice * 0.15, //场租  to 老师
        manage_Price: basePrice * 0.07, //管理费  to 归属升学保
        daoshi_Price: basePrice * 0.05, //升学导师奖金 to 升学导师.B
        total_Base_Amount: basePrice,
        total_A_Amount: basePrice * .30,
        total_B_Amount: basePrice * .30,
        total_Full_Amount: basePrice * 1.6
      }
      item.option = a;
      console.log(item);
    });

    // console.log(data);
    //计算分账金额

    //分账
    console.log(new Date)
  },
};
