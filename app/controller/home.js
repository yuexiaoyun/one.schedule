const Controller = require('egg').Controller;

class HomeController extends Controller {
    async info() {
        const { ctx, service } = this;
        const userId = ctx.params.id;
        ctx.body = await service.user.find(userId);
    }
};

module.exports = HomeController;
