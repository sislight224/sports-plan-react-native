var express = require('express');
var router = express.Router();
const ensureAuthenticated = require('../modules/ensureAuthenticated')
const Product = require('../models/Product')
const Variant = require('../models/Variant')
const Department = require('../models/Department')
const Category = require('../models/Category')
const TypedError = require('../modules/ErrorHandler')
const Cart = require('../models/Cart');
const Board = require('../models/Board');
const CartClass = require('../modules/Cart')
const User = require('../models/User')
const paypal_config = require('../configs/paypal-config')
const paypal = require('paypal-rest-sdk')

const { uploadProductImage, uploadVariantImage } =  require("../utils/multer");
const YOUR_STRIPE_SECRET_KEY = "sk_test_51OFqZlKNQd6FEMJUq2p0UWI68YgVXJyd82K93W1sMtpN7YnFeGGeoMWSDhj03FtiIkoaffWDwIs7g5LotWShXAGO006kjkVWqu";
const stripe = require('stripe')(YOUR_STRIPE_SECRET_KEY);

//GET /products
router.get('/products', function (req, res, next) {
  const { query, order } = categorizeQueryString(req.query)
  Product.getAllProducts(query, order, function (e, products) {
    if (e) {
      e.status = 406; return next(e);
    }
    if (products.length < 1) {
      return res.status(404).json({ message: "products not found" })
    }
    res.json({ products: products })
  })
});

//GET /products/:id
router.get('/products/:id', function (req, res, next) {
  let productId = req.params.id;
  Product.getProductByID(productId, function (e, item) {
    if (e) {
      e.status = 404; return next(e);
    }
    else {
      res.json({ product: item })
    }
  });
});

//GET /variants
router.get('/variants', function (req, res, next) {
  let { productId } = req.query
  if (productId) {
    Variant.getVariantProductByID(productId, function (err, variants) {
      if (err) return next(err)
      return res.json({ variants })
    })
  } else {
    Variant.getAllVariants(function (e, variants) {
      if (e) {
        if (err) return next(err)
      }
      else {
        return res.json({ variants })
      }
    })
  }
})

//GET /variants/:id
router.get('/variants/:id', ensureAuthenticated, function (req, res, next) {
  let id = req.params.id
  if (id) {
    Variant.getVariantByID(id, function (err, variants) {
      if (err) return next(err)
      res.json({ variants })
    })
  }
})

//GET /departments
router.get('/departments', function (req, res, next) {
  Department.getAllDepartments(req.query, function (err, d) {
    if (err) return next(err)
    res.status(200).json({ departments: d })
  })
})

//GET /categories
router.get('/categories', function (req, res, next) {
  Category.getAllCategories(function (err, c) {
    if (err) return next(err)
    res.json({ categories: c })
  })
})

//GET /search?
router.get('/search', function (req, res, next) {
  const { query, order } = categorizeQueryString(req.query)
  query['department'] = query['query']
  delete query['query']
  Product.getProductByDepartment(query, order, function (err, p) {
    if (err) return next(err)
    if (p.length > 0) {
      return res.json({ products: p })
    } else {
      query['category'] = query['department']
      delete query['department']
      Product.getProductByCategory(query, order, function (err, p) {
        if (err) return next(err)
        if (p.length > 0) {
          return res.json({ products: p })
        } else {
          query['title'] = query['category']
          delete query['category']
          Product.getProductByTitle(query, order, function (err, p) {
            if (err) return next(err)
            if (p.length > 0) {
              return res.json({ products: p })
            } else {
              query['id'] = query['title']
              delete query['title']
              Product.getProductByID(query.id, function (err, p) {
                let error = new TypedError('search', 404, 'not_found', { message: "no product exist" })
                if (err) {
                  return next(error)
                }
                if (p) {
                  return res.json({ products: p })
                } else {
                  return next(error)
                }
              })
            }
          })
        }
      })
    }
  })
})

