var Models = require('../models');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = {

    /**Create: Use the loop to save the room */
    create: function (rooms, callback) {
        /**Save rooms */
        rooms.forEach(function (item) {
            var newroom = new Models.Room(item);
            newroom.save(function (err) {
                if (err) return callback(err);
                console.log('Save room success!');
            });
        });
        return callback(null, rooms);
    },
    /**Update room by id */
    update: function (id, room, callback) {
        if (ObjectId.isValid(id)) {
            console.log(id);
            Models.Room.findByIdAndUpdate(id, room, { new: true }, function (err, doc) {
                if (err) return callback(err);
                if (doc) {
                    return callback(null, doc);
                } else {
                    return callback(null, 'No Item in database!');
                }
            });
        } else {
            return callback('Invalid ObjectId');
        }
    },
    /**Find Room By Id */
    findById: function (id, callback) {
        var modelView = {
            room: {},
            roomtype: {},
        }
        if (ObjectId.isValid(id)) {
            Models.Room.findById(id, function (err, doc) {
                if (err) return callback(err);
                if (doc) {
                    modelView.room = doc;
                    /**Seacrh roomtype of room */
                    Models.Room_Type.findById(doc.id_roomtype, function (err, roomtype) {
                        if (err) return callback(err);
                        modelView.roomtype = roomtype;
                        return callback(null, modelView);
                    }).populate('device.id_device');  //Get All devices in the room  

                }
                else {
                    return callback(null, 'No Item in database!');
                }
            });
        }
        else {
            return callback('Invalid ObjectId');
        }
    },
    /**Delele room by id */
    deleteById: function (id, callback) {
        if (ObjectId.isValid(id)) {
            /**Check status of the room */
            Models.Room.findById(id, function (err, doc) {
                if (err) return callback(err);
                if (doc) {
                    if (doc.status == false) {
                        //Allow remove the room 
                        Models.Room.findByIdAndRemove(doc._id, function (err) {
                            if (err) return callback(err);
                            return callback(null, 'Delete room success!');
                        });
                    }
                    else {
                        return callback(null, 'Rooms are rented');
                    }
                }
                else {
                    return callback(null, 'No Item in database!');
                }
            });
        }
        else {
            return callback('Invalid ObjectId');
        }
    },
    /*Find All Room */
    findAllRoom: function (callback) {
        Models.Room.find({}, function (err, docs) {
            if (err) return callback(err);
            if (docs.length > 0) {
                return callback(null, docs);
            } else {
                return callback(null, 'No item in database');
            }
        });
    },
    /**Find Room by the house id*/
    findRoomByHouseId: function (id, callback) {
        if (ObjectId.isValid(id)) {
            Models.Room.find({ id_house: id }, function (err, docs) {
                if (err) return callback(err);
                if (docs.length > 0) {
                    return callback(null, docs);
                }
                else {
                    return callback(null, 'No Item in database!');
                }
            });
        }
        else {
            return callback('Invalid ObjectId');
        }
    },
    findRentRoombyId: function (id, callback) {
        Models.Rent_Room_Detail.findOne({ id_room: id }, (err, rentroom) => {
            if (err) return callback(err);
            if (rentroom) {
                return callback(null, rentroom);
            }
            else return callback(null, null);

        }).populate('id_user', 'username email phone address gender identitycard');
    },
    removeRentRoom: function (id_room, callback) {
        // Find and remove rentroom
        Models.Rent_Room_Detail.findOneAndRemove({ id_room: id_room }, (err, rentroom) => {
            // remove notify
            if (err) return callback(err);
            Models.Notifycation.findOneAndRemove({ id_room: id_room }, (err, noti) => {
                if (err) return callback(err);
                // update status room
                Models.Room.findByIdAndUpdate(id_room, { status: false }, (err, room) => {
                    if (err) return callback(err);
                    return callback(null, room);
                });
            });
        });
    }

}