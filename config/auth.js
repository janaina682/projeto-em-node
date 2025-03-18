import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";

passport.use(
    new LocalStrategy(
        {usernameField:"email", passwordField:"senha"},
        async (username, password, done)=>{
            try{
                const usuario = await Usuario.findOne({email: username})

                if(!usuario){
                    return done(null, false, {message:"Esta conta não existe"})
                }
                const eUsuario = await bcrypt.compare(password, usuario.senha)
                if(eUsuario){
                    return done(null, usuario)
                }else{ 
                    return done(null, false,{message:"Senha incorreta"})
                }
            }catch(err){
                return done(err)
            }
        }
    )
)
passport.serializeUser((usuario, done)=>{
    done(null, usuario._id)
})

passport.deserializeUser(async (id, done) => {
    try{
        const usuario = await Usuario.findById(id)
        done(null, usuario)

    }catch(err){
        done(err)
    }
})

export default passport