// GET filter
router.get('/filter', function (req, res, next) {
  let result = {}
  let query = req.query.query
  Product.filterProductByDepartment(query, function (err, p) {
    if (err) return next(err)
    if (p.length > 0) {
      result['department'] = generateFilterResultArray(p, 'department')
    }
    Product.filterProductByCategory(query, function (err, p) {
      if (err) return next(err)
      if (p.length > 0) {
        result['category'] = generateFilterResultArray(p, 'category')
      }
      Product.filterProductByTitle(query, function (err, p) {
        if (err) return next(err)
        if (p.length > 0) {
          result['title'] = generateFilterResultArray(p, 'title')
        }
        if (Object.keys(result).length > 0) {
          return res.json({ filter: result })
        } else {
          let error = new TypedError('search', 404, 'not_found', { message: "no product exist" })
          return next(error)
        }
      })
    })
  })
})

//POST Add Category
router.post('/categories/', function (req, res, next) {
  const { name } = req.body
  console.log(name)
  if(name == '') {
    let err = new TypedError('name empty error', 400)
    return next(err)
  }

  var newCategory = new Category({
    categoryName: name
  })

  Category.createCategory(newCategory, function(err, c) {
    if(err) next(err)
    res.json({
      category: c
    })
  })

})

//GET /checkout
router.get('/checkout/:cartId', ensureAuthenticated, function (req, res, next) {
  const cartId = req.params.cartId
  const frontURL = 'https://zack-ecommerce-reactjs.herokuapp.com'
  // const frontURL = 'http://localhost:3000'

  Cart.getCartById(cartId, function (err, c) {
    if (err) return next(err)
    if (!c) {
      let err = new TypedError('/checkout', 400, 'invalid_field', { message: 'cart not found' })
      return next(err)
    }
    const items_arr = new CartClass(c).generateArray()
    const paypal_list = []
    for (const i of items_arr) {
      paypal_list.push({
        "name": i.item.title,
        "price": i.item.price,
        "currency": "CAD",
        "quantity": i.qty
      })
    }
    const create_payment_json = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": frontURL + '/success_page',
        "cancel_url": frontURL + '/cancel_page'
      },
      "transactions": [{
        "item_list": {
          "items": paypal_list
        },
        "amount": {
          "currency": "CAD",
          "total": c.totalPrice
        },
        "description": "This is the payment description."
      }]
    }
    paypal.configure(paypal_config);
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        console.log(JSON.stringify(error));
        return next(error)
      } else {
        console.log(payment);
        for (const link of payment.links) {
          if (link.rel === 'approval_url') {
            res.json(link.href)
          }
        }
      }
    });
  })
})

//GET /payment/success
router.get('/payment/success', ensureAuthenticated, function (req, res, next) {
  var paymentId = req.query.paymentId;
  var payerId = { payer_id: req.query.PayerID };
  paypal.payment.execute(paymentId, payerId, function (error, payment) {
    if (error) {
      console.error(JSON.stringify(error));
      return next(error)
    } else {
      if (payment.state == 'approved') {
        console.log('payment completed successfully');
        console.log(payment);
        res.json({ payment })
      } else {
        console.log('payment not successful');
      }
    }
  })
})

//API GET User list
router.get("/api/users/", function (req, res, next) {
  User.getAllUsers(function(err, u) {
    if (err) return next(err)
    res.json({ allUsers : u })
  })
})

//API GET User Data by ID
router.get("/api/users/:id", function (req, res, next) {
  const id = req.params.id;
  User.getUserById(id, function (err, u) {
    if (err) return next(err)
    if (!u) {
      let err = new TypedError('/checkout', 400, 'invalid_field', { message: 'user not found' })
      return next(err)
    }

    res.json({
      user: u
    })

  })
})

//API GET Category Data by ID
router.get('/api/categories/:id', function(req, res, next) {
  const id = req.params.id;

  Category.getCategoryById(id, function(err, category) {
    if(err) return next(err)

    res.json({
      category: category
    })
  })
})

//API PATCH Category update
router.patch('/api/categories/:id', function(req, res, next) {
  const id = req.params.id;
  const { name } = req.body;

  Category.updateCategory(id, name, function(err, c) {
    if(err) next(err)

    res.json({
      category: c
    })
  })
})

//API GET Products by category
router.get('/api/products/:categoryID', function(req, res, next) {
  const categoryID = req.params.categoryID;

  Category.getCategoryById(categoryID, function(err, category) {
    if(err) next(err)

    Product.getProductByCategory({category : category.categoryName}, null, function(err, products) {
      if(err) next(err)  
      res.json({
        products: products
      })
    })
  })
})

