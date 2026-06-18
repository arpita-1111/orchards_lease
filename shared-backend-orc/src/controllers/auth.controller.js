import User from "../models/user.model.js";

import bcrypt from "bcryptjs";

import {
generateToken
}
from "../utils/generateToken.js";


export const register=
async(req,res)=>{

try{

const {
name,
email,
password,
role
}=req.body;


if(role==="admin"){

return res
.status(403)
.json({
message:
"Admin registration disabled"
});

}


const exists=
await User.findOne({
email
});

if(exists){

return res
.status(400)
.json({
message:
"Email exists"
});

}


const hash=
await bcrypt.hash(
password,
10
);

const user=
await User.create({

name,

email,

password:hash,

role

});


res.json({

token:
generateToken(
user._id,
user.role
),

user

});


}

catch(err){

res
.status(500)
.json({
message:
err.message
});

}

};



export const login=
async(req,res)=>{

try{

const {
email,
password
}=req.body;


const user=
await User.findOne({
email
});


if(!user){

return res
.status(404)
.json({
message:
"User not found"
});

}


const ok=
await bcrypt.compare(
password,
user.password
);


if(!ok){

return res
.status(401)
.json({
message:
"Wrong password"
});

}


res.json({

token:
generateToken(
user._id,
user.role
),

user

});

}

catch(err){

res
.status(500)
.json({
message:
err.message
});

}

};



export const adminLogin=
async(req,res)=>{

const {
email,
password
}=req.body;


const admin=
await User.findOne({

email,

role:"admin"

});


if(!admin){

return res
.status(403)
.json({
message:
"Admin only"
});

}


const ok=
await bcrypt.compare(
password,
admin.password
);


if(!ok){

return res
.status(401)
.json({
message:
"Invalid"
});

}


res.json({

token:
generateToken(
admin._id,
admin.role
),

admin

});

};