
const userModel = require("../models/userModel");
const tokenModel = require("../models/tokenModel");
const mongoose = require("mongoose");
const Joi = require("joi");
const JWT = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const Email = require('../sendEmail');
const crypto = require("crypto");
const bcrypt = require('bcrypt');


//for class base
class Users {

    constructor() {
        //for future
    }

    createToken(id, time) {
        return JWT.sign({ id }, process.env.SECRET, { expiresIn: !time ? '2d' : '5m' })
    }

    validateSchema(body) {
        const schema = Joi.object({
            email: Joi.string().email({ tlds: { allow: false } }),
            password: Joi.string().alphanum().min(8).max(30).required(),
        });
        return schema.validate(body);
    };

    signup = async (req, res) => {
        try {
            const { error } = this.validateSchema(req.body)
            if (!error) {
                let user = await userModel.signup(req, res);
                const token = this.createToken(user._id);
                let emailToken = await new tokenModel({ userId: user._id, token: crypto.randomBytes(16).toString('hex') }).save();
                let text = await `Dear ${user.email}, please click this link to activate your account:
                <a href=http://localhost:4000/api/users/activate/${emailToken.token}> Click here</a> <br/> your status is currently ${user.status}`
                let isEmailSent = await Email(user.email, 'Welcome to workout', text, true)
                if (isEmailSent) {
                    res.status(200).json({ msg: 'email sent successfully', data: user, token })
                } else {
                    res.status(400).json({ error: 'email not sent' })
                }
            } else {
                res.status(400).json({ error: error && error.details[0].message })
            }

        } catch (err) {
            res.status(400).json({ error: err.message })
        }

    };

    signin = async (req, res) => {
        try {
            const { error } = this.validateSchema(req.body)
            if (!error) {
                let user = await userModel.login(req, res)
                const token = this.createToken(user._id, null)
                res.status(200).json({ msg: "login successfully", data: user, token })
            } else {
                res.status(400).json({ error: error && error.details[0].message })
            }
        } catch (err) {
            res.status(400).json({ error: err.message })
        }

    };

    verifyUser = async (req, res) => {
        try {
            const { confirmationCode } = req.params;
            let token = await tokenModel.findOne({ token: confirmationCode });
            if (!token) {
                return res.status(404).send({ message: "Link is invalid." });
            }

            let user = await userModel.findOne({ _id: token.userId });
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }
            else if (user.status == 'Active') {
                return res.status(404).send({ message: "User already Active." });
            }
            user.status = "Active";
            await user.save();
            await token.remove();
            res.status(200).send({ message: 'Activated successfully', data: user });

        } catch (err) {
            res.status(400).json({ errdor: err.message })
        }

    };

    resendEmail = async (req, res) => {
        const { email } = req.body;
        try {
            let user = await userModel.findOne({ email: email });
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            };
            if (user.status == 'Active') {
                return res.status(400).send({ message: "User already active." });
            };
            await tokenModel.findOneAndRemove({ userId: user._id });
            var token = await new tokenModel({ userId: user._id, token: crypto.randomBytes(16).toString('hex') }).save();
            let text = await `Dear ${user.email}, please click this link to activate your account:
           <a href=http://localhost:4000/api/users/activate/${token.token}> Click here</a> <br/> your status is currently ${user.status}`
            let isEmailSent = await Email(user.email, 'Resend Account Activation ', text, true)
            if (isEmailSent) {
                return res.status(200).json({ msg: 'email sent successfully', data: user })
            } else {
                return res.status(400).json({ error: 'email not sent' })
            }
        }
        catch (err) {
            res.status(400).send({ message: err.message })
        }
    };

    forgotPassword = async (req, res) => {
        try {
            let user = await userModel.findOne({ email: req.body.email });
            if (!user) {
                return res.status(400).send({ message: "User Not found." });
            };
            if (user.status != "Active") {
                return res.status(400).send({ message: "User not active yet.." });
            };
            await tokenModel.findOneAndRemove({ userId: user._id });
            let token = await new tokenModel({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();

            let text = await `Dear ${user.email}, please click this link to  reset password:
            <a href=http://localhost:4000/api/users/resetPassword/${user._id}/${token.token}> Click here</a>`
            let isEmailSent = await Email(user.email, 'Resent Password', text, true)
            if (isEmailSent) {
                res.status(200).json({ msg: 'email sent successfully', data: user })
            } else {
                res.status(400).json({ error: 'email not sent' })
            }
        } catch (err) {
            console.log(err)
        }
    };

    resetPassword = async (req, res) => {
        const { id } = req.params;
        const { password } = req.body;
        try {
            let user = await userModel.findOne({ _id: id });
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }
            const token = await tokenModel.findOne({
                userId: user._id,
                token: req.params.token
            });
            if (!token) return res.status(400).send({ error: "Invalid link" });
            const genrateSalt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(password, genrateSalt);
            let updatedUser = await userModel.updateOne({ _id: id }, {
                $set: {
                    password: hash
                }
            })
            res.status(200).send({ message: "Password updated successfully" })
        } catch (err) {
            res.status(400).send({ error: err })
        }
    };

}



module.exports = new Users();