
const eAdmin = (req, res, next)=>{
    if(req.isAuthenticated() && req.user.eAdmin == 1 ){
        return next()
    }
    req.flash("error_msg", "Esta área é restrita para administradores")
    res.redirect("/")
}

export default eAdmin


