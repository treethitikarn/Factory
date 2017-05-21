var app = require('express')();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var upload = require('express-fileupload');
var path = require('path');
var fs = require('fs');
var folderName = "/upload/";
var uploadFolder = "." + folderName;

var queryGetProductList = 'SELECT * from product order by id';
var queryGetProductById = 'Select * from product where id={0}';

var port = process.env.PORT || 7777;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(upload());
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.get('/', function (req, res) {
    res.send('<h1>Hello Node.js</h1>');
});

app.get('/index', function (req, res) {
    res.send('<h1>This is index page</h1>');
});

app.listen(port, function () {
    console.log('Starting node.js on port ' + port);
});
app.post('/uploadFile', function (req, res) {
    // var filePath = oldImageUrl;
    fs.unlinkSync(uploadFolder + '/17522766_1402551283134361_7776908201199112813_n.jpg');
    // if (req.files) {
    //     var file = req.files.uploadfile,
    //         filename = file.name;
    //     var ext = path.extname(filename);

    //     file.mv("./upload/1" + ext, function (err) {
    //         if (err) {
    //             console.log(err);
    //             res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดข้อผิดพลาดระหว่างอัพโหลดไฟล์' }));
    //         }
    //         else {
    //             console.log('Done!');
    //             res.send(JSON.stringify({ status: 1 }));
    //         }
    //     })
    // }
    // else {
    //     console.log('wrong');
    // }
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
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
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
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
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
                    else res.send(JSON.stringify({ status: 1, token: token, isAdmin: rows[0].isadmin, id: rows[0].id }));
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
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
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
                if (req.files) {
                    var file = req.files.uploadfile,
                        filename = file.name;
                    if (!fs.existsSync(uploadFolder)) {
                        fs.mkdirSync(uploadFolder);
                    }
                    file.mv(uploadFolder + filename, function (err) {
                        if (err) {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดข้อผิดพลาดระหว่างอัพโหลดไฟล์' }));
                        }
                        else {
                            var absolutepath = __dirname + folderName + filename;
                            absolutepath = absolutepath.replace(/\\/g, '/');
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
                                        values('" + productName + "', " + productTypeId + "," + productAmount + "," + productCost + "," + userId + ",'" + absolutepath + "', NOW());";
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
                    })
                }
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
                    if (req.files) {
                        var file = req.files.uploadfile,
                            filename = file.name;
                        if (!fs.existsSync(uploadFolder)) {
                            fs.mkdirSync(uploadFolder);
                        }
                        file.mv(uploadFolder + filename, function (err) {
                            if (err) {
                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดข้อผิดพลาดระหว่างอัพโหลดไฟล์' }));
                            }
                            else {
                                let connection = mysql.createConnection({
                                    host: 'localhost',
                                    user: 'root',
                                    password: 'Password@1',
                                    database: 'factory'
                                });
                                var getImageUrlQuery = 'select ImageUrl from product where id = ' + productId;
                                var oldImageUrl = "";
                                connection.query(getImageUrlQuery, function (error, rows) {
                                    if (error) {
                                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                                    }
                                    else {
                                        oldImageUrl = rows[0].ImageUrl;
                                        var filePath = oldImageUrl;
                                        fs.unlinkSync(filePath);
                                    }
                                });
                                var query = "update product set \
                                        Name = '" + productName + "',\
                                        ProductTypeId = " + productTypeId + ",\
                                        Cost = " + productCost + ",\
                                        EmployeeId = " + userId + ",\
                                        ImageUrl = '" + uploadFolder + filename + "',\
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
                        });
                    }
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "You are not admin." }));
    }
});

