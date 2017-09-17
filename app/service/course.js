module.exports = app => {
    class Course extends app.Service {
        async find(cid) {
            //获取需要接榫的新报名学生
            var item = await app.knex('tb_groups').select([
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
                    'tb_groups_course.status': 2,
                    'tb_groups_course.id': cid
                }).first().catch(e => console.error);

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
            };
            item.option = a;
            return item;
        };

        async getHours() {
            return await app.knex('hours').where({ 'status': 2, 'signed': 1 });
        }

        async Balance(hourId) {
            var hour = await app.knex('hours').where('id', hourId);
            var group = await find(hour.gid);
            var users = await app.knex('tb_groups_users').where('group_id', hour.gid);

            // 老师
            // 业务员
            // 导师

            var amount = users.length * group.option.total_Base_Amount * 0.5;
            var data = {
                status: 9,
                balancetime: new Date(),
                balanceamount: amount
            };
            console.log(data);
            await app.knex('hours').update(data).where('id', hourId);
        }
    };
    return Course;
};
