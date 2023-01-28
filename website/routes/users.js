const express = require("express");

const router = express.Router();

const db = require("../data/db");

const session = require("express-session");

const sequelize = require("../data/db");


var mysql2 = require('mysql2/promise');
var MySQLStore = require('express-mysql-session')(session);
const config = require("../config");

var sessionStore;
var connection = mysql2.createPool(config.db);
sessionStore = new MySQLStore(session, connection);




router.use(session({
    secret: "hello world",
    resave: false,
    saveUninitialized: false,
    //store: sessionStore
}));


router.use(express.urlencoded({ extended: false }));


router.use(express.static("public"));

var added = [];
var cart = [];
var find_update_item = [];
var selected_table =[];
var column =[];

var find_id=0;
var find_diet_id=0;

router.use("/recipes", async function (req, res) {
    
    res.render("recipes", {
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type
    });


});

router.use("/dp", async function (req, res) {
    
    res.render("diet_programs", {
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type
    });


});



// dietisyenin gelen diyet isteklerini gördüğü yer olcak
router.use("/admin/:table", async function (req, res) {


    const table_name=req.params.table;
    const sql="select * from "+table_name;  
    [selected_table ,] = await db.execute(sql);
      
    if(selected_table.length>0){
        column= Object.keys(selected_table[0]);
    }
  

    const text=req.body.textarea;  
    const button=req.body.submit;

    var admin_sql="";

    if(button =="INSERT"){
        admin_sql=button+" INTO "+ table_name +" VALUES (" + text + ")";
        await db.execute(admin_sql);
        admin_sql="";

    }
    else if(button=="DELETE"){
        admin_sql=button+" FROM " + table_name + " WHERE "+column[0] +"="+text;

        await db.execute(admin_sql);
        admin_sql="";
    }
    else if(button=="UPDATE"){
        
        admin_sql=button +" "+ table_name + " SET " +text.substring(2) + " WHERE " + column[0] +"="+ text.substring(0,1);
        await db.execute(admin_sql);
        admin_sql="";

    }
    
    [selected_table ,] = await db.execute(sql);//databasei güncel vermesi için
   
    res.render("adminpage", {
        column:column,
        table: selected_table,
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type
    });


});


// dietisyenin gelen diyet isteklerini gördüğü yer olcak
router.use("/ap", function (req, res) {
    column=[];
    selected_table=[];
    res.render("adminpage", {
        column: column,
        table: selected_table,
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type
    });
});



// spor hocasının gelen spor isteklerini görüp cevapladığı yer olcak
router.use("/dr/:user_id", async function (req, res) {

   
    find_diet_id=req.params.user_id;
    var text=req.body.textarea;

    var [control,]=await db.execute("select * FROM response_diet");
    var flag=false;
    control.forEach(element => {
        if(element.id == find_diet_id){
            flag=true;
        }  
    });

    if(!flag){
        var sql="INSERT INTO response_diet VALUE (?, ?)";
        var column =[find_diet_id,text];
        db.query(sql,column);
        await db.execute("DELETE FROM online_diet WHERE id=?", [find_diet_id]);
    }
    
    
    res.redirect("/dr");
});

// dietisyenin gelen diyet isteklerini gördüğü yer olcak
router.get("/dr", async function (req, res) {

    const [dr,] = await db.execute("select * FROM online_diet WHERE dietician=?",[req.session.user_id]);
    res.render("dietrequest", {
        diet_request:dr,
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type
    });

   
});


// spor hocasının gelen spor isteklerini görüp cevapladığı yer olcak
router.post("/sr/:user_id", async function (req, res) {

    find_id=req.params.user_id; 
    var text=req.body.textarea;

    var [control,]=await db.execute("select * FROM response_sport");
    var flag=false;
    control.forEach(element => {
        if(element.id == find_id){
            flag=true;
        }  
    });

    if(!flag){
        var sql="INSERT INTO response_sport VALUE (?, ?)";
        var column =[find_id,text];
        db.query(sql,column);
        await db.execute("DELETE FROM online_sport WHERE id=?", [find_id]);
    }
    
    
    res.redirect("/sr");
});

// spor hocasının gelen spor isteklerini görüp cevapladığı yer olcak
router.get("/sr", async function (req, res) {
    var text=req.body.textarea;
    
    const [sr,] = await db.execute("select * FROM online_sport WHERE personal_trainer=?",[req.session.user_id]);
    
    res.render("sportrequest", {
        sport_request:sr,
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type
    });
});




