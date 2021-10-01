const User = require('../models/user');

const router = require('express').Router();

router.post('/follow', async (req, res) => {
    if(!req.isAuthenticated()) return res.status(400).json({message: "User cant loginned"});
    const { _id } = req.body;
    try {

        const check = await User.find({$and:[ {_id: req.user._id}, 
            {following: {$elemMatch: 
            {$eq:_id } } }  ] })

        if(check.length>0) return res.redirect('/api/friends/unfollow')

        await User.findByIdAndUpdate( req.user._id, {$push: {following: _id} } );
        await User.findByIdAndUpdate( req.body._id,  {$push: {followers: req.user._id } })
        res.redirect( '/api/users/auth');
    } catch (error) {
        return res.status(404).json(error);
    }
});
router.post('/unfollow', async (req, res) => {
    if(!req.isAuthenticated()) return res.status(400).json({message: "User cant loginned"});
    const { _id } = req.body;
    
    try {
        const check = await User.find({$and:[ {_id: req.user._id}, {following: {$ne: [_id]} } ] })

        if(check.length>0) return res.redirect('/api/friends/follow')

        await User.findByIdAndUpdate( req.user._id, {$pull: {following: _id} } );
        await User.findByIdAndUpdate( req.body._id,  {$pull: {followers: req.user._id } })
        res.redirect( '/api/users/auth');
    } catch (error) {
        return res.status(404).json(error);
    }
});
router.post('/upd_info', async (req, res) => {
    if(!req.isAuthenticated()) return res.status(401).json({message: "User not loginned"});
    const {firstName, lastName, username} = req.body;
    
    try {
        await User.find({username: username}, (err, found)=>{
            if(err) return res.status(403).json({message: 'Something wrong went! Try again!'})
            else if( found.length > 0 ) return res.status(404).json({message: "Username useful. please check another username"})
        })    
    } catch (e) {
        return res.status(500).json({message: 'Somethin wrong went! Try again!'})
    }
    
    
    try {
        await User.updateOne({ _id: req.user._id, },
            { $set: { firstName: firstName, lastName: lastName, username: username } })        
            res.redirect( '/api/users/auth');
    } catch (e) {
        return res.status(500).json({message: 'Something wrong went! Try again!'})
    }
    
});

module.exports = router;
