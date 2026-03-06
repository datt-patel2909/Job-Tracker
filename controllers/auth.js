const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors/index')
const nodemailer = require('nodemailer')
const dns = require('dns')
const { OAuth2Client } = require('google-auth-library');

// Force IPv4 resolution to prevent ENETUNREACH for IPv6 on Render
dns.setDefaultResultOrder('ipv4first');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {

    const user = await User.create({ ...req.body })
    const token = user.createJWT()
    res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token })
}


const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new BadRequestError('Please provide email and password')
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new UnauthenticatedError('Invaild credential')
    }
    const ispasswordcorrect = await user.comparePassword(password)
    if (!ispasswordcorrect) {
        throw new UnauthenticatedError('Invaild credential')
    }


    const token = user.createJWT()
    res.status(StatusCodes.OK).json({ user: { name: user.name }, token })



}

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new BadRequestError('Please provide an email');
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new UnauthenticatedError('User does not exist');
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiration (10 minutes)
    user.resetPasswordOtp = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();
    // Send Email via Brevo API (HTTPS — works on Render, unlike SMTP)
    const emailHtml = `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Here is your 6-digit OTP code:</p>
        <h2 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${otp}</h2>
        <p>This code will expire in 10 minutes.</p>
    `;

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: 'Job Tracker', email: process.env.EMAIL_USER },
                to: [{ email: email }],
                subject: 'Job Tracker Password Reset OTP',
                htmlContent: emailHtml
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Brevo API Error:', data);
            throw new Error(data.message || 'Email service error');
        }

        res.status(StatusCodes.OK).json({ msg: 'OTP sent to email successfully' });
    } catch (error) {
        console.error('Email Error:', error);
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        throw new BadRequestError('Email could not be sent: ' + error.message);
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new BadRequestError('Please provide email and OTP');
    }

    const user = await User.findOne({
        email,
        resetPasswordOtp: otp,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        throw new BadRequestError('Invalid or expired OTP');
    }

    res.status(StatusCodes.OK).json({ msg: 'OTP verified successfully' });
};

const resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
        throw new BadRequestError('Please provide email, OTP, and new password');
    }

    const user = await User.findOne({
        email,
        resetPasswordOtp: otp,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        throw new BadRequestError('Invalid or expired OTP');
    }

    // Hash the new password - Note: Our pre('save') hook in User model ONLY runs 
    // on modified fields. So we just set it here.
    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(StatusCodes.OK).json({ msg: 'Password updated successfully' });
}

const googleAuth = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        throw new BadRequestError('Please provide a Google token');
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Generate a random secure password for OAuth users
            const randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2) + '!';
            user = await User.create({
                name,
                email,
                password: randomPassword
            });
        }

        const jwtToken = user.createJWT();
        res.status(StatusCodes.OK).json({ user: { name: user.name }, token: jwtToken });
    } catch (error) {
        throw new UnauthenticatedError('Invalid Google Token');
    }
};

module.exports = { register, login, forgotPassword, verifyOtp, resetPassword, googleAuth }