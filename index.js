var app = require('express')();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');

var queryGetProductList = 'SELECT * from product order by id';
var queryGetProductById = 'Select * from product where id={0}';

var port = process.env.PORT || 7777;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.get('/', function (req, res) {
    res.send('<h1>Hello Node.js</h1>');
});

app.get('/index', function (req, res) {
    res.send('<h1>This is index page</h1>');
});

app.listen(port, function () {
    console.log('Starting node.js on port ' + port);
});

app.post('/GetRegionList', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
            else {
                connection.query("select * from region", function (error, rows) {
                    connection.end();

                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        if (typeof rows !== 'undefined' && rows.length > 0) {
                            res.send(JSON.stringify({ status: 1, data: rows[0] }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                        }
                    }
                });
            }
        }
    });
});

app.post('/GetMaterialTypeList', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
            else {
                connection.query("select * from materialtype", function (error, rows) {
                    connection.end();

                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        if (typeof rows !== 'undefined' && rows.length > 0) {
                            res.send(JSON.stringify({ status: 1, data: rows[0] }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                        }
                    }
                });
            }
        }
    });
});

app.post('/Register', function (req, res) {
    var json = req.body;
    var name = json.name;
    var email = json.email;
    var password = bcrypt.hashSync(json.password);
    var isAdmin = json.isAdmin;
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    var selectExistEmailQuery = "select * from employee where email='" + email + "'";
    var insertQuery = "insert into employee (name, email, password, isAdmin) values('" + name + "','" + email + "','" + password + "'," + isAdmin + ")";
    connection.query(selectExistEmailQuery, function (error, rows) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: error }))
        if (rows.length > 0) {
            res.send(JSON.stringify({ status: 0, errorMessage: "This email already has registered." }))
        }
        else {
            connection.query(insertQuery, function (error, rows) {
                connection.end();
                if (error) res.send(JSON.stringify({ status: 0, errorMessage: error }))
                try {
                    res.send(JSON.stringify({ status: 1 }));
                }
                catch (err) {
                    res.send(JSON.stringify({ status: 0, errorMessage: "Cannot register." }))
                }
            });
        }
    });
});

app.post('/Login', function (req, res) {
    var json = req.body;
    var email = json.email;
    var password = json.password;
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    var query = "Select id, isadmin, password from employee where email='" + email + "'";
    connection.query(query, function (error, rows) {
        if (error) {
            connection.end();
            res.send(JSON.stringify({ status: 0, errorMessage: "Login fail, please check your email and password." }))
        }
        if (rows.length > 0) {
            if (bcrypt.compareSync(password, rows[0].password)) {
                var token = bcrypt.hashSync("login");
                var updateAuthenToken = "update employee set AuthenToken ='" + token + "' where id=" + rows[0].id;
                connection.query(updateAuthenToken, function (error, ans) {
                    connection.end();
                    if (error) res.send(JSON.stringify({ status: 0, errorMessage: "Login fail, please check your email and password." }));
                    else res.send(JSON.stringify({ status: 1, token: token, isAdmin: rows[0].isadmin }));
                });
            }
            else {
                res.send(JSON.stringify({ status: 0, errorMessage: "Login fail, please check your email and password." }))
            }
        }
        else {
            connection.end();
            res.send(JSON.stringify({ status: 0, errorMessage: "Login fail, please check your email and password." }))
        }
    });
});

app.get('/Logout', function (req, res) {
    var json = req.body;
    var userId = req.userId;
    var token = req.token;
    var query = "UPDATE employee set authentoken = null where id = " + 1 + " and authentoken = '" + token + "'";
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    connection.query(query, function (error, rows) {
        connection.end();
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: "Login fail, please check your email and password." }))
        else res.send({ status: 1 })
    });
});

function isLogin(userId, token, callback) {
    var checkTokenQuery = "Select id from employee where id=" + userId + " and authentoken='" + token + "'";
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    connection.query(checkTokenQuery, function (error, rows) {
        if (error) {
            callback(error, false);
        }
        else {
            if (typeof rows !== 'undefined' && rows.length > 0) {
                callback(false, true);
            }
            else {
                callback(false, false);
            }
        }
    });
}

