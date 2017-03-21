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

app.get('/GetRegion', function (req, res) {
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    connection.connect(function (err) {
        if (err) {
            console.log('Error connecting to Db');
            return;
        }
        console.log('Connection established');
        connection.query('SELECT * FROM region', function (err, rows) {
            connection.end();
            if (err) throw err;

            console.log('Data received from Db:\n');
            for (var i = 0; i < rows.length; i++) {
                console.log(rows[i].name);
            }

        });
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