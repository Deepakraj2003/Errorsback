import express from "express";
import bodyParser from "body-parser";
import { MongoClient } from 'mongodb';
import cors from "cors";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



const app = express();
app.use(cors())

const auth=(req,res,next)=>{
    try{
    const token = req.header("backend-token");//keyname,assign value as token
    jwt.verify(token,"abcd");
    next();
    }
    catch(error) {
    res.status(401).send({message:error.message});
    }
    }


const url = "mongodb+srv://deera3468:wQYHszmzEZiYK4tD@back153.i8nqqzc.mongodb.net/?retryWrites=true&w=majority&appName=back153";
const client = new MongoClient(url);


const dbName = 'stack';
await client.connect();
console.log('Mongodb Connected successfully to server');


app.use(express.json())


app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("Hi everyone");
});

app.post('/post', async (req, res) => {
    const getPostman = req.body;
    console.log(getPostman);
    const sendMethod = await client.db("stack").collection("questions").insertOne(getPostman);
    
    res.status(200).send(sendMethod);
});

app.post('/postcomment', async (req, res) => {
    const { questionId, comment } = req.body; 

    const updatedQuestion = await client.db("stack").collection("questions").findOneAndUpdate(
        { _id:new ObjectId(questionId) }, 
        { $addToSet: { comments: comment } },
        { returnDocument: 'after' } 
    );

 

    res.status(200).json(updatedQuestion.value); 
});
app.get('/getmany', async (req,res)=>{
    const getdata= await client.db("stack").collection("questions").find({}).toArray();
    res.status(200).send(getdata);
});

app.delete('/delete', async (req, res) => {
    const deletedata = await client.db("stack").collection("questions").deleteMany({});
    res.status(200).send(deletedata);
});

app.get('/detials/:id', async (req, res) => {
    const { id } = req.params;
    const getdata = await client.db("stack").collection("questions").findOne({_id:new ObjectId(id)});
    res.status(200).send(getdata);
});
app.post("/register",async (req, res)=>{
    const {username,email,password} = req.body;
    const userfind=await client.db("CURD").collection("registerdata").findOne({email:email});
    if (!userfind){
    const salt=await bcrypt.genSalt(10);
    const encrypt=await bcrypt.hash(password,salt);
    const registerData = await client.db("CURD").collection("registerdata").insertOne({name:username,email:email,password:encrypt});
    res.status(201).send(registerData);
    
    }
    else{
        res.status(400).send("user already registerd");
    }
    
    
})
app.post('/login', async(req, res) => {
    const {email,password} = req.body;
    const userfind=await client.db("CURD").collection("registerdata").findOne({email:email});
    if (userfind){
        const mongopass=userfind.password;
        const check= await bcrypt.compare(password, mongopass);
        if(check){
            const token=jwt.sign({id:userfind._id},"abcd");// jwt token abcd
            res.status(200).send({token:token})
        }
        else{
            res.status(400).send({message:"not Verified user"});
        }
    }
    else{
        res.status(400).send({message:"User not Found"});
    }
})
;

app.listen(4000, () => {
    console.log("Server is running on http://localhost:4000");
});
