var app = require('express')();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var path = require('path');
var fs = require('fs');
// var folderName = "/upload/";
// var folderName = "/var/www/html/ProductImg/";
// var folderName = "/upload/";
// var uploadFolder = __dirname.replace(/\\/gi, '/') + folderName;
// /var/www/html/FactoryUI/ProductImg/
var folderName = "/ProductImg/";
var previousPath = "/var/www/html/FactoryUI";
var uploadFolder = previousPath + folderName;
var ReadWriteLock = require('rwlock');
var upload = require('express-fileupload');
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

app.post('/GetRegionList', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                connection.query("select * from region", function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส' }));
                    }
                    else {
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส' }));
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
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                connection.query("select * from materialtype", function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส' }));
                    }
                    else {
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส' }));
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
    var username = json.username;
    var password = bcrypt.hashSync(json.password);
    var isAdmin = json.isAdmin;
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    var selectExistUsernameQuery = "select * from employee where username='" + username + "'";
    var insertQuery = "insert into employee (name, username, password, isAdmin) values('" + name + "','" + username + "','" + password + "'," + isAdmin + ")";
    connection.query(selectExistUsernameQuery, function (error, rows) {
        if (error) {
            connection.end();
            res.send(JSON.stringify({ status: 0, errorMessage: error }));
        }
        else {
            if (rows.length > 0) {
                connection.end();
                res.send(JSON.stringify({ status: 0, errorMessage: "ชื่อผู้ใช้งานนี้ได้ใช้ลงทะเบียนไปแล้ว" }))
            }
            else {
                connection.query(insertQuery, function (error, rows) {
                    connection.end();
                    if (error) res.send(JSON.stringify({ status: 0, errorMessage: "เกิดความผิดพลาดกับเดต้าเบส" }))
                    try {
                        res.send(JSON.stringify({ status: 1 }));
                    }
                    catch (err) {
                        res.send(JSON.stringify({ status: 0, errorMessage: "เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถสมัครสมาชิกได้" }))
                    }
                });
            }
        }
    });
});

app.post('/Login', function (req, res) {
    var json = req.body;
    var username = json.username;
    var password = json.password;
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    var query = "Select id, isadmin, password from employee where username='" + username + "'";
    connection.query(query, function (error, rows) {
        if (error) {
            connection.end();
            res.send(JSON.stringify({ status: 0, errorMessage: "เกิดความผิดพลาดกับเดต้าเบส" }))
        }
        else {
            if ((typeof rows != 'undefined') && (rows.length > 0)) {
                if (bcrypt.compareSync(password, rows[0].password)) {
                    var token = bcrypt.hashSync("login");
                    var updateAuthenToken = "update employee set AuthenToken ='" + token + "' where id=" + rows[0].id;
                    connection.query(updateAuthenToken, function (error, ans) {
                        connection.end();
                        if (error) res.send(JSON.stringify({ status: 0, errorMessage: "เกิดความผิดพลาดกับเดต้าเบส" }));
                        else res.send(JSON.stringify({ status: 1, token: token, isAdmin: rows[0].isadmin, id: rows[0].id }));
                    });
                }
                else {
                    connection.end();
                    res.send(JSON.stringify({ status: 0, errorMessage: "เกิดความผิดพลาดกับเดต้าเบส" }))
                }
            }
            else {
                connection.end();
                res.send(JSON.stringify({ status: 0, errorMessage: "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบความถูกต้องของชื่อผู้ใช้ และรหัสผ่าน" }))
            }
        }
    });
});

app.get('/Logout', function (req, res) {
    var json = req.body;
    var userId = req.userId;
    var token = req.token;
    var query = "UPDATE employee set authentoken = null where id = " + 1 + " and authentoken = '" + token + "'";
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    var lock = new ReadWriteLock();
    lock.writeLock(function (release) {
        connection.query(query, function (error, rows) {
            connection.end();
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: "เกิดความผิดพลาดกับเดต้าเบส ออกจากระบบไม่สำเร็จ" }))
            else res.send({ status: 1 })
        });
    });
    release();
});

function isLogin(userId, token, callback) {
    var checkTokenQuery = "Select id from employee where id=" + userId + " and authentoken='" + token + "'";
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    connection.query(checkTokenQuery, function (error, rows) {
        connection.end();
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
    var username = json.username;
    var newPassword = json.newPassword;
    var renewPassword = json.renewPassword;
    var query = "update employee set password='" + bcrypt.hashSync(newPassword) + "' where username='" + username + "'";
    if (newPassword == renewPassword) {
        var connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Password@1',
            database: 'factory'
        });
        var lock = new ReadWriteLock();
        lock.writeLock(function (release) {
            connection.query(query, function (error, rows) {
                connection.end();
                if (error) res.send({ status: 0, errorMessage: "New password and re password are not the same." })
                else res.send({ status: 1 })
            });
            release();
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
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                connection.query(queryGetProductList, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถนำรายการสินค้าออกมาได้' }));
                    }
                    else {
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถนำรายการสินค้าออกมาได้' }));
                        }
                    }
                });
            }
        }
    });
});

app.post('/GetProductListByCustomerId', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var customerId = json.customerId;
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var query = "select prod.*, ifnull(cust.price,0) price from (select * from product) prod left join (select productid,price from customerproductprice where customerid = " + customerId + ") cust on prod.id = cust.productid order by prod.id";
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถนำรายการสินค้าออกมาได้' }));
                    }
                    else {
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถนำรายการสินค้าออกมาได้' }));
                        }
                    }
                });
            }
        }
    });
});

