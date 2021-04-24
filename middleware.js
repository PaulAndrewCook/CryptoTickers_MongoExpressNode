const { investmentsSchema } = require('./schemas.js'); //Joi schema for linking databases
const AppError = require('./utils/appError'); //Error handler for text input
const Ticker = require('./models/stocks'); //Ticker Model
const User = require('./models/user'); // user Model
const { Update, getTics, updateTickers, makeTics } = require('./public/js/ticDataFetch'); //js functions for updating tics
const investments = require('./controllers/investments'); //call the investment controller

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
		req.flash('error', 'You must be signed in to do that!');
		return res.redirect('/login');
	}
	next();
};

module.exports.validateInput = (req, res, next) => {
	const { error } = investmentsSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new AppError(msg, 400);
	} else {
		next();
	}
};

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const userId = req.user._id;
	const ticker = await Ticker.findById(id);
	if (!ticker.creator.equals(userId)) {
		req.flash('error', 'You do NOT have permission to do that!');
		res.redirect(`/investments/${id}`);
	}
	next();
};

module.exports.isAdmin = async (req, res, next) => {
	const { _id } = req.user;
	const user = await User.findById(_id);
	if (!user.isAdmin) {
		req.session.returnTo = req.originalUrl;
		req.flash('error', 'You do NOT have permission to do that!');
		return res.redirect(`/investments`);
	}
	next();
};
module.exports.pathName = async (req, res, next) => {
	const pathName = req.path.replace(/\//g, 'status');
	next();
};

module.exports.bgUpdate = async (req, res, next) => {
	Update(`Tesing connection from middleware!`);
	try {
		Promise.all([
			getTics()
		])
			.then(async (tickers) => {
				return (ticker = await updateTickers(tickers));
			})
			.then(async (ticker) => {
				console.log('tickers returned from promise land');
			});
	} catch (e) {
		console.log('Error in Middleware');
		console.log(e);
	}
	next();
};

// const tickers = await getTics();
// const ticker = await updateTickers(tickers);
// res.locals.currentTickers = ticker;
