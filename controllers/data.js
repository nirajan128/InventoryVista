import express from "express"
import db from "../config/database.js"
import passport from "../config/database.js";

const router = express();

//Middileware to insure if the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('loginError', 'User does not exist');
    res.redirect('/');
  }
}

//for inventory page of each user
router.get("/inventory",ensureAuthenticated ,async (req,res) =>{

    try {
        const userId = req.user.user_id;
        const userData = await db.query("SELECT * FROM users WHERE user_id = $1", [userId]);
        const supplierData =  await db.query(
            "SELECT supplier_id, supplier_name, contact_info FROM suppliers WHERE user_id = $1",
            [userId]
          );
          const query = `
          SELECT 
            products.item_id,
            products.item_name,
            Suppliers.supplier_name,
            Min_Stock.min_stock_level,
            Available_Stock.available_stock,
            to_order.to_order
          FROM 
            products
          INNER JOIN 
            Suppliers ON products.supplier_id = Suppliers.supplier_id
          INNER JOIN 
            Min_Stock ON products.item_id = Min_Stock.item_id
          INNER JOIN 
            Available_Stock ON products.item_id = Available_Stock.item_id
          INNER JOIN
            to_order ON products.item_id = to_order.item_id
          WHERE 
            products.user_id = $1;
        `;
    
        //All data
        const allData = await db.query(query, [userId])
    
       
            //rows of data
        const suppliers = supplierData.rows;
        const userDataRows = userData.rows;
        const allDataRows = allData.rows;
    
        res.render("index.ejs",{
            user : req.user,
            users: userDataRows,
            suppliers:  suppliers,
            allData: allDataRows,
            totalItem : allDataRows.length
        })
        
    } catch (error) {
        console.error("Error fetching data", error);
        res.status(500).send("Internal Server Error"); 
    }
   
  })


  //Adding items
  router.post("/addItem", ensureAuthenticated, async(req,res) => {
       try {
          const item_name = req.body["itemName"];
          const productUser = req.user.user_id; 
          let productQuantity = parseInt(req.body["quantity"]);
          const supplierID = req.body["supplier"]
          const min_stock = parseInt(req.body["min_stock"])

          await db.query("BEGIN");

          const addItem = await db.query("INSERT INTO products (item_name, supplier_id, user_id, item_quantity) VALUES ($1, $2, $3, $4) RETURNING item_id",
            [item_name, supplierID, productUser, productQuantity]);
        
            //get id of the item and set initial available stock value to item_quantity
        const item_id = addItem.rows[0].item_id;
        await db.query(
            "INSERT INTO available_Stock (item_id, available_stock, user_id) VALUES ($1, $2, $3)",
            [item_id, productQuantity, productUser]
          );

          //set minimum stock level
          await db.query(
            "INSERT INTO Min_Stock (item_id, min_stock_level, user_id) VALUES ($1, $2, $3)",
            [item_id, min_stock, productUser]
          );
        
          
          const to_order = min_stock - productQuantity;
          await db.query("INSERT INTO to_order (item_id, to_order) VALUES ($1,$2)",
            [item_id, to_order]
          );

          await db.query("COMMIT");
          res.redirect("/inventory")


       } catch (error) {
        console.error("Error adding items", error);
        res.status(500).send("Internal Server Error");
       }

  })

  router.post("/addSupplier", ensureAuthenticated, async (req, res) => {
    try {
      const supplierContact = req.body["contact"];
      const productSupplier = req.body["supplier"];
      const productUser = req.user.user_id;
  
      await db.query(
        "INSERT INTO suppliers (supplier_name, contact_info, user_id) VALUES ($1, $2, $3);",
        [productSupplier, supplierContact, productUser]
      );
      res.redirect("/inventory");
    } catch (error) {
      console.error("Error adding supplier", error);
      res.status(500).send("Internal Server Error");
    }
  });
  router.post("/updateStock", ensureAuthenticated, async(req,res)=> {
    try {
        const item_id = parseInt(req.body.item_id);
        const available_stock = parseInt(req.body.available_stock);
        const min_stock_level = parseInt(req.body.min_stock_level);
    
        if (isNaN(item_id) || isNaN(available_stock)) {
          throw new Error("Invalid item_id or available_stock");
        }
    
        await db.query(
          "UPDATE available_stock SET available_stock = $1 WHERE item_id = $2 AND user_id = $3",
          [available_stock, item_id, req.user.user_id]
        );
    
        await db.query(
          "UPDATE min_stock SET min_stock_level = $1 WHERE item_id = $2 AND user_id = $3",
          [min_stock_level, item_id, req.user.user_id]
        );
    
        const new_to_order = min_stock_level - available_stock;
    
        await db.query(
          "UPDATE to_order SET to_order = $1 WHERE item_id = $2 AND user_id = $3",
          [new_to_order, item_id, req.user.user_id]
        );
    
        res.redirect("/inventory");
      } catch (error) {
        console.error("Error updating stock", error);
        res.status(500).send("Internal Server Error");
      }
  })


  export default router;