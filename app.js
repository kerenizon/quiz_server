const express = require('express');
const app = express();
const fs = require('fs');
app.use(express.json());

let quizQuestionsBank = [{
    id: 1,
    Q: "What is the favourite food?",
    A: ["pasta", "meat", "fish", "hummus"]
},
{
    id: 2,
    Q: "What is the favourite color?",
    A: ["red", "yellow", "pink", "blue"]
},
{
    id: 3,
    Q: "What is the favourite animal?",
    A: ["parrot", "dog", "cat", "bird"]
},
{
    id: 4,
    Q: "What is the favourite hobby?",
    A: ["music", "dancing", "cooking", "surfing"]
},
{
    id: 5,
    Q: "What is the favourite language?",
    A: ["Hebrew", "English", "French", "Spanish"]
}];

let users = [
{
    id: 1,
    name: "Pini"
}];

let friends = [
{
    id: 1,
    name: "Shani"
}]


// Retrieve a user profile by id
// http://localhost:3000/quiz/profile/get?id=1
app.get('/quiz/profile/get', (req, res) => {
    const id = parseInt(req.query.id);
    if (!id) {
        return res.send('You did not enter id');
    }
    const nameOfUser = users.find((el) => {
        if (el.id === id)
        return el;
    });
    try {
        const dataBuffer = fs.readFileSync(`${nameOfUser.name}.json`);        
        const dataJSON = dataBuffer.toString();
        res.send(JSON.parse(dataJSON)); 
    } catch (e) {
        console.log(e);
        res.send('An error occured');
    }   
});

// Create a user profile
// http://localhost:3000/quiz/profile/create
app.post('/quiz/profile/create', (req, res) => {
    const name = req.body.name;
    if (!name) {
        return res.send('You did not enter name');
    }
    const newUser = {
        name,
        id: users.length + 1
    };  
    users.push(newUser);

    const dataJSON = JSON.stringify(req.body.answersArr)
    fs.writeFileSync(`${name}.json`, `{"answersArr": ${dataJSON}}`)
    res.send('user profile was created');
})

// Update a user answers with Id
// http://localhost:3000/quiz/profile/update?id=1
app.put('/quiz/profile/update', (req, res) => {
    const id = parseInt(req.query.id);
    if (!id) {
        return res.send('You did not enter id');
    }
    const nameOfUser = users.find((el) => {
        if (el.id === id)
        return el;
    });
    try {
        const dataBuffer = fs.readFileSync(`${nameOfUser.name}.json`)
        let dataJSON = dataBuffer.toString()
        let ansArr = JSON.parse(dataJSON); 
        let arr = ansArr.answersArr;
        let newArr = arr.map((el) => {
            if(el.id === req.body.id){
                el.A = req.body.A;
            }
            return el;
        });
        dataJSON = JSON.stringify({"answersArr": newArr});
        fs.writeFileSync(`${nameOfUser.name}.json`, dataJSON)
        res.send('user profile was updated');
    } catch (e) {
        console.log(e);
        res.send('An error occured');
    }  
});

// Retrieve the quiz questions
// http://localhost:3000/quiz
app.get('/quiz', (req, res) => {
    res.send(quizQuestionsBank);
});

// Answer profile's questions by friend
// http://localhost:3000/quiz/answer?profile=PROFILE_ID&friend=FRIEND_NAME
app.post('/quiz/answer', (req, res) => {
    const id = parseInt(req.query.profile);
    if (!id) {
        return res.send('You did not enter profile id');
    }
    const nameOfUser = users.find((el) => {
        if (el.id === id)
        return el;
    });

    const friendName = req.query.friend;
    const newFriend = {
        name: friendName,
        id: friends.length + 1
    }
    friends.push(newFriend);
    
    let dataJSON = JSON.stringify(req.body)
    fs.writeFileSync(`${nameOfUser.name}-${friendName}-answer.json`, dataJSON)
    res.send(`${friendName} answers about ${nameOfUser.name} were submitted`);
})

// Update friend answers of profile with profile Id and friend name
// http://localhost:3000/quiz/answer/update?profile=PROFILE_ID&friend=FRIEND_NAME
app.put('/quiz/answer/update', (req, res) => {
    const id = parseInt(req.query.profile);
    if (!id) {
        return res.send('You did not enter profile id');
    }
    const nameOfUser = users.find((el) => {
        if (el.id === id)
        return el;
    });
    const friendName = req.query.friend;
    try {
        const dataBuffer = fs.readFileSync(`${nameOfUser.name}-${friendName}-answer.json`)
        let dataJSON = dataBuffer.toString();
        let ansArr = JSON.parse(dataJSON); 
        let arr = ansArr.answersArr;
        let newArr = arr.map((el) => {
            if(el.id === req.body.id){
                el.A = req.body.A;
            }
            return el;
        });
        dataJSON = JSON.stringify({"answersArr": newArr});
        fs.writeFileSync(`${nameOfUser.name}-${friendName}-answer.json`, dataJSON);
        res.send('user profile answered by friend was updated');
    } catch (e) {
        console.log(e);
        res.send('An error occured');
    }  
});

// Retrieve a profile rank of friend
// http://localhost:3000/quiz/get-rank?profile=PROFILE_ID&friend=FRIEND_NAME
app.get('/quiz/get-rank', (req, res) => {
    let counter = 0;
    const id = parseInt(req.query.profile);
    if (!id) {
        return res.send('You did not enter profile id');
    }
    const nameOfUser = users.find((el) => {
        if (el.id === id)
        return el;
    });
    const friendName = req.query.friend;
    try {
        counter = getRank(nameOfUser.name,friendName);
        res.send(`${friendName}'s rank of ${nameOfUser.name} is: ${counter / 5  * 100}%`);
    } catch (e) {
        console.log(e);
        res.send('An error occured');
    }  
});

// Retrieve a profile rank of all friends
// http://localhost:3000/quiz/get-all-ranks?profile=PROFILE_ID
app.get('/quiz/get-all-ranks', (req, res) => {
    let counter = 0;
    const id = parseInt(req.query.profile);
    if (!id) {
        return res.send('You did not enter profile id');
    }
    const nameOfUser = users.find((el) => {
        if (el.id === id)
        return el;
    });
    for(let i=0; i< friends.length; i++){
        let friendName = friends[i].name;
        try {
            counter = getRank(nameOfUser.name,friendName);
            res.send(`${friendName}'s rank of ${nameOfUser.name} is: ${counter / 5  * 100}%`);
        } catch (e) {
            console.log(e);
            res.send('An error occured');
        }
    }
});



app.get('*', (req, res) => {
    res.send('404: page not found');
});

app.listen(3000, () => {
    console.log('Server is up on port 3000');
});


function getRank(nameOfUser,friendName){
    let counter = 0;
    let dataBuffer = fs.readFileSync(`${nameOfUser}-${friendName}-answer.json`)
    let dataJSON = dataBuffer.toString()
    answersArrOfFriend = JSON.parse(dataJSON); 
    
    dataBuffer = fs.readFileSync(`${nameOfUser}.json`)
    dataJSON = dataBuffer.toString()
    answersArrOfProfile = JSON.parse(dataJSON); 

    for(let i=0; i<answersArrOfProfile.answersArr.length; i++){
        if(answersArrOfProfile.answersArr[i].A === answersArrOfFriend.answersArr[i].A){
            counter+= 1;
        }
    }
    return counter;
}