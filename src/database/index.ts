import mongoose from 'mongoose';

mongoose.connect('mongodb://root:example@localhost:27017/noderest?authSource=admin',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true,
        useCreateIndex: true
    }
);
mongoose.Promise = global.Promise;

export default mongoose;