app.post('/ChangePassword', function (req, res) {
    var json = req.body;
    var email = json.email;
    var newPassword = json.newPassword;
    var renewPassword = json.renewPassword;
    var query = "update employee set password='" + bcrypt.hashSync(newPassword) + "' where email='" + email + "'";
    if (newPassword == renewPassword) {
        let connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Password@1',
            database: 'factory'
        });
        connection.query(query, function (error, rows) {
            connection.end();
            if (error) res.send({ status: 0, errorMessage: "New password and re password are not the same." })
            else res.send({ status: 1 })
        });
    }
    else {
        res.send({ status: 0, errorMessage: "New password and re password are not the same." })
    }
});

app.post('/GetProductList', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
            else {
                connection.query(queryGetProductList, function (error, rows) {
                    connection.end();

                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        if (typeof rows !== 'undefined' && rows.length > 0) {
                            res.send(JSON.stringify({ status: 1, data: rows[0] }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                        }
                    }
                });
            }
        }
    });
});

app.post('/GetProductById', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var productId = json.productId;
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) {
            res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        }
        else {
            if (ans) {
                connection.query('Select * from product where id=' + productId, function (error, rows) {
                    connection.end();
                    if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                    else {
                        res.send(JSON.stringify({ status: 1, data: rows }));
                    }
                });
            }
            else {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
        }

    });
});

app.post('/AddNewProduct', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var productImg = json.productImg;
    var productName = json.productName;
    var productCost = json.productCost;
    var productTypeId = json.productTypeId;
    var productAmount = json.productAmount;
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
            else {
                let connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'Password@1',
                    database: 'factory'
                });
                var query = "Insert into product (Name,\
                                        ProductTypeId,\
                                        Amount,\
                                        Cost,\
                                        EmployeeId,\
                                        ImageUrl,\
                                        InsertedDate) \
                                        values('" + productName + "', " + productTypeId + "," + productAmount + "," + productCost + "," + userId + ",'" + productImg + "', NOW());";
                connection.query(query, function (error, rows) {
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        var selectQuery = "select * from product where id = " + rows['insertId'];
                        connection.query(selectQuery, function (error, valueRow) {
                            connection.end();
                            if (error) {
                                res.send(JSON.stringify({ status: 0, errorMessage: 'Cannot display new product.' }));
                            }
                            else {
                                res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                            }
                        });
                    }
                });
            }
        }
    });
});

app.post('/UpdateProduct', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var isAdmin = json.isAdmin;
    var token = json.token;
    var productId = json.productId;
    var productImg = json.productImg;
    var productName = json.productName;
    var productCost = json.productCost;
    var productTypeId = json.productTypeId;
    if (isAdmin == 1) {
        isLogin(userId, token, function (error, ans) {
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                }
                else {
                    let connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var query = "update product set \
                                        Name = '" + productName + "',\
                                        ProductTypeId = " + productTypeId + ",\
                                        Cost = " + productCost + ",\
                                        EmployeeId = " + userId + ",\
                                        ImageUrl = '" + productImg + "',\
                                        InsertedDate = NOW() \
                                        where id = " + productId;
                    connection.query(query, function (error, rows) {
                        if (error) {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                        }
                        else {
                            var selectQuery = "select * from product where id = " + productId;
                            connection.query(selectQuery, function (error, valueRow) {
                                connection.end();
                                if (error) {
                                    res.send(JSON.stringify({ status: 0, errorMessage: 'Cannot display new product.' }));
                                }
                                else {
                                    res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                                }
                            });
                        }
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "You are not admin." }));
    }
});

app.post('/SearchProduct', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var productId = json.productId;
    var productName = json.productName;
    var productTypeId = json.productTypeId;
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
            else {
                let connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'Password@1',
                    database: 'factory'
                });
                var query = "select *\
                from product\
                where (('" + productId + "' is null or '" + productId + "' = '') or id = '" + productId + "')\
                and (('" + productName + "' is null or '" + productName + "' = '') or name = '" + productName + "')\
                and (('" + productTypeId + "' is null or '" + productTypeId + "' = '') or producttypeid = '" + productTypeId + "')";
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        res.send(JSON.stringify({ status: 1, data: rows }));
                    }
                });
            }
        }
    });
});