app.post('/SearchProductByCustomerId', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var customerId = json.customerId;
    var productId = json.productId;
    var productName = json.productName;
    var productTypeId = json.productTypeId;
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'Password@1',
                    database: 'factory'
                });
                var query = "select prod.*, ifnull(cust.price,0) price\
                from (select * from product p where\
                (('" + productId + "' is null or '" + productId + "' = '') or p.id = '" + productId + "')\
                and (('" + productName + "' is null or '" + productName + "' = '') or p.name like '%" + productName + "%')\
                and (('" + productTypeId + "' is null or '" + productTypeId + "' = '') or p.producttypeid = '" + productTypeId + "')) prod\
                left join (select productid, price from customerproductprice where \
                customerId = " + customerId + ") cust on prod.id = cust.productid order by prod.id";
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถค้นหาได้' }));
                    }
                    else {
                        res.send(JSON.stringify({ status: 1, data: rows }));
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
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) {
            res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        }
        else {
            if (ans) {
                connection.query('Select * from product where id=' + productId, function (error, rows) {
                    connection.end();
                    if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถนำรายละเอียดสินค้าออกมาได้' }));
                    else {
                        res.send(JSON.stringify({ status: 1, data: rows }));
                    }
                });
            }
            else {
                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถนำรายละเอียดสินค้าออกมาได้' }));
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
    var lock = new ReadWriteLock();
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                if (req.files.uploadfile != null) {
                    var connection = mysql.createConnection({
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
                                        InsertedDate) \
                                        values('" + productName + "', " + productTypeId + "," + productAmount + "," + productCost + "," + userId + ", NOW() + INTERVAL 7 HOUR);";
                                        console.log(query);
                    lock.writeLock(function (release) {
                        connection.query(query, function (error, rows) {
                            if (error) {
                                connection.end();
                                console.log(error);
                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถเพิ่มสินค้าใหม่ได้' }));
                            }
                            else {
                                var file = req.files.uploadfile,
                                    filename = rows['insertId'] + '_' + file.name;
                                var absolutepath = folderName + filename;
                                if (!fs.existsSync(uploadFolder)) {
                                    fs.mkdirSync(uploadFolder);
                                }
                                var insertImageUrl = "update product set imageurl = '" + absolutepath + "' where id = " + rows['insertId'];
                                connection.query(insertImageUrl, function (error, valueRow) {
                                    if (error) {
                                        connection.end();
                                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถเพิ่มสินค้าใหม่ได้' }));
                                    }
                                    else {
                                        file.mv(uploadFolder + filename, function (err) {
                                            if (err) {
                                                connection.end();
                                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดข้อผิดพลาดระหว่างอัพโหลดไฟล์' }));
                                            }
                                            else {
                                                var selectQuery = "select * from product";
                                                connection.query(selectQuery, function (error, valueRow) {
                                                    connection.end();
                                                    if (error) {
                                                        console.log("TT");
                                                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถนำข้อมูลสินค้าใหม่ออกมาได้' }));
                                                    }
                                                    else {
                                                        console.log(valueRow[0]);
                                                        res.send(JSON.stringify({ status: 1, data: valueRow }));
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        release();
                    });
                }
                else {
                    var connection = mysql.createConnection({
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
                                        InsertedDate) \
                                        values('" + productName + "', " + productTypeId + "," + productAmount + "," + productCost + "," + userId + ", NOW());";
                    lock.writeLock(function (release) {
                        connection.query(query, function (error, rows) {
                            if (error) {
                                connection.end();
                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถเพิ่มสินค้าใหม่ได้' }));
                            }
                            else {
                                var selectQuery = "select * from product where id = " + rows['insertId'];
                                connection.query(selectQuery, function (error, valueRow) {
                                    connection.end();
                                    if (error) {
                                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถนำข้อมูลสินค้าใหม่ออกมาได้' }));
                                    }
                                    else {
                                        res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                                    }
                                });
                            }
                        });
                        release();
                    });
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
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
                }
                else {
                    var lock = new ReadWriteLock();
                    lock.writeLock(function (release) {
                        if (req.files.uploadfile != null) {
                            var file = req.files.uploadfile,
                                filename = productId + "_" + file.name;
                            if (!fs.existsSync(uploadFolder)) {
                                fs.mkdirSync(uploadFolder);
                            }
                            file.mv(uploadFolder + filename, function (err) {
                                if (err) {
                                    res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดข้อผิดพลาดระหว่างอัพโหลดไฟล์' }));
                                }
                                else {
                                    var connection = mysql.createConnection({
                                        host: 'localhost',
                                        user: 'root',
                                        password: 'Password@1',
                                        database: 'factory'
                                    });
                                    var getImageUrlQuery = 'select ImageUrl from product where id = ' + productId;
                                    var oldImageUrl = "";
                                    connection.query(getImageUrlQuery, function (error, rows) {
                                        if (error) {
                                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดข้อผิดพลาดระหว่างอัพโหลดไฟล์' }));
                                        }
                                        else {
                                            oldImageUrl = rows[0].ImageUrl;
                                            var filePath = previousPath + oldImageUrl;
                                            if (fs.existsSync(filePath)) {
                                                fs.unlinkSync(filePath);
                                            }
                                        }
                                    });
                                    var query = "update product set \
                                        Name = '" + productName + "',\
                                        ProductTypeId = " + productTypeId + ",\
                                        Cost = " + productCost + ",\
                                        EmployeeId = " + userId + ",\
                                        ImageUrl = '" + folderName + filename + "',\
                                        InsertedDate = NOW() \
                                        where id = " + productId;
                                    connection.query(query, function (error, rows) {
                                        if (error) {
                                            connection.end();
                                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถเพิ่มสินค้าใหม่ได้' }));
                                        }
                                        else {
                                            var selectQuery = "select * from product where id = " + productId;
                                            connection.query(selectQuery, function (error, valueRow) {
                                                connection.end();
                                                if (error) {
                                                    res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถนำข้อมูลสินค้าใหม่ออกมาได้' }));
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
                        else {
                            var connection = mysql.createConnection({
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
                                        InsertedDate = NOW() \
                                        where id = " + productId;
                            connection.query(query, function (error, rows) {
                                if (error) {
                                    connection.end();
                                    res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถเพิ่มสินค้าใหม่ได้' }));
                                }
                                else {
                                    var selectQuery = "select * from product where id = " + productId;
                                    connection.query(selectQuery, function (error, valueRow) {
                                        connection.end();
                                        if (error) {
                                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถนำข้อมูลสินค้าใหม่ออกมาได้' }));
                                        }
                                        else {
                                            res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                                        }
                                    });
                                }
                            });
                        }
                        release();
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "คุณไม่ใช่แอ็ดมิน" }));
    }
});

app.post('/AddProductAmount', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var productId = json.productId;
    var productAmount = json.productAmount;
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) {
            res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        }
        else {
            if (ans) {
                if ((typeof productId == 'undefined' || typeof productAmount == 'undefined') || (productId.length != productAmount.length)) {
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
                    var lock = new ReadWriteLock();
                    lock.writeLock(function (release) {
                        connection.query(insert, function (error, rows) {
                            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถเพิ่ม product transaction ได้' }));
                            else {
                                connection.query(updateAmount, function (error, rows) {
                                    if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถเพิ่ม product transaction ได้' }));
                                    else {
                                        res.send(JSON.stringify({ status: 1 }));
                                    }
                                });
                            }
                        });
                        release();
                    });
                }
            }
            else {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
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
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'Password@1',
                    database: 'factory'
                });
                var query = "select p.id as id, p.name as name, p.producttypeid as ProductTypeId, p.amount as amount\
                from product p\
                where (('" + productId + "' is null or '" + productId + "' = '') or p.id = '" + productId + "')\
                and (('" + productName + "' is null or '" + productName + "' = '') or p.name like '%" + productName + "%')\
                and (('" + productTypeId + "' is null or '" + productTypeId + "' = '') or p.producttypeid = '" + productTypeId + "')";
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถค้นหาได้' }));
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
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
                }
                else {
                    var connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var getImageUrlQuery = 'select ImageUrl from product where id = ' + productId;
                    var oldImageUrl = "";
                    var lock = new ReadWriteLock();
                    lock.writeLock(function (release) {
                        connection.query(getImageUrlQuery, function (error, rows) {
                            if (error) {
                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบสินค้าได้' }));
                            }
                            else {
                                oldImageUrl = rows[0].ImageUrl;
                                var filePath = previousPath + oldImageUrl;
                                if (fs.existsSync(filePath)) {
                                    fs.unlinkSync(filePath);
                                }
                            }
                        });
                        var query = "delete from product where id = " + productId;
                        connection.query(query, function (error, rows) {
                            connection.end();
                            if (error) {
                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบสินค้าได้' }));
                            }
                            else {
                                res.send(JSON.stringify({ status: 1 }));
                            }
                        });
                        release();
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "คุณไม่ใช่แอ็ดมิน" }));
    }
});

app.post('/GetProductTypeList', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var query = "select * from producttype";
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงประเภทสินค้าได้' }));
                    }
                    else {
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงประเภทสินค้าได้' }));
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
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) {
            res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        }
        else {
            if (ans) {
                connection.query('Select * from producttype where id=' + productTypeId, function (error, rows) {
                    connection.end();
                    if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงประเภทสินค้าได้' }));
                    else {
                        res.send(JSON.stringify({ status: 1, data: rows }));
                    }
                });
            }
            else {
                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงประเภทสินค้าได้' }));
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
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'Password@1',
                    database: 'factory'
                });
                var query = "Insert into producttype (Name,\
                                        EmployeeId,\
                                        `datetime`) \
                                        values('" + productTypeName + "'," + userId + ", NOW());";
                                        console.log(query);
                var lock = new ReadWriteLock();
                lock.writeLock(function (release) {
                    connection.query(query, function (error, rows) {
                        if (error) {
                            connection.end();
                            console.log(error);
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถเพิ่มประเภทสินค้าได้' }));
                        }
                        else {
                            var selectQuery = "select * from producttype where id = " + rows['insertId'];
                            console.log(selectQuery);
                            connection.query(selectQuery, function (error, valueRow) {
                                connection.end();
                                if (error) {
                                    console.log(error);
                                    res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถโชว์ประเภทสินค้าได้' }));
                                }
                                else {
                                    console.log(valueRow[0]);
                                    res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                                }
                            });
                        }
                    });
                    release();
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
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
                }
                else {
                    var connection = mysql.createConnection({
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
                    var lock = new ReadWriteLock();
                    lock.writeLock(function (release) {
                        connection.query(query, function (error, rows) {
                            if (error) {
                                connection.end();
                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแก้ไขประเภทสินค้าได้' }));
                            }
                            else {
                                var selectQuery = "select * from producttype where id = " + productTypeId;
                                connection.query(selectQuery, function (error, valueRow) {
                                    connection.end();
                                    if (error) {
                                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแก้ไขประเภทสินค้าได้' }));
                                    }
                                    else {
                                        res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                                    }
                                });
                            }
                        });
                        release();
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "คุณไม่ใช่แอ็ดมิน" }));
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
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
                }
                else {
                    var connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var query = "delete from producttype where id = " + productTypeId;
                    var lock = new ReadWriteLock();
                    lock.writeLock(function (release) {
                        connection.query(query, function (error, rows) {
                            if (error) {
                                connection.end();
                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบประเภทสินค้าได้' }));
                            }
                            else {
                                var updateQuery = "update product set producttypeid = 1 where producttypeid = " + productTypeId;
                                connection.query(updateQuery, function (error, rows) {
                                    if (error) {
                                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบประเภทสินค้าได้' }));
                                    }
                                    else {
                                        res.send(JSON.stringify({ status: 1 }));
                                    }
                                });
                            }
                        });
                        release();
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "คุณไม่ใช่แอ็ดมิน" }));
    }
});

app.post('/GetMaterialList', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var query = "select * from material";
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงวัตถุดิบได้' }));
                    }
                    else {
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงวัตถุดิบได้' }));
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
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) {
            res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        }
        else {
            if (ans) {
                connection.query('Select * from material where id=' + materialId, function (error, rows) {
                    connection.end();
                    if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงรายละเอียดวัตถุดิบได้' }));
                    else {
                        res.send(JSON.stringify({ status: 1, data: rows }));
                    }
                });
            }
            else {
                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงรายละเอียดวัตถุดิบได้' }));
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
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var connection = mysql.createConnection({
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
                var lock = new ReadWriteLock();
                lock.writeLock(function (release) {
                    connection.query(query, function (error, rows) {
                        if (error) {
                            connection.end();
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถเพิ่มวัตถุดิบได้' }));
                        }
                        else {
                            var selectQuery = "select * from material where id = " + rows['insertId'];
                            connection.query(selectQuery, function (error, valueRow) {
                                connection.end();
                                if (error) {
                                    res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถเพิ่มวัตถุดิบได้' }));
                                }
                                else {
                                    res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                                }
                            });
                        }
                    });
                    release();
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
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
                }
                else {
                    var connection = mysql.createConnection({
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
                    var lock = new ReadWriteLock();
                    lock.writeLock(function (release) {
                        connection.query(query, function (error, rows) {
                            if (error) {
                                connection.end();
                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงรายละเอียดวัตถุดิบได้' }));
                            }
                            else {
                                var selectQuery = "select * from material where id = " + materialId;
                                connection.query(selectQuery, function (error, valueRow) {
                                    connection.end();
                                    if (error) {
                                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงรายละเอียดวัตถุดิบได้' }));
                                    }
                                    else {
                                        res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                                    }
                                });
                            }
                        });
                        release();
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "คุณไม่ใช่แอ็ดมิน" }));
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
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'Password@1',
                    database: 'factory'
                });
                var query = "select m.id id, m.name name, m.materialtypeid materialtypeid, m.amount amount\
                from material m\
                where (('" + materialId + "' is null or '" + materialId + "' = '') or m.id = '" + materialId + "')\
                and (('" + materialName + "' is null or '" + materialName + "' = '') or m.name like '%" + materialName + "%')\
                and (('" + materialTypeId + "' is null or '" + materialTypeId + "' = '') or m.materialTypeId = '" + materialTypeId + "')";
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส  ไม่สามารถค้นหาได้' }));
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
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
                }
                else {
                    var connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var query = "delete from material where id = " + materialId;
                    var lock = new ReadWriteLock();
                    lock.writeLock(function (release) {
                        connection.query(query, function (error, rows) {
                            if (error) {
                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบวัตถุดิบได้' }));
                            }
                            else {
                                res.send(JSON.stringify({ status: 1 }));
                            }
                        });
                        release();
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "คุณไม่ใช่แอ็ดมิน" }));
    }
});

app.post('/GetCustomerList', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var query = "select * from customer";
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงรายชื่อลูกค้าได้' }));
                    }
                    else {
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงรายชื่อลูกค้าได้' }));
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
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) {
            res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        }
        else {
            if (ans) {
                connection.query('select c.*, cp.id customerproductpriceId,p.id productId, p.name productName, cp.price price from customer c left join customerproductprice cp on c.id = cp.customerid left join product p on cp.productId = p.id where c.id = ' + customerId, function (error, rows) {
                    connection.end();
                    if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงรายละเอียดลูกค้าได้' }));
                    else {
                        res.send(JSON.stringify({ status: 1, data: rows }));
                    }
                });
            }
            else {
                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงรายละเอียดลูกค้าได้' }));
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
    var credit = json.credit;
    // Array
    var price = json.price;
    // Array
    var productId = json.productId;
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var connection = mysql.createConnection({
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
                                        employeeId,\
                                        credit) \
                                        values('" + customerName + "', '" + address + "','" + subdistrict + "','" +
                    district + "','" + province + "','" + postcode + "','" + regionId + "','" +
                    phone + "','" + transporter + "','" + transporterPhone + "', NOW(), " + userId + ", " + credit + ");";
                var lock = new ReadWriteLock();
                lock.writeLock(function (release) {
                    connection.query(query, function (error, rows) {
                        if (error) {
                            connection.end();
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถเพิ่มลูกค้าใหม่ได้' }));
                        }
                        else {
                            addNewCustomerProductPrice(rows['insertId'], price, productId, function (isSuccess, errorMessage) {
                                var selectQuery = "select * from customer where id = " + rows['insertId'];
                                connection.query(selectQuery, function (error, valueRow) {
                                    connection.end();
                                    if (error) {
                                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงรายละเอียดลูกค้าได้' }));
                                    }
                                    else {
                                        if (!isSuccess) {
                                            res.send(JSON.stringify({ status: 1, errorMessage: errorMessage, data: valueRow[0] }));
                                        }
                                        else {
                                            res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                                        }
                                    }
                                });
                            });
                        }
                    });
                    release();
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
    var credit = json.credit;
    // Array
    var customerProductPriceId = json.customerProductPriceId;
    // Array
    var price = json.price;
    // Array
    var productId = json.productId;
    if (isAdmin == 1) {
        isLogin(userId, token, function (error, ans) {
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
                }
                else {
                    var connection = mysql.createConnection({
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
                                        credit = " + credit + ",\
                                        `datetime` = NOW() \
                                        where id = " + customerId;
                    var lock = new ReadWriteLock();
                    lock.writeLock(function (release) {
                        connection.query(query, function (error, rows) {
                            if (error) {
                                connection.end();
                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแก้ไขรายละเอียดลูกค้าได้' }));
                            }
                            else {
                                if ((typeof price == 'undefined')
                                    || (typeof productId == 'undefined')
                                    || (typeof customerProductPriceId == 'undefined')) {
                                    var select = "select * from customer where id = " + customerId;
                                    var deleteQ = "delete from customerproductprice where customerid = " + customerId;
                                    connection.query(deleteQ, function (error, ans) {
                                        if (error) {
                                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบราคาสินค้าของลูกค้าได้' }));
                                        }
                                        else {
                                            connection.query(select, function (error, valueRow) {
                                                connection.end();
                                                if (error) {
                                                    res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงรายละเอียดลูกค้าได้' }));
                                                }
                                                else {
                                                    res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    if ((price.length != productId.length) || (price.length != customerProductPriceId.length) || (productId.length != customerProductPriceId.length)) {
                                        res.send(JSON.stringify({ status: 0, errorMessage: 'ProductId, Price, customerProductPriceId มีจำนวนไม่เท่ากัน' }));
                                    }
                                    else {
                                        var insertQuery = "insert into customerproductprice (id,productId,customerId,price) values ";
                                        var deleteQuery = "delete from customerproductprice where";
                                        for (var i = 0; i < price.length; i++) {
                                            insertQuery += "(" + customerProductPriceId[i] + ", " + productId[i] + ", " + customerId + ", " + price[i] + ")";
                                            deleteQuery += " id <> " + customerProductPriceId[i];
                                            if (i != price.length - 1) {
                                                insertQuery += ',';
                                                deleteQuery += " and ";
                                            }
                                        }
                                        insertQuery += " on duplicate key update price = values(price)"
                                        connection.query(deleteQuery, function (error, ans) {
                                            if (error) {
                                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแก้ไขราคาสินค้าของลูกค้าได้' }));
                                            }
                                            else {
                                                connection.query(insertQuery, function (error, ans) {
                                                    if (error) {
                                                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแก้ไขราคาสินค้าของลูกค้าได้' }));
                                                    }
                                                    else {
                                                        var selectQuery = "select * from customer where id = " + customerId;
                                                        connection.query(selectQuery, function (error, valueRow) {
                                                            connection.end();
                                                            if (error) {
                                                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงรายละเอียดลูกค้าได้' }));
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
                        release();
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "คุณไม่ใช่แอ็ดมิน" }));
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
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                if ((typeof customerId !== 'undefined') && (typeof customerName !== 'undefined') && (typeof regionId !== 'undefined')) {
                    var connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var query = "select c.id id, c.name Name, c.credit credit, c.regionid regionId, c.phone phone\
                from customer c\
                where (('" + customerId + "' is null or '" + customerId + "' = '') or c.id = '" + customerId + "')\
                and (('" + customerName + "' is null or '" + customerName + "' = '') or c.name like '%" + customerName + "%')\
                and (('" + regionId + "' is null or '" + regionId + "' = '') or c.regionId = '" + regionId + "')";
                    connection.query(query, function (error, rows) {
                        connection.end();
                        if (error) {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส  ไม่สามารถค้นหาได้' }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 1, data: rows }));
                        }
                    });
                }
                else {
                    res.send(JSON.stringify({ status: 0, data: 'ข้อมูลในการค้นหาไม่ครบ' }));
                }
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
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
                }
                else {
                    var connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var query = "delete from customer where id = " + customerId;
                    var deleteCustProd = "delete from customerproductprice where customerid = " + customerId;
                    var lock = new ReadWriteLock();
                    lock.writeLock(function (release) {
                        connection.query(query, function (error, rows) {
                            if (error) {
                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบลูกค้าได้' }));
                            }
                            else {
                                connection.query(deleteCustProd, function (error, rows) {
                                    connection.end();
                                    if (error) {
                                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบลูกค้าได้' }));
                                    }
                                    else {

                                        res.send(JSON.stringify({ status: 1 }));
                                    }
                                });
                            }
                        });
                        release();
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "คุณไม่ใช่แอ็ดมิน" }));
    }
});

app.post('/GetOrderList', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var query = "select o.id id, o.`datetime` datetime,c.credit credit, c.name name, sum(od.amount*od.priceperpiece) price from `order` o join customer c on o.customerid = c.id left join orderdetails od on o.id = od.orderid group by o.id order by datetime";
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงคำสั่งซื้อได้' }));
                    }
                    else {
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงคำสั่งซื้อได้' }));
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
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) {
            res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        }
        else {
            if (ans) {
                var query = 'Select * from `order` as o left join orderdetails od on o.id = od.orderid where o.id=' + orderId;
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงรายละเอียดคำสั่งซื้อได้' }));
                    else {
                        res.send(JSON.stringify({ status: 1, data: rows }));
                    }
                });
            }
            else {
                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแสดงรายละเอียดคำสั่งซื้อได้' }));
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
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'Password@1',
                    database: 'factory'
                });
                var query = "Insert into `order` (customerId,\
                                        employeeId,\
                                        `datetime`) \
                                        values(" + customerId + ", " + userId + ", NOW()  + INTERVAL 7 HOUR);";
                var lock = new ReadWriteLock();
                lock.writeLock(function (release) {
                    connection.query(query, function (error, rows) {
                        if (error) {
                            connection.end();
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถเพิ่มคำสั่งซท้อใหม่ได้' }));
                        }
                        else {
                            if ((typeof productId == 'undefined')
                                || (typeof priceperpiece == 'undefined')
                                || (typeof amount == 'undefined')) {
                                connection.end();
                                res.send(JSON.stringify({ status: 1 }));
                            }
                            else {
                                if ((productId.length != amount.length) && (productId.length != priceperpiece.length) && (amount.length != priceperpiece.length)) {
                                    connection.end();
                                    res.send(JSON.stringify({ status: 0, errorMessage: 'ProductId, Amount, PricePerPiece มีจำนวนไม่เท่ากัน' }));
                                }
                                else {
                                    var insertQuery = "insert into orderdetails (orderid, productid, amount, priceperpiece, employeeid, `datetime`) values ";
                                    var updateQuery = "update product set `amount` = case id ";
                                    for (var i = 0; i < productId.length; i++) {
                                        var id = productId[i];
                                        var eachamount = amount[i]
                                        var eachpriceperpiece = priceperpiece[i];
                                        insertQuery += "(" + rows['insertId'] + ", " + id + ", " + eachamount + ", " + eachpriceperpiece + ", " + userId + ", NOW() + INTERVAL 7 HOUR)";
                                        updateQuery += "when " + id + " then `amount` - " + eachamount + " ";
                                        if (i != productId.length - 1) insertQuery += ",";
                                        else updateQuery += "else `amount` end";
                                    }
                                    connection.query(insertQuery, function (error, valueRow) {
                                        if (error) {
                                            connection.end();
                                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถเพิ่มรายการสั่งซื้อในคำสั่งซื้อได้' }));
                                        }
                                        else {
                                            connection.query(updateQuery, function (error, valueRow) {
                                                connection.end();
                                                if (error) {
                                                    res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแก้ไขจำนวนสินค้าได้' }));
                                                }
                                                else {
                                                    res.send(JSON.stringify({ status: 1 }));
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        }
                    });
                    release();
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
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
                }
                else {
                    var connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var getOrderDetails = "select productid id, amount from orderdetails where orderid = " + orderId;
                    var lock = new ReadWriteLock();
                    lock.writeLock(function (release) {
                        connection.query(getOrderDetails, function (error, rows) {
                            if (error) {
                                connection.end();
                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส' }));
                            }
                            else {
                                if (rows.length > 0) {
                                    var updateQuery = "update product set `amount` = case id ";
                                    for (var i = 0; i < rows.length; i++) {
                                        updateQuery += "when " + rows[i].id + " then `amount` + " + rows[i].amount + " ";
                                    }
                                    updateQuery += "else `amount` end";
                                    var query = "update `order` set \
                                        customerId = '" + customerId + "',\
                                        isupdated = 1\
                                        where id = " + orderId;
                                    connection.query(query, function (error, rows) {
                                        if (error) {
                                            connection.end();
                                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส เกิดความผิดพลาดกับเดต้าเบส' }));
                                        }
                                        else {
                                            if ((typeof orderDetailId == 'undefined')
                                                || (typeof productId == 'undefined')
                                                || (typeof priceperpiece == 'undefined')
                                                || (typeof amount == 'undefined')) {
                                                var deleteOrderdetails = 'delete from orderdetails where orderid = ' + orderId;
                                                connection.query(deleteOrderdetails, function (error, rows) {
                                                    connection.end();
                                                    if (error) {
                                                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบรายการสั่งซื้อได้' }));
                                                    }
                                                    else {
                                                        res.send(JSON.stringify({ status: 1 }));
                                                    }
                                                });
                                            }
                                            else {
                                                var q = 'if (not exist(select id from orderdetails where id = ' + '))';
                                                var insertquery = 'INSERT INTO orderdetails (id, orderid, priceperpiece, amount, employeeid, datetime, productid) ';
                                                var valuesquery = 'Values ';
                                                var duplicatequery = 'ON DUPLICATE KEY UPDATE priceperpiece = values(priceperpiece), amount = values(amount)';
                                                var minusQuery = "update product set amount = case id ";
                                                var deleteQuery = "delete from orderdetails where orderid = " + orderId + " and ";
                                                if ((orderDetailId.length != productId.length)
                                                    || (priceperpiece.length != amount.length)
                                                    || (orderDetailId.length != priceperpiece.length)
                                                    || (productId.length != amount.length)) {
                                                    connection.end();
                                                    res.send(JSON.stringify({ status: 1 }));
                                                }
                                                else {
                                                    connection.query(updateQuery, function (error, rows) {
                                                        if (error) {
                                                            connection.end();
                                                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแก้ไขจำนวนสินค้าได้' }));
                                                        }
                                                        else {
                                                            for (var i = 0; i < orderDetailId.length; i++) {
                                                                var eachorderDetailId = orderDetailId[i];
                                                                var eachproductId = productId[i];
                                                                var eachpriceperpiece = priceperpiece[i];
                                                                var eachamount = amount[i];
                                                                valuesquery += '(' + eachorderDetailId + ', ' + orderId + ', ' + eachpriceperpiece + ', ' + eachamount + ', ' + userId + ', now()  + INTERVAL 7 HOUR, ' + eachproductId + ')';
                                                                minusQuery += "when " + eachproductId + " then amount - " + eachamount + " ";
                                                                deleteQuery += "id <> " + eachorderDetailId + " ";
                                                                if (i != orderDetailId.length - 1) {
                                                                    valuesquery += ',';
                                                                    deleteQuery += "and ";
                                                                }
                                                            }
                                                            minusQuery += "else amount end";
                                                            var updateNewProductQuery = insertquery + valuesquery + duplicatequery;
                                                            connection.query(minusQuery, function (error, valueRow) {
                                                                if (error) {
                                                                    connection.end();
                                                                    res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแก้ไขจำนวนสินค้าได้' }));
                                                                }
                                                                else {
                                                                    connection.query(deleteQuery, function (error, valueRow) {
                                                                        if (error) {
                                                                            connection.end();
                                                                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบรายการสั่งซื้อได้' }));
                                                                        }
                                                                        else {
                                                                            connection.query(updateNewProductQuery, function (error, valueRow) {
                                                                                connection.end();
                                                                                if (error) {
                                                                                    res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบรายการสั่งซื้อได้' }));
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
                                                    });

                                                }
                                            }
                                        }
                                    });
                                }
                                else {
                                    var query = "update `order` set \
                                        customerId = '" + customerId + "',\
                                        isupdated = 1\
                                        where id = " + orderId;
                                    connection.query(query, function (error, rows) {
                                        if (error) {
                                            connection.end();
                                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแก้ไขคำสั่งซื้อได้' }));
                                        }
                                        else {
                                            if ((typeof orderDetailId == 'undefined')
                                                || (typeof productId == 'undefined')
                                                || (typeof priceperpiece == 'undefined')
                                                || (typeof amount == 'undefined')) {
                                                var deleteOrderdetails = 'delete from orderdetails where orderid = ' + orderId;
                                                connection.query(deleteOrderdetails, function (error, rows) {
                                                    connection.end();
                                                    if (error) {
                                                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบรายการสั่งซื้อได้' }));
                                                    }
                                                    else {
                                                        res.send(JSON.stringify({ status: 1 }));
                                                    }
                                                });
                                            }
                                            else {
                                                var q = 'if (not exist(select id from orderdetails where id = ' + '))';
                                                var insertquery = 'INSERT INTO orderdetails (id, orderid, priceperpiece, amount, employeeid, datetime, productid) ';
                                                var valuesquery = 'Values ';
                                                var duplicatequery = 'ON DUPLICATE KEY UPDATE priceperpiece = values(priceperpiece), amount = values(amount)';
                                                var minusQuery = "update product set amount = case id ";
                                                var deleteQuery = "delete from orderdetails where orderid = " + orderId + " and ";
                                                if ((orderDetailId.length != productId.length) || (priceperpiece.length != amount.length)) {
                                                    connection.end();
                                                    res.send(JSON.stringify({ status: 0, errorMessage: 'OrderDetailId, ProductId, PricePerPiece and Amount มีจำนวนไม่เท่ากัน' }));
                                                }
                                                else {
                                                    for (var i = 0; i < orderDetailId.length; i++) {
                                                        var eachorderDetailId = orderDetailId[i];
                                                        var eachproductId = productId[i];
                                                        var eachpriceperpiece = priceperpiece[i];
                                                        var eachamount = amount[i];
                                                        valuesquery += '(' + eachorderDetailId + ', ' + orderId + ', ' + eachpriceperpiece + ', ' + eachamount + ', ' + userId + ', now()  + INTERVAL 7 HOUR, ' + eachproductId + ')';
                                                        minusQuery += "when " + eachproductId + " then amount - " + eachamount + " ";
                                                        if (i != orderDetailId.length - 1) {
                                                            valuesquery += ',';
                                                        }
                                                    }
                                                    minusQuery += "else amount end";
                                                    var updateQuery = insertquery + valuesquery + duplicatequery;
                                                    connection.query(minusQuery, function (error, valueRow) {
                                                        if (error) {
                                                            connection.end();
                                                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแก้ไขจำนวนสินค้าได้' }));
                                                        }
                                                        else {
                                                            connection.query(updateQuery, function (error, valueRow) {
                                                                connection.end();
                                                                if (error) {
                                                                    res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแก้ไขรายการสั่งซื้อในคำสั่งซื้อได้' }));
                                                                }
                                                                else {
                                                                    res.send(JSON.stringify({ status: 1, data: valueRow[0] }));
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        });
                        release();
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "คุณไม่ใช่แอ็ดมิน" }));
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
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
                }
                else {
                    var connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var getPurchase = "select productid id, `amount` from orderdetails where orderid = " + orderId;
                    var query = "delete o.*, od.* from `order` as o left join orderdetails as od on o.id = od.orderid where o.id = " + orderId + " or od.orderid = " + orderId;
                    var updateQuery = "update product set `amount` = case id ";
                    var lock = new ReadWriteLock();
                    lock.writeLock(function (release) {
                        connection.query(getPurchase, function (error, rows) {
                            if (error) {
                                connection.end();
                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส' }));
                            }
                            else {
                                if (rows.length > 0) {
                                    for (var i = 0; i < rows.length; i++) {
                                        updateQuery += "when " + rows[i].id + " then `amount` + " + rows[i].amount + " ";
                                    }
                                    updateQuery += "else `amount` end";
                                    connection.query(updateQuery, function (error, rows) {
                                        if (error) {
                                            connection.end();
                                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส' }));
                                        }
                                        else {
                                            connection.query(query, function (error, rows) {
                                                connection.end();
                                                if (error) {
                                                    res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบคำสั่งซื้อได้' }));
                                                }
                                                else {
                                                    res.send(JSON.stringify({ status: 1 }));
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    connection.query(query, function (error, rows) {
                                        connection.end();
                                        if (error) {
                                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบคำสั่งซื้อได้' }));
                                        }
                                        else {
                                            res.send(JSON.stringify({ status: 1 }));
                                        }
                                    });
                                }
                            }
                        });
                        release();
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "คุณไม่ใช่แอ็ดมิน" }));
    }
});

app.post('/SearchOrder', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var orderId = json.orderId;
    var customerName = json.customerName;
    var regionId = json.regionId;
    var transactionDate = json.transactionDate;
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'Password@1',
                    database: 'factory'
                });
                var query = "select o.id,c.name,c.credit credit,o.`datetime` datetime,(select sum(od.priceperpiece * od.amount) from orderdetails as od where od.orderid = o.id) price \
                from `order` o join customer c on o.customerid = c.id \
                where (('" + orderId + "' is null or '" + orderId + "' = '') or o.id = '" + orderId + "')\
                and (('" + customerName + "' is null or '" + customerName + "' = '') or c.name like '%" + customerName + "%')\
                and (('" + transactionDate + "' is null or '" + transactionDate + "' = '') or date(o.`datetime`) = date(date_format('" + transactionDate + "', '%y-%m-%d %h:%m:%s')))\
                and (('" + regionId + "' is null or '" + regionId + "' = '') or c.regionId = '" + regionId + "')";
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถค้นหาได้' }));
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
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var connection = mysql.createConnection({
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
                var lock = new ReadWriteLock();
                lock.writeLock(function (release) {
                    connection.query(query, function (error, rows) {
                        if (error) {
                            connection.end();
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถเพิ่มรายการซื้อได้' }));
                        }
                        else {
                            connection.query(updateQuery, function (error, rows) {
                                connection.end();
                                if (error) {
                                    res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถเพิ่มรายการซื้อได้' }));
                                }
                                else {
                                    res.send(JSON.stringify({ status: 1 }));
                                }
                            });
                        }
                    });
                    release();
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
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
                }
                else {
                    var connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var updateQuery = "update product set `amount` = `amount` + (select `amount` from orderdetails where id = " + orderdetailsId + ") - " + amount + " where id = (select productid from orderdetails where id = " + orderdetailsId + ")";
                    var query = "update orderdetails set priceperpiece = " + priceperpiece + ", `amount` = " + amount + " where id = " + orderdetailsId;
                    var lock = new ReadWriteLock();
                    lock.writeLock(function (release) {
                        connection.query(updateQuery, function (error, rows) {
                            if (error) {
                                connection.end();
                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแก้ไขรายการซื้อได้' }));
                            }
                            else {
                                connection.query(query, function (error, rows) {
                                    connection.end();
                                    if (error) {
                                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแก้ไขรายการซื้อได้' }));
                                    }
                                    else {
                                        res.send(JSON.stringify({ status: 1 }));
                                    }
                                });
                            }
                        });
                        release();
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "คุณไม่ใช่แอ็ดมิน" }));
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
            if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            else {
                if (!ans) {
                    res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
                }
                else {
                    var connection = mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'Password@1',
                        database: 'factory'
                    });
                    var updateQuery = "update product set `amount` = `amount` + (select `amount` from orderdetails where id = " + orderdetailsId + ") where id = (select productid from orderdetails where id = " + orderdetailsId + ")";
                    var query = "delete from orderdetails where id = " + orderdetailsId;
                    var lock = new ReadWriteLock();
                    lock.writeLock(function (release) {
                        connection.query(updateQuery, function (error, rows) {
                            if (error) {
                                connection.end();
                                res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบรายการซื้อได้' }));
                            }
                            else {
                                connection.query(query, function (error, rows) {
                                    connection.end();
                                    if (error) {
                                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบรายการซื้อได้' }));
                                    }
                                    else {
                                        res.send(JSON.stringify({ status: 1 }));
                                    }
                                });
                            }
                        });
                        release();
                    });
                }
            }
        });
    }
    else {
        res.send(JSON.stringify({ status: 0, errorMessage: "คุณไม่ใช่แอ็ดมิน" }));
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
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'Password@1',
                    database: 'factory'
                });
                var insertQuery = 'insert into materialtransaction (materialId,acquire,`use`,balance,`datetime`,employeeid) values ';
                var updateQuery = "update material m1 join material m2 on m1.id = m2.id set m1.amount = case ";
                for (var i = 0; i < materialId.length; i++) {
                    insertQuery += '(' + materialId[i] + ', ' + acquire[i] + ', ' + use[i] + ', (select amount from material where id = ' + materialId[i] + ' limit 1) - ' + use[i] + ' + ' + acquire[i] + ', NOW(), ' + userId + ') ';
                    updateQuery += 'when m2.id = ' + materialId[i] + ' then m2.amount - ' + use[i] + " + " + acquire[i] + ' ';
                    if (i != materialId.length - 1) {
                        insertQuery += ', ';
                    }
                    else updateQuery += "else m2.amount end;";
                }
                var lock = new ReadWriteLock();
                lock.writeLock(function (release) {
                    connection.query(insertQuery, function (error, rows) {
                        if (error) {
                            connection.end();
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส' }));
                        }
                        else {
                            connection.query(updateQuery, function (error, rows) {
                                connection.end();
                                if (error) {
                                    res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส' }));
                                }
                                else {
                                    res.send(JSON.stringify({ status: 1 }));
                                }
                            });
                        }
                    });
                    release();
                });
            }
        }
    });
});

app.post('/GetMaterialTransactionList', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var query = 'select * from materialtransaction';
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส' }));
                    }
                    else {
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส' }));
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
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var connection = mysql.createConnection({
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
                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถค้นหาได้' }));
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
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var query = 'select * from producttransaction order by transactiondate';
                connection.query(query, function (error, rows) {
                    connection.end();
                    if (error) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส' }));
                    }
                    else {
                        if (typeof rows !== 'undefined') {
                            res.send(JSON.stringify({ status: 1, data: rows }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส' }));
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
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var connection = mysql.createConnection({
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
                        res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถค้นหาได้' }));
                    }
                    else {
                        res.send(JSON.stringify({ status: 1, data: rows }));
                    }
                });
            }
        }
    });
});

function addNewCustomerProductPrice(customerId, price, productId, callback) {
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password@1',
        database: 'factory'
    });
    if ((typeof price == 'undefined')
        || (typeof productId == 'undefined')) {
        callback(false, "ไม่มี ProductId หรือ Price");
    }
    else {
        if (price.length != productId.length) {
            callback(false, "ProductId, Price มีจำนวนไม่เท่ากัน")
        }
        else {
            var insertQuery = "insert into customerproductprice (productid, customerid,`price`) values ";
            for (var i = 0; i < productId.length; i++) {
                var prodid = productId[i];
                var eachprice = price[i]
                insertQuery += "(" + prodid + ", " + customerId + ", " + eachprice + ")";
                if (i != productId.length - 1) insertQuery += ",";
            }
            var lock = new ReadWriteLock();
            lock.writeLock(function (release) {
                connection.query(insertQuery, function (error, valueRow) {
                    if (error) {
                        connection.end();
                        callback(false, "เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถเก็บราคาสินค้าของลูกค้าได้");
                    }
                    else {
                        callback(true, "");
                    }
                });
                release();
            });
        }
    }
}

app.post('/UpdateCustomerProductPrice', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var price = json.price;
    var customerProductPriceId = json.customerProductPriceId;
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                if ((typeof price == 'undefined') || (typeof customerProductPriceId == 'undefined')) {
                    res.send(JSON.stringify({ status: 1 }));
                }
                else {
                    if (customerProductPriceId.length != price.length) {
                        res.send(JSON.stringify({ status: 0, errorMessage: 'CustomerProductPriceId, Price มีจำนวนไม่เท่ากัน' }));
                    }
                    else {
                        var connection = mysql.createConnection({
                            host: 'localhost',
                            user: 'root',
                            password: 'Password@1',
                            database: 'factory'
                        });
                        var query = "update `customerproductprice` set `price` = case id ";
                        for (var i = 0; i < price.length; i++) {
                            query += "when " + customerProductPriceId[i] + " then `price` + " + price[i] + " ";
                        }
                        query += "else `price` end";
                        var lock = new ReadWriteLock();
                        lock.writeLock(function (release) {
                            connection.query(query, function (error, rows) {
                                connection.end();
                                if (error) {
                                    res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถแก้ไขราคาสินค้าของลูกค้าได้' }));
                                }
                                else {
                                    res.send(JSON.stringify({ status: 1 }));
                                }
                            });
                            release();
                        });
                    }
                }
            }
        }
    });
});

app.post('/DeleteCustomerProductPrice', function (req, res) {
    var json = req.body;
    var userId = json.userId;
    var token = json.token;
    var customerProductPriceId = json.customerProductPriceId;
    isLogin(userId, token, function (error, ans) {
        if (error) res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
        else {
            if (!ans) {
                res.send(JSON.stringify({ status: 0, errorMessage: 'กรุณาเข้าสู่ระบบ' }));
            }
            else {
                var connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'Password@1',
                    database: 'factory'
                });
                var query = "delete from `customerproductprice` where id = " + customerProductPriceId + ";";
                var lock = new ReadWriteLock();
                lock.writeLock(function (release) {
                    connection.query(query, function (error, rows) {
                        connection.end();
                        if (error) {
                            res.send(JSON.stringify({ status: 0, errorMessage: 'เกิดความผิดพลาดกับเดต้าเบส ไม่สามารถลบราคาสินค้าของลูกค้าได้' }));
                        }
                        else {
                            res.send(JSON.stringify({ status: 1 }));
                        }
                    });
                    release();
                });
            }
        }
    });
});

