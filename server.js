const express = require ('express');
const app = express ();
path = require ('path');
const cors = require ('cors');
const Pool = require ('pg').Pool;
require ('dotenv').config ();

// we use process.env to contain our environment variables
//(variable to describe the enviroment our app is going to run in)
//because Herohu is responsible for the environment
//Heroku will provide some variables to apply for our app one of them is PORT .

const PORT = process.env.PORT || 5000;

const devConfig = {
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
};

const proConfig = {
  connectionString: process.env.DATABASE_URL, //coming from Heroku addons
};

const pool = new Pool (
  process.env.NODE_ENV === 'production' ? proConfig : devConfig
);

//process.env.NODE_ENV  to indicate if our app is in production mode or not which will return production or undefined
if (process.env.NODE_ENV === 'production') {
  //serve static content
  //npm run build
  app.use (express.static (path.join (__dirname, 'client/build')));
}

//console.log (__dirname);
//console.log (path.join (__dirname, 'client/build'));

// middleware
app.use (cors ());
app.use (express.json ()); //allow use to access request.body

//ROUTES
app.get ('/', (req, res) => {
  res.send ('Homepage here');
});

app.get ('/allquestions', async (req, res) => {
  try {
    const allquestions = await pool.query ('select id,question from question');
    const filter = await pool.query ('select id,module from module');
    const data = {};
    data.allquestions = allquestions.rows;
    data.filter = filter.rows;
    res.json (data);
  } catch (err) {
    console.error (err);
  }
});

app.get ('/answered', async (req, res) => {
  const answered = await pool.query (
    'select question.id,answer.answer from question inner join answer on question.id = answer.question_id where question.answered>0'
  );
  res.json (answered.rows);
});

app.get ('/unanswered', async (req, res) => {
  const answered = await pool.query (
    'select question.id,answer.answer from question inner join answer on question.id = answer.question_id where question.answered===0;'
  );
  res.json (answered.rows);
});

//SERVER LISTEN
app.listen (PORT, () => {
  console.log (`Server listening on port ${PORT}`);
});
