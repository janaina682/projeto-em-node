import express from "express"; //importa o framework Express
const router = express.Router();// Cria um objeto de roteamento do Express
import Categoria from "../models/Categoria.js";//importa o módulo Categoria
import Postagem from "../models/Postagem.js";//importa o módulo Postagem
import eAdmin from "../helpers/eAdmin.js";


//index da rota admin
router.get("/", eAdmin, (req, res) => {
  res.render("admin/index");
});
//página de posts da rota admin
router.get("/posts", eAdmin, (req, res) => {
  res.send("Página de Posts");
});
//página que lista as categorias
router.get("/categorias", eAdmin, (req, res) => {
  Categoria.find()
    .sort({ date: "desc" })
    .then((categorias) => {
      res.render("admin/categorias", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias");
      res.redirect("/admin");
      console.log("houve um erro: " + err)
    });
});
//página para adicionar uma nova categoria
router.get("/categorias/add", eAdmin, (req, res) => {
  res.render("admin/addcategorias");
});
//validação do formulario preenchido na categorias/add
router.post("/categorias/nova", eAdmin, (req, res) => {
  var erros = [];

  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome Inválido" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: "Slug Inválido" });
  }

  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome da categuria é muito pequeno" });
  }
  if (erros.length > 0) {
    res.render("admin/addcategorias", { erros: erros });
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
    };
    new Categoria(novaCategoria)
      .save()
      .then(() => {
        req.flash("success_msg", "Categoria criada com sucesso!");
        res.redirect("/admin/categorias");
      })
      .catch((err) => {
        req.flash(
          "error_msg",
          "Houve um error ao salvar a categoria, tente novamente"
        );
        res.redirect("/admin");
        console.log("houve um erro: " + err)
      });
  }
});
//página de edição de categorias
router.get("/categorias/edit/:id", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .then((categoria) => {
      res.render("admin/editcategorias", { categoria: categoria });
    })
    .catch((err) => {
      req.flash("error_msg", "Esta categoria não existe");
      res.redirect("/admin/categorias");
      console.log("houve um erro: " + err)
    });
});
//validação do formulário de edição de categorias
router.post("/categorias/edit", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.body.id })
    .then((categoria) => {
      categoria.nome = req.body.nome;
      categoria.slug = req.body.slug;

      categoria.save()
      .then(() => {
        req.flash("success_msg", "Categoria salva com sucesso!");
        res.redirect("/admin/categorias");
      }).catch((err)=>{
        req.flash("error_msg", "Houve um erro interno ao editar a categoria")
        res.redirect("/admin/categorias")
        console.log("houve um erro: " + err)
      })
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao editar a categoria");
      res.redirect("/admin/categorias");
      console.log("houve um erro: " + err)
    });
});
//validação para excluir categoria
router.post("/categorias/deletar", eAdmin,(req, res)=>{
  Categoria.deleteOne({_id: req.body.id})
  .then(()=>{
    req.flash("success_msg", "Categoria deletada com sucesso!")
    res.redirect("/admin/categorias")
  }).catch((err)=>{
    req.flash("error_msg","Houve um erro ao deletar a categoria")
    res.redirect("/admin/categorias")
    console.log("houve um erro: " + err)
  })
})
//Rotas das postagens
router.get("/postagens", eAdmin, (req,res)=>{
  Postagem.find().populate("categoria")
  .sort({data:"desc"})
  .then((postagens)=>{
    res.render("admin/postagens",{postagens:postagens})
  }).catch((err)=>{
    req.flash("error_msg", "Houve um erro ao listar as postagens")
    res.redirect("admin/postagens")
    console.log("houve um erro: " + err)
  })
})
//Pagina do formulário para add postagens
router.get("/postagens/add", eAdmin, (req,res)=>{
  Categoria.find()
  .then((categorias)=>{
    res.render("admin/addpostagens",{categorias:categorias})
  }).catch((err)=>{
    req.flash("error_msg", "Erro ao carregar o formulário")
    res.redirect("/admin")
    console.log("houve um erro: " + err)
  })
})
//validação do formulário de postagens
router.post("/postagens/nova", eAdmin, (req, res)=>{
  var erros =[]
  if(req.body.categoria == "0"){
    erros.push({texto:"Categoria inválida, registre uma categoria primeiro"})
  }
  if(erros.length > 0){
    res.render("admin/addpostagens",{erros:erros})
  }else{
    const  novaPostagem={
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug,
    }
    new Postagem(novaPostagem).save()
    .then(()=>{
      req.flash("success_msg"," Postagm criada com sucesso!")
      res.redirect("/admin/postagens")
    }).catch((err)=>{
      req.flash("error_msg", "Houve um erro ao criar a postagem")
      res.redirect("/admin/postagens")
      console.log("houve um erro: " + err)
    })
  }
})

//Rota para editar as postagens
router.get("/postagens/edit/:id", eAdmin, (req, res)=>{

  Postagem.findOne({_id: req.params.id})
  .then((postagem)=>{
    Categoria.find()
    .then((categorias)=>{
      res.render("admin/editpostagens",{categorias:categorias,postagem:postagem})
    }).catch((err)=>{
      req.flash("error_msg","Houve um erro ao listar as categorias")
      res.render("admin/postagens")
      console('erro: '+ err)
    })
  }).catch((err)=>{
    req.flash("error_msg","Houve um erro ao carregar o formuládio de edição")
    res.redirect("/admin/editpostagens")
    console('erro: '+ err)
  })

})
//validar formulario de edição de postagens
router.post("/postagens/edit", eAdmin, (req,res)=>{
  Postagem.findOne({_id: req.body.id})
  .then((postagem)=>{
    postagem.titulo = req.body.titulo,
    postagem.slug = req.body.slug,
    postagem.descricao = req.body.descricao,
    postagem.conteudo = req.body.conteudo,
    postagem.categoria = req.body.categoria

    postagem.save().then(()=>{
      req.flash("success_msg", "Postagem editada com sucesso!")
      res.redirect("/admin/postagens")
    }).catch((err)=>{
      req.flash("error_msg","Erro interno")
      res.redirect("/admin/postagens")
      console.log("erro:" + err)
    })

    }).catch((err)=>{
    req.flash("error_msg", "Houve um erro ao salvar edição")
    res.redirect("/admin/postagens")
  })
})
//Deletar postagem
router.get("/postagens/delete/:id", eAdmin, (req,res)=>{
  Postagem.deleteOne({_id: req.params.id})
  .then(()=>{
    req.flash("success_msg","Postagem deletada com sucesso")
    res.redirect("/admin/postagens")
  }).catch((err)=>{
    req.flash("error_msg", "Não foi possivel deletar a postagem")
    res.redirect("admin//postagens")
    console.log("erro:" + err)
  })
})

export default router;
