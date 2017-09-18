module.exports = {
    schedule: { interval: '160s', type: 'worker' },
    task: async ctx => {
        //获取需要接榫的新报名学生
        console.log(`检查时间：${new Date().toLocaleString()}`)
        const hour = await ctx.service.course.getHours();
        if (hour) {
            console.log(`有满足结算条件，开始进入结算流程`);
            // data.length > 0 && data.forEach(hour => {
            // console.log(hour);
            var hourId = hour.id;
            var hourGroupId = hour.gid;
            await ctx.service.course.find(hourGroupId).then(group => {
                console.log(`--------------------------------------------------------------------`);
                console.log(`进入结算流程:\n课程：${group.courseName}\n上课点：${group.groupName}\n科目：${group.subjectName}\n教师：${group.userName}`);
                console.log(`--------------------------------------------------------------------`);
                var msg = {
                    hourId,
                    hourGroupId
                };
                // console.log(msg);
                return ctx.app.tortoise.queue('Balance').publish(msg).then(x => {
                    // console.log(x);
                    return x;
                })
            }).then(result => {
                console.log(result);
            });
        }
    },
};