var Models = require('../models'),
    ObjectId = require('mongoose').Types.ObjectId;
var esClient = require('../services/elastic-client');
var async = require('async');

var Q = require('q');
module.exports = {
    /**Create House*/
    CreateHouse: function (house, callback) {
        //console.log(house);
        var newhouse = new Models.House(house);
        newhouse.save(function (err, doc) {
            if (err) return callback(err);
            else {
                esClient.addHouse(doc);
                return callback(null, doc);
            }
        });
    },
    /** Find house */
    findById: function (id, callback) {
        console.log(id);
        if (ObjectId.isValid(id)) {
            Models.House.findById(id, function (err, house) {
                if (err) callback(err);
                if (house) {
                    return callback(null, house);
                }
                else {
                    return callback(null, 'Not find House Object');
                }
            });
        }
        else {
            return callback({
                code: 401,
                message: 'Invalid ObjectId'
            });
        }

    },
    /**Delete By IdHouse */
    deleteById: function (id, callback) {
        console.log(id);
        if (ObjectId.isValid(id)) {
            Models.House.findByIdAndRemove(id, function (err, doc) {
                if (err) return callback(err);
                if (doc) {
                    // initialize elastic
                    esClient.indexExists().then((exists) => {
                        if (exists) {
                            return esClient.deleteIndex();
                        }
                    }).then(() => {
                        return esClient.initIndex().then(esClient.initMapping)
                    });
                    Models.Comment.remove({ id_house: id }, (err) => {
                        if (err) { return callback(err); }
                        return callback(null, 'Delete success!');
                    });
                }
                else {
                    return callback(null, 'Not find House Object');
                }
            });
        }
        else {
            return callback({
                code: 401,
                message: 'Invalid ObjectId'
            });
        }
    },
    /**Update by Id House */
    updateById: function (id, house, callback) {
        console.log(id);
        if (ObjectId.isValid(id)) {
            Models.House.findByIdAndUpdate(id, house, { new: true }, function (err, result) {
                if (err) return callback(err);
                if (result) {
                    esClient.addHouse(result);
                    return callback(null, result);
                }
                else {
                    return callback(null, 'Not find House Object');
                }

            })
        }
        else {
            return callback({
                code: 401,
                message: 'Invalid ObjectId'
            });
        }
    },
    /**Find All House */
    findAllHouse: function (callback) {
        Models.House.find(function (err, docs) {
            if (err) { throw err; }
            return callback(null, docs)
        });
    },
    findAllHousePromise: function () {
        var defer = Q.defer();
        Models.House.find((err, docs) => {
            if (err) defer.reject(err);
            defer.resolve(docs);
        });
        return defer.promise;
    },
    /**Get All Province of Viet Nam  */
    findAllProvinces: function (callback) {
        Models.Province.find(function (err, docs) {
            if (err) callback(err);
            if (docs) {
                return callback(null, docs);
            }
            else {
                return callback(null, 'No Item in database');
            }
        });
    },
    /**Get All Dictrict by province */
    findAllDictrictbyProvinceName: function (province_id, callback) {
        Models.District.find({ id_province: province_id }, function (err, docs) {
            if (err) callback(err);
            if (docs) {
                return callback(null, docs);
            }
            else {
                return callback(null, 'No Item in database');
            }
        });
    },
    /**Get all Ward by Dictrict */
    findAllWardbyDictrictName: function (dictrict_id, callback) {
        Models.Ward.find({ id_district: dictrict_id }, function (err, docs) {
            if (err) callback(err);
            if (docs) {
                return callback(null, docs);
            }
            else {
                return callback(null, 'No Item in database');
            }
        });
    },
    findHouseByIdLandlord: function (id, callback) {
        if (ObjectId.isValid(id)) {
            Models.House.find({ id_landlord: id }, (err, docs) => {
                console.log(docs);
                if (err) { return callback(err); }
                if (docs.length > 0) {
                    return callback(null, docs);
                }
                else {
                    return callback(null, null);
                }
            });
        }
        else {
            return callback('Invalid ObjectId')
        }
    },
    rateHouse: function (content, callback) {
        var newvalue = new Models.Rating(content);
        // Check user rating house
        //If not for rating, if the error message
        var id_user = content.id_user;
        var id_house = content.id_house;
        Models.Rating.findOne({ id_user: id_user, id_house: id_house }, (err, user) => {
            if (err) return callback(err);
            if (user) {
                return callback(null, 'Users have rated');
            }
            else {
                newvalue.save((err, doc) => {
                    if (err) { return callback(err); }
                    Models.Rating.find({ id_house: doc.id_house }, (err, docs) => {
                        if (err) callback(err);
                        var quantity = docs.length;
                        var sum = 0;
                        docs.forEach(function (item) {
                            sum = sum + item.value;
                        });
                        var rate = sum / quantity;
                        console.log(quantity);
                        console.log(sum);
                        console.log(rate);
                        // update rating of model house
                        Models.House.findById({ _id: doc.id_house }, (err, house) => {
                            if (err) {
                                return callback(err);
                            }
                            house.rate = rate;
                            house.save((err) => {
                                if (err) return callback(err);
                                return callback(null, null);
                            });
                        });
                    });
                });
            }
        })
    },
    findAllCommentbById: function (id, callback) {
        if (ObjectId.isValid(id)) {
            Models.Comment.find({ id_house: id }, {}, { sort: { 'timestamp': -1 } }, (err, docs) => {
                if (err) { return callback(err); }
                return callback(null, docs);
            }).populate('id_user', 'image firstname lastname username ');
        }
        else {
            return callback('Invalid ObjectId');
        }
    },
    comment: function (content, callback) {
        var id_house = content.id_house;
        if (ObjectId.isValid(id_house)) {
            // find house
            Models.House.findOne({ _id: id_house }, (err, doc) => {
                if (!err, doc) {
                    var newComment = new Models.Comment(content);
                    newComment.save((err, comment) => {
                        if (err) { return callback(err); }
                        return callback(null, null);
                    });
                }
            });
        } else {
            return callback('Invalid ObjectId');
        }

    },
    removeComment: function (id, callback) {
        if (ObjectId.isValid(id)) {
            Models.Comment.findOne({ '_id': id }, (err, doc) => {
                if (err) { return callback(err); }
                if (doc) {
                    doc.remove((err) => {
                        if (err) { return callback(err); }
                        return callback(null, 'Deleted comment success!');
                    });
                }
                else {
                    return callback(null, null)
                }
            });
        }
        else {
            return callback('Invalid ObjectId');
        }
    },
    //save notify
    saveNotify: function (content, id_room, callback) {
        Models.Notifycation.create(content, (err, notify) => {
            if (err) return callback(err);
            // save rent Room detail
            var newRent = new Models.Rent_Room_Detail({
                id_user: content.id_user,
                id_room: id_room
            });
            newRent.save((err) => {
                if (err) return callback(err);
            })
            return callback(null, notify);
        });
    },
    findTenNotifyNew: function (id_landlord, callback) {
        Models.Notifycation.find({ id_landlord: id_landlord, status: false }, {}, { sort: { 'date': -1 } }, (err, notify) => {
            if (err) return callback(err);
            return callback(null, notify);
        }).limit(10);
    },
    findAllNotifyNew: function (id_landlord, callback) {
        Models.Notifycation.find({ id_landlord: id_landlord, status: false }, {}, { sort: { 'date': -1 } }, (err, notifys) => {
            if (err) return callback(err);
            return callback(null, notifys);
        });
    },
    findTenNotifyOld: function (id_landlord, callback) {
        Models.Notifycation.find({ id_landlord: id_landlord, status: true }, {}, { sort: { 'date': -1 } }, (err, notify) => {
            if (err) return callback(err);
            return callback(null, notify);
        }).limit(10);
    },
    findAllNotifyOld: function (id_landlord, callback) {
        Models.Notifycation.find({ id_landlord: id_landlord, status: true }, {}, { sort: { 'date': -1 } }, (err, notifys) => {
            if (err) return callback(err);
            return callback(null, notifys);
        });
    },
    findUserByIdRentRoom: function (id_user, callback) {
        Models.Rent_Room_Detail.findOne({ id_user: id_user }, (err, user) => {
            if (err) return callback(err);
            if (user) {
                return callback(null, user);
            }
            else {
                return callback(null, null);
            }
        });
    },
    findDetailNotifyById: function (id, callback) {
        Models.Notifycation.findById(id, (err, notify) => {
            if (err) return callback(err);
            return callback(null, notify);
        }).populate('id_user', 'username email address gender identitycard phone')
            .populate('id_room', 'title');
    },
    acceptRentRoom: function (id, callback) {
        // update status of notify
        Models.Notifycation.findOne({ _id: id }, (err, notify) => {
            if (err) return callback(err);
            if (notify) {
                var id_room = notify.id_room;
                var email_user = notify.id_user.email;
                var info_landlord = {
                    email: notify.id_landlord.email,
                    phone: notify.id_landlord.phone
                };
                notify.status = true;
                notify.save((err) => {
                    if (err) return callback(err);
                    Models.Room.findByIdAndUpdate(id_room, { status: true }, { new: true }, (err, room) => {
                        if (err) return callback(err);
                        return callback(null, {
                            status: true,
                            email_user: email_user,
                            info_landlord: info_landlord
                        });
                    })
                })
            }
            else {
                return callback(null, {
                    status: false
                });
            }
        }).populate('id_user', 'username email')
            .populate('id_landlord', 'email phone');
    },
    notAcceptRentRoom: function (id, callback) {
        // find and deleted rent Room 
        Models.Notifycation.findOneAndRemove({ _id: id }, (err, notify) => {
            if (err) return callback(err);
            if (notify) {
                var id_user = notify.id_user;
                var email_user = notify.id_user.email;
                var info_landlord = {
                    email: notify.id_landlord.email,
                    phone: notify.id_landlord.phone
                };
                // find and deleted renRoom detail
                Models.Rent_Room_Detail.findOneAndRemove({ id_user: id_user }, (err, rentroom) => {
                    if (err) return callback(err);
                    return callback(null, {
                        status: true,
                        email_user: email_user,
                        info_landlord: info_landlord
                    });
                });
            }
            else {
                return callback(null, null);
            }
        }).populate('id_user', 'email username')
            .populate('id_landlord', 'email phone');
    },
    getInfoHomeLandlord: function (id_landlord) {
        var info = {};
        async.parallel([
            // get total room of landlord
            function (callback) {
                //step 1: Get all house of landlord
                Models.House.find({ id_landlord: id_landlord }, (err, house) => {
                    if (err) return callback(err);
                    
                })
            }
        ])
    }

} 