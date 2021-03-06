var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var HouseSchema = new Schema({
    id_landlord: { type: ObjectId , ref:'Landlord' },
    status: { type: String },
    check_status: { type: Boolean, default: true }, // Admin check new post
    longitude: { type: String },
    latitude: { type: String }, 
    id_ward: { type: ObjectId },
    price: { type: Number },
    image: { type: String, default:'https://firebasestorage.googleapis.com/v0/b/fsl-io.appspot.com/o/images-house%2Fimage-house-template.jpg?alt=media&token=dc26be9e-f11e-4581-8733-b064bac66a36' },
    title: { type: String },
    description: { type: String },
    address: { type: String },
    rate: {type: Number, default: 4},
    range: { type: String }, // acreage of room
    create_date: { type: Date, 'default': Date.now },
    service_price: {
        create_date: { type: Date, 'default': Date.now },
        electricity_price: { type: Number },
        water_price: { type: Number },
        internet_price: { type: Number },
        garbage_price: { type: Number }
    }
});

var House = module.exports = mongoose.model('House', HouseSchema);
