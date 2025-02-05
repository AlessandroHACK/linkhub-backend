import mongoose, { Schema, Document} from "mongoose";

export interface IUser extends Document {
    handle: string
    name: string
    email: string
    password: string

}

const userSchema: Schema = new Schema({
    handle: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email : {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },

})


const User = mongoose.model<IUser>('User', userSchema)
export default User