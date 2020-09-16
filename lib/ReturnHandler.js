module.exports = {
    returnHandler: (ret, res)=>{
        if (ret.type) {
            res.status(ret.status).json({
                error: ret
            });
        } else {
            res.status(200).json(ret);
        }
    }
};