app.post('/DeleteProduct', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var isAdmin = json.isAdmin;
    var token = json.token;
    var productId = json.productId;
    if (isAdmin == 1) {
        isLogin(userId, token, function (error, ans) {
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                }
                else {
                    let connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var query = "delete from product where id = " + productId;
                    connection.query(query, function (error, rows) {
                        if (error) {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 1 }));
                        }
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "You are not admin." }));
    }
});

app.post('/GetProductTypeList', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
            else {
                var query = "select * from producttype where id <> 1";
                connection.query(query, function (error, rows) {
                    connection.end();

                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        if (typeof rows !== 'undefined' && rows.length > 0) {
                            res.send(JSON.stringify({ status: 1, data: rows[0] }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                        }
                    }
                });
            }
        }
    });
});

app.post('/GetProductTypeById', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var productTypeId = json.productTypeId;
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) {
            res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        }
        else {
            if (ans) {
                connection.query('Select * from producttype where id=' + productTypeId, function (error, rows) {
                    connection.end();
                    if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                    else {
                        res.send(JSON.stringify({ status: 1, data: rows }));
                    }
                });
            }
            else {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
        }

    });
});

app.post('/AddNewProductType', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var productTypeName = json.productTypeName;
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
            else {
                let connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'Password@1',
                    database: 'factory'
                });
                var query = "Insert into productTypeId (Name,\
                                        EmployeeId,\
                                        InsertedDate) \
                                        values('" + productTypeName + "'," + userId + ", NOW());";
                connection.query(query, function (error, rows) {
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        var selectQuery = "select * from producttype where id = " + rows['insertId'];
                        connection.query(selectQuery, function (error, valueRow) {
                            connection.end();
                            if (error) {
                                res.send(JSON.stringify({ status: 0, errorMessage: 'Cannot display new product.' }));
                            }
                            else {
                                res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                            }
                        });
                    }
                });
            }
        }
    });
});

app.post('/UpdateProductType', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var isAdmin = json.isAdmin;
    var token = json.token;
    var productTypeName = json.productTypeName;
    var productTypeId = json.productTypeId;
    if (isAdmin == 1) {
        isLogin(userId, token, function (error, ans) {
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                }
                else {
                    let connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var query = "update producttype set \
                                        Name = '" + productTypeName + "',\
                                        EmployeeId = " + userId + ",\
                                        InsertedDate = NOW() \
                                        where id = " + productTypeId;
                    connection.query(query, function (error, rows) {
                        if (error) {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                        }
                        else {
                            var selectQuery = "select * from producttype where id = " + productTypeId;
                            connection.query(selectQuery, function (error, valueRow) {
                                connection.end();
                                if (error) {
                                    res.send(JSON.stringify({ status: 0, errorMessage: 'Cannot display new product.' }));
                                }
                                else {
                                    res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                                }
                            });
                        }
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "You are not admin." }));
    }
});

app.post('/DeleteProductType', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var isAdmin = json.isAdmin;
    var token = json.token;
    var productTypeId = json.productId;
    if (isAdmin == 1) {
        isLogin(userId, token, function (error, ans) {
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                }
                else {
                    let connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var query = "delete from producttype where id = " + productTypeId + "; update product set producttypeid = 1 where producttypeid = " + productTypeId;
                    connection.query(query, function (error, rows) {
                        if (error) {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 1 }));
                        }
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "You are not admin." }));
    }
});

app.post('/GetMaterialList', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
            else {
                var query = "select * from material where id <> 1";
                connection.query(query, function (error, rows) {
                    connection.end();

                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        if (typeof rows !== 'undefined' && rows.length > 0) {
                            res.send(JSON.stringify({ status: 1, data: rows[0] }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                        }
                    }
                });
            }
        }
    });
});

