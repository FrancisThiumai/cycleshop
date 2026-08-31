const path = require('path');

const express = require('express');
const { default: mongoose } = require('mongoose');
const cors= require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;

require("dotenv").config();
const DB_PATH = process.env.MONGODB_URL;
const shopRouter = require('./routers/shopRouter');
const errorsController = require('./controllers/errors')
const authRouter = require('./routers/authRouter');
const adminRouter = require('./routers/adminRouter');
const app = express();
const User = require('./models/user');

app.use(express.urlencoded());
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: DB_PATH,
      collectionName: 'sessions'
    }),

    cookie: {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);
app.use(async (req, res, next) => {
    try {
        if (req.session.userId) {
            req.user = await User.findById(req.session.userId);
        } else {
            req.user = undefined;
        }
    } catch (err) {
        req.user = undefined;
    }
    next();
});
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api', shopRouter);
app.use(errorsController.pageNotFound);
app.use(errorsController.handleError);

const port = 3000;
mongoose.connect(DB_PATH).then(() => {
    console.log('MongoDB connected successfully.');
    app.listen(port, () => {
        console.log(`listening at http://localhost:${port}/`);
    });
}).catch(err=>{
    console.log("error while connecting to mongo", err);
});