const mongoose = require("mongoose");
// const validator = require('validator')
const bcryptjs = require('bcryptjs')
// const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 2 },
  role: { type: String, enum: ["customer", "provider", "admin"], default: "customer" },
  phone: { type: String, match: /^[0-9]{10}$/ }
}, { timestamps: true });

//don't work on find only works on save and creATE
userSchema.pre('save',async function(next){
    if(!this.modifiedPaths('password')) return next()

    this.password = await bcryptjs.hash(this.password,12)
    // this.confirmpassword = ""
    next()
})
userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) {
        return next()
    }
    this.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.methods.checkPassword = async function(enteredpass,userpass){
    return await bcryptjs.compare(enteredpass,userpass)
}

const User = mongoose.model('User',userSchema)

module.exports = {User}
// module.exports = mongoose.model("User", userSchema);
