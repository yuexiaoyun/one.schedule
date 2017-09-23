const moment = require('moment');
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
                    'tb_groups_course.*',

                ])
                .innerJoin('tb_courses', 'tb_courses.id', 'tb_groups.catelog')
                .innerJoin('tb_groups_course', 'tb_groups.bid', 'tb_groups_course.group_id')
                .where({
                    'tb_groups_course.status': 2,
                    'tb_groups_course.id': cid
                }).first().catch(e => console.error);

            var basePrice = item.price;
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
            var date = moment().subtract(1, 'days').utcOffset(8);
            console.log('签到时间 < ', date.toDate().toLocaleString());
            return await app.knex('hours').where({ 'status': 2, 'signed': 1 })
                .where('signindate', '<', date.toDate())
                .first();
        }

        async Balance(hourId) {

            var { knex } = app;
            var that = this;
            var hour = await knex('hours').where('id', hourId).where('status', 2).first();
            // console.log(hour);

            var group = await this.find(hour.gid);

            // console.log(group);

            var users = await knex('tb_groups_users')
                .select([
                    'users.id as userId',
                    'users.name as userName',
                    'users_ecspts.userId as ecspId',
                    'users_ecspts.name as ecspName'
                ])
                .innerJoin('users_ecspts', 'users_ecspts.id', 'tb_groups_users.ecspId')
                .innerJoin('users', 'users.id', 'tb_groups_users.user_id')
                .where('tb_groups_users.course_id', hour.gid);
            if (users.length == 0) {
                throw new Error('未设置业务员');
            }
            var amount = users.length * group.option.total_Base_Amount * 0.5;

            console.log(`每课费用：${group.option.total_Base_Amount}`);
            console.log(`预先结算：${group.option.total_Base_Amount * 0.5}`);
            console.log(`* 课酬：${group.option.kechou_Price}`);
            console.log(`* 场租：${group.option.changz_Price}`);
            console.log(`* 招生：${group.option.zhashe_Price}`);
            console.log(`* 管理费：${group.option.manage_Price}`);
            console.log(`* 导师奖金：${group.option.daoshi_Price}`);
            console.log(`学生人数：${users.length}`);
            console.log(`计算总计：${amount}`);



            var title = `${group.groupName}_${group.subjectName}_${hour.title}`;

            var teach = await knex('users')
                .select(['users.id as userId', 'users.name'])
                .innerJoin('users_teachers', 'users_teachers.userid', 'users.id')
                .where('users_teachers.id', group.userId).first();
            // 导师
            var _group = await knex('tb_groups')
                .select(['instructors.userId'])
                .innerJoin('instructors', 'instructors.id', 'tb_groups.userId')
                .where('bid', group.groupId).first();
            var __data = {
                courseId: group.courseId,
                courseName: group.courseName,
                groupId: group.groupId,
                groupName: group.groupName,
                subjectId: group.id,
                subjectName: group.subjectName,
                hourId: hour.id,
                hourName: hour.title,
                amount: amount,
                createdAt: new Date()
            };

            await knex('balances').insert(__data).returning('id').then(id => {
                var id = id[0];
                var _data_detail = [];
                _data_detail.push({ balabceId: id, amount: group.option.kechou_Price * users.length, tag: '课酬', userId: teach ? teach.userId : 0 });
                _data_detail.push({ balabceId: id, amount: group.option.changz_Price * users.length, tag: '场租', userId: teach ? teach.userId : 0 })
                _data_detail.push({ balabceId: id, amount: group.option.daoshi_Price * users.length, tag: '导师奖金', userId: _group ? _group.userId : 0 })
                users.length > 0 && users.forEach(user => {
                    _data_detail.push({
                        balabceId: id,
                        amount: group.option.zhashe_Price,
                        tag: '招生',
                        stuUserId: user.userId,
                        stuUserName: user.userName,
                        userId: user.ecspId || 0
                    });
                });
                _data_detail.push({ balabceId: id, amount: group.option.manage_Price * users.length, tag: '管理费', userId: 0 });
                console.log(_data_detail);
                return knex('balances_detail').insert(_data_detail).then(row => { return row > 0 });

            });

            var data = {
                status: 9,
                balancetime: new Date(),
                balanceamount: amount,
                amount_kechou: group.option.kechou_Price * users.length,
                amount_zhashe: group.option.zhashe_Price * users.length,
                amount_changz: group.option.changz_Price * users.length,
                amount_manage: group.option.manage_Price * users.length,
                amount_daoshi: group.option.daoshi_Price * users.length
            };
            await knex('hours').update(data).where('id', hourId);

            // 老师
            if (teach) {
                console.log(teach);
                await that.wall(teach.userId, group.option.kechou_Price * users.length, `${title}_课酬`);
                await that.wall(teach.userId, group.option.changz_Price * users.length, `${title}_场租`);
            }
            if (_group) await that.wall(_group.userId, group.option.daoshi_Price * users.length, `${title}_导师奖金`);
            // 业务员
            if (users.length > 0) {
                users.forEach(async user => {
                    await that.wall(user.ecspId, group.option.zhashe_Price, `${title}_${user.userName}_招生提成`);
                });
            }

        };

        async wall(uid, amount, title) {
            var { knex } = app;
            console.log([uid, amount, title])
            await knex.raw('update users_wallets set amount=amount+:amount where userId= :userId;', {
                userId: uid,
                amount: amount
            });
            await knex('wallets_records').insert({
                userId: uid,
                title: title,
                amount: amount,
                type: 1,
                dateline: new Date(),
                status: 1
            })
            return true;
        }

    };
    return Course;
};
