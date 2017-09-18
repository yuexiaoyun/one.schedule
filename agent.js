module.exports = agent => {
    agent.messenger.on('egg-ready', () => {
        agent.tortoise.queue('Balance')
            .failThreshold(3) // 3 immediate attempts
            .failSpan(1000 * 60 * 10) // 10 minutes, defaults to 1 minute
            .retryTimeout(1000 * 10) // 10 second timeout on each retry, defaults to 5 seconds
            .subscribe(function(msg, ack, nack) {
                console.log('-------------------结算业务处理------------------');
                console.log(`--------- 处理时间：${new Date().toLocaleString()} -------------`);
                var data = JSON.parse(msg);
                agent.messenger.sendRandom('auto_balance_action', data);
                ack();
                console.log('-------------------结算业务处理------------------');
            });
    });
};