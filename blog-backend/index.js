const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongodb = require('mongodb')
const session = require('express-session')
const { mongo } = require('mongoose')
const url = 'mongodb://localhost/27017'
const port = process.env.PORT || 9700

let app = express() 
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
let db;

app.use(session({
    secret:"mysessionid"
}))

// static path
app.use(express.static(__dirname+'/public'))
app.set('views','./src/views')
app.set('view engine', 'ejs')

var mongoClient = new mongodb.MongoClient(url, {useNewUrlParser:true,useUnifiedTopology: true})
mongoClient.connect((err) => {
    if(err) throw err;
     db = mongoClient.db('myblog')
})

app.get('/', (req,res)=>{
    res.render('login')
})

app.get('/health', (req, res) => {
    res.send('health ok ❤️')
})

app.get('/posts', (req,res) => {
    if(!req.session.user) {res.send('No Session Found')}
    // db.collection('posts').find({name:req.session.user._id})
    db.collection('posts').find().toArray((err,postdata) => {
        if(err) throw err
        res.send(postdata)
    })
})

app.post('/addpost', (req,res) => {
    if(!req.session.user) {
        res.send('No Session Found')
        console.log('error')
    }
    let data = {
        title:req.body.title,
        description:req.body.description,
        createdBY:req.session.user._id,
        name:req.session.user.name,
        createdOn:{ type: Date, default: Date.now }
    }

    // res.send(data)

    db.collection('posts').insert(data, (err,result) => {
        if(err) throw err;
        res.send(data)
    })
})

app.post('/register', (req, res) => {
    let user = {
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
    }
    console.log(user)
    db.collection('users').insert(user,(err,data) => {
        if(err) throw err
        res.send("Data added")
    })
})

app.post('/login', (req, res) => {
    let user = {
        email:req.body.email,
        password:req.body.password
    }
    console.log(user)
    db.collection('users').findOne(user,(err, data) => {
        if(err || !data) {
            res.send('no user found')
        }else {
            req.session.user=data;
            res.send(req.session.user)
        }
    })
})

app.get('/logout', (req,res) => {
    req.session.user = null
    res.send('logout success')
})

app.listen(port, (err) => {
    if(err) throw err
    console.log(`app is running on port ${port}`)
})