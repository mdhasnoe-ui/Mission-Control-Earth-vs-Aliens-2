function validateRegister(req, res, next){

    const { username, password } = req.body;

    if(!username || !password){

        return res.status(400).json({
            message: "All fields are required"
        });

    }

    next();

}

module.exports = validateRegister;