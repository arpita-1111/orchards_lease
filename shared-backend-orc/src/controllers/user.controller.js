import User from "../models/user.model.js";

export const me=
async(
req,
res
)=>{

const user=
await User.findById(
req.user.id
)
.select(
"-password"
);

res.json(
user
);

};



export const getUsers=
async(
req,
res
)=>{

const users=
await User
.find()
.select(
"-password"
);

res.json(
users
);

};