//API DELETE Product by id
router.delete('/api/products/delete/:productID', function(req, res, next) {
  const productID = req.params.productID;

  console.log(productID)
  Product.deleteOne({
    _id: productID
  }, function(err, product) {
    if(err) next(err)

    res.json(product)
  })
})

//API PATCH Product by data
router.patch('/api/products/update/:productID', function(req, res, next) {
  const productID = req.params.productID;
  const {name, price, quantity, category, description} = req.body

  Product.findOneAndUpdate({ _id: productID }, {
    name: name,
    price: price,
    quantity: quantity,
    category: category,
    description: description,
  }, function(err, product) {
    if(err) next(err)

    res.json(product)
  })
})

//API PATCH Product by image
router.post('/api/products/update/image/:productID', uploadProductImage.single('image'), function(req, res, next) {
  const productID = req.params.productID;
  // const { image } = req.body
  const imagePath = req.productID;
  Product.findByIdAndUpdate(productID, {
    imagePath: `products/${imagePath}`
  }, function(err, product) {
    if(err) next(err)
    res.json(product)
  })
})

//API POST create Product by image
router.post('/api/products/create/product', uploadProductImage.single('image'), function(req, res, next) {
  const {title, price, quantity, category, description} = req.body
  const imagePath = 'products/' + req.productID;
  var newProduct = new Product({
    title: title,
    price: price,
    imagePath: imagePath,
    quantity: quantity,
    category: category,
    description: description,
  })
  
  newProduct.save(function(err, product) {
    if(err) next(err)

    res.json(product)
  })
})

//API POST Product Image
router.post('/api/products/image', uploadProductImage.single('image'), function(req, res, next) {
  const imagePath = `products/${req.productID}`;

  res.json({
    imagePath: imagePath
  })
})

//API GET Varient
router.get('/api/variant/:productId', function(req, res, next) {
  const productId = req.params.productId;

  Variant.getVariantProductByID(productId, function(err, variants) {
    if(err) next(err)

    res.json({
      variants: variants
    })
  })

})

//API DELETE Variant
router.delete("/api/variants/delete/:variantId", function(req, res, next) {
  const variantId = req.params.variantId;

  Variant.deleteVariantByID(variantId, function(err, varient) {
    if(err) next(err)

    res.json({
      varient: varient
    })
  })
})

//API POST CREATE Variant
router.post('/api/variants/create/', uploadVariantImage.single('image'), function(req, res, next) {
  const variantID = req.variantID;

  const {size, color, quantity, productID} = req.body
  const imagePath = 'variants/' + variantID;
  var newVariant = {
    size: size,
    color: color,
    imagePath: imagePath,
    quantity: quantity,
    productID: productID,
  }
  
  Variant.createVariant(newVariant, function(err, variant) {
    if(err) next(err)

    res.json({variant : variant})
  })
})

//API GET Variant BY ID
router.get('/api/variants/:id', function (req, res, next) {
  let id = req.params.id
  if (id) {
    Variant.getVariantByID(id, function (err, variants) {
      if (err) return next(err)
      res.json({ variants })
    })
  }
})


//API PATCH Product by data
router.patch('/api/variants/update/:variantID', function(req, res, next) {
  const variantID = req.params.variantID;
  const {size, color, quantity, productID} = req.body

  Variant.findOneAndUpdate({ _id: variantID }, {
    size: size,
    color: color,
    quantity: quantity,
    productID: productID,
  }, function(err, variant) {
    if(err) next(err)

    res.json(variant)
  })
})

//API PATCH Product by image
router.post('/api/variants/update/image/:variantID', uploadVariantImage.single('image'), function(req, res, next) {
  const variantID = req.params.variantID;
  // const { image } = req.body
  const imagePath = req.variantID;
  Variant.findByIdAndUpdate(variantID, {
    imagePath: `variants/${imagePath}`
  }, function(err, variant) {
    if(err) next(err)
    res.json(variant)
  })
})

