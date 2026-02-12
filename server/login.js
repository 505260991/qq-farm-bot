/**
 * 登录模块
 * 处理扫码登录逻辑
 */

const { MiniProgramLoginSession } = require('./lib/session');

/**
 * 获取农场登录二维码
 */
async function getLoginQr() {
    try {
        const result = await MiniProgramLoginSession.requestLoginCode();
        return {
            success: true,
            qrsig: result.code, // 这里的 code 用作查询状态的 key
            qrcode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(result.url)}`,
            url: result.url,
            isMiniProgram: true
        };
    } catch (error) {
        console.error('获取二维码失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 检查扫码状态
 * @param {string} qrsig 
 */
async function checkLoginQr(qrsig) {
    if (!qrsig) {
        return { success: false, error: 'Missing qrsig' };
    }

    try {
        const result = await MiniProgramLoginSession.queryStatus(qrsig);

        let ret = '66';
        let msg = '等待扫码...';
        let code = '';
        let uin = '';
        let avatar = '';

        if (result.status === 'Wait') {
            ret = '66';
            msg = '等待扫码...';
        } else if (result.status === 'Used') {
            ret = '65';
            msg = '二维码已失效';
        } else if (result.status === 'OK') {
            ret = '0';
            msg = '登录成功';
            uin = result.uin || '';
            if (uin) {
                avatar = `https://q1.qlogo.cn/g?b=qq&nk=${uin}&s=640`;
            }

            // 获取 AppID，农场 AppID 为 1112386029
            const appid = '1112386029';

            // 获取 Auth Code
            code = await MiniProgramLoginSession.getAuthCode(result.ticket, appid);
        } else if (result.status === 'Error') {
            ret = '65';
            msg = '状态查询错误';
        }

        return { success: true, ret, msg, code, uin, avatar };

    } catch (error) {
        console.error('查询状态失败:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    getLoginQr,
    checkLoginQr
};
