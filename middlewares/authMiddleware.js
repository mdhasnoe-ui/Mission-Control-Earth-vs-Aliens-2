const jwt = require("jsonwebtoken");

function verifyToken(req, res, next){

    const token = req.headers.authorization;

    if(!token){

        return res.status(401).json({
            message: "Access denied"
        });

    }

    try{

        const verified =
        jwt.verify(token, process.env.JWT_SECRET);

        req.user = verified;

        next();

    }catch(error){

        res.status(400).json({
            message: "Invalid token"
        });

    }

}

module.exports = verifyToken;