const express = require('express')
    , session = require('express-session')
    , volleyball = require('volleyball')
    , app = express()
    , port = 3001|| process.env.PORT
//Basically Data 
const users = [
    { id: 1 , name: "Alex" , email: "alex@gmail.com" , password: "secret"},
    { id: 2 , name: "Sam" , email: "sam@gmail.com" , password: "secret1"},
    { id: 3 , name: "David" , email: "david@gmail.com" , password: "secret2"}
]


app.use(volleyball)

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    name:"sid",
    cookie: { 
        sameSite: true
     }
}))

//   Redirect login 
function redirectLogin (req , res , next) {
    if(!req.session.userId){
        res.redirect('/login')
    }
    next()
}
function redirectHome  (req , res , next) {
    console.log("Inside redirect home")

    console.log(req.session.userId)
    if(typeof(req.session.userId) == 'number'){
         res.redirect('/home')
        console.log(typeof(req.session.userId))
    }
    else{
        next()
    }
    
}



app.use(express.json());
app.use(express.urlencoded({
    extended: true 
}))

app.get('/' , (req , res )=>{    
    const {userId} = req.session  
    console.log(req.session)
    res.send(`
        <html>
            <head>
                <title>/Route</title>
            </head>
            <body>
                ${!userId ?
                `<a href="/login">Login</a>
                <a href="/register">Register</a>
                `
                :
                `<a href="/home">Home</a>
                <form method="POST" action="/logout">
                    <button>Logout</button>
                </form>`
                }
            </body>
        </html>
    `)
})

app.get('/register',redirectHome   , (req , res , next) =>{
    res.send(`
    <form method="POST" action="/register">
        <input type="text" placeholder="Name" name="name" required>
        <input type="email" placeholder="Email" name="email" required>
        <input type="password" placeholder="Password" name="password" required>
        <input type="submit" >
    </form>
    <a href="/login">Login</a>
    `)
})


app.get('/login'   ,redirectHome , (req , res , next) =>{

    console.log(req.session.userId)
    console.log('Inside login')
    res.send(`
    <form method="POST" action="/login">
        <input type="email" placeholder="Email" name="email" required>
        <input type="password" placeholder="Password" name="password" required>
        <input type="submit" >
    </form>
    <a href="/register">Register</a>
    `)
})


app.get('/home', redirectLogin ,   (req , res , next) =>{
    res.send(`
        <h1>Home</h1>
        <ul>
            <li>id: </li>
            <li>Name</li>
            <li>Email </li>
        </ul>
    `)
})

app.post('/login' ,(req , res , next) =>{
    
    const { email , password } = req.body
    let user = users.find(u =>{
        if (u.email === email)
            if(u.password === password) {
                req.session.userId = u.id
                if(req.session.userId){
                    
                
                    console.log('/home '+req.session.userId)
                    res.redirect('/home')
                }
            }
            else{
                return res.send('Wrong Password')
            }
       
    })
    console.log(user)
})

app.post('/register' , (req , res , next) =>{
    const {email , password , name} = req.body
    if(email && password && name){
        let validUser = users.find((user) =>{
            if(user.email === email){
                return res.send("Already Exist")
            }
        })
    
    let id = users.length++ ; 
    let user = {
        id: id ,
        name : name , 
        email: email , 
        password: password
    }
    users.push(user);
    res.redirect('/login')
    }
})

app.post('/logout' , (req , res , next) => {
    req.session.destroy(
        err =>{
            if(err){
                return res.redirect('/home');
            }
           res.clearCookie("sid")
           res.redirect('/home')
        }
    )
})

app.listen(port , ()=>{
    console.log(`listening you at http://localhost:${port} `)
})