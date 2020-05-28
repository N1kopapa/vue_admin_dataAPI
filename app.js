const express = require('express')
const app = express()
// CORS模块，处理web端跨域问题
const cors = require('cors')
app.use(cors())

//body-parser 解析表单
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

//使用mysql中间件连接MySQL数据库
const mysql = require('mysql')
const connection = mysql.createConnection({
    host: '118.25.124.110', //数据库地址
    user: 'root', //用户名
    password: 'wlzx5057', //密码
    port: '3306', //端口
    database: 'final', //库名
    multipleStatements: true //允许执行多条语句
})

// 用户查询
app.get('/api/user', (req, res, next) => {
    const pageIndex = req.query.pageIndex
    const pageSize = req.query.pageSize
    const start = (pageIndex - 1) * pageSize
    const end = pageIndex * pageSize
    const sql = 'SELECT * FROM user where isDel=false limit ' + start + ',' + end;
    const sql1 = 'SELECT COUNT(*) as num FROM user where isDel=false';
    const allResults = {
        total: null,
        data: null,
    }
    connection.query(sql1, (err, results) => {
        if (err) {
            return res.json({
                code: 200,
                message: err,
                affextedRows: 0
            })
        }
        allResults.total = results[0].num
    })
    connection.query(sql, (err, results) => {
        if (err) {
            return res.json({
                code: 1,
                message: '无房屋信息',
                affextedRows: 0
            })
        }
        res.json({
            code: 200,
            message: results,
            total:allResults.total
        })
    })
})
// 用户修改
app.put('/api/user', (req, res) => {
    const param = [req.query.actualName, req.query.email, req.query.phone, req.query.qq, req.query.sex,req.query.isDel,req.query.userId]
    const updateSql = 'UPDATE user SET actualName = ?,email = ?,phone=?,qq=?,sex=?,isDel=? WHERE userId = ?'
    connection.query(updateSql, param, (err, results) => {
        if (err) {
            return res.json({
                code: 1,
                message: '修改失败',
                affextedRows: 0
            })
        }
        res.json({
            code: 200,
            message: '修改成功',
            affextedRows: results.affextedRows
        })
    })
})
// 用户删除
app.put('/api/delUser', (req, res) => {
    const param = [req.query.userId]
    const updateSql = 'UPDATE user SET isDel=true WHERE userId = ?'
    connection.query(updateSql, param, (err, results) => {
        if (err) {
            return res.json({
                code: 1,
                message: '修改失败',
                affextedRows: 0
            })
        }
        res.json({
            code: 200,
            message: '删除成功',
            affextedRows: results.affextedRows
        })
    })
})
//新增用户
app.post('/api/user', (req, res) => {
    const addSql = 'INSERT INTO user(userName,passWord,actualName,sex,qq,email,phone) VALUES(?,?,?,?,?,?,?)'
    const param = [req.query.userName, req.query.passWord, req.query.actualName, req.query.sex, req.query.qq, req.query.email, req.query.phone]
    connection.query(addSql, param, (err, results) => {
        if (err) {
            console.log('[增加失败] - ', err.message);
            return res.json({
                code: 1,
                message: '添加失败',
                affextedRows: 0
            })
        }
        res.json({
            code: 200,
            message: '添加成功',
            affextedRows: results.affextedRows
        })
    })
})
// 登录
app.get('/api/username', (req, res, next) => {
    const username = req.query.username
    const password = req.query.password
    const sql = 'SELECT * FROM user where userName = ? and passWord = ? ' //user为表名
    const param = [username, password]
    connection.query(sql, param, (err, results) => {
        if (err) {
            return res.json({
                code: 1,
                message: err,
                affextedRows: 0
            })
        }
        res.json({
            code: 200,
            data: results,
            affextedRows: results.affextedRows
        })
    })
})

app.get('/api/info', (req, res, next) => {
    res.json({
        code: 200,
        data: {
            name: "Super Admin",
            roles:['admin']
        }
    })

})


