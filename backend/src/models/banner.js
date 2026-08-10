import mongoose from 'mongoose';
const { Schema } = mongoose;

const bannerSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: null,
        },
        statusId: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        image: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Banner', bannerSchema);