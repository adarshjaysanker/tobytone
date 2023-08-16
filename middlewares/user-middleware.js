const jwt=require('jsonwebtoken')
const User=require('../model/users')
const requireAuth=(req,res,next)=>{
    const token =req.cookies.jwt;
    //check json web token exists and is verified
    if(token){
        jwt.verify(token,'secret of my application',(err,decodedToken)=>{
            if(err){
                console.log(err.message);
                res.redirect('/login')
            }else{
                if(res.locals.user && res.locals.user.isActive){
                    next();
                }else{
                    req.session.destroy();
                    res.redirect('/login?message=Sorry, you are blocked')
                }
                console.log(decodedToken);
                next()

            }
        })
        
    }else{
        res.redirect('/login')
    }
}
// check the current users
const checkUser=  (req,res,next)=>{
    const token=req.cookies.jwt
    if(token){
        jwt.verify(token,'secret of my application',async (err,decodedToken)=>{
            if(err){
                // console.log(err.message);
                res.locals.user=null
          next()
            }else{
               
                let user=await User.findById(decodedToken.id);
                if(user && user.isActive){
                    res.locals.user = user
                }else{
                    res.locals.user = null;
                }
                next()

            }
        });

    }else{
        res.locals.user=null
        next()

    }
}





module.exports={requireAuth,checkUser}