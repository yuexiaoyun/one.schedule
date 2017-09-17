module.exports = agent => {
    agent.tortoise
        .queue('Balance')
        .failThreshold(3) // 3 immediate attempts
        .failSpan(1000 * 60 * 10) // 10 minutes, defaults to 1 minute
        .retryTimeout(1000 * 10) // 10 second timeout on each retry, defaults to 5 seconds
        .subscribe(function(msg, ack, nack) {
            console.log(new Date().toLocaleString());
            console.log('-------------------------------------');
            // console.log(msg);
            var msg = JSON.parse(msg);
            agent.service.course.Balance(msg.hourId).then(resp => {
                console.log('结算完成')
                ack(true)
            }).catch(error => {
                console.error(error);
                nack(false);
            })

        });
};