app.post('/GetMaterialById', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var materialId = json.materialId;
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) {
            res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        }
        else {
            if (ans) {
                connection.query('Select * from material where id=' + materialId, function (error, rows) {
                    connection.end();
                    if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                    else {
                        res.send(JSON.stringify({ status: 1, data: rows }));
                    }
                });
            }
            else {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
        }

    });
});

app.post('/AddNewMaterial', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var materialName = json.materialName;
    var materialTypeId = json.materialTypeId;
    var materialAmount = json.materialAmount;
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
            else {
                let connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'Password@1',
                    database: 'factory'
                });
                var query = "Insert into material (Name,\
                                        MaterialTypeId,\
                                        Amount,\
                                        EmployeeId,\
                                        InsertedDate) \
                                        values('" + materialName + "', " + materialTypeId + "," + materialAmount + "," + userId + ", NOW());";
                connection.query(query, function (error, rows) {
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        var selectQuery = "select * from material where id = " + rows['insertId'];
                        connection.query(selectQuery, function (error, valueRow) {
                            connection.end();
                            if (error) {
                                res.send(JSON.stringify({ status: 0, errorMessage: 'Cannot display new product.' }));
                            }
                            else {
                                res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                            }
                        });
                    }
                });
            }
        }
    });
});

app.post('/UpdateMaterial', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var isAdmin = json.isAdmin;
    var token = json.token;
    var materialId = json.materialId;
    var materialName = json.materialName;
    var materialTypeId = json.materialTypeId;
    var materialAmount = json.materialAmount;
    if (isAdmin == 1) {
        isLogin(userId, token, function (error, ans) {
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                }
                else {
                    let connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var query = "update material set \
                                        Name = '" + productName + "',\
                                        materialtypeid = " + materialTypeId + ",\
                                        amount = " + materialAmount + ",\
                                        EmployeeId = " + userId + ",\
                                        InsertedDate = NOW() \
                                        where id = " + materialId;
                    connection.query(query, function (error, rows) {
                        if (error) {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                        }
                        else {
                            var selectQuery = "select * from material where id = " + materialId;
                            connection.query(selectQuery, function (error, valueRow) {
                                connection.end();
                                if (error) {
                                    res.send(JSON.stringify({ status: 0, errorMessage: 'Cannot display new product.' }));
                                }
                                else {
                                    res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                                }
                            });
                        }
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "You are not admin." }));
    }
});

app.post('/SearchMaterial', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var materialId = json.materialId;
    var materialName = json.materialName;
    var materialTypeId = json.materialTypeId;
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
            else {
                let connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'Password@1',
                    database: 'factory'
                });
                var query = "select *\
                from material\
                where (('" + materialId + "' is null or '" + materialId + "' = '') or id = '" + materialId + "')\
                and (('" + materialName + "' is null or '" + materialName + "' = '') or name = '" + materialName + "')\
                and (('" + materialTypeId + "' is null or '" + materialTypeId + "' = '') or materialTypeId = '" + materialTypeId + "')";
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        res.send(JSON.stringify({ status: 1, data: rows }));
                    }
                });
            }
        }
    });
});

app.post('/DeleteMaterial', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var isAdmin = json.isAdmin;
    var token = json.token;
    var materialId = json.materialId;
    if (isAdmin == 1) {
        isLogin(userId, token, function (error, ans) {
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                }
                else {
                    let connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var query = "delete from material where id = " + materialId;
                    connection.query(query, function (error, rows) {
                        if (error) {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 1 }));
                        }
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "You are not admin." }));
    }
});

app.post('/GetCustomerList', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
            else {
                var query = "select * from customer where";
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        if (typeof rows !== 'undefined' && rows.length > 0) {
                            res.send(JSON.stringify({ status: 1, data: rows[0] }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                        }
                    }
                });
            }
        }
    });
});

app.post('/GetCustomerById', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var customerId = json.customerId;
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) {
            res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        }
        else {
            if (ans) {
                connection.query('Select * from customer where id=' + customerId, function (error, rows) {
                    connection.end();
                    if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                    else {
                        res.send(JSON.stringify({ status: 1, data: rows }));
                    }
                });
            }
            else {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
        }

    });
});