app.post('/AddProductAmount', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var productId = json.productId;
    var productAmount = json.productAmount;
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
                if (productId.length != productAmount.length) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'ProductId and ProductAmount มีจำนวนไม่เท่ากัน' }));
                }
                else {
                    var insert = 'insert into producttransaction (amount, productid, employeeid, transactionDate) values ';
                    var updateAmount = "update product p1 join product p2 on p1.id = p2.id set p1.amount = case ";
                    for (var i = 0; i < productAmount.length; i++) {
                        var amount = productAmount[i];
                        var id = productId[i];
                        insert += '(' + amount + ', ' + id + ', ' + userId + ', NOW()) ';
                        updateAmount += "when p1.id = " + id + " then p1.amount + " + amount + " ";
                        if (i != productAmount.length - 1) insert += ",";
                        else updateAmount += "else p1.amount end;";
                    }
                    connection.query(insert, function (error, rows) {
                        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred in database.' }));
                        else {
                            connection.query(updateAmount, function (error, rows) {
                                if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred in database.' }));
                                else {
                                    res.send(JSON.stringify({ status: 1 }));
                                }
                            });
                        }
                    });
                }
            }
            else {
                res.send(JSON.stringify({ status: 0, errorMessage: 'Please login.' }));
            }
        }
    });
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
                var query = "select p.id as id, p.name as name, pt.name as producttypename, p.amount as amount\
                from product p join producttype pt on p.producttypeid = pt.id\
                where (('" + productId + "' is null or '" + productId + "' = '') or p.id = '" + productId + "')\
                and (('" + productName + "' is null or '" + productName + "' = '') or p.name = '" + productName + "')\
                and (('" + productTypeId + "' is null or '" + productTypeId + "' = '') or p.producttypeid = '" + productTypeId + "')";
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
                    var getImageUrlQuery = 'select ImageUrl from product where id = ' + productId;
                    var oldImageUrl = "";
                    connection.query(getImageUrlQuery, function (error, rows) {
                        if (error) {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                        }
                        else {
                            oldImageUrl = rows[0].ImageUrl;
                            var filePath = oldImageUrl;
                            fs.unlinkSync(filePath);
                        }
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
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
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
                var query = "Insert into productType (Name,\
                                        EmployeeId,\
                                        `datetime`) \
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
                                        `datetime` = NOW() \
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
                    var query = "delete from producttype where id = " + productTypeId;
                    connection.query(query, function (error, rows) {
                        if (error) {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                        }
                        else {
                            var updateQuery = "update product set producttypeid = 1 where producttypeid = " + productTypeId;
                            connection.query(query, function (error, rows) {
                                if (error) {
                                    res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                                }
                                else {
                                    res.send(JSON.stringify({ status: 1 }));
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
                var query = "select * from material";
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
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
                                        `datetime`) \
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
                                        Name = '" + materialName + "',\
                                        materialtypeid = " + materialTypeId + ",\
                                        amount = " + materialAmount + ",\
                                        EmployeeId = " + userId + ",\
                                        `datetime` = NOW() \
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
                var query = "select m.id id, m.name name, mt.name materialtypename, m.amount amount\
                from material m join materialtype mt on m.materialtypeid = mt.id\
                where (('" + materialId + "' is null or '" + materialId + "' = '') or m.id = '" + materialId + "')\
                and (('" + materialName + "' is null or '" + materialName + "' = '') or m.name = '" + materialName + "')\
                and (('" + materialTypeId + "' is null or '" + materialTypeId + "' = '') or m.materialTypeId = '" + materialTypeId + "')";
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
                var query = "select * from customer";
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
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
                                        `datetime`,\
                                        employeeId) \
                                        values('" + customerName + "', '" + address + "','" + subdistrict + "','" +
                    district + "','" + province + "','" + postcode + "','" + regionId + "','" +
                    phone + "','" + transporter + "','" + transporterPhone + "', NOW(), " + userId + ");";
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
                                        regionid = " + regionId + ",\
                                        phone = '" + phone + "',\
                                        transporter = '" + transporter + "',\
                                        transporterphone = '" + transporterPhone + "',\
                                        `datetime` = NOW() \
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
                var query = "select c.id id, c.name name, r.name regionname, c.phone phone\
                from customer c join region r on c.regionid = r.id\
                where (('" + customerId + "' is null or '" + customerId + "' = '') or c.id = '" + customerId + "')\
                and (('" + customerName + "' is null or '" + customerName + "' = '') or c.name = '" + customerName + "')\
                and (('" + regionId + "' is null or '" + regionId + "' = '') or c.sregionId = '" + regionId + "')";
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

app.post('/GetOrderList', function (req, res) {
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
                var query = "select o.id id, o.`datetime` datetime, c.name name, sum(od.amount*od.priceperpiece) price from `order` o join customer c on o.customerid = c.id left join orderdetails od on o.id = od.orderid group by od.orderid order by datetime";
                connection.query(query, function (error, rows) {
                    connection.end();

                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
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

app.post('/GetOrderById', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var orderId = json.orderId;
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
                var query = 'Select * from `order` as o left join orderdetails od on o.id = od.orderid where o.id=' + orderId;
                connection.query(query, function (error, rows) {
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

app.post('/AddNewOrder', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var customerId = json.customerId;
    var productId = json.productId;
    var amount = json.amount;
    var priceperpiece = json.priceperpiece;
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
                var query = "Insert into `order` (customerId,\
                                        employeeId,\
                                        `datetime`) \
                                        values(" + customerId + ", " + userId + ", NOW());";
                connection.query(query, function (error, rows) {
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        if ((productId.length != amount.length) && (productId.length != priceperpiece.length) && (amount.length != priceperpiece.length)) {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'ProductId, Amount, PricePerPiece มีจำนวนไม่เท่ากัน' }));
                        }
                        else {
                            var insertQuery = "insert into orderdetails (orderid, productid, amount, priceperpiece, employeeid, `datetime`) values ";
                            var updateQuery = "update product set amount = case id ";
                            for (var i = 0; i < productId.length; i++) {
                                var id = productId[i];
                                var eachamount = amount[i]
                                var eachpriceperpiece = priceperpiece[i];
                                insertQuery += "(" + rows['insertId'] + ", " + id + ", " + eachamount + ", " + eachpriceperpiece + ", " + userId + ", NOW())";
                                updateQuery += "when " + id + " then amount - " + eachamount + " ";
                                if (i != productId.length - 1) insertQuery += ",";
                                else updateQuery += "else amount end";
                            }
                            connection.query(insertQuery, function (error, valueRow) {
                                if (error) {
                                    res.send(JSON.stringify({ status: 0, errorMessage: 'Cannot add new purchase to order.' }));
                                }
                                else {
                                    connection.query(updateQuery, function (error, valueRow) {
                                        connection.end();
                                        if (error) {
                                            res.send(JSON.stringify({ status: 0, errorMessage: 'Cannot update product amount to Product table.' }));
                                        }
                                        else {
                                            console.log(updateQuery);
                                            res.send(JSON.stringify({ status: 1 }));
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        }
    });
});

app.post('/EditOrder', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var isAdmin = json.isAdmin;
    var token = json.token;
    var orderId = json.orderId;
    var customerId = json.customerId;
    var orderDetailId = json.orderDetailId;
    var productId = json.productId;
    var priceperpiece = json.priceperpiece;
    var amount = json.amount;
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
                    var getOrderDetails = "select productid id, amount from orderdetails where orderid = " + orderId;
                    var updateQuery = "update product set amount = case id "
                    connection.query(getOrderDetails, function (error, rows) {
                        if (error) {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database when getOrderDetails.' }));
                        }
                        else {
                            for (var i = 0; i < rows.length; i++) {
                                updateQuery += "when " + rows[i].id + " then amount + " + rows[i].amount + " ";
                            }
                            updateQuery += "else amount end";
                            connection.query(updateQuery, function (error, rows) {
                                if (error) {
                                    console.log(error);
                                    console.log(updateQuery);
                                    res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database when update old product amount.' }));
                                }
                                else {
                                    var query = "update `order` set \
                                        customerId = '" + customerId + "',\
                                        isupdated = 1\
                                        where id = " + orderId;
                                    connection.query(query, function (error, rows) {
                                        if (error) {
                                            res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database when update order.' }));
                                        }
                                        else {
                                            var q = 'if (not exist(select id from orderdetails where id = ' + '))';
                                            var insertquery = 'INSERT INTO orderdetails (id, orderid, priceperpiece, amount, employeeid, datetime, productid) ';
                                            var valuesquery = 'Values ';
                                            var duplicatequery = 'ON DUPLICATE KEY UPDATE priceperpiece = values(priceperpiece), amount = values(amount)';
                                            var minusQuery = "update product set amount = case id ";
                                            var deleteQuery = "delete from orderdetails where orderid = " + orderId + " and ";
                                            if ((orderDetailId.length != productId.length) || (priceperpiece.length != amount.length)) {
                                                res.send(JSON.stringify({ status: 0, errorMessage: 'OrderDetailId, ProductId, PricePerPiece and Amount มีจำนวนไม่เท่ากัน' }));
                                            }
                                            else {
                                                for (var i = 0; i < orderDetailId.length; i++) {
                                                    var eachorderDetailId = orderDetailId[i];
                                                    var eachproductId = productId[i];
                                                    var eachpriceperpiece = priceperpiece[i];
                                                    var eachamount = amount[i];
                                                    valuesquery += '(' + eachorderDetailId + ', ' + orderId + ', ' + eachpriceperpiece + ', ' + eachamount + ', ' + userId + ', now(), ' + eachproductId + ')';
                                                    minusQuery += "when " + eachproductId + " then amount - " + eachamount + " ";
                                                    deleteQuery += "id <> " + eachorderDetailId + " ";
                                                    if (i != orderDetailId.length - 1) {
                                                        valuesquery += ',';
                                                        deleteQuery += "and ";
                                                    }
                                                }
                                                minusQuery += "else amount end";
                                                var updateQuery = insertquery + valuesquery + duplicatequery;
                                                connection.query(minusQuery, function (error, valueRow) {
                                                    if (error) {
                                                        res.send(JSON.stringify({ status: 0, errorMessage: 'Cannot update product amount in product.' }));
                                                    }
                                                    else {
                                                        connection.query(deleteQuery, function (error, valueRow) {
                                                            if (error) {
                                                                res.send(JSON.stringify({ status: 0, errorMessage: 'Cannot update purchase in order.' }));
                                                            }
                                                            else {
                                                                connection.query(updateQuery, function (error, valueRow) {
                                                                    connection.end();
                                                                    if (error) {
                                                                        res.send(JSON.stringify({ status: 0, errorMessage: 'Cannot update purchase in order.' }));
                                                                    }
                                                                    else {
                                                                        res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    });
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

app.post('/DeleteOrder', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var isAdmin = json.isAdmin;
    var token = json.token;
    var orderId = json.orderId;
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
                    var query = "delete o.*, od.* from `order` as o left join orderdetails as od on o.id = od.orderid where o.id = " + orderId + " or od.orderid = " + orderId;
                    // var updateQuery = "update product set amount = amount + " + 
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

app.post('/SearchOrder', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var orderId = json.orderId;
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
                var query = "select o.id,c.name,o.`datetime` as `date`,(select sum(od.priceperpiece * od.amount) from orderdetails as od where od.orderid = o.id) as price \
                from `order` o join customer c on o.customerid = c.id \
                where (('" + orderId + "' is null or '" + orderId + "' = '') or o.id = '" + orderId + "')\
                and (('" + customerName + "' is null or '" + customerName + "' = '') or c.name = '" + customerName + "')\
                and (('" + regionId + "' is null or '" + regionId + "' = '') or c.regionId = '" + regionId + "')";
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

app.post('/AddNewPurchase', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var customerId = json.customerId;
    var orderId = json.orderId;
    var priceperpiece = json.priceperpiece;
    var amount = json.amount;
    var productId = json.productId;
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
                var query = "Insert into `orderdetails` (orderid,\
                                        priceperpiece,\
                                        `amount`,\
                                        employeeid,\
                                        productid,\
                                        `datetime`) \
                                        values(" + orderId + ", " +
                    priceperpiece + ", " + amount + ", " +
                    userId + ", " + productId + ", NOW());";
                var updateQuery = "update product set amount = amount - " + amount + " where id = " + productId;
                connection.query(query, function (error, rows) {
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        connection.query(updateQuery, function (error, rows) {
                            if (error) {

                                res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                            }
                            else {
                                res.send(JSON.stringify({ status: 1 }));
                            }
                        });
                    }
                });
            }
        }
    });
});

app.post('/EditPurchase', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var isAdmin = json.isAdmin;
    var token = json.token;
    var priceperpiece = json.priceperpiece;
    var amount = json.amount;
    var orderdetailsId = json.orderdetailsId;
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
                    var query = "update orderdetails set priceperpiece = " + priceperpiece + ", `amount` = " + amount + " where id = " + orderdetailsId;
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

app.post('/DeletePurchase', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var isAdmin = json.isAdmin;
    var token = json.token;
    var orderdetailsId = json.orderdetailsId;
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
                    var query = "delete from orderdetails where id = " + orderdetailsId;
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

app.post('/AddNewMaterialTransaction', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var materialId = json.materialId;
    var acquire = json.acquire;
    var use = json.use;
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
                var insertQuery = 'insert into materialtransaction (materialId,acquire,`use`,balance,`datetime`,employeeid) values ';
                var updateQuery = "update material m1 join material m2 on m1.id = m2.id set m1.amount = case ";
                for (var i = 0; i < materialId.length; i++) {
                    insertQuery += '(' + materialId[i] + ', ' + acquire[i] + ', ' + use[i] + ', (select amount from material where id = ' + materialId[i] + ' limit 1) - ' + use[i] + ', NOW(), ' + userId + ') ';
                    updateQuery += 'when m2.id = ' + materialId[i] + ' then m2.amount - ' + use[i] + " + " + acquire[i] + ' ';
                    if (i != materialId.length - 1) {
                        insertQuery += ', ';
                    }
                    else updateQuery += "else m2.amount end;";
                }
                connection.query(insertQuery, function (error, rows) {
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        connection.query(updateQuery, function (error, rows) {
                            if (error) {
                                res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                            }
                            else {
                                res.send(JSON.stringify({ status: 1 }));
                            }
                        });
                    }
                });
            }
        }
    });
});

app.post('/GetMaterialTransactionList', function (req, res) {
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
                var query = 'select * from materialtransaction';
                connection.query(query, function (error, rows) {
                    connection.end();

                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
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

app.post('/SearchMaterialTransaction', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var transactionDate = json.transactionDate;
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
                var query = "select m.id as id, m.name as name, mt.acquire acquire, mt.use `use`, mt.balance balance\
                from materialtransaction mt join material m on mt.materialid = m.id\
                where date(mt.`datetime`) = date(date_format('" + transactionDate + "', '%y-%m-%d %h:%m:%s'))";
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

app.post('/GetProductTransactionList', function (req, res) {
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
                var query = 'select * from producttransaction order by transactiondate';
                connection.query(query, function (error, rows) {
                    connection.end();

                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'Error occurred on database.' }));
                    }
                    else {
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
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

app.post('/SearchProductTransaction', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var transactionDate = json.transactionDate;
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
                var query = "select p.id id, p.name name, pt.amount amount\
                from producttransaction pt join product p on pt.productid = p.id\
                where date(pt.transactiondate) = date(date_format('" + transactionDate + "', '%y-%m-%d %h:%m:%s'))";
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

