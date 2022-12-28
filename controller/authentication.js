const userSchema = require('../model/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const createToken = require('../middleware/jwt')
const { asyncwrappe } = require('../middleware/asyncwrapper')

const maxAge = 60 * 60 * 24;

module.exports = {

   register: asyncwrappe(async (req, res) => {
      console.log(req.body)
      const { fullName, email, password } = req.body
      const pass = await bcrypt.hash(password, 10)
      const sameEmail = await userSchema.findOne({ email: email })
      if (sameEmail) {
         throw Error('Sorry, this email already exists. try something different')
      }
      else {
         const user = await userSchema.create({ name: fullName, email: email, password: pass })
         const token = createToken({ user: user, userId: user.id })
         res.status(201).json({ id: user._id, status: true, user: user, token })
      }
   }
   ),

   login: asyncwrappe(async (req, res) => {
      if (req.body.email_verified) {
         const googledata = req.body
         const guser = await userSchema.findOne({ email: googledata.email })
         if (guser) {
            const token = createToken({ user: guser, userId: guser.id })
            res.status(201).json({ id: guser._id, status: true, user: guser, token })
         }
         else {
            const user = await userSchema.create({ name: googledata.name, email: googledata.email, password: null, image: googledata.picture })
            const token = createToken({ user: user, userId: user.id })
            res.status(201).json({ id: user._id, status: true, user: user, token })
         }
      }
      else {
         const { email, password } = req.body
         const user = await userSchema.findOne({ email: email })
         if (user) {
            const use = await bcrypt.compare(password, user.password)
            if (use) {
               const token = createToken({ user: user, userId: user.id })
               res.status(201).json({ userid: user._id, status: true, user: user, token })
            }
            else {
               throw Error('Sorry, your password was incorrect. Please double-check your password.')
            }
         }
         else {
            throw Error('Sorry, your email was incorrect. Please double-check your email.')
         }
      }
   }
   ),

   updateProfile: asyncwrappe(async (req, res) => {
      const { form, user } = req.body
      const useid = user.userId
      const use = await userSchema.findByIdAndUpdate(useid, {
         name: form.name, mobile: form.mobile, dateofbirth: form.dateofbirth, bio: form.bio
      })
      res.json({ status: true, user: use })
   }
   ),

   getuser: asyncwrappe(async (req, res) => {
      const user = req.userId
      const userdetails = await userSchema.findOne({ _id: user })
      res.json({ status: true, user: userdetails })
   }),

   users: asyncwrappe(async (req, res) => {
      const userid = req.userId
      var user = await userSchema.findById(userid)
      userSchema.find({ _id: { $nin: [...user.following, userid] } }, { password: 0 }).sort({ createdAt: '-1' }).limit(7)
         .then(data => {
            res.json({ status: true, user: data })
         }).catch(err => reject(err))
   }),

   follow: asyncwrappe((req, res) => {
      return new Promise((resolve, reject) => {
         const frndId = req.body.frndid
         const userid = req.userId
         userSchema.findByIdAndUpdate(userid, { $addToSet: { following: frndId } }).then(data => {
            userSchema.findByIdAndUpdate(frndId, { $addToSet: { followers: userid } }).then(data => {
               resolve(data)
               res.json({ status: true, resolve })
            }).catch(err => reject(err))
         }).catch(err => reject(err))
      })
   }),

   unfollow: asyncwrappe((req, res) => {
      return new Promise((resolve, reject) => {
         const frndId = req.body.frndid
         const userid = req.userId
         userSchema.findByIdAndUpdate(userid, { $pull: { following: frndId } }).then(data => {
            userSchema.findByIdAndUpdate(frndId, { $pull: { followers: userid } }).then(data => {
               resolve(data)
               res.json({ status: true, resolve })
            }).catch(err => reject(err))
         }).catch(err => reject(err))
      })

   }),

   finduser: asyncwrappe((req, res) => {
      return new Promise(async (resolve, reject) => {
         const name = `(?i)${req.body.name}`
         const userid = req.userId
         let result = await userSchema.find({ name: { $regex: name } })
         res.json({ result })
      })
   }),

   getfollowing: asyncwrappe((req, res) => {
      return new Promise(async (resolve, reject) => {
         const userid = req.userId
         let user = await userSchema.find({ _id: userid }).populate('following')
         console.log(user)
         res.json({ user })
      })
   })
}





