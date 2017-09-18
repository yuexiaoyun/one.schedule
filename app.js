module.exports = app => {
    app.messenger.on('auto_balance_action', data => {
        console.log('---------------A--WAKAKA--结算业务处理------------------');
        console.log(data);
        var hourId = data.hourId;
        const ctx = app.createAnonymousContext();

        ctx.runInBackground(async() => {
            await ctx.service.course.Balance(hourId).then(x => {
                console.log(x);
                console.log('---------------B--OVER--结算业务处理------------------');
            });
        });

        console.log('---------------B--WAKAKA--结算业务处理------------------');
    });
};
