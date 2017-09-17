module.exports = {
    schedule: { interval: '130s', type: 'all' },
    task: async ctx => {

        console.log('开始结算');
        //获取需要接榫的新报名学生
        const data = await ctx.service.course.getHours();
        console.log(`有${data.length}课时满足结算条件，开始进入结算流程`);
        data.forEach(hour => {
            console.log(hour);
            var hourId = hour.id;
            var hourGroupId = hour.gid;
            ctx.service.course.find(hourGroupId).then(group => {
                console.log(`--------------------------------------------------------------------`);
                console.log(`进入结算流程:\n课程：${group.courseName}\n上课点：${group.groupName}\n科目：${group.subjectName}\n教师：${group.userName}`);
                console.log(`--------------------------------------------------------------------`);
                var msg = {
                    hourId,
                    hourGroupId,
                    courseId: group.courseId,
                    courseName: group.courseName,
                    option: group.option
                };
                // console.log(msg);
                return ctx.app.tortoise.queue('Balance').publish(msg);
            }).then(result => {
                console.log(result);
            });
        });
        //分账
        console.log(new Date)
    },
};