//add new product spor hocası ve dietisyen ekleyecke
router.use("/newproduct", function (req, res) {
    res.render("newproduct", {
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type
    });
});



//logout
router.get("/logout", async function (req, res) {
    let ts = Date.now();

    let date_ob = new Date(ts);
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();


    var random_number = Math.random() * 200 + 1700;
    const login_date = year + "-" + month + "-" + hours + "-" + minutes;
    var control =[login_date,req.session.user_id];
    
    var control_sql="UPDATE login SET logout_date =? WHERE user_id=?";
   
    db.query(control_sql,control);

    req.session.destroy();
    res.redirect("/login");
});

//LOGİN
router.get("/login", function (req, res) {
    const message=req.session.message;
    delete req.session.message;

    res.render("login", {
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type,
        message:message

    });
});

router.post("/login", async function (req, res) {

    const email = req.body.emailname;
    const password = req.body.password;
    const type = req.body.type;
    var flag = false;
    const [users,] = await db.execute("select * from users");

    users.forEach(user => {
        if (user.password == password && user.email == email && user.type == type) {
            flag = true;
            req.session.user_id = user.id;
            req.session.user_type = user.type;

        }
    });



    if (!flag) {
        res.render("login", {
            message: "email or password wrong",
            sessionname: req.session.sessionname,
            user_id: req.session.user_id,
            user_type: req.session.user_type,
        });
    }
    else {
        let ts = Date.now();

        let date_ob = new Date(ts);
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();


        var random_number = Math.random() * 200 ;
        const login_date = year + "-" + month + "-" + hours + "-" + minutes;
        var date =[random_number,login_date,0,req.session.user_id];
        var login_date_sql="INSERT INTO login VALUES (?,?,?,?)";
        db.query(login_date_sql,date);
        
        flag = false; 
        req.session.sessionname = 1;

        res.render("login", {
            sessionname: req.session.sessionname,
            user_id: req.session.user_id,
            user_type: req.session.user_type

        });

    }
});

///my account kısmına girip dietlerini görmek isterse
router.use("/myacc/diet", async function (req, res) {
    const [replied_diet ,] =await db.execute("select * FROM response_diet WHERE id=?",[req.session.user_id]);

    res.render("myaccdiet", {
        replied_diet:replied_diet,
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type

    });
});

//my account kısmındaki spor listlerini görüntüleyecek
router.use("/myacc/sport", async function (req, res) {

    const [replied_sport ,] =await db.execute("select * FROM response_sport WHERE id=?",[req.session.user_id]);
   
    res.render("myaccsport", {
        replied_sport:replied_sport,
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type

    });

});

//my account kısmına girip verdiği siparişleri görmek isterse
router.use("/myacc/orders", async function (req, res) {

    if (req.session.user_id != "undefined") {
        const [orders,] = await db.execute("select * from order_details where user_id=?", [req.session.user_id]);


        res.render("myacc", {
            orders: orders,
            sessionname: req.session.sessionname,
            user_id: req.session.user_id,
            user_type: req.session.user_type

        });

    }
});
//kullanıcı giriş yaptı hesabım butonuna tıkladı kullanıcının sahip olduğu spor ve diyet listeleri görüntülenir ve siparişi varsa o da görüntülenir.
router.use("/myacc", function (req, res) {

    res.render("myacc", {
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type

    });

});

//Card ekranında confirm derse eğer ödeme ekranı açılır.
router.get("/order", function (req, res) {
   
    res.render("order", {
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type,
        message: ""
    });
});

router.post("/order", async function (req, res) {
    
    const card_number = req.body.card_number;
    const cvv = req.body.cvv;
    const expiration_date = req.body.expiration_date;

    let ts = Date.now();

    let date_ob = new Date(ts);
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();


    var products = "";
    const purchase_date = year + "-" + month + "-" + hours + "-" + minutes;
    var random = 0;

    const [order_details,] = await db.execute("select * from order_details"); 
    const [order_items,] = await db.execute("select * from cart_product"); 

    order_items.forEach(element => {
        products += "Product Name: " + element.name + " Count: " + element.inCart + " ; ";
    });

    order_details.forEach(element2 => {
        while (true) {
            random = Math.random() * (150 - 0) + 0;
            if (element2.order_id != random) {
                break;
            }
        }
    });


    if (req.session.user_id != null) {
        var order = [random, req.session.total_cost, products, purchase_date, req.session.user_id];
        var sql = "INSERT INTO order_details VALUES (? , ? ,? ,?,?)";
        db.query(sql, order);

        await db.execute("DELETE FROM cart_product WHERE product_id >0");


        res.redirect("/order");
    }
    else {
        req.session.message="Please login first"
        res.redirect("/login");
    }





});

