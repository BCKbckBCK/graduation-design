const cryto = require('crypto');
const fs = require('fs');
module.exports = {
    md5(buffer) {
        let obj = cryto.createHash('md5');
        obj.update(buffer);
        return obj.digest('hex');
    },

    unlink(path) {
        return new Promise((resolve, reject) => {
            fs.unlink(path, (error) => {
                if (error) {
                    reject(error);

                } else {
                    resolve();
                }
            });

        });
    }
}