//房子api
// 房子分页，
app.get('/api/house', (req, res) => {
    const pageIndex = req.query.pageIndex
    const pageSize = req.query.pageSize
    const start = (pageIndex - 1) * pageSize
    const end = pageIndex * pageSize
    const param = [req.query.houseName, req.query.type, req.query.moneyType]
    const sql = 'SELECT * FROM house where isDel=false limit ' + start + ',' + end;
    const sql1 = 'SELECT COUNT(*) as num FROM house where isDel=false';
    const allResults = {
        count: null,
        data: null,

    }
    connection.query(sql1, (err, results) => {
        if (err) {
            return res.json({
                code: 1,
                message: '无房屋信息',
                affextedRows: 0
            })
        }
        allResults.count = results[0].num
    })
    connection.query(sql, (err, results) => {
        if (err) {
            return res.json({
                code: 1,
                message: '无房屋信息',
                affextedRows: 0
            })
        }
        allResults.data = results
        res.json({
            code: 200,
            message: allResults,
        })
    })

})
// 根据userId查询房子，我发布的房子
app.get('/api/houseById', (req, res) => {
    const pageIndex = req.query.pageIndex
    const pageSize = req.query.pageSize
    const start = (pageIndex - 1) * pageSize
    const end = pageIndex * pageSize
    const userId = req.query.userId
    const sql = 'SELECT * FROM house where userId = ? and isDel=false limit ' + start + ',' + end;
    const param = [userId]
    connection.query(sql, param, (err, results) => {
        if (err) {
            return res.json({
                code: 1,
                message: '无房屋信息',
                affextedRows: 0
            })
        }
        res.json({
            code: 200,
            message: results,
            affextedRows: results.affextedRows
        })
    })
})
//新增住房信息
app.post('/api/addHouse', (req, res) => {
    const addSql = 'INSERT INTO house(houseName,userId,remark,postionX,postionY,type,money,moneyType,address,img,phone) VALUES(?,1,?,?,?,?,?,?,?,?,?)'
    const param = [req.query.houseName, req.query.remark, req.query.postionX, req.query.postionY, req.query.type, req.query.money, req.query.moneyType, req.query.address, req.query.img, req.query.phone]
    connection.query(addSql, param, (err, results) => {
        if (err) {
            console.log('[增加失败] - ', err.message);
            return res.json({
                code: 1,
                message: '添加失败',
                affextedRows: 0
            })
        }
        res.json({
            code: 200,
            message: '添加成功',
            affextedRows: results.affextedRows
        })
    })
})
//修改住房信息
app.post('/api/updateHouse', (req, res) => {
    const param = [req.query.houseName, req.query.remark, req.query.type, req.query.money, req.query.moneyType, req.query.address, req.query.houseId]
    const updateSql = 'UPDATE house SET houseName = ?,remark = ?,type=?,money=?,moneyType=?,address=? WHERE houseId = ?'
    connection.query(updateSql, param, (err, results) => {
        if (err) {
            return res.json({
                code: 1,
                message: '修改失败',
                affextedRows: 0
            })
        }
        res.json({
            code: 200,
            message: '修改成功',
            affextedRows: results.affextedRows
        })
    })
})
//删除住房信息
app.post('/api/updateHouse', (req, res) => {
    const param = [req.query.isDel]
    const updateSql = 'UPDATE house SET isDel = ? WHERE houseId = ?'
    connection.query(updateSql, param, (err, results) => {
        if (err) {
            return res.json({
                code: 1,
                message: '删除失败',
                affextedRows: 0
            })
        }
        res.json({
            code: 200,
            message: '删除成功',
            affextedRows: results.affextedRows
        })
    })
})
//新增图片信息
app.post('/api/addImg', (req, res) => {
    const addSql = 'INSERT INTO houseimg(houseId,imgurl) VALUES(?,?)'
    const param = [req.query.houseId, req.query.imgurl]
    connection.query(addSql, param, (err, results) => {
        if (err) {
            console.log('[增加失败] - ', err.message);
            return res.json({
                code: 1,
                message: '添加失败',
                affextedRows: 0
            })
        }
        res.json({
            code: 200,
            message: '添加成功',
            affextedRows: results.affextedRows
        })
    })
})
//启动服务，端口3001
app.listen(3001, () => {
    console.log('服务启动成功:' + `http://localhost:3001/`)
})