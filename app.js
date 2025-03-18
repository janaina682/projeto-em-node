//Carregando os módulos
import express from "express";
const app = express();
import { engine } from "express-handlebars";
import admin from "./routes/admin.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import mongoose from "mongoose";
import session from "express-session";
import flash from "connect-flash";
import Postagem from "./models/Postagem.js";
import Categoria from "./models/Categoria.js";
import usuario from "./routes/usuario.js";
import passport from "passport";
import "./config/auth.js";

//Configurações
// Sessão
app.use(
  session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//Middlewares
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});
//express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//handlebars
app.engine(
  "handlebars",
  engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", "./views");
//Mogoose
mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost/blogapp")
  .then(() => {
    console.log("Conectado ao mongo");
  })
  .catch((err) => {
    console.log("Erro ao se conectar", err);
  });
//Public
app.use(express.static(path.join(__dirname, "public")));

//Rotas
app.get("/", (req, res) => {
  Postagem.find()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("index", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/404");
      console.log("Houve um erro: " + err);
    });
});
app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .then((postagem) => {
      if (postagem) {
        res.render("postagem/index", { postagem: postagem });
      } else {
        req.flash("error_msg", "Esta postagem não existe");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
      console.log("erro: " + err);
    });
});
app.get("/categorias", (req, res) => {
  Categoria.find()
    .then((categorias) => {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao listar as categorias");
      res.redirect("/");
      console.log("erro: " + err);
    });
});
app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .then((categoria) => {
      if (categoria) {
        Postagem.find({ categoria: categoria._id })
          .then((postagens) => {
            res.render("categorias/postagens", {
              postagens: postagens,
              categoria: categoria,
            });
          })
          .catch((err) => {
            req.flash(
              "error_msg",
              "Houve um erro interno ao carregar a página desta categoria"
            );
            res.redirect("/");
            console.log("erro: " + err);
          });
      } else {
        req.flash(
          "error_msg",
          "Ainda não existe postagens para essa categoria!"
        );
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro interno ao carregar a página desta categoria"
      );
      res.redirect("/");
      console.log("erro: " + err);
    });
});

app.get("/404", (req, res) => {
  res.send("Erro 404");
});

app.use("/admin", admin);
app.use("/usuarios", usuario);
//Outros
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log("Servidor Rodando...");
});