//Create account
router.get("/createAccount", function (req, res) {
    res.render("account", {
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type
    });
});



router.post("/createAccount", async function (req, res) {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const password = req.body.password;
    const emailname = req.body.emailname;
    const id = req.body.identity;
    const type = "user";


    if (firstname != "" && lastname != "") {
        try {
            var user = [id, firstname, lastname, password, emailname, type];
            var sql = "INSERT INTO users VALUES (? , ? ,? ,? ,? ,?)";
            db.query(sql, user);

        } catch (error) {
            console.log(error);
        }

    }

    res.render("account", {
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type
    });
});




//Online diet istekleri database'e kaydedilir
router.get("/od", async function (req, res) {
    
    var [dieticians,]= await db.execute("select * from users WHERE type='dietician'");

    
    res.render("online_diet", {
        dieticians: dieticians,
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type
    });
});

router.post("/od", async function (req, res) {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const emailname = req.body.emailname;
    const weight = req.body.weight;
    const height = req.body.height;
    const phone_number = req.body.phone_number;
    const id_number = req.body.id_number;
    const gender = req.body.gender;
    const dietician = req.body.dietician;

    var online_diet = [id_number, firstname, lastname, emailname, weight, height, phone_number, gender, dietician];


    var [od_list,]= await db.execute("select * from online_diet");

    var flag=false;

    od_list.forEach(element => {
        if(element.id == id_number ){
            flag=true;
        }
    });

    if(!flag){
        if(req.session.user_id !=null){
            var sql = "INSERT INTO online_diet VALUES (? , ? ,? ,?,?,?,?,?,?)";
            db.query(sql, online_diet);
            res.redirect("/od");
        }
        else{
            res.redirect("/login");
        }
       

    }
    else{
        res.redirect("/od");
    };

    


   

});


//Online sport istekleri database'e kaydedilir
router.get("/os", async function (req, res) {

    var [pt,]= await db.execute("select * from users WHERE type='pt'");
    
    res.render("online_sport", {
        personal_trainer:pt,
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type
    });
});

router.post("/os", async function (req, res) {

    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const emailname = req.body.emailname;
    const weight = req.body.weight;
    const height = req.body.height;
    const phone_number = req.body.phone_number;
    const id_number = req.body.id_number;
    const sport_type = req.body.sport_type;
    const gender = req.body.gender;
    const personal_trainer = req.body.personal_trainer;

    var online_sport = [id_number, firstname, lastname, emailname, weight, height, phone_number, sport_type, gender, personal_trainer];

    var [os_list,]= await db.execute("select * from online_sport");

    var flag=false;

    os_list.forEach(element => {
        if(element.id == id_number ){
            flag=true;
        }
    });

    if(!flag){
        if(req.session.user_id !=null){
            var sql = "INSERT INTO online_sport VALUES (? , ? ,? ,? ,? ,? ,? ,? ,? ,?)";
            db.query(sql, online_sport);
            res.redirect("/os");
        }
        else{
            res.redirect("/login");
        }
        

    }
    else{
        res.redirect("/os");
    }
    

});



