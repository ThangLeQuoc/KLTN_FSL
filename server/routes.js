var express = require('express'),
    router = express.Router(),
    jwt = require('jsonwebtoken'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('../models'),

    adminController = require('../controllers/adminController'),
    customerController = require('../controllers/customerController'),

    api_homeuserController = require('../controllers/api_home_user_Controller'),
    api_userController = require('../controllers/api_userController'),
    api_landlordController = require('../controllers/api_landlordController'),
    api_roomTypeController = require('../controllers/api_RoomTypeController'),
    api_roomController = require('../controllers/api_RoomController'),
    api_houseController = require('../controllers/api_houseController');

var config = require('../server/config');




// module
module.exports = function (app) {

    //section Lanlord
    router.get('/customer', customerController.index);
    router.post('/api/v1/landlord/login', api_landlordController.logIn);
    router.post('/api/v1/landlord/register', api_landlordController.register);
    router.get('/api/v1/landlord/:id', ensureAuthenticatedLandlord, api_landlordController.findLandlordById);
    router.put('/api/v1/landlord/:id', ensureAuthenticatedLandlord, api_landlordController.updateLandlordById);
    router.delete('/api/v1/landlord/:id', api_landlordController.deleteLandlord);
    router.get('/api/v1/landlord', api_landlordController.getAllLandlord);
    router.post('/api/v1/landlord/changepass', ensureAuthenticatedLandlord, api_landlordController.changPassword);
    router.post('/api/v1/landlord/check/validate', api_landlordController.validates);
    router.get('/api/v1/landlord/verify/verify-account/', api_landlordController.verifyEmail);

    // section Devices
    router.get('/api/v1/devices', api_landlordController.getAllDevices);

    /** section House */
    router.post('/api/v1/house', ensureAuthenticatedLandlord, api_houseController.create);
    router.get('/api/v1/house/:id', ensureAuthenticatedLandlord, api_houseController.getHouseById);
    router.delete('/api/v1/house/:id', ensureAuthenticatedLandlord, api_houseController.deleteHouseById);
    router.put('/api/v1/house/:id', ensureAuthenticatedLandlord, api_houseController.updateHouseById);
    router.get('/api/v1/houses/all', ensureAuthenticatedLandlord, api_houseController.getAllHouse);
    router.get('/api/v1/houses', ensureAuthenticatedLandlord, api_houseController.getHouseByIdLandlord);

    /**section Area */
    router.get('/api/v1/area/provinces', api_houseController.getAllProvinces);
    router.get('/api/v1/area/districts/:id', api_houseController.getAllDictrict);
    router.get('/api/v1/area/wards/:id', api_houseController.getAllWard);


    /**section RoomeType */
    router.post('/api/v1/roomtype', ensureAuthenticatedLandlord, api_roomTypeController.Create);
    router.get('/api/v1/roomtypes', ensureAuthenticatedLandlord, api_roomTypeController.GetRoomTypeByIdLandlord);
    router.put('/api/v1/roomtype/:id', ensureAuthenticatedLandlord, api_roomTypeController.UpdateRoomTypeById);
    router.delete('/api/v1/roomtype/:id', ensureAuthenticatedLandlord, api_roomTypeController.DeleteRoomTypeById);
    router.post('/api/v1/roomtype/:id', ensureAuthenticatedLandlord, api_roomTypeController.UpdateNumberRoomType);
    router.get('/api/v1/roomtype/:id', ensureAuthenticatedLandlord, api_roomTypeController.GetRoomtypeById);
    /**section Room */
    router.post('/api/v1/room', ensureAuthenticatedLandlord, api_roomController.Create);
    router.put('/api/v1/room/:id', ensureAuthenticatedLandlord, api_roomController.Update);
    router.get('/api/v1/room/:id', ensureAuthenticatedLandlord, api_roomController.GetRoomById);
    router.delete('/api/v1/room/:id', ensureAuthenticatedLandlord, api_roomController.RemoveRoomById);
    router.get('/api/v1/rooms', ensureAuthenticatedLandlord, api_roomController.GetAllRoom);
    router.get('/api/v1/rooms/:id', ensureAuthenticatedLandlord, api_roomController.GetRoomByIdHouse);
    router.get('/api/v1/room/rentroom/:id_room', ensureAuthenticatedLandlord, api_roomController.getInfoRentRoomByIdRoom);
    router.delete('/api/v1/room/rentroom/deleted/:id', ensureAuthenticatedLandlord, api_roomController.deletedUserRentRoom);
    /**section HomePage*/
    router.get('/api/v1/home/houses', api_homeuserController.getHousesOnHomePage);
    router.get('/api/v1/home/house/:id', api_homeuserController.getHouseById);
    router.get('/api/v1/detail/house/rooms/:id', api_roomController.GetRoomByIdHouse);
    /**Section User */
    router.post('/api/v1/user/login', api_userController.logIn);
    router.post('/api/v1/user/register', api_userController.register);
    router.get('/api/v1/user/:id', ensureAuthenticatedUser, api_userController.findUserById);
    router.get('/api/v1/users', api_userController.getAllUser);
    router.post('/api/v1/user/changepass', ensureAuthenticatedUser, api_userController.changPassword);
    router.delete('/api/v1/user/:id', api_userController.deleteUser);
    router.put('/api/v1/user/:id', ensureAuthenticatedUser, api_userController.updateUserById);
    router.post('/api/v1/user/check/validate', api_userController.validates);
    router.get('/api/v1/user/verify/verify-account/', api_userController.verifyEmail);

    router.get('/api/v1/house/detail/contact/:id', api_homeuserController.getContact);
    router.post('/api/v1/house/detail/rating', ensureAuthenticatedUser, api_houseController.rating);
    router.post('/api/v1/house/detail/comment', ensureAuthenticatedUser, api_houseController.comment);
    router.get('/api/v1/house/detail/:id_house/comment', api_houseController.getComment);
    router.delete('/api/v1/house/detail/comment/:id', ensureAuthenticatedUser, api_houseController.deleteComment);
    router.get('/search-house/', api_houseController.searchHouse);
    router.get('/search-house/all', api_houseController.searchAllHouse);
    router.get('/search-house/price', api_houseController.searchForHousePrice);
    router.post('/api/v1/notify', api_houseController.sendNotify);
    router.get('/api/v1/notify/new/:id_landlord', api_houseController.getTenNotifyNew);
    router.get('/api/v1/notify/old/:id_landlord', api_houseController.getTenNotifyOld);
    router.get('/api/v1/notify/allnew/:id_landlord', api_houseController.getAllNotifyNew);
    router.get('/api/v1/notify/allold/:id_landlord', api_houseController.getAllNotifyOld);
    router.get('/api/v1/notify/detail/:id', api_houseController.getNotifyById);
    router.get('/api/v1/notify/detail/accept/:id', api_houseController.acceptRentRoom);
    router.get('/api/v1/notify/detail/notaccept/:id', api_houseController.cancelRentRoom);
    router.get('/api/v1/check/rentroom', ensureAuthenticatedUser, api_houseController.checkUserByIdRentRoom);
    // section admin
    router.get('/admin/login', adminController.get_login);
    router.post('/admin/login', passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/admin/login',
        failureFlash: true
    }), adminController.post_login);
    router.get('/admin/logout', adminController.get_logout);
    router.get('/admin', ensureAuthenticated, adminController.index);
    router.get('/admin/user_infor', ensureAuthenticated, adminController.userpage);
    router.get('/admin/landlord_infor', ensureAuthenticated, adminController.landlord);
    router.get('/admin/accept_post', ensureAuthenticated, adminController.accept_post);
    router.get('/admin/not_accept_post', ensureAuthenticated, adminController.not_accept_post);
    router.post('/admin/check_lock_user/:id', ensureAuthenticated, adminController.check_lock_user);
    router.get('/admin/post-detail/:id', ensureAuthenticated, adminController.postDetail);
    router.get('/admin/detail/house/:id', ensureAuthenticated, adminController.detailHouse);
    router.get('/admin/detail/approvice/house/:id', ensureAuthenticated,adminController.approvice);
    // router.post('/admin/remove/:id', adminController.deleteUser);













    /** Authentication Admin*/
    function ensureAuthenticated(req, res, callback) {
        if (req.isAuthenticated()) {
            return callback();
        } else {
            // req. flash('error_msg', 'You are not login')
            res.redirect('/admin/login');
        }

    }
    /**Authentication Landlord  */
    function ensureAuthenticatedLandlord(req, res, callback) {
        if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
            var token = req.headers.authorization;
            jwt.verify(token.split(' ')[1], config.secret_landlord, function (err, decode) {
                if (err) {
                    req.landlordId = undefined;
                    return res.status(500).json({
                        code: res.statusCode,
                        results: {
                            message: 'Invalid Token! Please login.',
                            doc: null
                        }
                    });
                } else {
                    req.landlordId = decode;
                    passport.authenticate('jwt', { session: false });
                    console.log('Id landlord: ' + req.landlordId.id);
                    callback();
                }
            });
        } else {
            req.landlordId = undefined;
            return res.status(401).json({
                code: res.statusCode,
                results: {
                    message: 'Unauthorized User!',
                    doc: null
                }
            });
        }
    }
    /**Authentication User  */
    function ensureAuthenticatedUser(req, res, callback) {
        // (req.headers && req.headers.authorization && req.headers.authorizition.split(' ')[0] === 'JWT'
        if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
            var token = req.headers.authorization;
            jwt.verify(token.split(' ')[1], config.secret_user, function (err, decode) {
                if (err) {
                    req.userId = undefined;
                    return res.status(200).json({
                        code: res.statusCode,
                        results: {
                            message: 'Invalid Token! Please login.',
                            doc: null
                        }
                    });
                } else {
                    req.userId = decode;
                    passport.authenticate('jwt', { session: false });
                    console.log('Id userId: ' + req.userId.id);
                    callback();
                }
            });
        } else {
            req.userId = undefined;
            return res.status(401).json({
                code: res.statusCode,
                results: {
                    message: 'Unauthorized User!',
                    doc: null
                }
            });
        }
    }
    app.use(router);
};