// Board data save API
router.post('/api/saveBoard', function(req, res, next) {
  const {data, userId, boardType, isShare, boardId, boardName, date} = req.body;
  console.log("saveBoard--------", data, userId, boardId, boardType, isShare)

  var newBoard = {
    userId: userId,
    data: data,
    boardType: boardType,
    isShare: isShare,
    name: boardName,
    date: date
  }
  Board.updateBoardById(boardId, newBoard, function(err, board) {
    if(err) next(err)

    res.json({board : board})
  })

})

// Board data create API
router.post('/api/createBoard', function(req, res, next) {
  const {data, userId, boardType, isShare, boardId, boardName, date} = req.body;
  console.log("create Board--------",data, userId, boardId, boardType, isShare)

  var newBoard = {
    userId: userId,
    data: data,
    boardType: boardType,
    isShare: isShare,
    name: boardName,
    date: date
  }
  
  Board.createBoard(newBoard, function(err, board) {
    if(err) next(err)

    res.json({board : board})
  })

})

// Board data create date API
router.post('/api/createBoardByDate', function(req, res, next) {
  const {id, date} = req.body;
  console.log("create Board--------",id, date)


  Board.getBoardById(id, function(err, board) {
    if(err) next(err)

    var newBoard = {
      userId: board.userId,
      data: board.data,
      boardType: board.boardType,
      isShare: board.isShare,
      date: date,
      name: board.name
    }

    console.log("get board -------------", newBoard)


    Board.createBoard(newBoard, function(err, board) {
      if(err) next(err)
  
      res.json({board : board})
    })
    // res.json(board)
  })

})
// POST get Board data API
router.post('/api/getBoards', function(req, res, next) {
  const searchType = req.body;
  console.log("get Boards--------",searchType)
  Board.getAllBoards(searchType, function(err, board) {
    if(err) next(err)
    res.json(board)
  })
})
// POST get Board data by id API
router.post('/api/getBoardById', function(req, res, next) {
  const {id} = req.body;
  console.log("get Boards--------",id)
  Board.getBoardById(id, function(err, board) {
    if(err) next(err)
    res.json(board)
  })
})

// POST get Board data by id API
router.post('/api/payment_intent', function(req, res, next) {
  // const {id} = req.body;
  // Create a payment intent
  const createPaymentIntent = async () => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 3000, // Amount in cents (e.g., $10.00)
        currency: 'usd',
      });

      return paymentIntent.client_secret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  };

  // Example usage
  createPaymentIntent()
    .then(clientSecret => {
      console.log('Payment Intent Client Secret:', clientSecret);
      // Pass the clientSecret back to your React Native app
      res.json(clientSecret);
    })
    .catch(error => {
      console.error('Error:', error);
      // Handle the error
    });
})

//Post get stripe payment sheet
router.post('/payment-sheet', async (_, res) => {

  

  const customers = await stripe.customers.list();

  const customer = customers.data[0];
  if(!customer) {
    return res.send({
      error: 'You have no customer created.'
    })
  }

  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {apiVersion: '2020-03-02'},
  );
  // console.log("--------ephemeralKey-", ephemeralKey);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: 100 * 100,
    currency: 'usd',
    customer: customer.id,
    payment_method_types: [
      'card'
    ]
  });

  return res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id
  })

})


function generateFilterResultArray(products, targetProp) {
  let result_set = new Set()
  for (const p of products) {
    result_set.add(p[targetProp])
  }
  return Array.from(result_set)
}

function categorizeQueryString(queryObj) {
  let query = {}
  let order = {}
  //extract query, order, filter value
  for (const i in queryObj) {
    if (queryObj[i]) {
      // extract order
      if (i === 'order') {
        order['sort'] = queryObj[i]
        continue
      }
      // extract range
      if (i === 'range') {
        let range_arr = []
        let query_arr = []
        // multi ranges
        if (queryObj[i].constructor === Array) {
          for (const r of queryObj[i]) {
            range_arr = r.split('-')
            query_arr.push({
              price: { $gt: range_arr[0], $lt: range_arr[1] }
            })
          }
        }
        // one range
        if (queryObj[i].constructor === String) {
          range_arr = queryObj[i].split('-')
          query_arr.push({
            price: { $gt: range_arr[0], $lt: range_arr[1] }
          })
        }
        Object.assign(query, { $or: query_arr })
        delete query[i]
        continue
      }
      query[i] = queryObj[i]
    }
  }
  return { query, order }
}

module.exports = router;