router.use("/store/:productid", async function (req, res) {

    var breakException = { error: "" };
    const id = req.params.productid;
    var flag = false;

    try {

        [added,] = await db.execute("select * from product where product_id=?", [id]);

        [cart,] = await db.execute("select * from cart_product"); 
      

        if (cart.length <= 0) {// cart arrayi ilk başta boşsa
            var x = 0;
            x = Number(added[0].inCart) + 1;
            var denemearra = [added[0].product_id, added[0].name, added[0].price, added[0].count, added[0].image, added[0].ptid, added[0].product_definition, x];
            var sql = "INSERT INTO cart_product VALUES (? , ? ,? ,? ,? ,? ,? , ?)";

            db.query(sql, denemearra);

        }
        else {//cart arrayinini içi doluysa


            cart.forEach(async element => {
                if (element.product_id == id) { // carttaki tüm elemanları dolaşsın böyle bir id yoksa ekleme yapalım yoksa duplicate oluyor
                    flag = true;

                    [find_update_item,] = await db.execute("select * from cart_product WHERE product_id=?", [id]); // update edilecek ürünün incart bilgisi alınır 1 eklenerek update edilir
                    var x = 0;
                    x = Number(find_update_item[0].inCart);
                    x = x + 1;
                    var sql = "UPDATE cart_product SET inCart =? WHERE product_id =?";
                    var update_arr = [x, id];
                    db.query(sql, update_arr);

                }

            });
            if (!flag) {// yeni gelen ürünlerin eklenme yeri

                added[0].inCart = Number(added[0].inCart) + 1;// ürünün carttaki sayısını 1 arttırmaya çalışıyorum
                var denemearra = [added[0].product_id, added[0].name, added[0].price, added[0].count, added[0].image, added[0].ptid, added[0].product_definition, added[0].inCart];
                var sql = "INSERT INTO cart_product VALUES (? , ? ,? ,? ,? ,? ,? , ?)";
                db.query(sql, denemearra);
                flag = false;
            }

        }
        res.redirect("/store");
    }
    catch (err) {
        console.log(err);
    }
});




router.use("/card/add/:productid", async function (req, res) {

    var breakException = { error: "" };
    const id = req.params.productid;

    try {
        const [increase,] = await db.execute("select * from cart_product");

        increase.forEach(async element => {

            if (element.product_id == id) {

                const [increased_item,] = await db.execute("select * from cart_product WHERE product_id=?", [id]);
                var x = 0;
                x = Number(increased_item[0].inCart);
                x = x + 1;
                var sql = "UPDATE cart_product SET inCart =? WHERE product_id =?";
                var update_arr = [x, id];
                db.query(sql, update_arr);

            }

        });

        res.redirect("/card");
    }
    catch (err) {
        console.log(err);
    }
});


router.use("/card/subtraction/:productid", async function (req, res) {

    var breakException = { error: "" };
    const id = req.params.productid;


    try {
        const [decrease,] = await db.execute("select * from cart_product");

        decrease.forEach(async element => {

            if (element.product_id == id) {

                const [decreased_item,] = await db.execute("select * from cart_product WHERE product_id=?", [id]);
                var x = 0;
                x = Number(decreased_item[0].inCart);
                x = x - 1;
                if (x <= 0) {
                    var sql = "DELETE FROM cart_product WHERE product_id=?";
                    db.query(sql, id);
                } else {
                    var sql = "UPDATE cart_product SET inCart =? WHERE product_id =?";
                    var update_arr = [x, id];
                    db.query(sql, update_arr);

                }


            }

        });

        res.redirect("/card");
    }
    catch (err) {
        console.log(err);
    }
});

router.use("/card", async function (req, res) {

    try {
        const [result,] = await db.execute("select * from cart_product")

        const [sum,] = await db.execute("SELECT SUM(price) AS total_price FROM cart_product WHERE inCart=1");

        const [onemore_item,] = await db.execute("select * from cart_product WHERE inCart>1"); 


        var total = 0;
        //ürün sayısı 1 den fazla olanların toplam tutarının hesaplanması
        onemore_item.forEach(element => {
            total = 0;
            total += element.inCart * element.price;
            sum[0].total_price = Number(sum[0].total_price) + total;
        });
      
        req.session.total_cost = sum[0].total_price;

        res.render("card", {
            addproducts: result,
            total: sum,
            sessionname: req.session.sessionname,
            user_id: req.session.user_id,
            user_type: req.session.user_type
        });


    } catch (error) {
        console.log(error);
    }

});


router.post("/dc", function (req, res) {
    var random_number = Math.random() * 200 + 1700;

    res.render("daily_calories", {
        random: random_number,
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type
    });
});



router.get("/dc", function (req, res) {
    var random_number = Math.random() * 200 + 1700;

    res.render("daily_calories", {
        random: 0,
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type
    });
});



router.use("/store", async function (req, res) {
    try {
        const [result,] = await db.execute("select * from product")

        res.render("store", {
            products: result,
            sessionname: req.session.sessionname,
            user_id: req.session.user_id,
            user_type: req.session.user_type
        });

    } catch (error) {
        console.log(error);
    }



});



router.use("/", function (req, res) {
    res.render("index", {
        sessionname: req.session.sessionname,
        user_id: req.session.user_id,
        user_type: req.session.user_type
    });
});

module.exports = router;