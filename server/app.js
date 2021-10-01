require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const session = require('express-session');
const socketio = require('socket.io');
const path = require('path')
const http = require('http');
const router = require('./routes/user');

const app = express();

mongoose.connect(
process.env.MONGO_URL
    , {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const Conversation = require('./models/conversations');
const User = require('./models/user');
const Messages = require('./models/messages');

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret:process.env.SESSION_SECRET,
    saveUninitialized:false,
    resave: false
}));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users',router);
app.use('/api/friends', require('./routes/friends') );
app.use('/api/conversations', require('./routes/conversation'));
const server = http.createServer(app);

const io = socketio(server,{
    cors: {
      origin: 'http://localhost:3000'
    }
});
io.on('connection', async (socket) => {

    const id = socket.handshake.query.id
    socket.join(id)
    await User.findByIdAndUpdate(id, {$set: { online: true }})
    io.emit("users", {baza: await User.find({}) })
    socket.on('deleteUser', ({currentConversation, current}, callback)=>{
        let err1 = false;

        try {
            if(currentConversation.recipients.length === 1) {
                Conversation.findByIdAndDelete( currentConversation._id, function (err, docs) {
                    if (err){
                        err1 = true
                    }
                    
                } )
            }
            else{
                if( currentConversation.admins.includes(current) ){
                    Conversation.findByIdAndUpdate( currentConversation._id, {$pull: {admins: current} }, 
                        function (err, docs) {
                        if (err){
                            err1 = true
                        }
                        
                    } ); 
                }
                Conversation.findByIdAndUpdate( currentConversation._id, {$pull: {recipients: current} }, 
                    function (err, docs) {
                    if (err){
                        err1 = true
                    }
                    
                } );    
            }
            currentConversation.recipients.forEach( r=>{
                if(r._id === current){
                    socket.broadcast.to(current).emit('iamdeleted', {cr: currentConversation})
                }
                else{
                    socket.broadcast.to(r._id).emit('somebodydeleted', {cr: currentConversation, current})
                }
            } )
            
        } catch (error) {
            err1 = true    
        }
        
        callback({err: err1})
    })
    socket.on('handleChange', ({currentConversation, name}, callback)=>{
        let err1 = false;
        try {
            Conversation.findByIdAndUpdate(currentConversation._id , { $set: { groupName: name } } ,
                function (err, docs) {
                    if (err){
                        err1 = true
                    }
                    
                } )
            currentConversation.recipients.forEach(r=>{
                if(r._id!==id) socket.broadcast.to(r._id).emit('groupname', {cr: currentConversation, name})
            })
        } catch (error) {
            err = true;
        }
        callback({err: err1})
    })
    socket.on("changeUser", ({currentConversation, current}, callback)=>{
        let err1 = false;
        let ans = currentConversation.admins.includes(current)
        try {
            if( !ans ){
                Conversation.findByIdAndUpdate( currentConversation._id, {$push: {admins: current} }, function (err, docs) {
                    if (err){
                        err1 = true
                    }
                    
                } )
            }
            else{
                Conversation.findByIdAndUpdate( currentConversation._id, {$pull: {admins: current} }, function (err, docs) {
                    if (err){
                        err1 = true
                    }
                    
                } )
            }

            currentConversation.recipients.forEach(r=>{
                if(ans) socket.broadcast.to(r._id).emit("adminout", {cr: currentConversation, current})
                else   socket.broadcast.to(r._id).emit("adminin", {cr: currentConversation, current})
            
            })

        } catch (error) {
            err1 = true
        }
        callback({err: err1, ans})
    })
    socket.on('add_user', ({add, currentConversation}, callback)=>{
        let err_1 = false;
        const {recipients, ...other} = currentConversation
        
        try {
            const fero = add.map(i=>i._id)
            
            Conversation.findByIdAndUpdate(currentConversation._id, {
                    $push: {
                        recipients: {
                            $each: fero,
                            $position: 0
                        }
                    }
                },
                function (err, docs) {
                if (err){
                    err_1 = true
                }
            });
            
            const nw = [ ...add ,...recipients ]

            add.forEach( i=>{
                socket.broadcast.to(i._id).emit('group-add', {
                    geldim: { recipients: nw, ...other }
                })
            
            })

            recipients.forEach( i=>{
                if(i._id !== id)
                socket.broadcast.to( i._id ).emit('somebody-added', {
                    geldim: { recipients: nw, ...other }
                })
            } )

        } catch (error) {
            err_1 = true
        }

        callback({err: err_1})

    })
    socket.on('leave-group', ({currentConversation, user}, callback)=>{
        let err_1 = false;
        try {
             
            Conversation.findByIdAndUpdate( currentConversation._id , {$pull: {recipients: user._id}},
                function (err, docs) {
                    if (err){
                        err_1 = true
                    }
                    
                    }
                ) 
            
                currentConversation.recipients.forEach( i=>{
                socket.broadcast.to(i._id).emit('leave-somebody', {
                    cr: currentConversation, 
                    fer: user
                })
            })

        } catch (error) {
            err_1 = true
        }

        callback({err: err_1})

    })
    socket.on('send-message', async ( {recipients, sender , current, text}, callback )=>{
        Conversation.findByIdAndUpdate( current._id, { $set: {status: [] } }, (err)=>{
            // console.log('send-message:', err)
        } )
        recipients.forEach(recipient => {
            socket.broadcast.to(recipient).emit('receive-message', {
              current, sender, text,  readers:[]
            })
        })
        let err=false;
        try {
            const nw = new Messages( 
                { 
                    about: current._id, 
                    sender: sender._id, 
                    text, 
                    watchers: current.recipients.map(r => r._id), 
                    readers:[] 
                });
            await nw.save();
        } catch (e) {
            err=true;
        }
        callback({err: err})
    });
    socket.on('send-typing', ({currentConversation, user})=>{
        currentConversation.recipients.forEach( r=>{
            socket.broadcast.to( r._id ).emit('get-typing', { current: currentConversation, writer: user })
        })
    })
    socket.on('stop-typing', ({currentConversation, user})=>{
        currentConversation.recipients.forEach( r=>{
            socket.broadcast.to( r._id ).emit('dur-typing', { current: currentConversation, writer: user })
        })
    })
    socket.on('read-message', async ({currentConversation}, callback)=>{
        let err = false;
        try {
            await Messages.updateMany( 
                { $and:[ 
                    {about: currentConversation._id}, 
                    {sender: {$not: {$eq:id}}}, 
                    { readers: { $nin: [id]  } } ] 
                }, 
                { $push: {readers: id} })
        } catch (error) {
            err = true;
        }
        callback({err})
    })
    socket.on('disconnect', ()=>{
        User.findByIdAndUpdate(id, {$set: { online: false }}, function (err, docs){})
    })
})
app.post('/', async (req, res) => {
    if(!req.isAuthenticated()) return res.status(403).json({ message: "Forbidden" });
    const {tapmaly} = req.body;

    try {
        const found = await User.find( {$and: [ { _id: { $not: {$eq: req.user.id} } }, 
            { $or:[ { username: { $regex: `${tapmaly}`, $options: 'i' }},
                    { firstName: { $regex: `${tapmaly}`, $options: 'i' }},
                    { lastName: { $regex: `${tapmaly}`, $options: 'i' }} 
        ] } ]  }   );
        
        return res.status(200).json(found);
    } catch (error) {
        return res.status(500).json({message: "Sorry somenthing went wrong!"});
    }

});
app.post('/get', async (req, res) => {
    const {username} = req.body;
    try {
        const found = await User.findOne({username: username});
        if(!found) return res.status(404).json({message: "Not Found"})
        return res.status(200).json(found);
    } catch (error) {
        return res.status(500).json(error)
    }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, ()=>{
    console.log(`Server started on ${PORT}`);
});