app.post('/AddNewCustomer', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var customerName = json.customerName;
    var regionId = json.regionId;
    var address = json.address;
    var subdistrict = json.subdistrict;
    var district = json.district;
    var province = json.province;
    var postcode = json.postcode;
    var phone = json.phone;
    var transporter = json.transporter;
    var transporterPhone = json.transporterPhone;
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
            else {
                let connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'Password@1',
                    database: 'factory'
                });
                var query = "Insert into customer (Name,\
                                        address,\
                                        subdistrict,\
                                        district,\
                                        province,\
                                        postcode,\
                                        regionid,\
                                        phone,\
                                        transporter,\
                                        transporterphone,\
                                        InsertedDate) \
                                        values('" + customerName + "', '" + address + "','" + subdistrict + "','" + 
                                        district + "','" + province + "','" + postcode + "','" + regionId + "','" + 
                                        phone + "','" + transporter + "','" + transporterPhone + "', NOW());";
                connection.query(query, function (error, rows) {
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        var selectQuery = "select * from customer where id = " + rows['insertId'];
                        connection.query(selectQuery, function (error, valueRow) {
                            connection.end();
                            if (error) {
                                res.send(JSON.stringify({ status: 0, errorMessage: 'Cannot display new product.' }));
                            }
                            else {
                                res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                            }
                        });
                    }
                });
            }
        }
    });
});

app.post('/UpdateCustomer', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var isAdmin = json.isAdmin;
    var token = json.token;
    var customerId = json.customerId;
    var customerName = json.customerName;
    var regionId = json.regionId;
    var address = json.address;
    var subdistrict = json.subdistrict;
    var district = json.district;
    var province = json.province;
    var postcode = json.postcode;
    var phone = json.phone;
    var transporter = json.transporter;
    var transporterPhone = json.transporterPhone;
    if (isAdmin == 1) {
        isLogin(userId, token, function (error, ans) {
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                }
                else {
                    let connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var query = "update customer set \
                                        Name = '" + customerName + "',\
                                        address = '" + address + "',\
                                        subdistrict = '" + subdistrict + "',\
                                        district = '" + district + "',\
                                        province = '" + province + "',\
                                        postcode = '" + postcode + "',\
                                        regionid = " + regionid + ",\
                                        phone = '" + phone + "',\
                                        transporter = '" + transporter + "',\
                                        transporterphone = '" + transporterphone + "',\
                                        InsertedDate = NOW() \
                                        where id = " + customerId;
                    connection.query(query, function (error, rows) {
                        if (error) {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                        }
                        else {
                            var selectQuery = "select * from customer where id = " + customerId;
                            connection.query(selectQuery, function (error, valueRow) {
                                connection.end();
                                if (error) {
                                    res.send(JSON.stringify({ status: 0, errorMessage: 'Cannot display new product.' }));
                                }
                                else {
                                    res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                                }
                            });
                        }
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "You are not admin." }));
    }
});

app.post('/SearchCustomer', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var customerId = json.customerId;
    var customerName = json.customerName;
    var regionId = json.regionId;
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
            else {
                let connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'Password@1',
                    database: 'factory'
                });
                var query = "select *\
                from customer\
                where (('" + customerId + "' is null or '" + customerId + "' = '') or id = '" + customerId + "')\
                and (('" + customerName + "' is null or '" + customerName + "' = '') or name = '" + customerName + "')\
                and (('" + regionId + "' is null or '" + regionId + "' = '') or regionId = '" + regionId + "')";
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        res.send(JSON.stringify({ status: 1, data: rows }));
                    }
                });
            }
        }
    });
});

app.post('/DeleteCustomer', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var isAdmin = json.isAdmin;
    var token = json.token;
    var customerId = json.customerId;
    if (isAdmin == 1) {
        isLogin(userId, token, function (error, ans) {
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
                }
                else {
                    let connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var query = "delete from customer where id = " + customerId;
                    connection.query(query, function (error, rows) {
                        if (error) {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 1 }));
                        }
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "You are not admin." }));
    }
});