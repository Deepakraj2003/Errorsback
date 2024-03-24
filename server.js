import express from "express";
import bodyParser from "body-parser";
import { MongoClient } from 'mongodb';
import cors from "cors";
import { ObjectId } from "mongodb";



const app = express();
app.use(cors())

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

app.listen(4000, () => {
    console.log("Server is running on http://localhost:4000");
});
